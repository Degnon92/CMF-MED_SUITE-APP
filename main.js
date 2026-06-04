const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1350,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Permet l'import direct de modules locaux en toute simplicité
      enableRemoteModule: true
    },
    // Rendre l'application plus immersive et premium
    titleBarStyle: 'default', 
    autoHideMenuBar: true // Cache la barre de menu classique alt pour faire place à notre UI scandinave
  });

  // Charger le point d'entrée HTML principal
  mainWindow.loadFile('index.html');

  // Ouvrir/fermer l'inspecteur via F12 ou Ctrl+Shift+I (insensible à la casse)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const key = input.key.toLowerCase();
    const isCmdOrCtrl = input.control || input.meta;
    const isShift = input.shift;

    if (input.type.toLowerCase() === 'keydown') {
      if (key === 'f12' || (key === 'i' && isCmdOrCtrl && isShift)) {
        if (mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.closeDevTools();
        } else {
          mainWindow.webContents.openDevTools();
        }
        event.preventDefault();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Lancement au démarrage de l'appli
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Arrêt complet lorsque toutes les fenêtres sont fermées (sauf sous macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Helper to recursively encrypt string objects in PDF dictionaries and arrays
function encryptStringsInObject(obj, objectNum, generationNum, encryptionKey, PDFHexString, PDFString, PDFDict, PDFArray, encryptObject, bytesToHex) {
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
        encryptStringsInObject(value, objectNum, generationNum, encryptionKey, PDFHexString, PDFString, PDFDict, PDFArray, encryptObject, bytesToHex);
      }
    }
  } else if (obj instanceof PDFArray) {
    const array = obj.asArray();
    for (const element of array) {
      encryptStringsInObject(element, objectNum, generationNum, encryptionKey, PDFHexString, PDFString, PDFDict, PDFArray, encryptObject, bytesToHex);
    }
  }
}

// Fonction d'aide pour sauvegarder le buffer PDF avec option de chiffrement
function savePDFBuffer(filePath, data, pdfPassword) {
  return new Promise((resolve, reject) => {
    if (pdfPassword) {
      try {
        const { PDFDocument, PDFName, PDFHexString, PDFString, PDFDict, PDFArray, PDFRawStream, PDFNumber } = require('pdf-lib');
        const { bytesToHex, hexToBytes } = require('@pdfsmaller/pdf-encrypt-lite');
        const { 
          computeEncryptionKey, 
          computeOwnerKey, 
          computeUserKey, 
          encryptObject
        } = require('./node_modules/@pdfsmaller/pdf-encrypt-lite/dist/pdf-encrypt.js');

        PDFDocument.load(data, {
          ignoreEncryption: true,
          updateMetadata: false
        }).then(pdfDoc => {
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
          const ownerKey = computeOwnerKey(null, pdfPassword);
          const encryptionKey = computeEncryptionKey(pdfPassword, ownerKey, permissions, fileId);
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
                encryptStringsInObject(obj.dict, objectNum, generationNum, encryptionKey, PDFHexString, PDFString, PDFDict, PDFArray, encryptObject, bytesToHex);
              }
            }

            if (!(obj instanceof PDFRawStream)) {
              encryptStringsInObject(obj, objectNum, generationNum, encryptionKey, PDFHexString, PDFString, PDFDict, PDFArray, encryptObject, bytesToHex);
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
          
          pdfDoc.save({ useObjectStreams: false }).then(encryptedBytes => {
            fs.writeFile(filePath, Buffer.from(encryptedBytes), (error) => {
              if (error) reject(error);
              else resolve();
            });
          }).catch(err => {
            reject(new Error(`Erreur lors de la sauvegarde du PDF chiffré: ${err.message}`));
          });
        }).catch(err => {
          reject(new Error(`Erreur de chargement du PDF pour chiffrement: ${err.message}`));
        });
      } catch (err) {
        reject(new Error(`Impossible de charger les bibliothèques de chiffrement PDF: ${err.message}`));
      }
    } else {
      fs.writeFile(filePath, data, (error) => {
        if (error) reject(error);
        else resolve();
      });
    }
  });
}

