# CRUX: the all-in-one browser toolkit

CRUX puts **222 free tools** in one browser extension: ad and tracker blocking, a password vault, safety checks, a website investigator (Track), image, video and PDF studios, a stock-market coach, reading and accessibility tools, calculators, trackers and a large everyday toolbox.

Switch tools on or off, or just open the one you need. Where it makes sense, CRUX **asks first** with a small popup ("Scan this site?", "Make a strong password?", "Save this login?") instead of acting on its own.

Version 1.0.0 · Works in Chrome, Edge, Brave and other Chromium browsers (version 116 or newer).

---

## 1. Install

1. Unzip `crux-extension.zip`. You get a folder called `crux` (keep it somewhere permanent, the browser reads from it).
2. Open `chrome://extensions` (Edge: `edge://extensions`).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and choose the unzipped folder.
5. Click the puzzle-piece icon and **pin CRUX**.

**Updating:** remove the old CRUX on the same page, then load the new folder the same way. Your saved data (vault, notes, trackers) stays in the browser unless you remove the extension, but export your vault first to be safe (Vault → Settings → Export encrypted backup).

---

## 2. Using CRUX

### Three ways to open it

| How | Best for |
|---|---|
| **Popup** (click the icon, or `Alt+Shift+C`) | Quick actions |
| **Full screen** (the ⤢ button, `Alt+Shift+H`, or right-click the icon → Options) | Browsing all 222 tools with a sidebar, search and sections |
| **Side panel** (the ▥ button) | Keeping CRUX open beside the page while you work |

In full screen and the side panel, tools act on the **last website tab you used**, not on the dashboard itself.

### Switches vs. buttons
- A **switch** means "keep this tool active". Active tools can show popups on matching pages.
- A **button** (like *Scan this site* or *Open*) runs the tool once. It works even if the switch is off.
- **All** at the top flips every switch at once.
- **☆ Pin** any tool to keep it at the top. Recently used tools are listed in the full-screen view.
- **Pause here** turns CRUX off for the current site.
- **Popups** (footer) turns the ask-first popups off everywhere.

### The ask-first popups
When a tool is switched on and the page fits, a card slides in at the top right. Each card has **Not now** and **Don't ask on this site**. Examples: Track scan, risky-site warning, strong password, save login, throwaway email, form filler, reader view, translate, ambient glow, night mode, screen comfort, link check, image grabber.

### Right-click menus
- On an **image**: Remove background, Edit in Image Studio, Google Lens search, TinEye search.
- On a **link**: Check this link with CRUX, Make a QR code.
- On a **page**: Scan with Track, Save to reading list.

### Keyboard shortcuts

| Keys | Action |
|---|---|
| `Alt+Shift+C` | Open the CRUX popup |
| `Alt+Shift+T` | Scan the current site with Track |
| `Alt+Shift+H` | Open the full-screen dashboard |
| `Alt+P` | Picture-in-picture for the main video |
| `Alt+G` | Ambient glow on/off |
| `S` / `D` / `R` | Video speed slower / faster / reset (up to 16x) |
| `Z` / `X` | Skip video back / forward 10 seconds |
| `/` | Focus search (full-screen dashboard) |
| `Esc` | Close reader view, ruler, zapper and similar overlays |

You can change the first three at `chrome://extensions/shortcuts`.

---

## 3. Highlights

### Protection
Ad blocker, tracker blocker, tracking-tag cleaner (utm_, fbclid, gclid), redirect and popup blocker, cookie-banner killer, always-HTTPS, site cleaner and quick clean. Blocking uses the browser's built-in rule engine, so it stays fast. The icon badge shows how many requests were blocked on the current page.

### Track (website investigator)
One click shows owner clues, contact details, developers and credits, when the domain was registered, tech stack, server and location, DNS and mail setup, security headers, trackers, subdomains and more. Many owners hide their details behind privacy services, so Track shows what the site and public records reveal.

