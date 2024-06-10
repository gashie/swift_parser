

const fs = require('fs');
const axios = require('axios');

function readFinFile(filePath) {
    try {
        console.log(`Attempting to read file at: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        console.log(`File read successfully`);
        return fileContent;
    } catch (error) {
        console.error('Error reading file:', error);
        process.exit(1); // Exit the process with an error code
    }
}

async function getUSDTExchangeRate(currency) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${currency}`);
        return response.data.tether[currency];
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        throw error;
    }
}

async function convertToUSDT(amount, currency) {
    const rate = await getUSDTExchangeRate(currency);
    return amount * rate;
}

async function processFinFile(filePath, currency) {
    const finData = readFinFile(filePath);
    console.log(finData); // Inspect the structure of the .fin file

    // Extract the amount from the .fin file
    // This part needs to be customized based on the file's structure
    // Example placeholder logic:
    const amountRegex = /:32A:.*?(\d+,\d+)/; // Adjust regex according to your .fin file format
    const match = finData.match(amountRegex);
    if (!match) {
        console.error('Amount not found in the .fin file');
        return;
    }

    const amountStr = match[1].replace(',', '.'); // Convert to a standard decimal format
    const amount = parseFloat(amountStr);

    // Convert the amount to USDT
    const usdtAmount = await convertToUSDT(amount, currency);
    console.log(`Amount in ${currency}: ${amount}`);
    console.log(`Equivalent amount in USDT: ${usdtAmount}`);
}

// Test the file reading functionality
const filePath = '/Users/bwilliam/Documents/Dev/Backend/Node/finparse/FIN.FIN';
console.log('Reading file:', filePath);
const fileContent = readFinFile(filePath);
console.log('File content:', fileContent);

// Process the file and convert to USDT
processFinFile(filePath, 'usd');
