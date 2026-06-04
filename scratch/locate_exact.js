const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const targets = [
    'toggleBillPaymentStatus',
    'launchAssuranceRecovery',
    'generateDocFromKeywords',
    'convertProformaToDefinitifSplit',
    'convertProformaToDetailAssurance',
    'duplicateCurrentBillFromEditor',
    'duplicateCurrentDocFromEditor',
    'openPatientDMEDrawer',
    'closePatientDMEDrawer',
    'processConvalescenceAlerts',
    'parseDuration',
    'prepareReprise',
    'prepareControl',
    'renderRecentActivity',
    'viewRecentItem',
    'injectDemoData'
];

targets.forEach(name => {
    console.log(`\n=== SEARCHING FOR: ${name} ===`);
    lines.forEach((line, idx) => {
        if (line.includes(name)) {
            // Check if it looks like a definition
            const isDef = line.includes('function') || line.includes('=>') || line.trim().startsWith(`${name}(`) || line.trim().startsWith(`window.${name}`);
            if (isDef) {
                console.log(`${idx + 1}: ${line.trim()}`);
                // Print next 5 lines
                for (let j = 1; j <= 5; j++) {
                    if (lines[idx + j] !== undefined) {
                        console.log(`  +${j}: ${lines[idx + j]}`);
                    }
                }
            }
        }
    });
});