### Password vault
Encrypted with AES-256-GCM, key derived from your master password with PBKDF2-SHA256 (600,000 rounds). It never leaves your device. It offers to make strong passwords, fill logins (only after you click) and save new ones. There is also a breach check (only the first 5 characters of a hash are sent) and an encrypted backup. **There is no recovery if you forget the master password.** The unlocked key lives only in memory and clears when the browser closes or after the auto-lock time (default 10 minutes).

### Ambient glow (YouTube and other videos)
Cinema lighting around the video. Open **Controls** for blur, light amount, colour richness, glow size, page dimming, smoothness, refresh rate, colour mode (match the video, warm, cool, custom) and presets. Settings are remembered.

### Image Studio
Background remover (auto from edges or pick a colour, with erase and restore brushes), watermark and object remover (paint over it and CRUX fills it in), blur and pixelate, resize, crop and rotate with social presets, add your own watermark, adjust and filters, annotate, photo privacy (see and strip hidden location data) and colour palette. Also **Screenshot and edit**.

### Image Maker
Meme maker, quote and banner maker, avatars, placeholder images, wallpapers, barcodes, collages, passport-photo sheets, favicon packs (zip), and photo effects (pixel art, sketch, cartoon, duotone, ASCII). **AI image generator** (free online service, see section 5).

### Video Studio
Photo slideshow videos, text and quote videos, a video editor (trim, speed, filters, text, logo, compress), video to GIF, extract audio and grab a frame. Videos are built on your device and record in real time, so **keep the tab open and visible** while rendering.

### PDF tools
Merge, split or extract pages, rotate or delete pages, images to PDF, page numbers and watermark, **invoice maker** and **resume maker**. Files never leave your device.

### Market Coach
Analyzes a stock, index or crypto from price history: trend, momentum, support and resistance, a scorecard, "if this, then that" scenarios, an example risk plan (shares, stop, target) and **backtests** of five simple rules on that stock's own history. A chart-screenshot tab lets you capture a chart and get a ready-made question for any AI assistant, or analyze it with your own API key. Includes a position-size calculator, a loss-recovery table and a scam red-flag checklist.

> **No guarantee.** Nobody can guarantee market returns. "Lean" describes what past prices show; it is not a prediction. Backtests show the past, not the future. Educational only, not financial advice. See the disclaimers in section 8.

### Toolbox (135 tools)
Calculators (EMI, SIP, GST, PPF, loans, health, study, home), text and developer tools, planners and trackers (expenses, habits, kanban, journal), an authenticator (2FA codes), QR codes (Wi-Fi, UPI, contacts and more), flashcards and more. Open it from the popup, or in full screen under each category.

---

## 4. Full tool list

### Protect (10)

| Tool | What it does |
|---|---|
| 🚫 Ad blocker *(switch)* | Blocks ad networks, hides ad slots, skips video ads |
| 👁️ Tracker blocker *(switch)* | Stops analytics, pixels and fingerprinting |
| 🧼 Clean links *(switch)* | Strips utm_, fbclid, gclid tags from URLs |
| ↩️ Redirect blocker *(switch)* | Stops sneaky auto-redirects and popups |
| 🍪 Cookie banners *(switch)* | Rejects or hides consent popups |
| 🔒 Always HTTPS *(switch)* | Upgrades http:// pages to https:// |
| 🗝️ Password vault *(switch)* | Asks to make, fill and save passwords |
| 📧 Temp email *(switch)* | Throwaway inbox for sign-ups, offered on forms |
| 🧽 Site cleaner | Wipe this site’s cookies and data, then reload |
| 🧹 Quick clean | Clears the last hour of history, cache, cookies |

### Investigate (5)

| Tool | What it does |
|---|---|
| 🛰️ Track *(switch)* | Owner, contacts, developers, age, server |
| 🛡️ Site and file checker *(switch)* | Warns on risky sites and downloads |
| 🔗 Link checker *(switch)* | Flags broken and suspicious links |
| 🕰️ Time machine | See old versions of this page |
| 🔬 Page inspector | SEO and accessibility audit of this page |

### Image (21)

