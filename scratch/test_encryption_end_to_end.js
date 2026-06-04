const { encryptPDF } = require('@pdfsmaller/pdf-encrypt-lite');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log("Starting End-to-End PDF encryption test...");
  
  // Find a small PDF file in the parent directory
  const parentDir = path.join(__dirname, '..', '..');
  const files = fs.readdirSync(parentDir);
  const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
  
  if (!pdfFile) {
    console.error("No PDF file found in workspace to test with!");
    process.exit(1);
  }
  
  const pdfPath = path.join(parentDir, pdfFile);
  console.log(`Using PDF file for test: ${pdfFile}`);
  
  const originalBytes = new Uint8Array(fs.readFileSync(pdfPath));
  console.log(`Original PDF size: ${originalBytes.length} bytes`);
  
  const password = "MercyFiatPassword123";
  
  try {
    const encryptedBytes = await encryptPDF(originalBytes, password);
    console.log(`Encrypted PDF size: ${encryptedBytes.length} bytes`);
    
    // Save the encrypted PDF to scratch directory
    const outputPath = path.join(__dirname, 'encrypted_test.pdf');
    fs.writeFileSync(outputPath, encryptedBytes);
    console.log(`Encrypted PDF saved to: ${outputPath}`);
    
    // Read the encrypted file and search for the /Encrypt dictionary
    const encryptedString = fs.readFileSync(outputPath, 'ascii');
    const isEncrypted = encryptedString.includes('/Encrypt');
    console.log(`Does the file contain '/Encrypt' marker? ${isEncrypted ? "YES (Pass)" : "NO (Fail)"}`);
    
    if (isEncrypted) {
      console.log("SUCCESS: PDF Encryption End-to-End Test Passed!");
    } else {
      console.error("FAILURE: PDF did not contain encryption dictionary.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Encryption failed with error:", error);
    process.exit(1);
  }
}

run();
