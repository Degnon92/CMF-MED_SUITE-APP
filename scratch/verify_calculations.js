// Mock global window object for billing_calculations.js
global.window = {};
require('../billing_calculations.js');

const calculations = global.window.MercyFiatCalculations;

// Test cases
const items = [
    { name: "Consultation", price: 15000, qty: 1 },
    { name: "Analyses", price: 45000, qty: 1 }
];

console.log("=== RUNNING BILLING CALCULATION TESTS ===");

// 1. Tiers-payant simple sans remise
let res1 = calculations.calculateBillTotals(items, 'PERCENT', 0, 'MALADIE', 80, null, false);
console.log("Test 1 (Maladie 80% standard, No Discount):");
console.log(` - Gross Total: ${res1.grossTotal} (Expected: 60000)`);
console.log(` - Part Assurance: ${res1.partAssurance} (Expected: 48000)`);
console.log(` - Part Patient: ${res1.partPatient} (Expected: 12000)`);
console.log(` - Item 1 Patient: ${res1.items[0].partPatient} (Expected: 3000)`);
console.log(` - Item 2 Patient: ${res1.items[1].partPatient} (Expected: 9000)`);
let itemsSumPatient1 = res1.items.reduce((sum, item) => sum + item.partPatient, 0);
console.log(` - Sum of item parts: ${itemsSumPatient1} (Matches total: ${itemsSumPatient1 === res1.partPatient})`);

// 2. Tiers-payant simple avec remise (10%)
let res2 = calculations.calculateBillTotals(items, 'PERCENT', 10, 'MALADIE', 80, null, false);
console.log("\nTest 2 (Maladie 80% standard, 10% Discount):");
console.log(` - Gross Total: ${res2.grossTotal} (Expected: 60000)`);
console.log(` - Reduction: ${res2.reductionAmount} (Expected: 6000)`);
console.log(` - Discounted Total: ${res2.discountedTotal} (Expected: 54000)`);
console.log(` - Part Assurance: ${res2.partAssurance} (Expected: 43200)`);
console.log(` - Part Patient: ${res2.partPatient} (Expected: 10800)`);
console.log(` - Item 1 Patient: ${res2.items[0].partPatient} (Expected: 2700)`);
console.log(` - Item 2 Patient: ${res2.items[1].partPatient} (Expected: 8100)`);
let itemsSumPatient2 = res2.items.reduce((sum, item) => sum + item.partPatient, 0);
console.log(` - Sum of item parts: ${itemsSumPatient2} (Matches total: ${itemsSumPatient2 === res2.partPatient})`);

if (itemsSumPatient2 === res2.partPatient && res2.partPatient === 10800) {
    console.log("\n>>> CALCULATION VERIFICATION SUCCESSFUL! <<<");
} else {
    console.log("\n>>> CALCULATION VERIFICATION FAILED! <<<");
    process.exit(1);
}