| Tool | What it does |
|---|---|
| ✂️ Background remover | Cut out the background, keep it transparent |
| 🪄 Watermark and object remover | Paint over a mark or object to fill it in |
| 🙈 Blur and pixelate | Hide faces, plates and private details |
| 📐 Resize, crop, rotate | Social presets, passport size, flip |
| ©️ Add your watermark | Stamp your name or logo on your photos |
| 🎚️ Photo adjust and filters | Brightness, color, blur and one-tap looks |
| ✏️ Annotate image | Arrows, boxes, text and hide-boxes |
| 🕵️ Photo privacy | See and strip hidden location and camera data |
| 🌈 Colors in image | Pull a palette out of any picture |
| 📸 Screenshot and edit | Capture this page and open it in the editor |
| 😂 Meme maker | Add top and bottom text to any picture |
| 🖋️ Quote and banner maker | Quote cards, stories, thumbnails, banners |
| 🧑‍🎨 Avatar generator | Initials, pixel and gradient avatars |
| 🔲 Placeholder image | Any size, any color |
| 🌌 Wallpaper maker | Gradient wallpapers for phone and desktop |
| ▥ Barcode generator | Code 128 barcodes |
| 🧩 Photo collage | Combine photos into one grid |
| 🪪 Passport photo sheet | Print-ready sheets of passport photos |
| ⭐ Favicon and app icons | Every icon size in one zip |
| 🎭 Photo effects and ASCII | Pixel art, sketch, cartoon, duotone, ASCII |
| 🤖 AI image generator | Describe it and get a picture (free) |

### Video (6)

| Tool | What it does |
|---|---|
| 🎞️ Photo slideshow video | Photos to a video with motion and music |
| 🔤 Text and quote video | Animated text videos for Reels and Shorts |
| ✂️ Video editor | Trim, speed, filters, text, logo, compress |
| 🖼️ Video to GIF | Turn a clip into a GIF |
| 🎧 Extract audio | Save the sound from a video |
| 📷 Grab a video frame | Save any moment as a picture |

### PDF (7)

| Tool | What it does |
|---|---|
| 🧷 Merge PDFs | Combine files into one, in any order |
| ✂️ Split or extract pages | Keep only the pages you need |
| 🔄 Rotate or delete pages | Fix sideways scans, drop pages |
| 🖼️ Images to PDF | Turn photos or scans into one PDF |
| 🔢 PDF numbers and watermark | Page numbers, DRAFT stamp, clear properties |
| 🧾 Invoice maker | Make a clean PDF invoice |
| 📄 Resume maker | Simple ATS-friendly resume PDF |

### Markets (7)

| Tool | What it does |
|---|---|
| 📊 Market Coach | Analyze a stock: indicators, levels, risk plan, backtests |
| 📸 Chart screenshot: what next? | Capture a chart and get an educational read |
| 🛡️ Position size and risk | How much to buy so one loss stays small |
| 🚩 Reality check | Scam red flags and a pre-trade checklist |
| 🛡️ Position size | Shares to buy for a set risk |
| 📉 Average price | Your new average after buying more |
| ↩️ Loss recovery | Gain needed to recover from a loss |

### Media (10)

| Tool | What it does |
|---|---|
| 🌈 Ambient glow *(switch)* | Cinema lighting with blur, light and dimming controls |
| 🎥 Screen recorder *(switch)* | Screen, window or tab, with audio |
| 📸 Screenshot | Save what you see as a PNG |
| 📜 Full-page shot | Capture the whole page |
| ⏩ Video speed *(switch)* | S / D change speed to 16x, R resets, Z / X skip 10s |
| 🖼️ Image grabber *(switch)* | List and download page images |
| 🪟 Picture-in-picture *(switch)* | Float any video (Alt+P) |
| 🔊 Volume booster | Boost quiet videos up to 500% |
| ⏸️ Autoplay blocker *(switch)* | Stops videos that start by themselves |
| 🧘 YouTube focus *(switch)* | Hides Shorts, comments and recommendations |

### Read (6)

| Tool | What it does |
|---|---|
| ♿ Reading and access *(switch)* | Reader view, read aloud, dyslexia font, contrast |
| 🌙 Night mode *(switch)* | Dark theme, remembered per site |
| 🌅 Screen comfort *(switch)* | Blue-light and dimming filter |
| 📝 Page notes *(switch)* | Sticky note that returns on every visit |
| 🈯 Translate *(switch)* | Offers to translate pages in other languages |
| 💬 Selection bar *(switch)* | Select text to copy, search, define, translate, listen |

