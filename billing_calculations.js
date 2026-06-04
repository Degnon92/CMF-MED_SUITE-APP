/* ============================================================
   billing_calculations.js - Logique de Calculs Financiers Isopropyl
   ============================================================ */

window.MercyFiatCalculations = {
    // Calcule la répartition Tiers-Payant pour une ligne de prestation individuelle
    calculateItemSplit: function(price, qty, useSplit, patientType, coverage, splitLimit, splitRate) {
        const subtotal = price * qty;
        let itemSplitLimit = splitLimit !== undefined ? splitLimit : subtotal;
        let itemSplitRate = splitRate !== undefined ? splitRate : coverage;
        let itemPartAssurance = 0;
        let itemPartPatient = subtotal;

        if (patientType !== 'PRIVE') {
            if (useSplit) {
                itemPartAssurance = Math.round(itemSplitLimit * (itemSplitRate / 100));
                itemPartPatient = subtotal - itemPartAssurance;
            } else {
                itemPartAssurance = Math.round(subtotal * (coverage / 100));
                itemPartPatient = subtotal - itemPartAssurance;
            }
        }

        return {
            subtotal: subtotal,
            splitLimit: itemSplitLimit,
            splitRate: itemSplitRate,
            partAssurance: itemPartAssurance,
            partPatient: itemPartPatient
        };
    },

    // Calcule l'intégralité des totaux financiers d'une facture
    calculateBillTotals: function(items, discountType, discountValue, patientType, coverage, rawAmountPaid, useSplit) {
        let grossTotal = 0;
        let totalPartAssurance = 0;
        let totalPartPatient = 0;
        
        // 1. Calculer les sous-totaux et parts par item
        const processedItems = items.map(item => {
            const split = this.calculateItemSplit(
                item.price, 
                item.qty, 
                useSplit, 
                patientType, 
                coverage, 
                item.splitLimit, 
                item.splitRate
            );
            
            grossTotal += split.subtotal;
            totalPartAssurance += split.partAssurance;
            totalPartPatient += split.partPatient;
            
            return {
                name: item.name,
                price: item.price,
                qty: item.qty,
                subtotal: split.subtotal,
                splitLimit: split.splitLimit,
                splitRate: split.splitRate,
                partAssurance: split.partAssurance,
                partPatient: split.partPatient
            };
        });

        // 2. Calcul de la réduction flexible (% ou FCFA)
        let reductionAmount = 0;
        let discountPct = 0;
        const discVal = parseFloat(discountValue) || 0;

        if (discountType === 'PERCENT') {
            discountPct = discVal;
            reductionAmount = Math.round(grossTotal * (discountPct / 100));
        } else {
            reductionAmount = Math.round(discVal);
            discountPct = grossTotal > 0 ? (reductionAmount / grossTotal) * 100 : 0;
        }

        const discountedTotal = grossTotal - reductionAmount;
        
        let partAssurance = totalPartAssurance;
        let partPatient = totalPartPatient;
        
        // 3. Ajustement proportionnel des parts splitées si réduction
        if (reductionAmount > 0) {
            const splitDiscountRatio = grossTotal > 0 ? discountedTotal / grossTotal : 1;
            partAssurance = Math.round(partAssurance * splitDiscountRatio);
            partPatient = discountedTotal - partAssurance;
            
            processedItems.forEach(item => {
                item.partAssurance = Math.round(item.partAssurance * splitDiscountRatio);
                item.partPatient = item.subtotal - item.partAssurance;
            });
        }

        // 4. Calcul du reste à charge et règlements du patient
        const totalPatientShare = (patientType !== 'PRIVE') ? partPatient : discountedTotal;
        
        let amountPaidPatient = totalPatientShare;
        if (rawAmountPaid !== undefined && rawAmountPaid !== null && !isNaN(rawAmountPaid)) {
            amountPaidPatient = Math.min(rawAmountPaid, totalPatientShare);
        }
        
        const balancePatient = totalPatientShare - amountPaidPatient;

        return {
            grossTotal: grossTotal,
            reductionAmount: reductionAmount,
            discountPct: discountPct,
            discountedTotal: discountedTotal,
            partAssurance: partAssurance,
            partPatient: partPatient,
            totalPatientShare: totalPatientShare,
            amountPaidPatient: amountPaidPatient,
            balancePatient: balancePatient,
            items: processedItems
        };
    }
};
