/* ============================================================
   app_demo_data.js - Données de Démonstration Réalistes
   ============================================================ */

function injectDemoData() {
    const demoBills = [
        {
            id: 'BILL-1',
            reference: 'MF-DEF-202605-001',
            patientNom: 'PARAISO',
            patientPrenom: 'Alex',
            patientAge: '56 ans',
            civilite: 'M.',
            type: 'DEFINITIF',
            insurance: 'NSIA',
            coverage: 80,
            matricule: 'NS-9912A',
            diagnosis: 'Gonarthrose unilatérale gauche invalidante',
            items: [
                { name: 'Prothèse Totale du Genou (PTG) gauche', price: 1200000, qty: 1, subtotal: 1200000 },
                { name: 'Frais de Bloc Opératoire', price: 150000, qty: 1, subtotal: 150000 },
                { name: 'Nuitée d\'Hospitalisation (Chambre VIP)', price: 45000, qty: 5, subtotal: 225000 },
                { name: 'Frais d\'Anesthésie Générale / Rachi', price: 200000, qty: 1, subtotal: 200000 },
                { name: 'Kiné de rééducation post-opératoire (Séance)', price: 15000, qty: 6, subtotal: 90000 }
                
            ],
            grossTotal: 1865000,
            discountPct: 0,
            reductionAmount: 0,
            discountedTotal: 1865000,
            partAssurance: 1452000,
            partPatient: 413000,
            paymentMethod: 'TIERS_PAYANT',
            amountPaidPatient: 413000,
            balancePatient: 0,
            status: 'IMPAYÉ',
            date: '2026-05-10'
        },
        {
            id: 'BILL-2',
            reference: 'MF-PRO-202605-001',
            patientNom: 'KPADONOU',
            patientPrenom: 'Rémi Senakpon',
            patientAge: '34 ans',
            civilite: 'M.',
            type: 'PROFORMA',
            insurance: 'OLEA',
            coverage: 80,
            matricule: 'OLEA-99238',
            diagnosis: 'Rupture complète du LCA du genou gauche',
            items: [
                { name: 'Plastie ligamentaire du LCA par DIDT (Genou)', price: 750000, qty: 1, subtotal: 750000 },
                { name: 'Frais de Bloc Opératoire', price: 120000, qty: 1, subtotal: 120000 },
                { name: 'Nuitée d\'Hospitalisation (Chambre Standard)', price: 25000, qty: 3, subtotal: 75000 },
                { name: 'Frais d\'Anesthésie Générale / Rachi', price: 150000, qty: 1, subtotal: 150000 }
            ],
            grossTotal: 1095000,
            discountPct: 0,
            reductionAmount: 0,
            discountedTotal: 1095000,
            partAssurance: 876000,
            partPatient: 219000,
            paymentMethod: 'TIERS_PAYANT',
            amountPaidPatient: 0,
            balancePatient: 219000,
            status: 'IMPAYÉ',
            date: '2026-05-18'
        },
        {
            id: 'BILL-3',
            reference: 'MF-DEF-202605-002',
            patientNom: 'MELLIER',
            patientPrenom: 'Daniel',
            patientAge: '62 ans',
            civilite: 'M.',
            type: 'DEFINITIF',
            insurance: 'ASCOMA',
            coverage: 80,
            matricule: 'ASC-MELL-01',
            diagnosis: 'Adénome de prostate obstructif — RTUP',
            items: [
                { name: 'Résection Trans-urétrale de la Prostate (RTUP)', price: 650000, qty: 1, subtotal: 650000 },
                { name: 'Frais de Bloc Opératoire', price: 120000, qty: 1, subtotal: 120000 },
                { name: 'Nuitée d\'Hospitalisation (Chambre Standard)', price: 25000, qty: 4, subtotal: 100000 }
            ],
            grossTotal: 870000,
            discountPct: 0,
            reductionAmount: 0,
            discountedTotal: 870000,
            partAssurance: 696000,
            partPatient: 174000,
            paymentMethod: 'TIERS_PAYANT',
            amountPaidPatient: 0,
            balancePatient: 174000,
            status: 'IMPAYÉ',
            date: '2026-05-22'
        },
        {
            id: 'BILL-4',
            reference: 'MF-PRO-202605-002',
            patientNom: 'ADJAKPA',
            patientPrenom: 'Céleste',
            patientAge: '28 ans',
            civilite: 'Mme',
            type: 'PROFORMA',
            insurance: 'PRIVE',
            coverage: 0,
            matricule: 'N/A',
            diagnosis: 'Fracture déplacée de la clavicule gauche',
            items: [
                { name: 'Ostéosynthèse clavicule par plaque LCP', price: 500000, qty: 1, subtotal: 500000 },
                { name: 'Nuitée d\'Hospitalisation', price: 25000, qty: 2, subtotal: 50000 },
                { name: 'Frais de Bloc Opératoire', price: 80000, qty: 1, subtotal: 80000 }
            ],
            grossTotal: 630000,
            discountPct: 0,
            reductionAmount: 0,
            discountedTotal: 630000,
            partAssurance: 0,
            partPatient: 630000,
            paymentMethod: 'CASH',
            amountPaidPatient: 630000,
            balancePatient: 0,
            status: 'RÉGLÉ',
            date: '2026-05-25'
        }
    ];

    const demoDocs = [
        {
            id: 'DOC-1',
            patientNom: 'PARAISO',
            patientPrenom: 'Alex',
            patientAge: '56 ans',
            diagnosis: 'Gonarthrose unilatérale gauche invalidante',
            text: 'Rapport d\'hospitalisation pour PTG genou gauche.',
            templateId: 'rapport_hospi_assurance',
            date: '2026-05-10'
        },
        {
            id: 'DOC-2',
            patientNom: 'KPADONOU',
            patientPrenom: 'Rémi Senakpon',
            patientAge: '34 ans',
            diagnosis: 'Rupture complète du ligament croisé antérieur genou gauche',
            text: 'Rapport de consultation pour LCA genou gauche.',
            templateId: 'rapport_cs_assurance',
            date: '2026-05-18'
        }
    ];

    const currentBills = window.savedBills || [];
    const currentDocs = window.savedDocuments || [];

    if (currentBills.length === 0) {
        window.savedBills = demoBills;
        localStorage.setItem('mercyfiat_bills', JSON.stringify(demoBills));
    }
    if (currentDocs.length === 0) {
        window.savedDocuments = demoDocs;
        localStorage.setItem('mercyfiat_docs', JSON.stringify(demoDocs));
    }
}
window.injectDemoData = injectDemoData;
