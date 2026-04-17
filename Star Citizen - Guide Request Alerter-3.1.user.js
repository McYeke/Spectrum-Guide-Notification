// ==UserScript==
// @name         Star Citizen - Guide Request Alerter
// @namespace    https://robertsspaceindustries.com/
// @version      3.1
// @description  Alerts (sound + notification + badge) only when a new guide request arrives
// @author       Yeke
// @match        https://robertsspaceindustries.com/spectrum/guide*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const script = document.createElement('script');
    script.textContent = `(function() {

    // ─── CONFIG ─────────────────────────────────────────────────────────────
    const VOLUME         = 0.5;   // 0.0 – 1.0
    const FLASH_INTERVAL = 500;   // ms between title flashes
    // ────────────────────────────────────────────────────────────────────────

    let audioCtx   = null;
    let flashTimer = null;
    let alertCount = 0;
    let badge      = null;
    const seenIds  = new Set();
    const ORIG_TITLE = document.title;

    // ── Audio ────────────────────────────────────────────────────────────────
    function getCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }
    document.addEventListener('click',   () => { try { getCtx(); } catch(e){} }, { once: true });
    document.addEventListener('keydown', () => { try { getCtx(); } catch(e){} }, { once: true });

    // Two-tone ascending chime — soft and rounded, clearly not Discord
    // First note: 880 Hz (A5), second note: 1320 Hz (E6) — a perfect fifth up
    // Each note uses a sine wave with a smooth attack and exponential decay
    // so it sounds like a struck bell rather than a harsh beep
    function playChime() {
        try {
            const ctx = getCtx();

            function playNote(freq, startTime, duration) {
                const osc  = ctx.createOscillator();
                const gain = ctx.createGain();

                // Mix in a little triangle wave for warmth
                const osc2  = ctx.createOscillator();
                const gain2 = ctx.createGain();

                osc.connect(gain);
                osc2.connect(gain2);
                gain.connect(ctx.destination);
                gain2.connect(ctx.destination);

                osc.type  = 'sine';
                osc2.type = 'triangle';
                osc.frequency.value  = freq;
                osc2.frequency.value = freq;

                // Main tone: fast attack, slow exponential decay
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(VOLUME, startTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

                // Triangle undertone: quieter, adds body
                gain2.gain.setValueAtTime(0, startTime);
                gain2.gain.linearRampToValueAtTime(VOLUME * 0.18, startTime + 0.01);
                gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);

                osc.start(startTime);
                osc.stop(startTime + duration);
                osc2.start(startTime);
                osc2.stop(startTime + duration * 0.6);
            }

            const now = ctx.currentTime;
            playNote(880,  now,        0.6);   // A5 — first note
            playNote(1320, now + 0.18, 0.7);   // E6 — second note, slightly longer

        } catch(e) {}
    }

    // ── Desktop notification ─────────────────────────────────────────────────
    function sendNotification(name) {
        const title = '⚠️ New Guide Request — Star Citizen';
        const body  = name
            ? name + ' is requesting your guidance!'
            : 'Someone is requesting your guidance!';
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: 'https://robertsspaceindustries.com/favicon.ico',
                requireInteraction: true
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(p => {
                if (p === 'granted') new Notification(title, { body, requireInteraction: true });
            });
        }
    }

    // ── Tab title flash ──────────────────────────────────────────────────────
    function startFlash(count) {
        stopFlash();
        let tog = false;
        flashTimer = setInterval(() => {
            document.title = tog
                ? ORIG_TITLE
                : ('🔴 [' + count + ' REQUEST' + (count > 1 ? 'S' : '') + '] GUIDE ALERT');
            tog = !tog;
        }, FLASH_INTERVAL);
    }
    function stopFlash() {
        if (flashTimer) { clearInterval(flashTimer); flashTimer = null; }
        document.title = ORIG_TITLE;
    }

    // ── On-page badge ────────────────────────────────────────────────────────
    function ensureBadge() {
        if (badge) return badge;
        badge = document.createElement('div');
        Object.assign(badge.style, {
            position:     'fixed',
            bottom:       '20px',
            right:        '20px',
            zIndex:       '2147483647',
            background:   '#c0392b',
            color:        '#fff',
            fontFamily:   'sans-serif',
            fontSize:     '14px',
            fontWeight:   '600',
            padding:      '12px 18px',
            borderRadius: '10px',
            boxShadow:    '0 4px 18px rgba(0,0,0,0.5)',
            cursor:       'pointer',
            display:      'none',
            lineHeight:   '1.5',
            maxWidth:     '300px',
            userSelect:   'none',
        });
        badge.addEventListener('click', () => {
            alertCount = 0;
            badge.style.display = 'none';
            stopFlash();
        });
        const attach = () => document.body.appendChild(badge);
        document.body ? attach() : document.addEventListener('DOMContentLoaded', attach);
        return badge;
    }

    function showBadge(count, name) {
        const b = ensureBadge();
        const nameStr = name
            ? '<br><small style="font-weight:400;opacity:.9">' + name + '</small>'
            : '';
        b.innerHTML =
            '⚠️ ' + count + ' guide request' + (count > 1 ? 's' : '') + ' waiting!' +
            nameStr +
            '<br><small style="font-weight:400;opacity:.7">Click to dismiss</small>';
        b.style.display = 'block';
    }

    // ── Core alert ───────────────────────────────────────────────────────────
    function triggerAlert(notif) {
        if (seenIds.has(notif.id)) return;
        seenIds.add(notif.id);

        alertCount++;
        const name = notif.text_tokens && notif.text_tokens.member_displayname
            ? notif.text_tokens.member_displayname
            : null;

        console.info('[GuideAlerter] 🚨 New guide request from ' + (name || 'unknown') + ':', notif);

        playChime();
        sendNotification(name);
        startFlash(alertCount);
        showBadge(alertCount, name);
    }

    // ── WebSocket interceptor ────────────────────────────────────────────────
    const OrigWS = window.WebSocket;
    function PatchedWS(...args) {
        const ws = new OrigWS(...args);
        ws.addEventListener('message', (event) => {
            let data;
            try { data = JSON.parse(event.data); } catch { return; }
            if (
                data.type === 'notification.new' &&
                data.notification &&
                data.notification.type === 'guide-request-new'
            ) {
                triggerAlert(data.notification);
            }
        });
        return ws;
    }
    PatchedWS.prototype = OrigWS.prototype;
    Object.defineProperty(PatchedWS, 'CONNECTING', { value: OrigWS.CONNECTING });
    Object.defineProperty(PatchedWS, 'OPEN',       { value: OrigWS.OPEN });
    Object.defineProperty(PatchedWS, 'CLOSING',    { value: OrigWS.CLOSING });
    Object.defineProperty(PatchedWS, 'CLOSED',     { value: OrigWS.CLOSED });
    window.WebSocket = PatchedWS;

    // ── Notification permission ──────────────────────────────────────────────
    if (Notification.permission === 'default') {
        document.addEventListener('click', () => Notification.requestPermission(), { once: true });
    }

    console.info('[GuideAlerter] v3.1 ready — listening for guide-request-new notifications.');

})();`;

    (document.head || document.documentElement).appendChild(script);
    script.remove();
})();