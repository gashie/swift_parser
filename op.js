const fs = require('fs');
const pdf = require('pdf-parse');

// Specify the path to your PDF file
const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/BB-INVEST-EMAY-4_7B[070624].pdf';

// Read the PDF file
const dataBuffer = fs.readFileSync(filePath);

// Function to parse SWIFT data line and convert it to structured JSON
function parseSwiftData(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    const blocks = {};
    let currentBlock = null;
    let currentSubBlock = null;

    lines.forEach(line => {
        // Skip lines with *** and >>>
        if (line.startsWith('***') || line.startsWith('>>>')) {
            return;
        }

        // Detect block start
        const blockMatch = line.match(/^==+\s*(.*?)\s*==+$/);
        if (blockMatch) {
            currentBlock = blockMatch[1].toLowerCase().replace(/\s+/g, '_');
            blocks[currentBlock] = { name: blockMatch[1], content: [] };
            currentSubBlock = null;
            return;
        }

        // Parse lines with specific pattern (e.g., >>001://:)
        const match = line.match(/^>>(\d+):\/\/:\s*(.*)$/);
        if (match && currentBlock) {
            const contentLine = {
                tag: match[1],
                content: match[2],
                fieldValue: match[2].split(':')[0].trim(),
                value: match[2].split(':').slice(1).join(':').trim()
            };

            if (currentSubBlock) {
                blocks[currentBlock].content[currentSubBlock].content.push(contentLine);
            } else {
                blocks[currentBlock].content.push(contentLine);
            }

            return;
        }

        // Handle sub-blocks within a block
        if (currentBlock && line.includes('//:')) {
            const subBlockMatch = line.match(/^(.*?):\/\/:\s*(.*)$/);
            if (subBlockMatch) {
                currentSubBlock = blocks[currentBlock].content.length;
                blocks[currentBlock].content.push({
                    tag: subBlockMatch[1],
                    content: [{ 
                        content: subBlockMatch[2],
                        fieldValue: subBlockMatch[2].split(':')[0].trim(),
                        value: subBlockMatch[2].split(':').slice(1).join(':').trim()
                    }]
                });
                return;
            }
        }

        // Add other lines as general content
        if (currentBlock) {
            const contentLine = { content: line };
            if (currentSubBlock !== null) {
                blocks[currentBlock].content[currentSubBlock].content.push(contentLine);
            } else {
                blocks[currentBlock].content.push(contentLine);
            }
        }
    });

    return blocks;
}

// Parse the PDF file
pdf(dataBuffer).then(function(data) {
    // Extract text from the PDF
    const text = data.text;

    // Convert the extracted text to structured JSON
    const jsonResult = parseSwiftData(text);

    // Log the JSON result
    console.log(JSON.stringify(jsonResult, null, 2));
}).catch(err => {
    console.error('Error parsing PDF:', err);
});