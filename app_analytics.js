/* ============================================================
   app_analytics.js - Statistiques, Tableaux de Bord & Graphiques SVG
   ============================================================ */

// 1. Calcul des statistiques globales du tableau de bord
function updateDashboardStats() {
    const bills = window.savedBills || [];
    const docs = window.savedDocuments || [];

    // Nombre de proformas et de points définitifs
    const proformasCount = bills.filter(b => b.type === 'PROFORMA').length;
    const definitifsCount = bills.filter(b => b.type === 'DEFINITIF').length;
    const avoirsCount = bills.filter(b => b.type === 'AVOIR').length;
    
    const kpiProf = document.getElementById('kpi-proformas');
    if (kpiProf) kpiProf.textContent = proformasCount;

    const kpiDef = document.getElementById('kpi-definitifs');
    if (kpiDef) kpiDef.textContent = definitifsCount + (avoirsCount > 0 ? ` (${avoirsCount} avoirs)` : '');
    
    // Chiffre d'affaires brut total (définitifs - avoirs)
    const definitifsGross = bills
        .filter(b => b.type === 'DEFINITIF')
        .reduce((sum, b) => sum + b.grossTotal, 0);
    const avoirsGross = bills
        .filter(b => b.type === 'AVOIR')
        .reduce((sum, b) => sum + b.grossTotal, 0);
    const caTotal = definitifsGross - avoirsGross;

    const kpiCa = document.getElementById('kpi-ca');
    if (kpiCa) kpiCa.textContent = typeof formatCurrency === 'function' ? formatCurrency(caTotal) : caTotal;
    
    // Nombre de rapports médicaux
    const kpiRep = document.getElementById('kpi-reports');
    if (kpiRep) kpiRep.textContent = docs.length;

    // Calcul de l'en-cours assurance (somme des partAssurance DEFINITIF impayées - avoirs impayés)
    const encoursDef = bills
        .filter(b => b.type === 'DEFINITIF' && b.status === 'IMPAYÉ')
        .reduce((sum, b) => sum + b.partAssurance, 0);
    const encoursAvoir = bills
        .filter(b => b.type === 'AVOIR' && b.status === 'IMPAYÉ')
        .reduce((sum, b) => sum + b.partAssurance, 0);
    const encoursTotal = encoursDef - encoursAvoir;
    const encoursEl = document.getElementById('kpi-encours');
    if (encoursEl) encoursEl.textContent = typeof formatCurrency === 'function' ? formatCurrency(encoursTotal) : encoursTotal;
    
    // Calcul de la répartition par assureur (légende du graphique)
    const insurances = bills.map(b => b.insurance);
    const counts = {};
    insurances.forEach(ins => { counts[ins] = (counts[ins] || 0) + 1; });
    
    const legendContainer = document.getElementById('insurance-legend');
    if (legendContainer) {
        legendContainer.innerHTML = '';
        const insNames = {};
        if (window.MercyFiatDB && window.MercyFiatDB.INSURERS) {
            window.MercyFiatDB.INSURERS.forEach(ins => {
                insNames[ins.id] = ins.name;
            });
        }
        
        Object.keys(counts).forEach(key => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.marginBottom = '4px';
            row.innerHTML = `
                <span><strong>${insNames[key] || key} :</strong></span>
                <span>${counts[key]} dossier(s)</span>
            `;
            legendContainer.appendChild(row);
        });
    }
    
    // Suivi Analytique Tiers-Payant
    if (typeof updateInsurerReceivablesDashboard === 'function') {
        updateInsurerReceivablesDashboard();
    }
}
window.updateDashboardStats = updateDashboardStats;

