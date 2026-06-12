from flask import Flask, render_template, request, jsonify
import string
import random
import qrcode
from PIL import Image
import io
import base64
import zlib

# Initialize the Flask application
app = Flask(__name__)

# --- Base Character and Emoji Sets ---
# Using a reduced, more common set of emojis for broader compatibility
EMOJI_LIST = [
    # Smileys & Emotion
    '😀', '😂', '😊', '😍', '🤔', '😎', '😭', '😡', '👍', '👎', '❤️', '💔', '🔥', '✨', '⭐', '🎉', '🚀', '💯',
    '😃', '😄', '😁', '😆', '😅', '🤣', '😇', '😉', '😌', '🥰', '😘', '😋', '😜', '🤪', '🤨', '🧐', '🤓', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😤', '😠', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄',
    '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕',
    '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹',
    # People & Body
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
    '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶',
    '👣', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨',
    '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🙇', '🤦', '🤷', '🧑‍⚕️', '🧑‍🎓', '🧑‍🏫',
    '🧑‍⚖️', '🧑‍🌾', '🧑‍🍳', '🧑‍🔧', '🧑‍🏭', '🧑‍💼', '🧑‍🔬', '🧑‍💻', '🧑‍🎤', '🧑‍🎨', '🧑‍✈️', '🧑‍🚀', '🧑‍🚒', '👮', '🕵️',
    '💂', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚',
    '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '🗣️', '👤', '👥', '🫂',
    # Animals & Nature
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦',
    '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🐢', '🐍', '🐙',
    '🦑', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🐘', '🦏', '🐪', '🦒', '🦘', '🐃',
    '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🐈', '🐓', '🦃', '🕊️', '🐇', '🐁', '🐀', '🐿️',
    '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '🍀', '🍁', '🍄', '🌍', '🌞', '🌕', '🌑', '⭐', '⚡', '🔥', '💧', '🌊',
    '🌎', '🌏', '🌋', '🌌', '🌠', '🌈', '☀️', '☁️', '❄️', '☃️', '🌬️', '💨', '🌪️', '🌫️',
    # Food & Drink
    '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆',
    '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍞', '🥐', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓',
    '🥩', '🍗', '🍖', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍿', '🧂', '🥫', '🍱', '🍚', '🍛', '🍜', '🍝',
    '🍠', '🍣', '🍤', '🍥', '🍡', '🥟', '🥡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬',
    '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃',
    # Activities
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋', '🛹',
    '🥇', '🥈', '🥉', '🏆', '🏅', '🎖️', '🎯', '🎲', '♟️', '🎰', '🎳', '🎮', '🧩', '🎨', '🎭', '🎼', '🎤', '🎧', '🎷',
    '🎸', '🎹', '🎺', '🎻', '🪕', '🥁',
    # Travel & Places
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛵', '🚲', '🛴', '⛽', '🚦',
    '🏁', '🚩', '🎌', '🏴', '🏳️', '⚓', '⛵', '🛶', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '✈️', '🛩️', '🛫', '🛬',
    '🚀', '🛰️', '🚁', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '🏠',
    '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌',
    '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢',
    # Objects
    '⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '💽', '💾', '💿', '📀', '📼', '📷', '📹', '🎥', '📞', '☎️', '📟',
    '📠', '📺', '📻', '🎙️', '🧭', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🗑️', '🛢️', '💸', '💵', '💴', '💶', '💷',
    '💰', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '⛏️', '🔩', '⚙️', '⛓️', '🔫', '💣', '🔪', '🗡️', '🛡️', '🚬', '⚰️',
    '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️',
    '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🔑', '🗝️', '🛋️', '🪑', '🚪', '🛏️', '🖼️', '🧸', '🪆', '🛍️', '🛒',
    '🎁', '🎀', '🎈', '🎊', '🎉', '🎏', '🎎', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📮', '📪', '📫', '📬',
    '📭', '📦', '🏷️', '📜', '📃', '📄', '📑', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '📇', '🗃️', '🗳️', '🗄️',
    '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔗', '📎', '🖇️',
    '✂️', '📐', '📏', '📌', '📍', '🚩', '🎌', '🏳️', '🏴', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '⛏️', '⚒️',
    '🗡️', '⚔️', '🔫', '🛡️', '⚙️', '⚖️', '🔗', '⛓️', '⚗️', '🔬', '🔭', '📡', '💉', '💊', '🩸', '🩹', '🩺', '🌡️',
    # Symbols
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
    '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍',
    '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️',
    '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑',
    '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️',
    '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠',
    'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚻', '🚮', '🎦',
    '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣',
    '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️',
    '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️',
    '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️',
    '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵',
    '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️',
    '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬',
    '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄',
    # Flags
    '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈',
]

