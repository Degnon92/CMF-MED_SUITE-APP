const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app.js');
if (!fs.existsSync(filePath)) {
    console.log("app.js not found!");
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Ranges to replace (1-based, inclusive)
// Format: { start: line_num, end: line_num, label: "comment to insert" }
const ranges = [
    { start: 795, end: 845, label: "// [Extracted to app_recent_activity.js] - renderRecentActivity()" },
    { start: 848, end: 1040, label: "// [Extracted to app_recent_activity.js] - viewRecentItem()" },
    { start: 1043, end: 1197, label: "// [Extracted to app_demo_data.js] - injectDemoData()" },
    { start: 1903, end: 2071, label: "// [Extracted to app_dme_drawer.js] - openPatientDMEDrawer()" },
    { start: 2073, end: 2082, label: "// [Extracted to app_dme_drawer.js] - closePatientDMEDrawer()" },
    { start: 2086, end: 2207, label: "// [Extracted to app_dme_drawer.js] - processConvalescenceAlerts()" },
    { start: 2209, end: 2220, label: "// [Extracted to app_dme_drawer.js] - parseDuration()" },
    { start: 2222, end: 2236, label: "// [Extracted to app_dme_drawer.js] - prepareReprise()" },
    { start: 2238, end: 2255, label: "// [Extracted to app_dme_drawer.js] - prepareControl()" },
    { start: 2262, end: 2272, label: "// [Extracted to app_workflow.js] - toggleBillPaymentStatus()" },
    { start: 2274, end: 2316, label: "// [Extracted to app_workflow.js] - launchAssuranceRecovery()" },
    { start: 2321, end: 2452, label: "// [Extracted to app_workflow.js] - generateDocFromKeywords()" },
    { start: 2454, end: 2456, label: "" }, // window assignments
    { start: 2459, end: 2543, label: "// [Extracted to app_workflow.js] - convertProformaToDefinitifSplit()" },
    { start: 2544, end: 2544, label: "" }, // window assignment
    { start: 2547, end: 2625, label: "// [Extracted to app_workflow.js] - convertProformaToDetailAssurance()" },
    { start: 2626, end: 2626, label: "" }, // window assignment
    { start: 2792, end: 2808, label: "// [Extracted to app_workflow.js] - duplicateCurrentBillFromEditor()" },
    { start: 2809, end: 2809, label: "" }, // window assignment
    { start: 2812, end: 2822, label: "// [Extracted to app_workflow.js] - duplicateCurrentDocFromEditor()" },
    { start: 2823, end: 2823, label: "" } // window assignment
];

// Sort ranges in descending order of start line to avoid shifting indices as we modify the array
ranges.sort((a, b) => b.start - a.start);

ranges.forEach(range => {
    const count = range.end - range.start + 1;
    // Replace elements in the lines array
    // splice takes: start_index (0-based), delete_count, ...items_to_insert
    const startIdx = range.start - 1;
    lines.splice(startIdx, count, range.label);
});

// Join back and write
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`Successfully cleaned app.js! New line count: ${lines.length}`);
