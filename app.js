/* =========================================================
   EmojiCrypt — App Logic
   Handles: tabs, text encrypt/decrypt, image, QR, scanner
   ========================================================= */

'use strict';

// ── Utility helpers ────────────────────────────────────────────
const $ = id => document.getElementById(id);
const toast = () => {
  const el = $('toast');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
};

function setStatus(id, type, msg) {
  const el = $(id);
  el.className = `status-bar ${type}`;
  el.innerHTML = type === 'loading'
    ? `<div class="spinner"></div> ${msg}`
    : msg;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(toast).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    toast();
  });
}

function showCopyBtn(btnId, textArea) {
  const btn = $(btnId);
  if (textArea.value) btn.classList.remove('hidden');
  else btn.classList.add('hidden');
}

// ── Tab switching ──────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active'); b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
    $('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Eye (toggle password visibility) ──────────────────────────
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = $(btn.dataset.target);
    if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
    else { input.type = 'password'; btn.textContent = '👁'; }
  });
});

// ═══════════════════════════════════════════════════════════════
//  TEXT ENCRYPTION — Plain Text → Emoji Code
// ═══════════════════════════════════════════════════════════════
const encInput    = $('enc-input');
const encOutput   = $('enc-output');
const encPassword = $('enc-password');
const encCopyBtn  = $('enc-copy-btn');

// Character counter
encInput.addEventListener('input', () => {
  $('enc-count').textContent = encInput.value.length.toLocaleString() + ' chars';
});

// Encrypt
$('enc-btn').addEventListener('click', async () => {
  const text = encInput.value.trim();
  const pass = encPassword.value;
  if (!text) { setStatus('enc-status', 'error', '❌ Enter a message to encrypt.'); return; }
  if (!pass) { setStatus('enc-status', 'error', '❌ Enter a passphrase.'); return; }

  setStatus('enc-status', 'loading', 'Encrypting…');
  encOutput.value = '';
  encCopyBtn.classList.add('hidden');

  // Run in next tick so browser can repaint loader
  await new Promise(r => setTimeout(r, 20));

  try {
    const result = ecEncrypt(text, pass);
    encOutput.value = result;
    encCopyBtn.classList.remove('hidden');
    const emojiCount = result.split(' ').filter(Boolean).length;
    setStatus('enc-status', 'success',
      `✅ Done! ${text.length} chars → ${emojiCount} emojis (${result.length.toLocaleString()} chars).`);
  } catch (e) {
    setStatus('enc-status', 'error', `❌ Error: ${e.message}`);
  }
});

$('enc-copy-btn').addEventListener('click', () => copyText(encOutput.value));

$('enc-clear').addEventListener('click', () => {
  encInput.value = ''; encOutput.value = '';
  $('enc-count').textContent = '0 chars';
  encCopyBtn.classList.add('hidden');
  setStatus('enc-status', 'idle', '');
});

// ═══════════════════════════════════════════════════════════════
//  TEXT DECRYPTION — Emoji Code → Plain Text
// ═══════════════════════════════════════════════════════════════
const decInput    = $('dec-input');
const decOutput   = $('dec-output');
const decPassword = $('dec-password');
const decCopyBtn  = $('dec-copy-btn');

decInput.addEventListener('input', () => {
  const count = decInput.value.trim().split(' ').filter(Boolean).length;
  $('dec-emoji-count').textContent = count.toLocaleString() + ' emojis';
});

$('dec-btn').addEventListener('click', async () => {
  const text = decInput.value.trim();
  const pass = decPassword.value;
  if (!text) { setStatus('dec-status', 'error', '❌ Paste emoji code to decrypt.'); return; }
  if (!pass) { setStatus('dec-status', 'error', '❌ Enter the passphrase.'); return; }

  setStatus('dec-status', 'loading', 'Decrypting… (may take a moment for long texts)');
  decOutput.value = '';
  decCopyBtn.classList.add('hidden');

  await new Promise(r => setTimeout(r, 20));

  try {
    const result = ecDecrypt(text, pass);
    if (result === null) {
      setStatus('dec-status', 'error', '❌ Invalid or corrupted emoji code.');
      return;
    }
    if (result.includes('?')) {
      setStatus('dec-status', 'error', '❌ Wrong passphrase or corrupted data. Found unrecognised characters.');
      decOutput.value = result;
      return;
    }
    decOutput.value = result;
    decCopyBtn.classList.remove('hidden');
    setStatus('dec-status', 'success', `✅ Decrypted! ${result.length} characters recovered.`);
  } catch (e) {
    setStatus('dec-status', 'error', `❌ Error: ${e.message}`);
  }
});

