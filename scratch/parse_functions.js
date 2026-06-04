const fs = require('fs');
const path = require('path');

const files = ['app.js', 'billing.js', 'documents.js', 'exports.js', 'database.js'];

files.forEach(filename => {
    const filePath = path.join(__dirname, '..', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n========================================`);
    console.log(`ANALYSIS OF ${filename}`);
    console.log(`========================================`);
    
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let inFunction = false;
    let funcName = '';
    let startLine = 0;
    let braceCount = 0;
    
    const functionsFound = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Simple regex to detect functions
        // e.g. function name(
        // async function name(
        // window.name = function(
        // name = function(
        const funcDeclMatch = line.match(/(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(/) || 
                              line.match(/window\.([a-zA-Z0-9_$]+)\s*=\s*(?:async\s+)?function/) ||
                              line.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s+)?\s*\([^)]*\)\s*=>/) ||
                              line.match(/([a-zA-Z0-9_$]+)\s*:\s*(?:async\s+)?function/);
                              
        if (!inFunction && funcDeclMatch) {
            inFunction = true;
            funcName = funcDeclMatch[1];
            startLine = i + 1;
            braceCount = 0;
        }
        
        if (inFunction) {
            // Count braces
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            braceCount += openBraces - closeBraces;
            
            // If braces balance, function ends
            if (braceCount <= 0 && i + 1 > startLine) {
                const endLine = i + 1;
                const length = endLine - startLine + 1;
                functionsFound.push({ name: funcName, start: startLine, end: endLine, length });
                inFunction = false;
            }
        }
    }
    
    // Sort functions by length descending
    functionsFound.sort((a, b) => b.length - a.length);
    
    console.log(`Total functions found: ${functionsFound.length}`);
    console.log(`\nAll Functions in ${filename}:`);
    functionsFound.slice(0).forEach(f => {
        console.log(`- ${f.name} (Lines ${f.start}-${f.end}): ${f.length} lines`);
    });
});
