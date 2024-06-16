
const crypto = require('crypto')

module.exports = {
  prepareColumns: (payload) => {
    let columns = Object.keys(payload)
    let ids = '';
    for (let i = 0; i < columns.length; i++) {
      ids += i === 0 ? '$1' : `, $${i + 1}`;
    }
    return ids;
  }, SimpleEncrypt: (data = '', encryptionKey = '') => { //decrypt device information and ip
    const initializationVector = crypto.randomBytes(16);
    const hashedEncryptionKey = crypto.createHash('sha256').update(encryptionKey).digest('hex').substring(0, 32);
    const cipher = crypto.createCipheriv('aes256', hashedEncryptionKey, initializationVector);

    let encryptedData = cipher.update(Buffer.from(data, 'utf-8'));
    encryptedData = Buffer.concat([encryptedData, cipher.final()]);

    return `${initializationVector.toString('hex')}:${encryptedData.toString('hex')}`;

  },
  SimpleDecrypt: (encryptedData = '', encryptionKey = '') => { //decrypt device information and ip
    const [initializationVectorAsHex, encryptedDataAsHex] = encryptedData?.split(':');
    const initializationVector = Buffer.from(initializationVectorAsHex, 'hex');
    const hashedEncryptionKey = crypto.createHash('sha256').update(encryptionKey).digest('hex').substring(0, 32);
    const decipher = crypto.createDecipheriv('aes256', hashedEncryptionKey, initializationVector);

    let decryptedText = decipher.update(Buffer.from(encryptedDataAsHex, 'hex'));
    decryptedText = Buffer.concat([decryptedText, decipher.final()]);

    return decryptedText.toString();

  },



};