$('dec-copy-btn').addEventListener('click', () => copyText(decOutput.value));

$('dec-clear').addEventListener('click', () => {
  decInput.value = ''; decOutput.value = '';
  $('dec-emoji-count').textContent = '0 emojis';
  decCopyBtn.classList.add('hidden');
  setStatus('dec-status', 'idle', '');
});

// ═══════════════════════════════════════════════════════════════
//  IMAGE ENCRYPTION — Image File → Emoji Code
// ═══════════════════════════════════════════════════════════════
const imgFileInput = $('img-file-input');
const imgEncZone   = $('img-enc-zone');
let selectedImageFile = null;

function handleImageSelect(file) {
  if (!file || !file.type.startsWith('image/')) {
    setStatus('img-enc-status', 'error', '❌ Please select a valid image file.'); return;
  }
  selectedImageFile = file;
  $('img-enc-filename').textContent = file.name;
  $('img-enc-filename').classList.remove('hidden');
  imgEncZone.classList.add('has-file');

  const reader = new FileReader();
  reader.onload = e => {
    const preview = $('img-enc-preview');
    const thumb   = $('img-enc-thumb');
    const meta    = $('img-enc-meta');
    thumb.src = e.target.result;
    thumb.onload = () => {
      meta.textContent = `${thumb.naturalWidth} × ${thumb.naturalHeight}px · ${(file.size/1024).toFixed(1)} KB`;
    };
    preview.classList.add('visible');
  };
  reader.readAsDataURL(file);
}

imgFileInput.addEventListener('change', () => handleImageSelect(imgFileInput.files[0]));

imgEncZone.addEventListener('dragover', e => { e.preventDefault(); imgEncZone.style.borderColor = 'var(--accent)'; });
imgEncZone.addEventListener('dragleave', () => { imgEncZone.style.borderColor = ''; });
imgEncZone.addEventListener('drop', e => {
  e.preventDefault(); imgEncZone.style.borderColor = '';
  handleImageSelect(e.dataTransfer.files[0]);
});

$('img-enc-btn').addEventListener('click', async () => {
  if (!selectedImageFile) { setStatus('img-enc-status', 'error', '❌ Select an image first.'); return; }
  const pass = $('img-enc-password').value;
  if (!pass) { setStatus('img-enc-status', 'error', '❌ Enter a passphrase.'); return; }

  setStatus('img-enc-status', 'loading', 'Resizing & encrypting image… this may take a few seconds.');
  $('img-enc-output-wrap').classList.add('hidden');

  await new Promise(r => setTimeout(r, 30));

  try {
    const result = await encryptImage(selectedImageFile, pass);
    $('img-enc-output').value = result;
    $('img-enc-output-wrap').classList.remove('hidden');
    const emojiCount = result.split(' ').filter(Boolean).length;
    setStatus('img-enc-status', 'success', `✅ Image encrypted → ${emojiCount.toLocaleString()} emojis.`);
  } catch (e) {
    setStatus('img-enc-status', 'error', `❌ Error: ${e.message}`);
  }
});

$('img-enc-copy').addEventListener('click', () => copyText($('img-enc-output').value));

// Image decrypt counter
$('img-dec-input').addEventListener('input', () => {
  const count = $('img-dec-input').value.trim().split(' ').filter(Boolean).length;
  $('img-dec-count').textContent = count.toLocaleString() + ' emojis';
});

