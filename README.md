# Star Citizen — Guide Request Alerter

A Tampermonkey userscript that alerts you with a **chime sound**, **desktop notification**, and a **flashing tab title** the moment a new guide request arrives on the RSI Spectrum guide page — so you never miss a request while you're in game.

---

## How it works

The RSI Spectrum guide page receives guide requests silently through a WebSocket connection in the background — there's no built-in sound or visual alert. This script intercepts that connection and listens specifically for `guide-request-new` notifications. When one arrives it:

- Plays a two-tone chime
- Sends a desktop notification that stays on screen until you dismiss it, showing the requester's username
- Flashes the browser tab title so you notice it when you alt-tab back
- Shows a dismissible red badge in the bottom-right corner of the page

It only fires on genuine incoming requests — accepting, declining, or cancelling a request will not trigger it.

---

## Requirements

- A Chromium or Firefox based browser (see below for supported browsers)
- The **Tampermonkey** browser extension
- **Userscripts enabled** in your browser (see Step 1 below)

---

## Step 1 — Enable userscripts in your browser

Some browsers block userscripts by default and require you to manually allow them before Tampermonkey can work.

### Opera / Opera GX

1. Go to `opera://flags` in your address bar and press **Enter**
2. Search for **"userscripts"** in the flags search box
3. Set **"Enable userscripts"** to **Enabled**
4. Click **Relaunch** to restart the browser

> This is a required step for Opera and Opera GX — Tampermonkey will install fine but scripts will not run until this flag is enabled.

### Chrome / Brave / Edge

No extra steps needed — userscripts work out of the box once Tampermonkey is installed.

### Firefox

No extra steps needed.

---

## Step 2 — Install Tampermonkey

Install Tampermonkey for your browser from the links below:

| Browser | Link |
|---|---|
| Chrome | [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/) |
| Edge | [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) |
| Opera / Opera GX | [Opera Add-ons](https://addons.opera.com/en/extensions/details/tampermonkey-beta/) |
| Brave | Use the [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) link — Brave supports Chrome extensions natively |
| Safari | [App Store](https://apps.apple.com/us/app/tampermonkey/id1482490089) (paid, $1.99) |

Once installed you should see the Tampermonkey icon (a dark circle with two white squares) in your browser toolbar.

> **Opera / Opera GX users:** After installing from the Opera Add-ons store, you may see a warning saying the extension is not from the Opera store. Click **Go ahead anyway** — Tampermonkey is a well-established and trusted extension used by millions of people.

---

## Step 3 — Install the script

You have two options:

### Option A — One-click install (recommended)

Click the link below. Tampermonkey will detect the script automatically and show an install screen.

> [**Install RSI Guide Request Alerter**](https://raw.githubusercontent.com/McYeke/Spectrum-Guide-Notification/main/Star%20Citizen%20-%20Guide%20Request%20Alerter-3.1.user.js)

Click **Install** on the Tampermonkey install screen and you're done.

### Option B — Manual install

1. Download the `.user.js` file from this repository
2. Open Tampermonkey in your browser toolbar and click **Dashboard**
3. Drag and drop the downloaded file onto the Dashboard — Tampermonkey will open an install prompt
4. Click **Install**

---

## Step 4 — Using the script

1. Navigate to [https://robertsspaceindustries.com/spectrum/guide](https://robertsspaceindustries.com/spectrum/guide) and log in
2. **Click anywhere on the page once** — this is required to unlock audio in the browser (a browser security requirement). You only need to do this once per page load
3. When prompted, click **Allow** to grant desktop notification permission
4. Leave the tab open in the background while you play — the script will alert you automatically when a request comes in
5. Click the red badge in the bottom-right corner to dismiss the alert once you've seen it

---

## Adjusting the volume

Open Tampermonkey's Dashboard, find the script, and click the **edit (pencil) icon**. Near the top of the script you'll find this line:

```js
const VOLUME = 0.5;   // 0.0 – 1.0
```

Change the value to anything between `0.0` (silent) and `1.0` (maximum). For example:

```js
const VOLUME = 0.3;   // quieter
const VOLUME = 0.8;   // louder
```

Save with **Ctrl+S** (or **Cmd+S** on Mac) and reload the guide page for the change to take effect.

---

## Troubleshooting

**The chime isn't playing**
Click somewhere on the guide page first. Browsers block audio until the user has interacted with the page — a single click anywhere fixes this.

**I'm not getting desktop notifications**
Check that notifications haven't been blocked for `robertsspaceindustries.com`. In most browsers you can find this under **Settings → Privacy & Security → Site Settings → Notifications**.

**The script isn't running at all**
- Make sure you completed Step 1 and enabled userscripts in your browser (especially important for Opera / Opera GX)
- Make sure Tampermonkey is enabled and the script is toggled **on** in the Dashboard
- The script only runs on pages matching `robertsspaceindustries.com/spectrum/guide*` — confirm you're on the correct URL

**I updated the script but nothing changed**
Hard-refresh the guide page after saving changes in Tampermonkey (**Ctrl+Shift+R** / **Cmd+Shift+R**).

---

## Privacy & security

This script is safe to use and safe to share. It does not transmit any data anywhere. It only listens to the WebSocket connection that your own browser has already established with RSI Spectrum — the same connection the page itself uses. No credentials, cookies, or personal information are accessed or exposed.

---

## Contributing

If RSI update their site and the script stops working, feel free to open an issue or submit a pull request.

---

## Disclaimer

This script is a fan-made quality-of-life tool and is not affiliated with or endorsed by Cloud Imperium Games or Roberts Space Industries.