### Page (10)

| Tool | What it does |
|---|---|
| 🔓 Copy unlocker *(switch)* | Re-enables copy and right-click on locked pages |
| 👀 Show passwords *(switch)* | Reveal a password field when you hover it |
| 📏 Scroll progress *(switch)* | Progress bar and back-to-top button |
| ⚡ Element zapper *(switch)* | Click any annoying element to remove it for good |
| ⏬ Auto-scroll | Hands-free reading scroll |
| 📋 Copy link | Copy a clean link or Markdown link |
| 🔇 Mute tab | Mute or unmute this tab |
| 🔤 Style inspector | Click text to see its font, size and color |
| 📐 Pixel ruler | Drag to measure anything on the page |
| 🖨️ Print or save PDF | Open print, choose Save as PDF |

### Do more (8)

| Tool | What it does |
|---|---|
| ✍️ Form filler *(switch)* | Asks to fill your name, email, address on forms |
| 🗂️ Tab manager | Search, dedupe, mute, stash, restore tabs |
| 💤 Tab saver *(switch)* | Sleeps tabs you haven’t used |
| 🎯 Focus and Pomodoro *(switch)* | Blocks distractions on a timer |
| 🎨 Color picker | Pick any color on screen |
| 💧 Health reminders *(switch)* | Eye breaks every 20 min, water and posture nudges |
| 📚 Read later | Save this page to a list for later |
| 📖 Reading list | Everything you saved to read later |

### Calculate (35)

| Tool | What it does |
|---|---|
| 🧮 Calculator | Scientific: sqrt, sin, log, pi, powers |
| ％ Percentage | X% of Y, what percent, % change |
| 🏷️ Discount | Sale price and what you save |
| 🍽️ Tip and split | Split a bill between friends |
| ⚖️ BMI | Body mass index |
| 🎂 Age | Exact age and next birthday |
| 📅 Date difference | Days, weeks and weekdays between dates |
| 🏦 Loan EMI | Monthly payment and total interest |
| 📈 SIP calculator | Future value of monthly investing |
| 💹 Compound interest | Growth over time |
| 🧾 GST | Add or remove GST (5, 12, 18, 28%) |
| ⛽ Fuel cost | Trip fuel and cost |
| 🔁 Units and money | Length, weight, data, speed, temperature, currency |
| 🏧 Fixed deposit | Maturity value of an FD |
| 📐 CAGR | Compound annual growth rate |
| 💰 Profit margin | Margin and markup from cost and price |
| 💼 Salary converter | Hourly, monthly, yearly pay |
| 🔥 Calories (BMR) | Daily calorie needs |
| 📊 Statistics | Mean, median, mode, std deviation |
| 🖥️ Aspect ratio | Ratio and resize math |
| 🚗 Travel time | Distance and speed to time |
| 🎈 Inflation | Future cost of things |
| 🕘 Time difference | Hours between two times |
| 🏦 Loan prepayment | See interest saved by prepaying |
| 🌴 Retirement corpus | How much you need, and the SIP to get there |
| ⚖️ Break-even | Units to cover your costs |
| 📈 ROI | Return on investment, per year |
| 🏛️ PPF calculator | 15-year PPF maturity |
| 🏧 Recurring deposit | RD maturity value |
| 🎁 Gratuity | Gratuity from salary and years |
| 🧾 VAT calculator | Add or remove VAT |
| 💡 Electricity bill | Estimate from units used |
| 🗓️ Working days | Business days between dates |
| ➕ Add or subtract dates | Days, months, years from a date |
| 📆 Day of the week | Weekday, week number, leap year |

### Health (7)

| Tool | What it does |
|---|---|
| 💧 Water intake | Daily water for your weight |
| 🧍 Ideal weight | Four standard formulas |
| 👶 Pregnancy due date | Due date and weeks along |
| 😴 Sleep calculator | Best bed and wake times |
| ❤️ Heart rate zones | Training zones by age |
| 📏 Body fat | US Navy method |
| 🥗 Macros | Protein, carbs, fat for your calories |

