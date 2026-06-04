/* ============================================================
   print_templates.js - Centralisation des En-têtes & Pieds de page
   ============================================================ */

window.MercyFiatTemplates = {
    // Génère l'en-tête officiel de la clinique avec logo et spécialités
    getPrintHeaderHtml: function() {
        return `
            <div style="display:flex; align-items:center; border-bottom:3px double #2d3748; padding-bottom:4px; margin-bottom:6px; gap:20px; width:100%; box-sizing:border-box;">
                <div style="flex:0 0 90px; display:flex; justify-content:center; align-items:center;">
                    <img src="assets/logo_clinique.jpg" alt="Logo" style="max-height:75px; max-width:90px; object-fit:contain;">
                </div>
                <div style="flex:1; text-align:center; padding-right:90px;">
                    <div style="font-family:'Outfit','Inter',sans-serif; font-size:1.5rem; font-weight:900; color:#2d3748; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">CLINIQUE MERCY FIAT</div>
                    <div style="font-size:0.56rem; font-weight:700; color:#4a5568; text-transform:uppercase; letter-spacing:0.1px; margin-bottom:1px; white-space:nowrap;">MEDECINE GENERALE - SPECIALITES MEDICALES ET CHIRURGICALES - LABORATOIRE</div>
                    <div style="font-size:0.58rem; font-weight:700; color:#4a5568; text-transform:uppercase; letter-spacing:0.1px;">CARDIOLOGIE 7J/7</div>
                </div>
            </div>
        `;
    },

    // Génère le pied de page officiel encadré et coloré (Teal)
    getPrintFooterHtml: function() {
        return `
            <div class="print-footer">
                SEME AGUE PK 18 &nbsp;|&nbsp; Tél : +229 69 62 02 02 / 98 00 00 55 &nbsp;|&nbsp; Cotonou Vodjè &nbsp;|&nbsp; Tél : +229 69 02 11 11 / 98 70 98 98<br>
                E-mail : cliniquemercyfiat@gmail.com &nbsp;/&nbsp; ORABANK Cpte bancaire : 02170730 0 201 &nbsp;/&nbsp; N° IFU : 3201710045937 &nbsp;/&nbsp; N° RCCM-RB-COT-17-B-19317
            </div>
        `;
    },

    // Génère le bloc Notes & Conditions des devis/proformas encadré
    getProformaNotesHtml: function() {
        return `
            <div style="border: 1px solid #4b807b; background: #f4f8f7; border-radius: 6px; padding: 6px 10px; font-size: 0.58rem; line-height: 1.35; color: #2d3748; font-family:'Times New Roman', Times, serif; text-align:left; box-sizing:border-box; width:100%; display: flex; flex-direction: column; gap: 3px; page-break-inside: avoid;">
                <strong style="color: #4b807b; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2px; font-weight:800; display: inline-flex; align-items: center; gap: 3px; margin-bottom: 1px;">📌 Notes &amp; Conditions :</strong>
                <span style="display: block;"><strong>A -</strong> Cette facture est susceptible de modifications.</span>
                <span style="display: block;"><strong>B -</strong> Lorsque le patient est assuré, la compagnie d'assurance paie toute ou une partie de la facture et il lui revient de payer la différence.</span>
                <span style="display: block;"><strong>C -</strong> Aucune autre tarification n'est acceptée à part celle pratiquée à la Clinique.</span>
            </div>
        `;
    }
};
