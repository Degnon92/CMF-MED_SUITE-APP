const path = require('path');
const fs = require('fs');

// Simple vanilla mock of DOM
global.document = {
    addEventListener: (event, cb) => {},
    getElementById: (id) => {
        const mocks = {
            'bill-patient-nom': { value: 'KAKPO' },
            'bill-patient-prenom': { value: 'LUC' },
            'bill-type': { value: 'PROFORMA' },
            'bill-insurance': { value: 'PRIVE' },
            'bill-coverage': { value: '0' },
            'bill-reference': { value: 'TEST_NEW_MERGE' },
            'bill-matricule': { value: 'Non specifie' },
            'bill-intervention': { value: 'CARDIOLOGIE INTERVENTIONNELLE' },
            'bill-title-custom': { value: 'FACTURE PROFORMA' }
        };
        return mocks[id] || null;
    },
    querySelectorAll: (selector) => {
        if (selector === '#billing-items-container .item-row') {
            return [
                {
                    querySelector: (s) => {
                        if (s === '.item-name') return { value: 'Consultation de Cardiologie' };
                        if (s === '.item-price') return { value: '25000' };
                        if (s === '.item-qty') return { value: '1' };
                        return null;
                    }
                },
                {
                    querySelector: (s) => {
                        if (s === '.item-name') return { value: 'Electrocardiogramme (ECG)' };
                        if (s === '.item-price') return { value: '15000' };
                        if (s === '.item-qty') return { value: '1' };
                        return null;
                    }
                }
            ];
        }
        return [];
    }
};

global.window = {
    activeBillReference: ''
};

// Mock alert
global.alert = (msg) => {
    console.log("ALERT:", msg);
};

// Read and eval exports.js in global context
const exportsCode = fs.readFileSync(path.join(__dirname, '../exports.js'), 'utf-8');
const originalRequire = require;
global.require = (mod) => {
    if (mod === 'electron') {
        return {
            shell: {
                openPath: (p) => console.log("Shell opening path:", p)
            }
        };
    }
    return originalRequire(mod);
};

eval(exportsCode);

// Call exportSingleBillToExcel
try {
    if (global.exportSingleBillToExcel) {
        global.exportSingleBillToExcel();
    } else if (typeof exportSingleBillToExcel !== 'undefined') {
        exportSingleBillToExcel();
    } else {
        console.error("Function exportSingleBillToExcel not found!");
    }
} catch (err) {
    console.error("Error during export:", err);
}