### Study (10)

| Tool | What it does |
|---|---|
| 🎓 GPA and CGPA | GPA and percentage |
| 📝 Final grade needed | What you need on the exam |
| ➗ Fractions | Add, subtract, multiply, divide |
| 📉 Quadratic solver | Roots and vertex |
| 🔢 Primes, GCD and LCM | Factorize any number |
| 🎰 Permutations and combinations | nPr, nCr, factorial |
| 📐 Shapes calculator | Area, volume, perimeter |
| 🃏 Flashcards | Make a deck and quiz yourself |
| 📚 Dictionary | Definitions, examples, audio |
| 🔤 Synonyms and rhymes | Find the right word |

### Life (13)

| Tool | What it does |
|---|---|
| 🎨 Paint calculator | Litres for a room |
| 🧱 Tile calculator | Tiles for a floor |
| 🍳 Cooking converter | Cups to grams by ingredient |
| 🍲 Recipe scaler | Double or halve a recipe |
| 💸 Expense tracker | Log spending, see monthly totals |
| 🔥 Habit tracker | Daily streaks |
| 🎅 Secret Santa | Draw names fairly |
| 👥 Team splitter | Random teams |
| 🎡 Spin the wheel | Pick from a list |
| 🗂️ Kanban board | To do, doing, done |
| 📔 Journal | One entry per day |
| 🔘 Tally counters | Tap to count |
| 🔐 Authenticator (2FA) | One-time codes like Google Authenticator |

### Text (27)

| Tool | What it does |
|---|---|
| 🔤 Text tools | Count, case, slug, sort, dedupe, reverse |
| 📄 Lorem ipsum | Placeholder text |
| 📊 Word frequency | Most used words |
| ✨ Fancy text | Bold, script, circled and more for bios |
| 📡 Morse code | Text to Morse and back |
| 💾 Binary and hex | Text to binary, hex and back |
| 🔐 ROT13 and Caesar | Simple letter-shift ciphers |
| & HTML entities | Encode and decode |
| ⇄ Text diff | Compare two texts line by line |
| Ⓜ️ Markdown preview | Write Markdown, see it rendered |
| 🗃️ CSV and JSON | Convert both ways |
| 🗜️ Minifier | Basic CSS, JS and HTML minify |
| 🔊 Text to speech | Read text aloud with any voice |
| 🗒️ Scratchpad | Notepad that saves as you type |
| ✅ To-do list | Simple saved checklist |
| Ⅻ Roman numerals | Numbers to Roman and back |
| 🐫 Case converter | camelCase, snake_case, kebab-case… |
| 🧽 Text cleaner | Strip spaces, line breaks, accents |
| 🎣 Extractor | Pull emails, links, numbers, hashtags |
| 🐦 Post length | X, Instagram, LinkedIn, SMS limits |
| 🔠 Number to words | Indian and international style |
| 📖 Readability | Flesch score and grade level |
| 🧮 List compare | What differs between two lists |
| 🔁 Find and replace | Plain or regex |
| 🔣 Unicode inspector | Code points and bytes |
| 🔀 Shuffle and pick | Randomize lines or words |
| 😀 Emoji picker | Search and click to copy |

### Dev (33)

