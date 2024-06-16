const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Function to decrypt AES file
function decryptFile(filePath, key, iv) {
    try {
        const encryptedData = fs.readFileSync(filePath);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Error decrypting file:', error);
        process.exit(1);
    }
}

// Load the private key and other decryption parameters
const privateKeyPath = path.resolve('/Users/bwilliam/Documents/Dev/Backend/Node/finparse/key.pem');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const key = crypto.createHash('sha256').update(privateKey).digest(); // Generate key from private key
const iv = Buffer.from('635001929-AAA', 'hex'); // Replace with your actual IV

// Decrypt and read the file
const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/FIN.FIN';
console.log('Decrypting and reading file:', filePath);
const decryptedContent = decryptFile(filePath, key, iv);
console.log('Decrypted file content:', decryptedContent);
