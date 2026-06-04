const { PDFDocument, PDFName, PDFHexString, PDFString, PDFDict, PDFArray, PDFRawStream, PDFNumber } = require('pdf-lib');
const { bytesToHex, hexToBytes } = require('@pdfsmaller/pdf-encrypt-lite');
const { 
  padPassword, 
  computeEncryptionKey, 
  computeOwnerKey, 
  computeUserKey, 
  encryptObject
} = require('../node_modules/@pdfsmaller/pdf-encrypt-lite/dist/pdf-encrypt.js');
const fs = require('fs');
const path = require('path');

function encryptStringsInObject(obj, objectNum, generationNum, encryptionKey) {
  if (!obj) return;

  if (obj instanceof PDFString) {
    const originalBytes = obj.asBytes();
    const encrypted = encryptObject(originalBytes, objectNum, generationNum, encryptionKey);
    // Convert to PDFHexString to avoid syntax issues with random binary characters
    Object.setPrototypeOf(obj, PDFHexString.prototype);
    obj.value = bytesToHex(encrypted);
  } else if (obj instanceof PDFHexString) {
    const originalBytes = obj.asBytes();
    const encrypted = encryptObject(originalBytes, objectNum, generationNum, encryptionKey);
    obj.value = bytesToHex(encrypted);
  } else if (obj instanceof PDFDict) {
    const entries = obj.entries();
    for (const [key, value] of entries) {
      const keyName = key.asString();
      if (keyName !== '/Length' && keyName !== '/Filter' && keyName !== '/DecodeParms') {
        encryptStringsInObject(value, objectNum, generationNum, encryptionKey);
      }
    }
  } else if (obj instanceof PDFArray) {
    const array = obj.asArray();
    for (const element of array) {
      encryptStringsInObject(element, objectNum, generationNum, encryptionKey);
    }
  }
}

async function customEncryptPDF(pdfBytes, userPassword, ownerPassword = null) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
      updateMetadata: false
    });
    
    const context = pdfDoc.context;
    
    let fileId;
    const trailer = context.trailerInfo;
    const idArray = trailer.ID;
    
    if (idArray && (Array.isArray(idArray) || idArray instanceof PDFArray) && idArray.length > 0) {
      const idString = idArray.get ? idArray.get(0).toString() : idArray[0].toString();
      const hexStr = idString.replace(/^<|>$/g, '');
      fileId = hexToBytes(hexStr);
    } else {
      const randomBytes = new Uint8Array(16);
      for (let i = 0; i < 16; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
      fileId = randomBytes;
      
      const idHex1 = PDFHexString.of(bytesToHex(fileId));
      const idHex2 = PDFHexString.of(bytesToHex(fileId));
      trailer.ID = context.obj([idHex1, idHex2]);
    }
    
    const permissions = 0xFFFFFFFC;
    const ownerKey = computeOwnerKey(ownerPassword, userPassword);
    const encryptionKey = computeEncryptionKey(userPassword, ownerKey, permissions, fileId);
    const userKey = computeUserKey(encryptionKey, fileId);
    
    const indirectObjects = context.enumerateIndirectObjects();
    
    for (const [ref, obj] of indirectObjects) {
      const objectNum = ref.objectNumber;
      const generationNum = ref.generationNumber || 0;

      if (obj instanceof PDFDict) {
        const filter = obj.get(PDFName.of('Filter'));
        if (filter && filter.asString() === '/Standard') {
          continue;
        }
      }

      if (obj instanceof PDFRawStream && obj.dict) {
        const type = obj.dict.get(PDFName.of('Type'));
        if (type) {
          const typeName = type.toString();
          if (typeName === '/XRef' || typeName === '/Sig') {
            continue;
          }
        }
      }

      if (obj instanceof PDFRawStream) {
        const streamData = obj.contents;
        const encrypted = encryptObject(streamData, objectNum, generationNum, encryptionKey);
        obj.contents = encrypted;

        if (obj.dict) {
          encryptStringsInObject(obj.dict, objectNum, generationNum, encryptionKey);
        }
      }

      if (!(obj instanceof PDFRawStream)) {
        encryptStringsInObject(obj, objectNum, generationNum, encryptionKey);
      }
    }
    
    const encryptDict = context.obj({
      Filter: PDFName.of('Standard'),
      V: PDFNumber.of(2),
      R: PDFNumber.of(3),
      Length: PDFNumber.of(128),
      P: PDFNumber.of(permissions),
      O: PDFHexString.of(bytesToHex(ownerKey)),
      U: PDFHexString.of(bytesToHex(userKey))
    });
    
    const encryptRef = context.register(encryptDict);
    trailer.Encrypt = encryptRef;
    
    const encryptedBytes = await pdfDoc.save({
      useObjectStreams: false
    });
    
    return encryptedBytes;
    
  } catch (error) {
    console.error('Custom PDF encryption error:', error);
    throw new Error(`Failed to encrypt PDF: ${error.message}`);
  }
}

async function test() {
  console.log("Running custom encryption test...");
  const pdfPath = path.join(__dirname, '..', '..', 'ACME-_Instrument_Display_Brochure[1].pdf');
  const originalBytes = new Uint8Array(fs.readFileSync(pdfPath));
  
  try {
    const encrypted = await customEncryptPDF(originalBytes, 'MercyFiatPassword123');
    const outputPath = path.join(__dirname, 'custom_encrypted_test.pdf');
    fs.writeFileSync(outputPath, encrypted);
    console.log("SUCCESS: Encrypted PDF saved to", outputPath);
  } catch (err) {
    console.error("FAIL:", err);
  }
}

test();
