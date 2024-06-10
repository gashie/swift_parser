const fs = require('fs');

const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/EMAY_07062024_EUR_4_732B.fin';

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const lines = data.split('\n');
    lines.forEach(line => {
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
});
