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
    let startIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`function ${name}`) || lines[i].includes(`${name} = function`) || lines[i].includes(`${name}(`)) {
            if (lines[i].includes('function') || lines[i].includes('=>') || lines[i].trim().startsWith(name)) {
                startIdx = i;
                break;
            }
        }
    }
    if (startIdx !== -1) {
        // Find closing brace matching the function's opening brace
        let openBraces = 0;
        let foundOpen = false;
        let endIdx = -1;
        for (let i = startIdx; i < lines.length; i++) {
            const line = lines[i];
            for (let char of line) {
                if (char === '{') {
                    openBraces++;
                    foundOpen = true;
                } else if (char === '}') {
                    openBraces--;
                }
            }
            if (foundOpen && openBraces === 0) {
                endIdx = i;
                break;
            }
        }
        console.log(`${name}: lines ${startIdx + 1} to ${endIdx + 1}`);
    } else {
        console.log(`${name}: NOT FOUND`);
    }
});
