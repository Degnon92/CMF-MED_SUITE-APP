const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'app.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Define replacements by identifying marker texts
const replacements = [
    {
        name: "Database/Sanitize Block",
        startMarker: "// Fonction de nettoyage robuste des noms de patients pour corriger les anomalies d'importation",
        endMarker: "// Initialisation globale",
        replacement: "// [Extracted to app_database.js]\n\n"
    },
    {
        name: "SPA Routing Block",
        startMarker: "// Routage simple des sections (SPA)",
        endMarker: "// Enregistre une facture",
        replacement: "// [Extracted to app_router.js]\n\n"
    },
    {
        name: "Dashboard Stats Block",
        startMarker: "// Calcule et affiche les statistiques sur le tableau de bord",
        endMarker: "// Rendu du tableau d'activité récente (Dashboard)",
        replacement: "// [Extracted to app_analytics.js]\n\n"
    },
    {
        name: "Autocomplete/Datalist Block",
        startMarker: "// Moteur d'Autocomplétion Sur-Mesure Premium (Défilable & Clavier-Friendly)",
        endMarker: "// Contrôleurs de création manuelle de patient (Modal)",
        replacement: "// [Extracted to app_autocomplete.js]\n\n"
    },
    {
        name: "Analytics Charts Block",
        startMarker: "/* ==========================================\n   📊 MODULE DÉCISIONNEL & GRAPHIQUES SVG NATIFS\n   ========================================== */",
        endMarker: "/* ==========================================\n   💼 SUIVI DES IMPAYÉS ET RÈGLEMENTS MUTUELLES\n   ========================================== */",
        replacement: "// [Extracted to app_analytics.js]\n\n"
    }
];

replacements.forEach(r => {
    const startIndex = appJsContent.indexOf(r.startMarker);
    const endIndex = appJsContent.indexOf(r.endMarker);
    
    if (startIndex === -1) {
        console.error(`ERROR: Start marker not found for "${r.name}"`);
        process.exit(1);
    }
    if (endIndex === -1) {
        console.error(`ERROR: End marker not found for "${r.name}"`);
        process.exit(1);
    }
    if (startIndex >= endIndex) {
        console.error(`ERROR: Start marker is after End marker for "${r.name}"`);
        process.exit(1);
    }
    
    const targetContent = appJsContent.substring(startIndex, endIndex);
    appJsContent = appJsContent.replace(targetContent, r.replacement);
    console.log(`Successfully replaced "${r.name}"`);
});

fs.writeFileSync(appJsPath, appJsContent, 'utf8');
console.log("app.js updated successfully!");
