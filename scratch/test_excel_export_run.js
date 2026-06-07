const path = require('path');
const fs = require('fs');

// Mock DOM
global.window = {
    MercyFiatDB: {
        INSURERS: [
            { id: 'SANLAM', category: 'Assurance Maladie' }
        ]
    }
};

global.document = {
    getElementById: (id) => {
        const mocks = {
            'bill-patient-nom': { value: 'KELLY' },
            'bill-patient-prenom': { value: 'ELIAS' },
            'bill-type': { value: 'DETAIL_ASSUR' },
            'bill-insurance': { value: 'SANLAM' },
            'bill-coverage': { value: '80' },
            'bill-patient-type': { value: 'MALADIE' },
            'bill-use-split': { checked: true },
            'bill-reference': { value: 'MF-DET-202606-001' },
            'bill-matricule': { value: 'SAN-1234' },
            'bill-intervention': { value: 'PLASTIE DU LCA' },
            'bill-k-code': { value: 'K180' },
            'bill-discount-type': { value: 'PERCENT' },
            'bill-discount-value': { value: '10' },
            'bill-payment-method': { value: 'TIERS_PAYANT' },
            'bill-amount-paid-patient': { value: '100000' }
        };
        return mocks[id] || null;
    },
    querySelectorAll: (selector) => {
        if (selector === '#billing-items-container .item-row') {
            return [
                {
                    id: 'row-1',
                    querySelector: (s) => {
                        if (s === '.item-name') return { value: 'Consultation' };
                        if (s === '.item-price') return { value: '15000' };
                        if (s === '.item-qty') return { value: '1' };
                        if (s === '.item-split-limit') return { value: '15000' };
                        if (s === '.item-split-rate') return { value: '80' };
                        return null;
                    }
                },
                {
                    id: 'row-2',
                    querySelector: (s) => {
                        if (s === '.item-name') return { value: 'Consommables' };
                        if (s === '.item-price') return { value: '100000' };
                        if (s === '.item-qty') return { value: '1' };
                        if (s === '.item-split-limit') return { value: '100000' };
                        if (s === '.item-split-rate') return { value: '0' }; // Exclu
                        return null;
                    }
                }
            ];
        }
        return [];
    }
};

// Mock alert
global.alert = (msg) => console.log("ALERT:", msg);

// Load billing_utils.js
const utilsCode = fs.readFileSync(path.join(__dirname, '../billing_utils.js'), 'utf-8');
eval(utilsCode.replace(/window\./g, 'global.window.'));

// Load excel_export_service.js
const serviceCode = fs.readFileSync(path.join(__dirname, '../excel_export_service.js'), 'utf-8');
// Mock ExcelJS requirement
global.require = (name) => {
    if (name === 'exceljs') {
        const ExcelJS = require('exceljs');
        return ExcelJS;
    }
    if (name === 'path' || name === 'fs' || name === 'os') {
        return require(name);
    }
    if (name === 'electron') {
        return {
            shell: {
                openPath: (p) => console.log("MOCK: opening path", p)
            }
        };
    }
    return require(name);
};

eval(serviceCode.replace(/window\./g, 'global.window.'));

console.log("Calling exportSingleBillToExcel...");
global.window.exportSingleBillToExcel();
