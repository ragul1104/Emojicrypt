document.addEventListener('DOMContentLoaded', () => {

    // --- TEXT ENCRYPTION ---
    const encryptBtn = document.getElementById('encrypt-btn');
    if (encryptBtn) {
        const textInput = document.getElementById('text-input');
        const passwordInput = document.getElementById('encrypt-password');
        const outputBox = document.getElementById('encryption-output');
        const copyBtn = document.getElementById('copy-btn');
        const copyFeedback = document.getElementById('copy-feedback');

        encryptBtn.addEventListener('click', async () => {
            if (!textInput.value || !passwordInput.value) {
                outputBox.textContent = "Please provide both a message and a password.";
                return;
            }
            outputBox.innerHTML = '<div class="loader"></div>';
            copyBtn.classList.add('hidden');
            const response = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textInput.value, password: passwordInput.value })
            });
            const data = await response.json();
            outputBox.textContent = data.result || data.error;
            if (data.result) {
                copyBtn.classList.remove('hidden');
                copyFeedback.textContent = 'Copy';
            }
        });

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(outputBox.textContent).then(() => {
                copyFeedback.textContent = 'Copied!';
                setTimeout(() => { copyFeedback.textContent = 'Copy'; }, 2000);
            });
        });
    }

    // --- TEXT DECRYPTION ---
    const decryptBtn = document.getElementById('decrypt-btn');
    if (decryptBtn) {
        const emojiInput = document.getElementById('emoji-input');
        const passwordInput = document.getElementById('decrypt-password');
        const outputBox = document.getElementById('decryption-output');

        decryptBtn.addEventListener('click', async () => {
            if (!emojiInput.value || !passwordInput.value) {
                outputBox.textContent = "Please provide both emoji code and a password.";
                return;
            }
            outputBox.innerHTML = '<div class="loader"></div>';
            const response = await fetch('/api/decrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: emojiInput.value, password: passwordInput.value })
            });
            const data = await response.json();
            outputBox.textContent = data.result || data.error;
        });
    }

    // --- ENCRYPT TO QR CODE ---
    const encryptQrBtn = document.getElementById('encrypt-qr-btn');
    if (encryptQrBtn) {
        const textInputQr = document.getElementById('text-input-qr');
        const passwordInputQr = document.getElementById('qr-encrypt-password');
        const qrCodeResult = document.getElementById('qr-code-result');
        const QR_CHAR_LIMIT = 140; // A safe character limit for QR code generation

        // Create and insert character counter element
        const charCounter = document.createElement('div');
        charCounter.style.textAlign = 'right';
        charCounter.style.fontSize = '0.9rem';
        charCounter.style.marginTop = '-15px'; // Adjust spacing
        charCounter.style.marginBottom = '15px';
        textInputQr.insertAdjacentElement('afterend', charCounter);

        // Function to update the counter and button state
        const updateCounter = () => {
            const currentLength = textInputQr.value.length;
            charCounter.textContent = `${currentLength} / ${QR_CHAR_LIMIT}`;
            if (currentLength > QR_CHAR_LIMIT) {
                charCounter.style.color = '#ff5252'; // A distinct error color
                encryptQrBtn.disabled = true;
            } else {
                charCounter.style.color = 'inherit'; // Reset to default text color
                encryptQrBtn.disabled = false;
            }
        };
        
        // Set initial state and add the event listener
        updateCounter();
        textInputQr.addEventListener('input', updateCounter);

        encryptQrBtn.addEventListener('click', async () => {
            const plainText = textInputQr.value;
            const password = passwordInputQr.value;

            if (!plainText || !password) {
                qrCodeResult.innerHTML = '<p class="error-message">Please provide a message and a password.</p>';
                return;
            }
            qrCodeResult.innerHTML = '<div class="loader"></div>';

            try {
                // Step 1: Encrypt the text
                const encryptResponse = await fetch('/api/encrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: plainText, password: password })
                });

                const encryptData = await encryptResponse.json();
                if (!encryptResponse.ok) throw new Error(encryptData.error || 'Encryption failed');
                
                const emojiText = encryptData.result;

                // Step 2: Generate QR code from the encrypted text
                const qrResponse = await fetch('/api/generate_qr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: emojiText })
                });

                const qrData = await qrResponse.json();
                if (!qrResponse.ok) throw new Error(qrData.error || 'QR generation failed');

                qrCodeResult.innerHTML = `<img src="${qrData.qr_image}" alt="Generated QR Code">`;

            } catch (error) {
                qrCodeResult.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
            }
        });
    }
    
    // --- IMAGE ENCRYPTION ---
    const imageEncryptBtn = document.getElementById('image-encrypt-btn');
    if (imageEncryptBtn) {
        const imageUpload = document.getElementById('image-upload');
        const fileNameDisplay = document.getElementById('file-name-display');
        const passwordInput = document.getElementById('image-encrypt-password');
        const outputBox = document.getElementById('image-encryption-output');
        const copyBtn = document.getElementById('copy-btn-image');
        const copyFeedback = document.getElementById('copy-feedback-image');
        
        imageUpload.addEventListener('change', () => {
            fileNameDisplay.textContent = imageUpload.files.length > 0 ? imageUpload.files[0].name : 'No file chosen';
        });

        imageEncryptBtn.addEventListener('click', async () => {
            if (imageUpload.files.length === 0) {
                outputBox.textContent = 'Please choose an image file.'; return;
            }
            if (!passwordInput.value) {
                outputBox.textContent = 'Please enter a password.'; return;
            }
            outputBox.innerHTML = '<div class="loader"></div><p style="text-align: center;">Encrypting image...</p>';
            copyBtn.classList.add('hidden');

            const formData = new FormData();
            formData.append('image', imageUpload.files[0]);
            formData.append('password', passwordInput.value);

            try {
                const response = await fetch('/api/encrypt_image', { method: 'POST', body: formData });
                const data = await response.json();
                if (response.ok) {
                    outputBox.textContent = data.result;
                    copyBtn.classList.remove('hidden');
                    copyFeedback.textContent = 'Copy';
                } else { throw new Error(data.error); }
            } catch (error) {
                outputBox.textContent = `Error: ${error.message}`;
            }
        });
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(outputBox.textContent).then(() => {
                copyFeedback.textContent = 'Copied!';
                setTimeout(() => { copyFeedback.textContent = 'Copy'; }, 2000);
            });
        });
    }
    
    // --- IMAGE DECRYPTION ---
    const imageDecryptBtn = document.getElementById('image-decrypt-btn');
    if(imageDecryptBtn) {
        const emojiInput = document.getElementById('emoji-input-image');
        const passwordInput = document.getElementById('image-decrypt-password');
        const outputContainer = document.getElementById('image-decryption-output');

        imageDecryptBtn.addEventListener('click', async () => {
            if (!emojiInput.value || !passwordInput.value) {
                outputContainer.innerHTML = '<p class="error-message">Please provide emoji code and a password.</p>'; return;
            }
            outputContainer.innerHTML = '<div class="loader"></div><p style="text-align: center;">Decrypting image...</p>';

            try {
                const response = await fetch('/api/decrypt_image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: emojiInput.value, password: passwordInput.value })
                });
                const data = await response.json();
                if(response.ok) {
                    outputContainer.innerHTML = `<img src="${data.image}" alt="Decrypted Image">`;
                } else { throw new Error(data.error); }
            } catch (error) {
                 outputContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
            }
        });
    }

    // --- SCAN & DECRYPT PAGE (FILE & CAMERA) ---
    const scannerPage = document.getElementById('scanner-decrypt-page');
    if (scannerPage) {
        const qrImageUpload = document.getElementById('qr-image-upload');
        const startScanBtn = document.getElementById('start-scan-btn');
        const statusEl = document.getElementById('qr-scan-status');
        const fileNameDisplay = document.getElementById('qr-file-name-display');
        const emojiInput = document.getElementById('emoji-input-scanner');
        const passwordInput = document.getElementById('scanner-decrypt-password');
        const decryptBtn = document.getElementById('scanner-decrypt-btn');
        const outputBox = document.getElementById('scanner-decryption-output');
        
        // Initialize HTML5-QRCode components
        const fileScanner = new Html5Qrcode("qr-scan-status");
        const cameraScanner = new Html5Qrcode("qr-reader");

        // File-based scanning (Works correctly)
        qrImageUpload.addEventListener('change', (event) => {
            if (event.target.files.length === 0) {
                fileNameDisplay.textContent = "No file chosen";
                return;
            }
            const file = event.target.files[0];
            fileNameDisplay.textContent = file.name;
            statusEl.innerHTML = '<div class="loader"></div><p style="text-align:center;">Scanning image...</p>';

            fileScanner.scanFile(file, true)
                .then(decodedText => {
                    statusEl.innerHTML = `<p class="success-message">QR Code decoded successfully from file! Proceed to Decrypt.</p>`;
                    emojiInput.value = decodedText;
                })
                .catch(err => {
                    console.error("QR Scan Error:", err); // Log the actual error for debugging
                    statusEl.innerHTML = `<p class="error-message">Error: Could not decode QR code. Please try again with a clearer image. Ensure the QR code is well-lit, in focus, and not distorted.</p>`;
                });
        });

        // Camera-based scanning (FIXED LOGIC)
        startScanBtn.addEventListener('click', async () => {
            if (cameraScanner.isScanning) {
                 // If currently scanning, stop it
                 cameraScanner.stop()
                    .then(() => {
                        startScanBtn.textContent = 'Start Camera Scan';
                        statusEl.innerHTML = `<p>Scanner stopped.</p>`;
                        // Clear the reader area when stopped
                        document.getElementById('qr-reader').innerHTML = ''; 
                    })
                    .catch(err => {
                        console.error("Failed to stop scanner", err);
                        statusEl.innerHTML = `<p class="error-message">Error stopping camera.</p>`;
                    });
            } else {
                 statusEl.innerHTML = `<div class="loader"></div><p style="text-align:center;">Requesting camera access...</p>`;
                 
                 const qrCodeSuccessCallback = (decodedText, decodedResult) => {
                    // Success: Put the emoji code into the input box
                    emojiInput.value = decodedText;
                    statusEl.innerHTML = `<p class="success-message">QR Code Scanned Successfully! Proceed to Decrypt.</p>`;
                    
                    // Automatically stop the scanner after a successful scan
                    cameraScanner.stop().catch(err => console.error("Failed to stop scanner", err));
                    startScanBtn.textContent = 'Start Camera Scan';
                    document.getElementById('qr-reader').innerHTML = ''; 
                };

                const config = { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 } 
                };
                 
                 // Start the scanner
                 cameraScanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
                    .then(() => {
                        startScanBtn.textContent = 'Stop Scanning';
                        statusEl.innerHTML = `<p>Point camera at a QR code...</p>`;
                    })
                    .catch(err => {
                         statusEl.innerHTML = `<p class="error-message">Error starting camera: ${err}. Please ensure your device has a camera and you have granted permission.</p>`;
                         startScanBtn.textContent = 'Start Camera Scan';
                    });
            }
        });

        // Decryption logic (works for both file and camera scanned emoji code)
        decryptBtn.addEventListener('click', async () => {
            if (!emojiInput.value || !passwordInput.value) {
                outputBox.textContent = "Please provide the scanned code and password.";
                return;
            }
            outputBox.innerHTML = '<div class="loader"></div>';
            const response = await fetch('/api/decrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: emojiInput.value, password: passwordInput.value })
            });
            const data = await response.json();
            outputBox.textContent = data.result || data.error;
        });
    }
});

