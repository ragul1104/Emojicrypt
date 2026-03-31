// ============================================================
//  EmojiCrypt – Core Encryption Engine
//  Block-based seeded emoji substitution cipher
//  NOTE: novelty obfuscation only – not cryptographically secure
// ============================================================

const EMOJI_LIST = [
  // Smileys & Emotion
  '😀','😂','😊','😍','🤔','😎','😭','😡','👍','👎','❤️','💔','🔥','✨','⭐','🎉','🚀','💯',
  '😃','😄','😁','😆','😅','🤣','😇','😉','😌','🥰','😘','😋','😜','🤪','🤨','🧐','🤓','🤩',
  '🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😤','😠','🤬',
  '🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤭','🤫','🤥','😶','😐','😑','😬','🙄',
  '😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕',
  '🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹',
  // People & Body
  '👋','🤚','🖐️','✋','🖖','👌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️',
  '✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦿','🦶',
  '👣','👂','🦻','👃','🧠','🦷','🦴','👀','👁️','👅','👄','👶','🧒','👦','👧','🧑','👱','👨',
  '🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🙇','🤦','🤷',
  '👮','🕵️','💂','👷','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🤱','👼','🎅','🤶','🦸','🦹',
  '🧙','🧚','🧛','🧜','🧝','🧞','🧟','💆','💇','🚶','🧍','🧎','🏃','💃','🕺','🗣️','👤','👥','🫂',
  // Animals & Nature
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦',
  '🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🐢','🐍','🐙',
  '🦑','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦏','🐪','🦒','🦘','🐃',
  '🐂','🐄','🐎','🐖','🐏','🐑','🐐','🦌','🐕','🐩','🐈','🐓','🦃','🕊️','🐇','🐁','🐀','🐿️',
  '🌵','🎄','🌲','🌳','🌴','🌱','🌿','🍀','🍁','🍄','🌍','🌞','🌕','🌑','⚡','💧','🌊',
  '🌎','🌏','🌋','🌌','🌠','🌈','☀️','☁️','❄️','☃️','🌬️','💨','🌪️','🌫️',
  // Food & Drink
  '🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🥝','🍅','🥥','🥑','🍆',
  '🥔','🥕','🌽','🌶️','🥒','🥬','🥦','🧄','🧅','🍞','🥐','🥖','🥨','🧀','🥚','🍳','🥞','🥓',
  '🥩','🍗','🍖','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🍿','🧂','🥫','🍱','🍚','🍛','🍜','🍝',
  '🍠','🍣','🍤','🍥','🍡','🥟','🥡','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬',
  '🍭','🍮','🍯','🍼','🥛','☕','🍵','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃',
  // Activities
  '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🎱','🏓','🏸','🥅','🏒','🏑','🏏','⛳','🏹','🎣','🥊','🥋','🛹',
  '🥇','🥈','🥉','🏆','🏅','🎖️','🎯','🎲','♟️','🎰','🎳','🎮','🧩','🎨','🎭','🎼','🎤','🎧','🎷',
  '🎸','🎹','🎺','🎻','🪕','🥁',
  // Travel & Places
  '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🛵','🚲','🛴','⛽','🚦',
  '🏁','🚩','🎌','🏴','🏳️','⚓','⛵','🛶','🚤','🛳️','⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬',
  '🛰️','🚁','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','🏠',
  '🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌',
  '🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','♨️','🎠','🎡','🎢',
  // Objects
  '⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','💽','💾','💿','📀','📼','📷','📹','🎥','📞','☎️','📟',
  '📠','📺','📻','🎙️','🧭','📡','🔋','🔌','💡','🔦','🕯️','🗑️','🛢️','💸','💵','💴','💶','💷',
  '💰','💳','💎','⚖️','🔧','🔨','⚒️','⛏️','🔩','⚙️','⛓️','💣','🔪','🗡️','🛡️','⚰️',
  '⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️',
  '🧹','🧺','🧻','🚽','🚰','🚿','🛁','🔑','🗝️','🛋️','🪑','🚪','🛏️','🖼️','🧸','🪆','🛍️','🛒',
  '🎁','🎀','🎈','🎊','🎏','🎎','🎐','🧧','✉️','📩','📨','📧','💌','📮','📪','📫','📬',
  '📭','📦','🏷️','📜','📃','📄','📑','📊','📈','📉','🗒️','🗓️','📆','📅','📇','🗃️','🗳️','🗄️',
  '📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔗','📎','🖇️',
  '✂️','📐','📏','📌','📍','🔒','🔓','🔏','🔐',
  // Symbols
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝',
  '💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍',
  '♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️',
  '🆚','💮','🉐','🈴','🈵','🈹','🈲','🅰️','🅱️','🆑','🅾️','🆘','❌','⭕','🛑',
  '⛔','📛','🚫','💯','💢','♨️','❗','❕','❓','❔','‼️',
  '⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','❇️','✳️','❎','🌐','💠',
  'Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🎦',
  '📶','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓',
  '⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️',
  '⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️',
  '↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾️','💲','💱','™️',
  '©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵',
  '🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️',
  '🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬',
  '💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄',
];

