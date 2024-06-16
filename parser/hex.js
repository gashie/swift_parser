const fs = require('fs');

// Specify the path to your .fin file
const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/EMAY_07062024_EUR_4_732B.fin';

// Read the file as binary data
fs.readFile(filePath, (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Output raw binary data (in hex format for readability)
    console.log(data.toString('hex'));

    // If the file uses a specific encoding like EBCDIC, you need to convert it
    // Example: Convert EBCDIC to ASCII using a custom conversion function or library
    // const asciiData = convertEBCDICtoASCII(data);
    // console.log(asciiData.toString('utf8'));
});