| Tool | What it does |
|---|---|
| {} JSON | Format, minify, validate |
| 🧬 Base64 | Encode and decode |
| 🔗 URL tools | Encode, decode, parse |
| 🪪 JWT decoder | Read token header and payload |
| #️⃣ Hashes | SHA-1, 256, 384, 512 |
| 🕒 Timestamp | UNIX time and dates |
| 🆔 UUID generator | Random unique IDs |
| 🔎 Regex tester | Live matches and groups |
| 🎨 Color converter | HEX, RGB, HSL |
| 🌅 CSS gradient | Pick colors, copy the code |
| 🔢 Number bases | Binary, octal, decimal, hex |
| 📁 chmod calculator | Unix permissions |
| 🖥️ Browser info | User agent, screen, memory |
| 📍 My IP | Your public IP and network |
| 🌐 DNS lookup | A, MX, NS, TXT records |
| 📟 HTTP status codes | What each code means |
| 🖼️ Image converter | Convert, resize and compress |
| 🧱 Image to Base64 | Data URL for any image |
| ▦ QR code | For this page or any text |
| 🌍 World clock | Times around the world |
| 🧪 HTML playground | Live HTML and CSS preview |
| 🌑 Box shadow | Generate CSS shadows |
| ⏰ Cron explainer | Next run times for any cron line |
| 🔏 HMAC | Keyed hash of a message |
| 🛡️ Password strength | How long would it take to crack? |
| 🕸️ Subnet calculator | CIDR to range and hosts |
| 🎨 Color palette | Harmonies, tints and shades |
| 🔆 Contrast checker | WCAG AA and AAA |
| ↔️ px and rem | Convert CSS units |
| 🧾 XML formatter | Pretty print or minify |
| 🔑 Password generator | Strong passwords with options |
| 🏷️ UTM link builder | Campaign tracking links |
| ▶️ YouTube thumbnails | Get a video’s thumbnail images |

### Fun (7)

| Tool | What it does |
|---|---|
| ⏱️ Stopwatch | With laps |
| ⏳ Countdown | Timer with a beep |
| 🎲 Decider | Coin, dice, random picker |
| ⌨️ Typing test | WPM and accuracy |
| ⚡ Reaction test | How fast are you? |
| 🫁 Breathing guide | 4-7-8 and box breathing |
| 🗓️ Days until | Countdown to your dates |

---

## 5. Privacy and network use

**Everything runs on your device**, and your data is stored in your browser, unless a tool below says otherwise. CRUX has no account and no server of its own.