$('img-dec-btn').addEventListener('click', async () => {
  const text = $('img-dec-input').value.trim();
  const pass = $('img-dec-password').value;
  if (!text) { setStatus('img-dec-status', 'error', '❌ Paste emoji code first.'); return; }
  if (!pass) { setStatus('img-dec-status', 'error', '❌ Enter the passphrase.'); return; }

  setStatus('img-dec-status', 'loading', 'Decrypting… please wait.');
  $('img-dec-preview').classList.remove('visible');

  await new Promise(r => setTimeout(r, 30));

  try {
    const dataUrl = await decryptImage(text, pass);
    const preview = $('img-dec-preview');
    const img     = $('img-dec-result');
    img.src = dataUrl;
    $('img-dec-download').href = dataUrl;
    preview.classList.add('visible');
    setStatus('img-dec-status', 'success', '✅ Image decrypted successfully!');
  } catch (e) {
    setStatus('img-dec-status', 'error', `❌ ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════
//  QR CODE GENERATION — Encrypt Text → QR
// ═══════════════════════════════════════════════════════════════
const QR_LIMIT = 100;
const qrInput = $('qr-input');

qrInput.addEventListener('input', () => {
  const len = qrInput.value.length;
  const counter = $('qr-count');
  counter.textContent = `${len} / ${QR_LIMIT}`;
  counter.className = len > QR_LIMIT ? 'char-count warn' : 'char-count';
  $('qr-btn').disabled = len > QR_LIMIT;
});

$('qr-btn').addEventListener('click', async () => {
  const text = qrInput.value.trim();
  const pass = $('qr-password').value;
  if (!text) { setStatus('qr-status', 'error', '❌ Enter a message.'); return; }
  if (!pass)  { setStatus('qr-status', 'error', '❌ Enter a passphrase.'); return; }
  if (text.length > QR_LIMIT) { setStatus('qr-status', 'error', `❌ Keep message under ${QR_LIMIT} characters.`); return; }

  setStatus('qr-status', 'loading', 'Encrypting & generating QR…');
  $('qr-result').classList.remove('visible');

  await new Promise(r => setTimeout(r, 20));

  try {
    const encrypted = ecEncrypt(text, pass);
    const canvas = $('qr-canvas');
    await QRCode.toCanvas(canvas, encrypted, {
      errorCorrectionLevel: 'L',
      margin: 2,
      width: 256,
      color: { dark: '#000000', light: '#ffffff' }
    });
    $('qr-result').classList.add('visible');
    $('qr-download').href = canvas.toDataURL('image/png');
    setStatus('qr-status', 'success', '✅ QR code generated! Download or share it.');
  } catch (e) {
    setStatus('qr-status', 'error', `❌ Error: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════
//  QR SCANNER — Camera → Scan QR → Decrypt
// ═══════════════════════════════════════════════════════════════
let html5QrScanner = null;

$('scan-start-btn').addEventListener('click', async () => {
  $('qr-reader').classList.remove('hidden');
  $('scan-start-btn').classList.add('hidden');
  $('scan-stop-btn').classList.remove('hidden');
  $('scan-result-wrap').classList.remove('scanner-result');

  html5QrScanner = new Html5Qrcode('qr-reader');
  try {
    await html5QrScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decoded) => {
        $('scan-raw').value = decoded;
        $('scan-result-wrap').classList.add('scanner-result', 'visible');
        stopScanner();
      },
      () => {} // ignore on-scan-failure noise
    );
  } catch (e) {
    setStatus('scan-status', 'error', `❌ Camera error: ${e}. Make sure you've granted camera permission.`);
    stopScanner();
  }
});

function stopScanner() {
  if (html5QrScanner) {
    html5QrScanner.stop().catch(() => {});
    html5QrScanner = null;
  }
  $('qr-reader').classList.add('hidden');
  $('scan-start-btn').classList.remove('hidden');
  $('scan-stop-btn').classList.add('hidden');
}

$('scan-stop-btn').addEventListener('click', stopScanner);

$('scan-copy-raw').addEventListener('click', () => copyText($('scan-raw').value));

$('scan-decrypt-btn').addEventListener('click', async () => {
  const text = $('scan-raw').value.trim();
  const pass = $('scan-password').value;
  if (!text) { setStatus('scan-status', 'error', '❌ No QR data scanned yet.'); return; }
  if (!pass)  { setStatus('scan-status', 'error', '❌ Enter the passphrase.'); return; }

  setStatus('scan-status', 'loading', 'Decrypting…');
  $('scan-out-label').classList.add('hidden');
  $('scan-output').classList.add('hidden');

  await new Promise(r => setTimeout(r, 20));

  try {
    const result = ecDecrypt(text, pass);
    if (!result || result.includes('?')) {
      setStatus('scan-status', 'error', '❌ Wrong passphrase or not an EmojiCrypt QR code.');
      return;
    }
    $('scan-output').value = result;
    $('scan-output').classList.remove('hidden');
    $('scan-out-label').classList.remove('hidden');
    setStatus('scan-status', 'success', `✅ Message decrypted! ${result.length} characters.`);
  } catch (e) {
    setStatus('scan-status', 'error', `❌ Error: ${e.message}`);
  }
});

$('scan-copy-out').addEventListener('click', () => copyText($('scan-output').value));
