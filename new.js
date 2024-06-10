const fs = require('fs');
const readline = require('readline');

// Specify the path to your .fin file
const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/EMAY_07062024_EUR_4_732B.fin';

// Create a read stream
const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

// Create a readline interface to read the file line by line
const readInterface = readline.createInterface({
    input: readStream,
    output: process.stdout,
    console: false
});

// Event listener for each line
readInterface.on('line', (line) => {
    if (line.startsWith(':')) {
        // Process SWIFT tag and content
        const tag = line.substring(0, line.indexOf(':', 1) + 1);
        const content = line.substring(line.indexOf(':', 1) + 1);
        console.log('Tag:', tag, 'Content:', content);
    } else {
        // Process continuation of content or other lines
        console.log('Content continuation:', line);
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
