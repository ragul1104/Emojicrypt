# 🔐 EmojiCrypt

> Convert text and images into emoji sequences using a password-based cipher — entirely in your browser.

**Live Demo:** [emojicrypt-five.vercel.app](https://emojicrypt-five.vercel.app)

---

## ✨ Features

| Mode | Direction | Description |
|------|-----------|-------------|
| **Text Encrypt** | Plain Text → Emoji Code | Encode any message with a passphrase |
| **Text Decrypt** | Emoji Code → Plain Text | Decode back with the same passphrase |
| **Image Encrypt** | Image → Emoji Code | Encode pixel data as emojis |
| **Image Decrypt** | Emoji Code → Image | Reconstruct the original image |
| **QR Encrypt** | Text → Emoji → QR | Generate a scannable encrypted QR code |
| **QR Scan** | Scan QR → Emoji → Text | Scan & decrypt with camera |

---

## 🏗 Architecture

**100% client-side static web app** — no backend, no server, no data sent anywhere.

```
emojicrypt/
├── index.html       # Single-page app shell
├── style.css        # Responsive dark-theme styles
├── emojicrypt.js    # Encryption engine (JS port of original algorithm)
├── app.js           # UI logic & event handlers
├── vercel.json      # Deployment config
└── README.md
```

### External CDN Dependencies

| Library | Purpose |
|---------|---------|
| [pako](https://cdn.jsdelivr.net/npm/pako@2.1.0) | zlib compress/decompress for image data |
| [qrcode.js](https://cdn.jsdelivr.net/npm/qrcode@1.5.3) | QR code canvas rendering |
| [html5-qrcode](https://unpkg.com/html5-qrcode@2.3.8) | Camera-based QR scanning |
| Google Fonts | Outfit + JetBrains Mono |

---

## 🔐 Algorithm

EmojiCrypt uses a **block-based seeded emoji substitution cipher**:

1. Text is split into **256-character blocks**
2. Each block uses a unique seed: `"{password}-block-{index}"`
3. The emoji list (~700 emojis) is **shuffled** with a seeded PRNG (Mulberry32)
4. Each character maps to a **4-emoji sequence** using a deterministic jump pattern based on the character's printable index
5. Decryption rebuilds the same lookup table and reverses the mapping

> ⚠️ **Security note:** This is novelty obfuscation, not cryptographic encryption. Do not use for sensitive data.

---

## 🚀 Deploy to Vercel

### One-click
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ragul1104/emojicrypt)

### Manual
```bash
# 1. Clone
git clone https://github.com/ragul1104/emojicrypt.git
cd emojicrypt

# 2. Deploy (requires Vercel CLI)
npm i -g vercel
vercel --prod
```

---

## 🖥 Local Development

No build step required — it's plain HTML/CSS/JS.

```bash
# Option 1: Python
python -m http.server 3000

# Option 2: Node
npx serve .

# Option 3: VS Code
# Install "Live Server" extension → click "Go Live"
```

---

## 📱 GitHub → Vercel Auto-Deploy

1. Push this repo to GitHub
2. Import repo in [Vercel Dashboard](https://vercel.com/new)
3. Framework preset: **Other** (static)
4. Root directory: `/`
5. Every `git push` auto-deploys ✅

---

## 👨‍💻 Author

**Ragul V** — BCA @ Arignar Anna College (Periyar University)

- LinkedIn: [linkedin.com/in/ragulv11](https://linkedin.com/in/ragulv11)
- GitHub: [github.com/ragul1104](https://github.com/ragul1104)

---

## 📄 License

MIT — free to use, modify, and deploy.
