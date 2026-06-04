const testStrings = [
    // Interventions
    "Il avait bénéficié le 28/09/2024 d’une reprise chirurgicale : ablation du clou fémoral rompu, re-ostéosynthèse par clou verrouillé et greffe osseuse",
    "Elle a bénéficié d’une intervention chirurgicale (ostéosynthèse par plaque vissée LCP en INOX) le 22 janvier 2025",
    "Elle a ensuite été opérée en juin 2023 pour une ostéosynthèse du fémur avec greffe osseuse",
    "Elle a bénéficié, le 18 juillet 2025, d'une ligamentoplastie du ligament croisé antérieur sous arthroscopie",
    "Il est indiqué une ablation de sonde JJ",
    "Il est indiqué Une résection transurétrale de la prostate (RTUP)",
    "Il avait bénéficié le 22/02/23 d’une ostéosynthèse par un clou gamma long",
    "Pour rappel, Il avait bénéficié le 06/05/23 d’une ostéosynthèse du fémur gauche",
    "Il est indiqué une ablation du clou fémoral droit",
    "Il est indiqué une ostéosynthèse par plaque vissée LCP du radius et un enclouage de l’humérus",
    "Il est indiqué une Prothèse totale des deux hanches",
    "Il a bénéficié, le 11 mars 2026, d’une ligamentoplastie du LCA droit sous arthroscopie",
    "Il a bénéficié d’une ostéosynthèse par plaque vissée des plateaux tibiaux droits",
    "Il a bénéficié, le 01/06/2017, d’une prothèse totale de la hanche gauche à la Clinique Chirurgicale de Lomé",
    "Il avait bénéficié, le 25 juin 2024, d’une ostéosynthèse par plaque vissée LCP du fémur distal gauche et le 03 janvier 2025 d’une reprise",
    "Il est indiqué une ostéosynthèse de la malléole latérale et une syndesmodése",
    "Il est indiqué une cure de Pseudarthrose avec ostéosynthèse par plaque LCP des deux os de l’avant-bras droit et auto greffe iliaque",
    "Il est indiqué une arthroscopie diagnostique et thérapeutique avec ménisectomie et une ligamentoplastie du genou droit",
    "Il a bénéficié le 13/05/2023 d’une ostéoclasie du tibia et d’une double ostéosynthèse par plaques verrouillées latérale et médicale",
    "Elle a bénéficié le 14/01/23 d’une ostéosynthèse par plaque vissée fibulaire",
    "Il a bénéficié d’une ostéosynthèse par clou fémoral verrouillé",
    "Il est indiqué une résection transurétrale de la prostate (RTUP)",
    "Il est indiqué une ablation du matériel d’ostéosynthèse du 5ème métacarpien",
    "Il est indiqué une arthroscopie diagnostique avec une ligamentoplastie du genou droit",
    "Il est indiqué une résection transurétrale de la prostate et une cure herniaire bilatérale avec prothèse",
    "Il a bénéficié d’une ostéosynthèse des deux foyers de fracture le 29/09/2022 au CHDO/P",
    "Elle a bénéficié de parage suture et d’une ostéosynthèse par un fixateur externe",
    "Il a bénéficié, le 14 février 2025, d’une ostéosynthèse par plaque vissée LCP",
    "Il a bénéficié le 14 mai 2025 d’une prothèse totale du genou gauche de type charnière",
    "Il a bénéficié, le 20 juin 2025, d’une cure de pseudarthrose avec une ostéosynthèse par clou tibial verrouillé statique avec une autogreffe iliaque",
    "Il a bénéficié, le 2 juillet 2025, d'une ménisectomie et d'une ligamentoplastie du ligament croisé antérieur sous arthroscopie",
    "Elle avait bénéficié, le 1er mars 2023, d’une ostéotomie de la fibula gauche et d’une ostéosynthèse du tibia gauche par plaque LCP/DCP",
    "Il a bénéficié le 17 décembre 2025 d’une ostéosynthèse par vissage acromio-claviculaire droit",
    "Il a bénéficié, le 13 décembre 2025, d’une double ostéosynthèse, à savoir",
    "Elle a bénéficié d’une ostéosynthèse par une lame-plaque à 95°",
    
    // Diagnoses
    "Elle présente actuellement une hydronéphrose droite compliquée d’une insuffisance rénale aiguë",
    "Pour rappel, elle a été victime d’un accident de la circulation en décembre 2020 ayant entraîné une fracture bifocale du fémur gauche",
    "Un défaut de visualisation du ligament croisé antérieur, ce qui suggère une rupture ancienne de ce ligament",
    "Le bilan lésionnel associe une fracture isolée du radius gauche et une fracture céphalo-tubérositaire de l’humérus droit",
    "Roselyne, âgée de 36 ans pour une coxarthrose sévère bilatérale",
    "Une entorse grave avec rupture du ligament croisé antérieur",
    "La radiographie du 23 juin 2024 a retrouvé une fracture sus et intercondylienne gauche",
    "L’examen Clinique avait retrouvé un hémopéritoine et une fracture de l’avant-bras droit",
    "Une gonarthrose fémoro-tibiale bicompartimentale sévère avec chondropathie étendue grade IV",
    "Pour rappel elle a été hospitalisée du 14 au 16/01/2023 pour une fracture équivalent bimalléolaire droite",
    "Pour rappel, il a été victime d’un accident il y a 5 ans, ayant entraîné une fracture fermée du fémur gauche",
    "Pour rappel, il a bénéficié d’un embrochage du 5ème doigt droit indiqué pour une fracture du col du 5ème métacarpien droit le 18 avril 2025",
    "Rupture partielle du ligament croisé antérieur ;",
    "AKPATA Léon, âgé de 76 ans, pour une hypertrophie prostatique et une hernie inguinale bilatérale",
    "Il aurait été victime d’un accident de la circulation en juin 2023, ayant entraîné une fracture des épines tibiales",
    "PARAIZO ALEX, âgé de 61 ans, pour une gonarthrose bilatérale ligamentaire sur séquelle de poliomyélite aiguë",
    "KOTTO Benoît, âgé de 70 ans, pour une pseudarthrose de la jambe gauche",
    "AKO Jean Jacques, âgé de 33 ans, pour une rupture complète du ligament croisé antérieur et une fissure du ménisque médial",
    "Pour rappel, elle a été victime d’un traumatisme du genou droit courant janvier 2025, ayant entraîné une fracture du fémur distal droit"
];

