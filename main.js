const fs = require('fs');
const pdf = require('pdf-parse');

// Specify the path to your PDF file
const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/mine.pdf';

// Read the PDF file
const dataBuffer = fs.readFileSync(filePath);

// Function to parse SWIFT data line and convert it to structured JSON
function parseSwiftData(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    const blocks = {};
    let currentBlock = null;
    let allFields = {};
    let fieldNames = [];
    let acknowledgementMessage = "";
    let endOfCodeTransmissionFormat = "";
    let isAcknowledgementSection = false;
    let endOfCodeTransmission = false;
    let inCertificate = false;
    let inSSLData = false;

    lines.forEach(line => {
        // Remove lines with repetitive exclamations
        line = line.replace(/!+/g, '');

        // Start and end of certificate data
        if (line.includes('BEGIN CERTIFICATE')) {
            inCertificate = true;
            return;
        }
        if (line.includes('END CERTIFICATE')) {
            inCertificate = false;
            return;
        }
        if (inCertificate) {
            return;
        }

        // Start and end of SSL data
        if (line.includes('SSL handshake has read')) {
            inSSLData = true;
            return;
        }
        if (line.includes('global_server /start')) {
            inSSLData = false;
            return;
        }
        if (inSSLData) {
            return;
        }

        // Detect and handle acknowledgement message
        if (line.startsWith('ACK:') || line.startsWith('CONNECTED')) {
            isAcknowledgementSection = true;
            acknowledgementMessage += line + "\n";
            return;
        }

        if (isAcknowledgementSection && line.startsWith('TRANSACTION REFERENCE NUMBER')) {
            isAcknowledgementSection = false;
        }

        // Handle end_of_code_transmision_format
        if (line.includes('END OF CODE TRANSMISSION')) {
            endOfCodeTransmission = true;
            endOfCodeTransmissionFormat += line + "\n";
            return;
        }

        if (endOfCodeTransmission) {
            endOfCodeTransmissionFormat += line + "\n";
            return;
        }

        // Detect block start
        const blockMatch = line.match(/^PRIME SOURCE PACKAGE:\s*(.*?)$/);
        if (blockMatch) {
            currentBlock = blockMatch[1].toLowerCase().replace(/\s+/g, '_');
            blocks[currentBlock] = { name: blockMatch[1], content: [] };
            return;
        }

        // Handle general lines with field names and values
        const fieldMatch = line.match(/^([A-Z\s]+):\s*(.*)$/);
        if (fieldMatch) {
            const fieldName = fieldMatch[1].toLowerCase().replace(/\s+/g, '_');
            const fieldValue = fieldMatch[2].replace(/✔/g, '').trim();

            if (!blocks[currentBlock]) {
                blocks[currentBlock] = { name: currentBlock, content: [] };
            }

            const contentLine = {
                field_name: fieldName,
                value: fieldValue
            };

            blocks[currentBlock].content.push(contentLine);

            if (!allFields[fieldName]) {
                allFields[fieldName] = fieldValue;
            } else if (Array.isArray(allFields[fieldName])) {
                allFields[fieldName].push(fieldValue);
            } else {
                allFields[fieldName] = [allFields[fieldName], fieldValue];
            }

            if (!fieldNames.includes(fieldName)) {
                fieldNames.push(fieldName);
            }

            return;
        }

        // Handle general content lines
        if (currentBlock) {
            blocks[currentBlock].content.push({ content: line });
        }
    });

    return {
        blocks: blocks,
        all_fields: allFields,
        field_names: fieldNames,
        acknowledgement_message: acknowledgementMessage.trim(),
        end_of_code_transmission_format: endOfCodeTransmissionFormat.trim()
    };
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