# --- UNIFIED & OPTIMIZED Encryption/Decryption Functions ---
# IMPORTANT SECURITY NOTE: This is a form of obfuscation, NOT secure encryption.
# It is for novelty purposes only and should not be used to protect sensitive data.

BLOCK_SIZE = 256
EMOJI_CHUNK_SIZE = 4 # Changed from 7 to 4

def perform_encryption(plain_text, password):
    """Encrypts text using a block-based, seeded emoji substitution cipher."""
    encrypted_emojis = []
    full_character_set = string.printable
    char_to_index = {char: i for i, char in enumerate(full_character_set)}
    
    for block_index, i in enumerate(range(0, len(plain_text), BLOCK_SIZE)):
        block = plain_text[i:i + BLOCK_SIZE]
        block_seed = f"{password}-block-{block_index}"
        
        # Create a seeded, shuffled list of emojis for this block
        seeded_emojis = EMOJI_LIST[:]
        random.seed(block_seed)
        random.shuffle(seeded_emojis)
        
        for char_in_block_index, char in enumerate(block):
            char_index = char_to_index.get(char)
            if char_index is not None:
                emojis_for_char = []
                # Define a jump based on the character's index to make the sequence unique
                jump = (char_index % 50) + 1 
                current_emoji_index = (char_index + char_in_block_index) % len(seeded_emojis)
                
                # Generate the emoji chunk for this character
                for _ in range(EMOJI_CHUNK_SIZE):
                    current_emoji_index = (current_emoji_index + jump) % len(seeded_emojis)
                    emojis_for_char.append(seeded_emojis[current_emoji_index])
                encrypted_emojis.extend(emojis_for_char)
                
    random.seed() # Reset the global random seed
    return ' '.join(encrypted_emojis)

def perform_decryption(emoji_string, password):
    """Decrypts emoji code back to text using an optimized block-based lookup."""
    decrypted_text = ""
    all_emojis = [emoji for emoji in emoji_string.split(' ') if emoji]
    
    # Check if the total number of emojis is a multiple of our chunk size
    if len(all_emojis) % EMOJI_CHUNK_SIZE != 0:
        return None  # Indicates corrupted or invalid data
        
    emoji_chunks = [all_emojis[i:i + EMOJI_CHUNK_SIZE] for i in range(0, len(all_emojis), EMOJI_CHUNK_SIZE)]
    full_character_set = string.printable
    
    # Process decryption block by block
    for block_index, i in enumerate(range(0, len(emoji_chunks), BLOCK_SIZE)):
        chunk_block = emoji_chunks[i:i + BLOCK_SIZE]
        block_seed = f"{password}-block-{block_index}"
        
        # Recreate the exact same seeded, shuffled list of emojis for this block
        seeded_emojis = EMOJI_LIST[:]
        random.seed(block_seed)
        random.shuffle(seeded_emojis)
        
        # --- OPTIMIZATION ---
        # Instead of recalculating the emoji chunk for every possible character during lookup,
        # we pre-calculate all possible chunks for this block and store them in a dictionary.
        # This turns a slow, repetitive search into a single fast lookup.
        chunk_to_char_map = {}
        for char_index, original_char in enumerate(full_character_set):
            for char_in_block_index in range(BLOCK_SIZE):
                expected_chunk = []
                jump = (char_index % 50) + 1
                current_emoji_index = (char_index + char_in_block_index) % len(seeded_emojis)
                for _ in range(EMOJI_CHUNK_SIZE):
                    current_emoji_index = (current_emoji_index + jump) % len(seeded_emojis)
                    expected_chunk.append(seeded_emojis[current_emoji_index])
                
                # Store the result with a key that includes its position in the block
                map_key = (tuple(expected_chunk), char_in_block_index)
                chunk_to_char_map[map_key] = original_char

        # Use the optimized map for fast decryption
        for char_in_block_index, received_chunk in enumerate(chunk_block):
            lookup_key = (tuple(received_chunk), char_in_block_index)
            decrypted_char = chunk_to_char_map.get(lookup_key, '?')
            decrypted_text += decrypted_char
            
    random.seed() # Reset the global random seed
    return decrypted_text