function cleanClinicalTerm(term) {
    if (!term || typeof term !== 'string') return '';
    let clean = term.trim();
    
    // Extraction des interventions ou diagnostics dans les phrases de rapports
    const sentencePatterns = [
        // Nouveaux patterns pour les pronoms et récits
        /(?:il|elle)\s+est\s+indiqué[ee]?(?![a-z])\s+(?:une?|d['’]une?|la|le|l['’]|du|de|d['’]|\b)\s*(.*)$/i,
        /(?:il|elle)\s+(?:avait\s+|a\s+)?bénéficié(?![a-z]).*?\b(?:d['’]une?|d['’]l['’]|d['’]|de|du)\s*(.*)$/i,
        /(?:il|elle)\s+(?:a\s+)?(?:ensuite\s+)?été\s+opéré[ee]?(?![a-z]).*?\bpour\s+(?:une?|l['’]|la|le|du)\s*(.*)$/i,
        /(?:il|elle)\s+(?:a\s+)?présenté?e?(?![a-z])\s+(?:actuellement\s+)?(?:une?|des|la|le|l['’]|du|de|d['’])\s*(.*)$/i,
        /(?:il|elle)\s+présente(?![a-z])\s+(?:actuellement\s+)?(?:une?|des|la|le|l['’]|du|de|d['’])\s*(.*)$/i,
        /(?:l['’]irm|la\s+radiographie|l['’]examen\s+clinique|l['’]interrogatoire)\s+.*?(?:retrouvé?e?|objectivé?e?|retrouve|objective|montre|révèle)(?![a-z])\s+(?:une?|des|la|le|l['’]|du|de|d['’]|\b)\s*(.*)$/i,
        /(?:le\s+)?bilan\s+lésionnel\s+associe\s+(?:une?|des|la|le|l['’]|du|de|d['’]|\b)\s*(.*)$/i,
        /(?:ayant|a)\s+(?:entraîné|entrainé)(?![a-z])\s+(?:une?|d['’]une?|la|le|l['’]|du|de|d['’]|\b)\s*(.*)$/i,

        // Anciens patterns existants (mis à jour hospitalisé pour être flexible)
        /(?:consulte|consultée|reçu|reçue|hospitalisé|hospitalisée|admis|admise)\b.*?\bpour\s+(?:une?|l['’]|de|du|d['’]|\b)\s*(.*)$/i,
        /motif\s+de\s+consultation\s*\:\s*(.*)$/i,
        /diagnostic\s+principal\s*\:\s*(.*)$/i,
        /(?:âgé|âgée|age|âge)\s+de\s+\d+\s*(?:ans|mois)\s+pour\s+(?:une?|l['’]|le|la|les|des|du|\b)\s*(.*)$/i,
        /pour\s+(?:une?|l['’]|le|la|les|des|du|\b)\s*(ablation|ostéosynthèse|osteosynthèse|cure|arthroscopie|ligamentoplastie|résection|resection|réduction|reduction|exérèse|exerese|suture|parage|embrochage|enclouage|arthrodèse|arthrodese|prothèse|prothese|synovectomie|ténolyse|tenolyse|ténoplastie|tenoplastie|ténorraphie|tenorraphie|recalibrage|laminectomie|discectomie|libération|liberation|décompression|decompression|plastie|greffe|amputation|cystostomie|urétéroscopie|ureteroscopie|nlpc|extraction|dépose|depose|reconstruction).*$/i
    ];

    for (let pat of sentencePatterns) {
        const m = clean.match(pat);
        if (m && m[1]) {
            clean = m[1].trim();
            break;
        }
    }
    
    // Nettoyer les dates partout (global /g)
    clean = clean.replace(/\s+(?:,\s*)?le\s+\d{1,2}\s+\w+\s+\d{4}/ig, ''); // le 22 janvier 2025
    clean = clean.replace(/\s+(?:,\s*)?le\s+\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/ig, ''); // le 28/09/2024
    clean = clean.replace(/\s+(?:,\s*)?en\s+\w+\s+\d{4}/ig, ''); // en juin 2023
    clean = clean.replace(/\s+courant\s+\w+\s+\d{4}/ig, ''); // courant janvier 2025
    
    // Nettoyer les mentions cliniques / administratives de fin
    clean = clean.replace(/\s+à\s+la\s+Clinique\b.*$/i, '');
    clean = clean.replace(/\s+au\s+CHDO\/P.*$/i, '');
    clean = clean.replace(/,\s*à\s*savoir$/i, '');
    clean = clean.replace(/[\s\-\.\,\:\_]+$/, '').trim();
    
    return clean;
}

console.log("=== RESULTS ===");
for (let s of testStrings) {
    console.log(`Original:  "${s}"`);
    console.log(`Cleaned:   "${cleanClinicalTerm(s)}"`);
    console.log("---");
}
