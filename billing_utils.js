/* ============================================================
   billing_utils.js - Formatages monétaires & Chiffres en lettres
   ============================================================ */

// Formate les chiffres en devise FCFA
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
}
window.formatCurrency = formatCurrency;

// Formate les chiffres pour la grille de saisie (sans suffixe FCFA pour économiser l'espace)
function formatGridNumber(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount);
}
window.formatGridNumber = formatGridNumber;

// Convertisseur simple de nombres en toutes lettres en français
function numberToFrenchWords(num) {
    if (num === 0) return "zéro";
    
    const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
    
    function convertLessThanThousand(n) {
        if (n === 0) return "";
        let result = "";
        
        const hundreds = Math.floor(n / 100);
        const remainder = n % 100;
        
        if (hundreds > 0) {
            if (hundreds === 1) {
                result += "cent ";
            } else {
                result += ones[hundreds] + " cent ";
            }
        }
        
        if (remainder > 0) {
            if (remainder < 20) {
                result += ones[remainder];
            } else {
                const t = Math.floor(remainder / 10);
                const o = remainder % 10;
                if (t === 7 || t === 9) {
                    result += tens[t - 1] + "-" + ones[o + 10];
                } else {
                    result += tens[t] + (o === 1 ? " et un" : (o > 0 ? "-" + ones[o] : ""));
                }
            }
        }
        return result.trim();
    }
    
    let temp = num;
    let billion = Math.floor(temp / 1000000000);
    temp %= 1000000000;
    let million = Math.floor(temp / 1000000);
    temp %= 1000000;
    let thousand = Math.floor(temp / 1000);
    let rest = temp % 1000;
    
    let words = "";
    
    if (billion > 0) {
        words += convertLessThanThousand(billion) + " milliard" + (billion > 1 ? "s" : "") + " ";
    }
    if (million > 0) {
        words += convertLessThanThousand(million) + " million" + (million > 1 ? "s" : "") + " ";
    }
    if (thousand > 0) {
        if (thousand === 1) {
            words += "mille ";
        } else {
            words += convertLessThanThousand(thousand) + " mille ";
        }
    }
    if (rest > 0) {
        words += convertLessThanThousand(rest);
    }
    
    return words.trim();
}
window.numberToFrenchWords = numberToFrenchWords;