# --- Page Routes ---
@app.route('/')
def encrypt_page(): return render_template('encrypt.html')
@app.route('/decrypt')
def decrypt_page(): return render_template('decrypt.html')
@app.route('/qr_share')
def qr_share_page(): return render_template('qr_share.html')
@app.route('/image_encrypt')
def image_encrypt_page(): return render_template('image_encrypt.html')
@app.route('/image_decrypt')
def image_decrypt_page(): return render_template('image_decrypt.html')
@app.route('/scanner_decrypt')
def scanner_decrypt_page(): return render_template('scanner_decrypt.html')

# --- API Routes ---
@app.route('/api/encrypt', methods=['POST'])
def encrypt_api():
    data = request.get_json()
    if not data or 'text' not in data or 'password' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    result = perform_encryption(data['text'], data['password']) 
    return jsonify({'result': result})

@app.route('/api/decrypt', methods=['POST'])
def decrypt_api():
    data = request.get_json()
    if not data or 'text' not in data or 'password' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    result = perform_decryption(data['text'], data['password'])
    if result is None:
        return jsonify({'error': 'Invalid or corrupted emoji text.'}), 400
    return jsonify({'result': result})

@app.route('/api/generate_qr', methods=['POST'])
def generate_qr_api():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided for QR code.'}), 400
    qr = qrcode.QRCode(
        version=1,
        # Error correction 'L' (Low) allows for the maximum amount of data storage.
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10, 
        border=4
    )
    qr.add_data(data['text'])
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return jsonify({'qr_image': f'data:image/png;base64,{img_str}'})

@app.route('/api/encrypt_image', methods=['POST'])
def encrypt_image_api():
    if 'image' not in request.files or 'password' not in request.form:
        return jsonify({'error': 'Missing image or password.'}), 400
    
    image_file = request.files['image']
    password = request.form['password']
    
    try:
        img = Image.open(image_file.stream).convert('RGB')
        img.thumbnail((128, 128))
        pixels = list(img.getdata())
        
        # Using a bytearray for more efficient string building
        pixel_byte_array = bytearray()
        for r, g, b in pixels:
            pixel_byte_array.extend(f"{r:03}{g:03}{b:03}".encode('ascii'))
            
        image_data_string = f"{img.width}:{img.height};".encode('ascii') + pixel_byte_array
        
        compressed_data = zlib.compress(image_data_string, level=9) # Use max compression
        b64_string_to_encrypt = base64.b64encode(compressed_data).decode('utf-8')
        
        encrypted_string = perform_encryption(b64_string_to_encrypt, password)
        return jsonify({'result': encrypted_string})

    except Exception as e:
        return jsonify({'error': f'Could not process image: {e}'}), 500

@app.route('/api/decrypt_image', methods=['POST'])
def decrypt_image_api():
    data = request.get_json()
    if not data or 'text' not in data or 'password' not in data:
        return jsonify({'error': 'Missing emoji text or password.'}), 400
        
    emoji_string = data['text']
    password = data['password']
    
    try:
        b64_string_decrypted = perform_decryption(emoji_string, password)
        if b64_string_decrypted is None or '?' in b64_string_decrypted:
             return jsonify({'error': 'Decryption failed. Wrong password or corrupt data.'}), 400

        compressed_data = base64.b64decode(b64_string_decrypted)
        decrypted_data_bytes = zlib.decompress(compressed_data)

        # Split metadata and pixel data more robustly
        header, pixel_data = decrypted_data_bytes.split(b';', 1)
        width, height = map(int, header.decode('ascii').split(':'))
        
        pixels = []
        # Process the byte string directly for better performance
        for i in range(0, len(pixel_data), 9):
            chunk = pixel_data[i:i+9]
            if len(chunk) == 9:
                r = int(chunk[0:3])
                g = int(chunk[3:6])
                b = int(chunk[6:9])
                pixels.append((r, g, b))
        
        if len(pixels) != width * height:
            return jsonify({'error': 'Image data size mismatch after decryption.'}), 400
        
        img = Image.new('RGB', (width, height))
        img.putdata(pixels)
            
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return jsonify({'image': f'data:image/png;base64,{img_str}'})
        
    except Exception as e:
        return jsonify({'error': f'Could not reconstruct image: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True)

