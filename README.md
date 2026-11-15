# EmojiCrypt

A browser based emoji encoder with authenticated encryption. **Try the live app:** https://ragul1104.github.io/Emojicrypt/

## Features

- Encrypt and decrypt text, including Unicode.
- Create and download a QR code for an encrypted text message.
- Encrypt an image as a small PNG preview and decrypt it back to a downloadable image.
- Scan a QR code from an image or, in supported browsers, with a camera.
- The password and content are processed in the browser. Text and image data are not sent to a server.

## Encryption

New messages use PBKDF2-HMAC-SHA256 (600,000 rounds) and authenticated AES-256-GCM, with a fresh random salt and nonce per encryption. Emoji are only a printable encoding of the encrypted bytes. Keep both the full code and password; there is no password recovery. Older unversioned substitution codes were lossy and are not supported by this edition.

## Limits and compatibility

Images are resized to at most 128 × 128 before encryption. QR creation needs internet access for the QRCode.js library loaded from cdnjs. QR scanning depends on browser BarcodeDetector support; current Chrome and Edge are recommended. Camera access requires user permission and a secure context (GitHub Pages HTTPS or localhost).

## Run locally

Install Python 3 and run `python run_local.py`, then open `http://127.0.0.1:8000`. The static text and image workflows need no Python packages.

## GitHub Pages deployment

The site is static and can be published from the `main` branch root. In the repository settings open **Pages**, set **Deploy from a branch**, select `main` and `/(root)`, then save.
