const fs = require('fs');
const readline = require('readline');

// Specify the path to your .fin file
const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/EMAY_07062024_EUR_4_732B.fin';

// Create a read stream with binary encoding
const readStream = fs.createReadStream(filePath, { encoding: 'binary' });

// Create a readline interface to read the file line by line
const readInterface = readline.createInterface({
    input: readStream,
    output: process.stdout,
    console: false
});

// Event listener for each line
readInterface.on('line', (line) => {
    // Convert binary line to readable format (assuming it's UTF-8 encoded)
    let utf8Line = Buffer.from(line, 'binary').toString('utf8');
    
    if (utf8Line.startsWith(':')) {
        // Process SWIFT tag and content
        const tag = utf8Line.substring(0, utf8Line.indexOf(':', 1) + 1);
        const content = utf8Line.substring(utf8Line.indexOf(':', 1) + 1);
        console.log('Tag:', tag, 'Content:', content);
    } else {
        // Process continuation of content or other lines
        console.log('Content continuation:', utf8Line);
    }
});

// Event listener for the end of the file
readInterface.on('close', () => {
    console.log('File read complete.');
});

// Event listener for errors
readStream.on('error', (err) => {
    console.error('Error reading file:', err);
});