| Tool | Contacts | What is sent |
|---|---|---|
| Track | rdap.org, dns.google, ipwho.is, web.archive.org, crt.sh | The site's domain name and IP address |
| Vault breach check | api.pwnedpasswords.com | First 5 characters of a password hash (k-anonymity) |
| Temp email | api.mail.tm | Requests for a throwaway address and its inbox |
| Link checker, Site checker | The links or site being checked | A normal web request to each |
| Selection bar "Define" | api.dictionaryapi.dev | The selected word |
| Dictionary, Synonyms | api.dictionaryapi.dev, api.datamuse.com | The word you type |
| Currency converter | open.er-api.com | A rates request (nothing about you) |
| YouTube thumbnails | img.youtube.com | The video ID |
| **AI image generator** | image.pollinations.ai | **Your description** (don't include private details) |
| Market Coach prices | query1.finance.yahoo.com | The symbol you typed |
| **AI chart reader (optional)** | api.anthropic.com | **Your screenshot and note**, using **your own** API key |
| Right-click search, Translate | Google Lens, TinEye, Google Translate | The image or page address, only when you choose it |
| Site and file checker (optional) | virustotal.com | A file's SHA-256 fingerprint, only if you add your own key |

**Stored unencrypted on your device** (so keep sensitive things out): form-filler details, authenticator secrets, notes, journal, to-dos, scratchpad, expenses, habits, and your optional API keys. The vault is the encrypted part.

---

## 6. Permissions explained

| Permission | Why |
|---|---|
| All websites | Blocking, Track, the link checker, popups on pages, and fetching public lookups |
| activeTab, scripting, tabs | Run tools on the page you are on, read tab titles for the tab manager |
| storage | Save your settings and data locally |
| declarativeNetRequest | Ad, tracker and redirect rules, Focus guard, HTTPS upgrades |
| downloads | Save screenshots, images and files; warn about risky downloads |
| notifications | Risky-download warnings, health reminders, Pomodoro alerts |
| alarms | Timers for the tab saver, Pomodoro and reminders |
| browsingData | Site cleaner and Quick clean |
| contextMenus | The right-click menus |
| sidePanel | The side panel |

---

## 7. Good to know

- **Ad blocking** uses a built-in list of 95 ad domains and 62 tracker domains, plus 26 tracking-tag rules and page rules. It is not as exhaustive as a full filter-list blocker. YouTube video-ad skipping is best effort and may need updates when YouTube changes.
- **Background remover** works best on plain or evenly lit backgrounds (logos, products, signatures, documents). It will not cleanly cut out hair or busy scenes. Use the brushes to tidy edges.
- **Watermark and object remover** is a paint-over fill for your own pictures: your watermark, date stamps, clutter. It works best on small areas and is not meant for removing other people's copyright marks.
- **Ambient glow, volume boost and full-page screenshots** depend on how a site is built and can fail on some sites (protected video, scrolling boxes inside a page).
- **Video Studio** renders in real time. Hidden or background tabs get paused by the browser.
- **Large images** are scaled to 3200 px on the long side in the studios to keep editing smooth.
- **Pages the browser protects** (`chrome://` pages, the Chrome Web Store) can't be scanned or modified by any extension.
- **Health, finance and legal calculators** are estimates. Check results with a professional for decisions that matter.

---

## 8. Disclaimers

- **Market Coach and the money tools are educational, not financial advice.** No tool, adviser or signal can guarantee returns. Anyone promising guaranteed or "fixed high" returns is a red flag. Past performance does not predict future results. You can lose money, including all of it, especially with leverage. Check that advisers are registered with your market regulator (in India, SEBI).
- **Health tools** (calories, BMI, due date, sleep, heart-rate zones, body fat) give general estimates and are not medical advice.
- **Safety checks** (site and file checker, link checker, risky-site warnings) are warning signs, not proof. A clean result does not guarantee safety.
- Use the **watermark/object remover** and **background remover** only on images you own or have permission to edit.

---

## 9. Troubleshooting

| Problem | Try this |
|---|---|
| A tool says "Not on this page" | Browser pages (`chrome://`) can't be modified. Open a normal website. |
| Popups don't appear | Check **Popups** is on in the footer, that you haven't chosen "Don't ask on this site", and that the tool's switch is on. Reload the page after installing. |
| Something broke on a site | Press **Pause here**, or turn off Redirect blocker, Cookie banners or Ad blocker and reload. |
| Screenshots capture the wrong tab | Open the page you want first, then use the tool. From the full-screen dashboard CRUX switches to your last website tab automatically. |
| Video Studio output is empty or short | Keep the tab visible while it renders. |
| Market symbol not found | Indian stocks need `.NS` (NSE) or `.BO` (BSE). Or paste a CSV (Date, Close columns) from your broker. |
| AI image generator shows an error | The free service can be busy or change. Press Retry in a minute. |
| Forgot vault password | It can't be recovered. Restore from your encrypted backup if you have one. |
| Extension disappears after restart | Keep the unzipped folder in a permanent location. Don't delete or move it. |

---

## 10. For developers

- Manifest V3. No build step: plain JavaScript, HTML and CSS. Edit files and press the reload button on `chrome://extensions`.
- `background.js` is the service worker (rules, actions, vault key, lookups). `core.js` is the content-script core (settings, prompts). `m-*.js` are page tools. `catalog.js` and `tb.json` define the tile list.
- Standalone pages: `vault`, `check`, `recorder`, `tools` (toolbox), `imgstudio`, `maker`, `video`, `pdftools`, `market`, `imagine`, `tabs`, `focus`, `later`, `tempmail`, `profile`.
- Shared logic with tests: `imgcore.js` (image algorithms), `pdfcore.js`, `videocore.js`, `marketcore.js`, `zip.js`.
- Bundled open-source libraries (all MIT): **qrcode-generator**, **pdf-lib**, **gifenc**.

### What was verified
Algorithms were checked against independent references: market indicators and backtests against pandas and `ta`, Code 128 barcodes against `python-barcode`, authenticator codes against the official RFC 6238 test vectors, ZIP and ICO output against Python's `zipfile` and Pillow, and PDFs by reading them back. Pages were exercised in a simulated browser. Parts that need real hardware or live services (screen recording, video rendering, live price data, the AI image service and the optional AI chart reader) were not run end to end, so report anything that misbehaves.

---

*Made with CRUX. Stay curious, stay safe.*
