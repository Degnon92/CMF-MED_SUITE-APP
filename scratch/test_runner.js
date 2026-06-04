const fs = require('fs');
const path = require('path');

// Mocker de façon basique le navigateur pour éviter toute dépendance jsdom
global.window = {
    addEventListener: () => {}
};
global.document = {
    addEventListener: (event, cb) => {
        if (event === 'DOMContentLoaded') {
            global.DOMContentLoadedHandler = cb;
        }
    },
    getElementById: (id) => {
        return {
            id: id,
            value: '',
            style: {},
            classList: {
                add: () => {},
                remove: () => {},
                contains: () => false
            },
            parentNode: {
                classList: {
                    contains: () => false
                },
                insertBefore: () => {}
            },
            appendChild: () => {},
            textContent: '',
            innerHTML: ''
        };
    },
    querySelectorAll: () => {
        return {
            forEach: () => {}
        };
    },
    createElement: (tag) => {
        return {
            tagName: tag.toUpperCase(),
            style: {},
            classList: {
                add: () => {},
                remove: () => {},
                contains: () => false
            },
            appendChild: () => {},
            addEventListener: () => {}
        };
    }
};

// Mocker localStorage
const localStorageStore = {};
global.localStorage = {
    getItem: (key) => localStorageStore[key] || null,
    setItem: (key, value) => { localStorageStore[key] = String(value); },
    clear: () => { for(let k in localStorageStore) delete localStorageStore[k]; },
    removeItem: (key) => { delete localStorageStore[key]; }
};

global.navigator = {
    userAgent: 'node'
};

// Exécuter les scripts dans l'ordre
const basePath = path.join(__dirname, '..');
const scripts = ['database.js', 'app.js', 'billing.js', 'documents.js', 'exports.js'];

scripts.forEach(script => {
    const code = fs.readFileSync(path.join(basePath, script), 'utf8');
    try {
        // Exécuter le code JS dans le contexte de Node
        const fn = new Function('window', 'document', 'localStorage', code);
        fn(global.window, global.document, global.localStorage);
    } catch (err) {
        console.error(`Erreur dans ${script}:`, err);
    }
});

// Appeler le DOMContentLoaded
if (global.DOMContentLoadedHandler) {
    try {
        global.DOMContentLoadedHandler();
    } catch (err) {
        console.error("Erreur lors de l'exécution de DOMContentLoaded:", err);
    }
}

// Appeler switchSection('register')
try {
    if (typeof global.switchSection === 'function') {
        global.switchSection('register');
        console.log("global.switchSection('register') exécuté avec succès.");
    } else if (typeof global.window.switchSection === 'function') {
        global.window.switchSection('register');
        console.log("global.window.switchSection('register') exécuté avec succès.");
    } else {
        console.log("switchSection n'est pas défini globalement ni sur window.");
    }
} catch (err) {
    console.error("Erreur dans switchSection('register'):", err);
}
