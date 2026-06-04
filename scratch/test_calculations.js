// Mock the window object so the browser script runs fine in Node.js
global.window = {};
require('../billing_calculations.js');

const calculations = global.window.MercyFiatCalculations;

console.log("====================================================");
console.log("RUNNING BILLING CALCULATIONS UNIT TESTS");
console.log("====================================================");

let testsFailed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        testsFailed++;
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

// Test 1: calculateItemSplit - Private Patient
try {
    const res = calculations.calculateItemSplit(10000, 2, false, 'PRIVE', 80);
    assert(res.subtotal === 20000, "Private patient subtotal should be 20000");
    assert(res.partAssurance === 0, "Private patient insurance share should be 0");
    assert(res.partPatient === 20000, "Private patient patient share should be subtotal");
} catch (e) {
    console.error("Test 1 crashed:", e);
    testsFailed++;
}

// Test 2: calculateItemSplit - Insurance standard
try {
    const res = calculations.calculateItemSplit(10000, 2, false, 'INSURED', 80);
    assert(res.subtotal === 20000, "Insured subtotal should be 20000");
    assert(res.partAssurance === 16000, "Insured partAssurance should be 16000 (80%)");
    assert(res.partPatient === 4000, "Insured partPatient should be 4000 (20%)");
} catch (e) {
    console.error("Test 2 crashed:", e);
    testsFailed++;
}

// Test 3: calculateItemSplit - Insurance with split limits
try {
    const res = calculations.calculateItemSplit(10000, 3, true, 'INSURED', 80, 20000, 50);
    assert(res.subtotal === 30000, "Split subtotal should be 30000");
    assert(res.partAssurance === 10000, "Split partAssurance should be 50% of 20000 = 10000");
    assert(res.partPatient === 20000, "Split partPatient should be 30000 - 10000 = 20000");
} catch (e) {
    console.error("Test 3 crashed:", e);
    testsFailed++;
}

// Test 4: calculateBillTotals - PERCENT discount
try {
    const items = [
        { name: "Consultation", price: 15000, qty: 1 },
        { name: "ECG", price: 15000, qty: 1 }
    ];
    const totals = calculations.calculateBillTotals(items, 'PERCENT', 10, 'PRIVE', 0, null, false);
    assert(totals.grossTotal === 30000, "Gross total should be 30000");
    assert(totals.reductionAmount === 3000, "Reduction amount should be 3000 (10%)");
    assert(totals.discountedTotal === 27000, "Discounted total should be 27000");
    assert(totals.partAssurance === 0, "Part insurance should be 0");
    assert(totals.partPatient === 27000, "Part patient should be 27000");
} catch (e) {
    console.error("Test 4 crashed:", e);
    testsFailed++;
}

// Test 5: calculateBillTotals - VALUE discount
try {
    const items = [
        { name: "Consultation", price: 15000, qty: 1 },
        { name: "ECG", price: 15000, qty: 1 }
    ];
    const totals = calculations.calculateBillTotals(items, 'VALUE', 5000, 'INSURED', 80, null, false);
    assert(totals.grossTotal === 30000, "Gross total should be 30000");
    assert(totals.reductionAmount === 5000, "Reduction amount should be 5000");
    assert(totals.discountedTotal === 25000, "Discounted total should be 25000");
    // With 80% coverage on 30000 gross: gross insurance share = 24000, gross patient share = 6000.
    // Reduction is 5000. splitDiscountRatio = 25000 / 30000 = 5/6.
    // Adjusted insurance share = round(24000 * 5/6) = 20000.
    // Adjusted patient share = 25000 - 20000 = 5000.
    assert(totals.partAssurance === 20000, "Adjusted partAssurance should be 20000");
    assert(totals.partPatient === 5000, "Adjusted partPatient should be 5000");
} catch (e) {
    console.error("Test 5 crashed:", e);
    testsFailed++;
}

console.log("\n====================================================");
if (testsFailed === 0) {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
} else {
    console.error(`💥 ${testsFailed} TESTS FAILED!`);
    process.exit(1);
}
console.log("====================================================");