// Écouteur pour l'export PDF natif haute définition
ipcMain.on('save-to-pdf', (event, patientName, docType, htmlContent, pdfPassword) => {
  if (!mainWindow) return;

  const defaultPath = path.join(app.getPath('downloads'), `${docType}_${patientName}.pdf`);

  dialog.showSaveDialog(mainWindow, {
    title: 'Exporter en PDF',
    defaultPath: defaultPath,
    filters: [
      { name: 'Fichiers PDF', extensions: ['pdf'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePath) {
      // Configuration d'impression PDF A4 ultra-précise
      const options = {
        marginsType: 1, // Utilise 1 pour "Aucune marge" (None) afin de respecter le CSS @page
        pageSize: 'A4',
        printBackground: true,
        landscape: false
      };

      if (htmlContent) {
        const tempHtmlPath = path.join(app.getAppPath(), `temp_print_save_${Date.now()}.html`);
        fs.writeFile(tempHtmlPath, htmlContent, 'utf8', (err) => {
          if (err) {
            event.reply('pdf-save-result', { success: false, error: err.message });
            return;
          }

          const workerWindow = new BrowserWindow({
            show: false,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true
            }
          });

          workerWindow.loadFile(tempHtmlPath);

          workerWindow.webContents.on('did-finish-load', () => {
            setTimeout(() => {
              workerWindow.webContents.printToPDF(options).then(data => {
                savePDFBuffer(result.filePath, data, pdfPassword).then(() => {
                  workerWindow.destroy();
                  fs.unlink(tempHtmlPath, () => {});
                  const { shell } = require('electron');
                  shell.openPath(result.filePath);
                  event.reply('pdf-save-result', { success: true, path: result.filePath });
                }).catch(error => {
                  workerWindow.destroy();
                  fs.unlink(tempHtmlPath, () => {});
                  event.reply('pdf-save-result', { success: false, error: error.message });
                });
              }).catch(pdfErr => {
                workerWindow.destroy();
                fs.unlink(tempHtmlPath, () => {});
                event.reply('pdf-save-result', { success: false, error: pdfErr.message });
              });
            }, 100);
          });
        });
      } else {
        mainWindow.webContents.printToPDF(options).then(data => {
          savePDFBuffer(result.filePath, data, pdfPassword).then(() => {
            const { shell } = require('electron');
            shell.openPath(result.filePath);
            event.reply('pdf-save-result', { success: true, path: result.filePath });
          }).catch(error => {
            event.reply('pdf-save-result', { success: false, error: error.message });
          });
        }).catch(err => {
          event.reply('pdf-save-result', { success: false, error: err.message });
        });
      }
    }
  }).catch(err => {
    event.reply('pdf-save-result', { success: false, error: err.message });
  });
});

// Écouteur pour générer un PDF silencieux temporaire et l'ouvrir DIRECTEMENT dans Adobe Acrobat (avec aperçu et dialogue parfait !)
ipcMain.on('print-to-pdf-temp', (event, patientName, htmlContent) => {
  if (!mainWindow) return;

  const tempPath = path.join(app.getPath('temp'), `Impression_MercyFiat_${patientName}_${Date.now()}.pdf`);

  const options = {
    marginsType: 1, // Utilise 1 pour "Aucune marge" (None)
    pageSize: 'A4',
    printBackground: true,
    landscape: false
  };

  if (htmlContent) {
    const tempHtmlPath = path.join(app.getAppPath(), `temp_print_temp_${Date.now()}.html`);
    fs.writeFile(tempHtmlPath, htmlContent, 'utf8', (err) => {
      if (err) {
        event.reply('pdf-temp-result', { success: false, error: err.message });
        return;
      }

      const workerWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      workerWindow.loadFile(tempHtmlPath);

      workerWindow.webContents.on('did-finish-load', () => {
        setTimeout(() => {
          workerWindow.webContents.printToPDF(options).then(data => {
            fs.writeFile(tempPath, data, (error) => {
              workerWindow.destroy();
              fs.unlink(tempHtmlPath, () => {});

              if (error) {
                event.reply('pdf-temp-result', { success: false, error: error.message });
              } else {
                const { shell } = require('electron');
                shell.openPath(tempPath);
                event.reply('pdf-temp-result', { success: true });
              }
            });
          }).catch(pdfErr => {
            workerWindow.destroy();
            fs.unlink(tempHtmlPath, () => {});
            event.reply('pdf-temp-result', { success: false, error: pdfErr.message });
          });
        }, 100);
      });
    });
  } else {
    mainWindow.webContents.printToPDF(options).then(data => {
      fs.writeFile(tempPath, data, (error) => {
        if (error) {
          event.reply('pdf-temp-result', { success: false, error: error.message });
        } else {
          // Ouvrir automatiquement le PDF temporaire dans le lecteur par défaut (Adobe Acrobat) pour affichage immédiat de l'aperçu et impression !
          const { shell } = require('electron');
          shell.openPath(tempPath);
          event.reply('pdf-temp-result', { success: true });
        }
      });
    }).catch(err => {
      event.reply('pdf-temp-result', { success: false, error: err.message });
    });
  }
});



// Écouteur pour lister de manière native les imprimantes installées sous Windows
ipcMain.on('get-printers', (event) => {
  if (!mainWindow) return;
  
  mainWindow.webContents.getPrintersAsync().then(printers => {
    event.reply('printers-list', printers);
  }).catch(err => {
    event.reply('printers-list', []);
  });
});

// Écouteur pour déclencher l'impression physique native 100% dans l'application
ipcMain.on('silent-print', (event, printOptions) => {
  if (!mainWindow) return;

  const options = {
    silent: true,
    deviceName: printOptions.printerName,
    copies: printOptions.copies,
    color: !printOptions.isMono,
    pageSize: 'A4',
    printBackground: true,
    margins: { marginType: printOptions.marginsType }
  };

  mainWindow.webContents.print(options, (success, failureReason) => {
    if (success) {
      event.reply('print-result', { success: true });
    } else {
      event.reply('print-result', { success: false, error: failureReason });
    }
  });
});

// Écouteur pour basculer le Mode Développeur (Console)
ipcMain.on('toggle-devtools', (event) => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  }
});