// 2. Rendu du tableau et des barres visuelles de créance Tiers-Payant
function updateInsurerReceivablesDashboard() {
    const listContainer = document.getElementById('insurer-receivables-rows');
    const barsContainer = document.getElementById('insurer-receivables-bars');
    const globalRateBadge = document.getElementById('kpi-recouvrement-global');
    if (!listContainer || !barsContainer) return;

    const bills = window.savedBills || [];

    // Récupérer la liste des assureurs actifs (hors PRIVE)
    const activeInsurers = (window.MercyFiatDB && window.MercyFiatDB.INSURERS) 
        ? window.MercyFiatDB.INSURERS.filter(ins => ins.id !== 'PRIVE') 
        : [];

    listContainer.innerHTML = '';
    barsContainer.innerHTML = '';

    let globalTotalBilled = 0;
    let globalTotalUnpaid = 0;

    const insurerStats = activeInsurers.map(ins => {
        const insurerBills = bills.filter(b => b.insurance === ins.id && b.type === 'DEFINITIF');
        const insurerAvoirs = bills.filter(b => b.insurance === ins.id && b.type === 'AVOIR');

        const totalBilled = insurerBills.reduce((sum, b) => sum + b.partAssurance, 0) 
            - insurerAvoirs.reduce((sum, b) => sum + b.partAssurance, 0);

        const unpaidBilled = insurerBills.filter(b => b.status === 'IMPAYÉ').reduce((sum, b) => sum + b.partAssurance, 0)
            - insurerAvoirs.filter(b => b.status === 'IMPAYÉ').reduce((sum, b) => sum + b.partAssurance, 0);

        const unpaidDossiersCount = insurerBills.filter(b => b.status === 'IMPAYÉ').length;

        const paidBilled = totalBilled - unpaidBilled;
        const recoveryRate = totalBilled > 0 ? Math.max(0, Math.min(100, Math.round((paidBilled / totalBilled) * 100))) : 100;

        globalTotalBilled += totalBilled;
        globalTotalUnpaid += unpaidBilled;

        return {
            id: ins.id,
            name: ins.name,
            unpaidCount: unpaidDossiersCount,
            unpaidAmount: unpaidBilled,
            recoveryRate: recoveryRate,
            totalBilled: totalBilled
        };
    });

    insurerStats.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="color: var(--text-primary);">${stat.name}</strong></td>
            <td style="text-align:center;">
                <span class="badge ${stat.unpaidCount > 0 ? 'warning' : 'success'}" style="font-weight: 700;">
                    ${stat.unpaidCount} dossier${stat.unpaidCount > 1 ? 's' : ''}
                </span>
            </td>
            <td style="text-align:right; font-weight:700; color:${stat.unpaidAmount > 0 ? 'var(--accent-coral)' : 'var(--success)'};">
                ${new Intl.NumberFormat('fr-FR').format(stat.unpaidAmount)} FCFA
            </td>
            <td style="text-align:right;">
                <span class="badge ${stat.recoveryRate >= 80 ? 'success' : (stat.recoveryRate >= 50 ? 'warning' : 'danger')}" style="font-weight: 800;">
                    ${stat.recoveryRate}%
                </span>
            </td>
        `;
        listContainer.appendChild(row);

        const barWrapper = document.createElement('div');
        barWrapper.style.display = 'flex';
        barWrapper.style.flexDirection = 'column';
        barWrapper.style.gap = '6px';
        barWrapper.style.marginBottom = '12px';

        const barHeader = document.createElement('div');
        barHeader.style.display = 'flex';
        barHeader.style.justifyContent = 'space-between';
        barHeader.style.fontSize = '0.78rem';
        barHeader.style.fontWeight = '700';
        barHeader.style.color = 'var(--text-primary)';
        barHeader.innerHTML = `
            <span style="font-size:0.78rem; letter-spacing:0.3px; color:var(--text-primary); font-weight:700;">${stat.name}</span>
            <span style="color: ${stat.recoveryRate >= 80 ? 'var(--success)' : (stat.recoveryRate >= 50 ? 'var(--warning)' : 'var(--danger)')}; font-weight:800;">${stat.recoveryRate}% Recouvré</span>
        `;

        const barTrack = document.createElement('div');
        barTrack.style.width = '100%';
        barTrack.style.height = '10px';
        barTrack.style.backgroundColor = 'var(--border-color)';
        barTrack.style.borderRadius = '6px';
        barTrack.style.overflow = 'hidden';
        barTrack.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.06)';

        const barFill = document.createElement('div');
        barFill.style.width = `${stat.recoveryRate}%`;
        barFill.style.height = '100%';
        
        let barColor = 'linear-gradient(90deg, var(--success), #8bc34a)';
        if (stat.recoveryRate < 50) {
            barColor = 'linear-gradient(90deg, var(--danger), #ff5252)';
        } else if (stat.recoveryRate < 80) {
            barColor = 'linear-gradient(90deg, var(--warning), #ffb74d)';
        }
        barFill.style.background = barColor;
        barFill.style.borderRadius = '6px';
        barFill.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

        barTrack.appendChild(barFill);
        barWrapper.appendChild(barHeader);
        barWrapper.appendChild(barTrack);
        barsContainer.appendChild(barWrapper);
    });

    const globalPaid = globalTotalBilled - globalTotalUnpaid;
    const globalRecoveryRate = globalTotalBilled > 0 ? Math.max(0, Math.min(100, Math.round((globalPaid / globalTotalBilled) * 100))) : 100;
    if (globalRateBadge) {
        globalRateBadge.textContent = `Recouvrement Global : ${globalRecoveryRate}%`;
        globalRateBadge.className = `badge ${globalRecoveryRate >= 80 ? 'success' : (globalRecoveryRate >= 50 ? 'warning' : 'danger')}`;
    }
}
window.updateInsurerReceivablesDashboard = updateInsurerReceivablesDashboard;

// 3. Rendu des graphiques SVGs interactifs
function renderAnalyticsCharts() {
    const caContainer = document.getElementById('ca-chart-container');
    const insuranceContainer = document.getElementById('insurance-chart-container');
    const legendContainer = document.getElementById('insurance-legend');
    
    if (!caContainer || !insuranceContainer) return;
    
    const bills = window.savedBills || [];
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        last6Months.push({
            year: d.getFullYear(),
            month: d.getMonth(),
            label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`,
            total: 0
        });
    }
    
    bills.forEach(b => {
        if (b.type === 'DEFINITIF') {
            const bDate = new Date(b.date);
            last6Months.forEach(m => {
                if (bDate.getFullYear() === m.year && bDate.getMonth() === m.month) {
                    m.total += b.grossTotal;
                }
            });
        }
    });
    
    const maxVal = Math.max(...last6Months.map(m => m.total), 1000000);
    
    const width = 450;
    const height = 200;
    const padding = 35;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    let svgHtml = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
        <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent-blue)"></stop>
                <stop offset="100%" stop-color="rgba(74, 111, 165, 0.05)"></stop>
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="var(--accent-teal)"></stop>
                <stop offset="100%" stop-color="var(--accent-blue)"></stop>
            </linearGradient>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent-teal)" stop-opacity="0.25"></stop>
                <stop offset="100%" stop-color="var(--accent-teal)" stop-opacity="0.00"></stop>
            </linearGradient>
        </defs>
        
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="var(--border-color)" stroke-width="0.8" stroke-dasharray="3"></line>
        <line x1="${padding}" y1="${padding + chartHeight/2}" x2="${width - padding}" y2="${padding + chartHeight/2}" stroke="var(--border-color)" stroke-width="0.8" stroke-dasharray="3"></line>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border-color)" stroke-width="1.5"></line>
    `;
    
    const barWidth = 24;
    const spacing = chartWidth / last6Months.length;
    const points = [];
    
    last6Months.forEach((m, idx) => {
        const x = padding + idx * spacing + spacing / 2;
        const barHeight = (m.total / maxVal) * chartHeight;
        const y = height - padding - barHeight;
        
        points.push({x, y});
        
        svgHtml += `
            <rect x="${x - barWidth/2}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="url(#barGrad)" style="cursor: pointer; transition: all 0.3s ease; opacity: 0.85;" 
                  class="chart-bar-rect"
                  onmouseover="showChartTooltip(event, '${m.label}', '${new Intl.NumberFormat('fr-FR').format(m.total)} FCFA')" 
                  onmouseout="hideChartTooltip()">
            </rect>
            <text x="${x}" y="${height - padding + 18}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--text-secondary)">${m.label}</text>
        `;
    });
    
    if (points.length > 1) {
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const cpX1 = points[i-1].x + spacing / 2;
            const cpY1 = points[i-1].y;
            const cpX2 = points[i].x - spacing / 2;
            const cpY2 = points[i].y;
            pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
        }
        
        svgHtml += `
            <path d="${pathD} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z" fill="url(#areaGrad)"></path>
            <path d="${pathD}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round"></path>
        `;
        
        points.forEach((p, idx) => {
            const m = last6Months[idx];
            svgHtml += `
                <circle cx="${p.x}" cy="${p.y}" r="5" fill="#ffffff" stroke="var(--accent-teal)" stroke-width="3" style="cursor: pointer; transition: all 0.2s; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));" class="chart-point-node"
                        onmouseover="showChartTooltip(event, '${m.label}', '${new Intl.NumberFormat('fr-FR').format(m.total)} FCFA')" 
                        onmouseout="hideChartTooltip()">
                </circle>
            `;
        });
    }
    
    const formatYVal = (val) => val >= 1000000 ? (val/1000000).toFixed(1) + "M" : val/1000 + "k";
    svgHtml += `
        <text x="${padding - 8}" y="${padding + 3}" text-anchor="end" font-size="9" font-weight="700" fill="var(--text-secondary)">${formatYVal(maxVal)}</text>
        <text x="${padding - 8}" y="${padding + chartHeight/2 + 3}" text-anchor="end" font-size="9" font-weight="700" fill="var(--text-secondary)">${formatYVal(maxVal/2)}</text>
        <text x="${padding - 8}" y="${height - padding + 3}" text-anchor="end" font-size="9" font-weight="700" fill="var(--text-secondary)">0</text>
    </svg>`;
    
    caContainer.innerHTML = svgHtml;
    
    // --- 2. DONUT ASSURANCES ---
    const insurersCount = {};
    let totalInvoices = 0;
    
    bills.forEach(b => {
        insurersCount[b.insurance] = (insurersCount[b.insurance] || 0) + 1;
        totalInvoices++;
    });
    
    const insColors = {};
    const insNames = {};
    if (window.MercyFiatDB && window.MercyFiatDB.INSURERS) {
        window.MercyFiatDB.INSURERS.forEach(ins => {
            insColors[ins.id] = ins.color || '#a0aec0';
            insNames[ins.id] = ins.name;
        });
    }
    
    if (totalInvoices > 0) {
        let donutSvg = `<svg width="150" height="150" viewBox="0 0 36 36" style="transform: rotate(-90deg); overflow: visible;">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" stroke-width="4.2" stroke-opacity="0.3"></circle>
        `;
        
        let currentOffset = 0;
        const legendItems = [];
        
        Object.keys(insurersCount).forEach(key => {
            const count = insurersCount[key];
            const pct = (count / totalInvoices) * 100;
            const strokeColor = insColors[key] || '#a0aec0';
            
            donutSvg += `
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="${strokeColor}" stroke-width="4.5"
                        stroke-dasharray="${pct} 100" stroke-dashoffset="${-currentOffset}"
                        style="cursor: pointer; transition: all 0.3s ease; stroke-linecap: round;"
                        class="donut-slice"
                        onmouseover="showChartTooltip(event, '${insNames[key] || key}', '${count} dossier(s) (${Math.round(pct)}%)')"
                        onmouseout="hideChartTooltip()">
                </circle>
            `;
            
            legendItems.push({
                key,
                name: insNames[key] || key,
                count,
                pct,
                color: strokeColor
            });
            
            currentOffset += pct;
        });
        
        donutSvg += `
            <circle cx="18" cy="18" r="12" fill="var(--bg-card)"></circle>
            <text x="18" y="19.2" text-anchor="middle" font-size="5.5" font-weight="900" fill="var(--text-primary)" style="transform: rotate(90deg); transform-origin: 18px 18px;">${totalInvoices}</text>
            <text x="18" y="24" text-anchor="middle" font-size="2.8" font-weight="700" fill="var(--text-secondary)" style="transform: rotate(90deg); transform-origin: 18px 18px;">Fiches</text>
        </svg>`;
        
        insuranceContainer.innerHTML = donutSvg;
        
        if (legendContainer) {
            legendContainer.innerHTML = '';
            legendItems.sort((a, b) => b.count - a.count);
            
            legendItems.forEach(item => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.justifyContent = 'space-between';
                row.style.marginBottom = '8px';
                row.style.padding = '6px 12px';
                row.style.borderRadius = 'var(--radius-sm)';
                row.style.backgroundColor = 'var(--bg-main)';
                row.style.border = '1px solid var(--border-color)';
                row.style.transition = 'var(--transition-fast)';
                row.style.cursor = 'pointer';
                row.classList.add('legend-row-item');
                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${item.color}; box-shadow:0 0 6px ${item.color}80;"></span>
                        <span style="font-weight:700; color:var(--text-primary); font-size: 0.8rem;">${item.name}</span>
                    </div>
                    <span style="font-weight:800; color:var(--text-secondary); font-size: 0.8rem;">${item.count} (${Math.round(item.pct)}%)</span>
                `;
                legendContainer.appendChild(row);
            });
        }
    } else {
        insuranceContainer.innerHTML = `
            <svg width="150" height="150" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" stroke-width="4.2"></circle>
                <text x="18" y="20" text-anchor="middle" font-size="4" font-weight="700" fill="var(--text-secondary)">Aucune donnée</text>
            </svg>
        `;
        if (legendContainer) legendContainer.innerHTML = '<p style="font-style:italic; font-size:0.8rem; color:var(--text-secondary);">Aucune facture enregistrée.</p>';
    }
}
window.renderAnalyticsCharts = renderAnalyticsCharts;

// 4. Infobulles graphiques
function showChartTooltip(event, label, value) {
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.backgroundColor = 'rgba(26, 32, 44, 0.96)';
        tooltip.style.color = '#ffffff';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '6px';
        tooltip.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
        tooltip.style.zIndex = '100000';
        tooltip.style.fontSize = '0.78rem';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.transition = 'opacity 0.15s ease';
        tooltip.style.opacity = '0';
        tooltip.style.fontWeight = '600';
        tooltip.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        tooltip.style.backdropFilter = 'blur(8px)';
        document.body.appendChild(tooltip);
    }
    
    tooltip.innerHTML = `
        <div style="font-weight:800; color:var(--accent-teal); margin-bottom:2px;">${label}</div>
        <div style="font-size:0.85rem; font-weight:800;">${value}</div>
    `;
    
    tooltip.style.left = (event.clientX + 15) + 'px';
    tooltip.style.top = (event.clientY - 15) + 'px';
    tooltip.style.opacity = '1';
}
window.showChartTooltip = showChartTooltip;

function hideChartTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
    }
}
window.hideChartTooltip = hideChartTooltip;