// Python's string.printable equivalent
const PRINTABLE = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ \t\n\r\u000b\u000c';

const BLOCK_SIZE = 256;
const CHUNK_SIZE = 4;

// ── Seeded PRNG (Mulberry32) ──────────────────────────────────────
function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

function makeRng(seedStr) {
  let s = hashStr(seedStr);
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

function seededShuffle(arr, seedStr) {
  const result = arr.slice();
  const rng = makeRng(seedStr);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ── Build char→index map once ────────────────────────────────────
const CHAR_TO_IDX = {};
for (let i = 0; i < PRINTABLE.length; i++) CHAR_TO_IDX[PRINTABLE[i]] = i;

// ── Encrypt ──────────────────────────────────────────────────────
function ecEncrypt(plainText, password) {
  const out = [];
  for (let bi = 0; bi * BLOCK_SIZE < plainText.length; bi++) {
    const block = plainText.slice(bi * BLOCK_SIZE, (bi + 1) * BLOCK_SIZE);
    const emojis = seededShuffle(EMOJI_LIST, `${password}-block-${bi}`);
    for (let ci = 0; ci < block.length; ci++) {
      const idx = CHAR_TO_IDX[block[ci]];
      if (idx === undefined) continue;
      const jump = (idx % 50) + 1;
      let pos = (idx + ci) % emojis.length;
      for (let k = 0; k < CHUNK_SIZE; k++) {
        pos = (pos + jump) % emojis.length;
        out.push(emojis[pos]);
      }
    }
  }
  return out.join(' ');
}

// ── Decrypt ──────────────────────────────────────────────────────
function ecDecrypt(emojiStr, password) {
  const all = emojiStr.trim().split(' ').filter(Boolean);
  if (all.length % CHUNK_SIZE !== 0) return null;

  const chunks = [];
  for (let i = 0; i < all.length; i += CHUNK_SIZE) chunks.push(all.slice(i, i + CHUNK_SIZE));

  let result = '';
  for (let bi = 0; bi * BLOCK_SIZE < chunks.length; bi++) {
    const blockChunks = chunks.slice(bi * BLOCK_SIZE, (bi + 1) * BLOCK_SIZE);
    const emojis = seededShuffle(EMOJI_LIST, `${password}-block-${bi}`);

    // Pre-build lookup: (chunkKey, posInBlock) → char
    const map = new Map();
    for (let ci = 0; ci < PRINTABLE.length; ci++) {
      const jump = (ci % 50) + 1;
      for (let pi = 0; pi < BLOCK_SIZE; pi++) {
        let pos = (ci + pi) % emojis.length;
        const chunk = [];
        for (let k = 0; k < CHUNK_SIZE; k++) {
          pos = (pos + jump) % emojis.length;
          chunk.push(emojis[pos]);
        }
        map.set(chunk.join('\u0000') + '|' + pi, PRINTABLE[ci]);
      }
    }

    for (let pi = 0; pi < blockChunks.length; pi++) {
      const key = blockChunks[pi].join('\u0000') + '|' + pi;
      result += map.get(key) ?? '?';
    }
  }
  return result;
}

// ── Image helpers (Canvas-based) ──────────────────────────────────
async function encryptImage(file, password) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 128;
      let { width: w, height: h } = img;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const pxData = ctx.getImageData(0, 0, w, h).data;
      let pixStr = `${w}:${h};`;
      for (let i = 0; i < pxData.length; i += 4) {
        pixStr += pxData[i].toString().padStart(3,'0')
               + pxData[i+1].toString().padStart(3,'0')
               + pxData[i+2].toString().padStart(3,'0');
      }
      // Compress with pako then base64
      const compressed = pako.deflate(new TextEncoder().encode(pixStr));
      const b64 = btoa(String.fromCharCode(...compressed));
      resolve(ecEncrypt(b64, password));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function decryptImage(emojiStr, password) {
  const b64 = ecDecrypt(emojiStr, password);
  if (!b64 || b64.includes('?')) throw new Error('Decryption failed — wrong password or corrupted data.');
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const decompressed = pako.inflate(bytes);
  const pixStr = new TextDecoder().decode(decompressed);
  const semi = pixStr.indexOf(';');
  const [ws, hs] = pixStr.slice(0, semi).split(':');
  const w = parseInt(ws), h = parseInt(hs);
  const rawPx = pixStr.slice(semi + 1);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  for (let i = 0, p = 0; i < rawPx.length; i += 9, p += 4) {
    imgData.data[p]   = parseInt(rawPx.slice(i, i+3));
    imgData.data[p+1] = parseInt(rawPx.slice(i+3, i+6));
    imgData.data[p+2] = parseInt(rawPx.slice(i+6, i+9));
    imgData.data[p+3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}
