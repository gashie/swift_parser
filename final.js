const fs = require('fs');
const pdf = require('pdf-parse');

// Specify the path to your PDF file
const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/bf.pdf';

// Read the PDF file
const dataBuffer = fs.readFileSync(filePath);

// Function to parse SWIFT data line and convert it to structured JSON
function parseSwiftData(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    const blocks = {};
    let currentBlock = null;
    let currentSubBlock = null;
    let allFields = {};
    let fieldNames = [];

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
            let content = match[2].replace(/\.{2,}/g, ''); // Remove unnecessary dots
            let [fieldName, fieldValue] = content.split(':').map(part => part.trim());
            fieldName = fieldName.toLowerCase().replace(/\s+/g, '_');

            const contentLine = {
                tag: match[1],
                content: content,
                field_name: fieldName,
                value: fieldValue
            };

            if (currentSubBlock) {
                blocks[currentBlock].content[currentSubBlock].content.push(contentLine);
            } else {
                blocks[currentBlock].content.push(contentLine);
            }

            if (!allFields[currentBlock]) allFields[currentBlock] = {};
            allFields[currentBlock][fieldName] = fieldValue;

            if (!fieldNames.includes(fieldName)) fieldNames.push(fieldName);

            return;
        }

        // Handle sub-blocks within a block
        if (currentBlock && line.includes('//:')) {
            const subBlockMatch = line.match(/^(.*?):\/\/:\s*(.*)$/);
            if (subBlockMatch) {
                let content = subBlockMatch[2].replace(/\.{2,}/g, ''); // Remove unnecessary dots
                let [fieldName, fieldValue] = content.split(':').map(part => part.trim());
                fieldName = fieldName.toLowerCase().replace(/\s+/g, '_');

                currentSubBlock = blocks[currentBlock].content.length;
                blocks[currentBlock].content.push({
                    tag: subBlockMatch[1],
                    content: [{ 
                        content: subBlockMatch[2],
                        field_name: fieldName,
                        value: fieldValue
                    }]
                });

                if (!allFields[currentBlock]) allFields[currentBlock] = {};
                allFields[currentBlock][fieldName] = fieldValue;

                if (!fieldNames.includes(fieldName)) fieldNames.push(fieldName);

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

    return {
        blocks: blocks,
        all_fields: allFields,
        field_names: fieldNames
    };
}

// Parse the PDF file
pdf(dataBuffer).then(function(data) {
    // Extract text from the PDF
    const text = data.text;

    // Convert the extracted text to structured JSON
    const jsonResult = parseSwiftData(text);

    // Add additional handling for special blocks like acknowledgments and end_of_code_transmision
    jsonResult.acknowledgement_message = text.match(/ACKNOWLEDGEMENT MESSAGE[\s\S]*?==/g) || '';
    jsonResult.end_of_code_transmission_format = text.match(/END OF CODE TRANSMISION[\s\S]*?==/g) || '';

    // Log the JSON result
    console.log(JSON.stringify(jsonResult, null, 2));
}).catch(err => {
    console.error('Error parsing PDF:', err);
});
