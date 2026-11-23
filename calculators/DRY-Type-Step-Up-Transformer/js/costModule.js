/**
 * costModule.js
 * Generic Material Cost Estimation Module
 * 
 * This script runs completely independently from the engineering calculations.
 * It listens for changes in any input and updates the cost breakdown dynamically.
 */

(function() {
    // Standard price IDs
    const PRICE_IDS = {
        'Copper': 'priceCu',
        'Aluminium': 'priceAl',
        'Iron Core': 'priceFe',
        'Bobbin': 'priceBobbin',
        'Clamp': 'priceClamp'
    };

    // Load saved prices from localStorage
    function loadPrices() {
        try {
            const saved = JSON.parse(localStorage.getItem('material_prices') || '{}');
            Object.values(PRICE_IDS).forEach(id => {
                const el = document.getElementById(id);
                if (el && saved[id] !== undefined) {
                    el.value = saved[id];
                }
            });
        } catch (e) {
            console.error('Error loading prices', e);
        }
    }

    // Save prices to localStorage
    function savePrices() {
        const prices = {};
        Object.values(PRICE_IDS).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                prices[id] = el.value;
            }
        });
        localStorage.setItem('material_prices', JSON.stringify(prices));
    }

    // Format currency
    function formatCurrency(amount) {
        return '₹' + amount.toFixed(2);
    }

    // Get current price for a material
    function getPriceForMaterial(materialName) {
        const id = PRICE_IDS[materialName];
        if (!id) return 0;
        const el = document.getElementById(id);
        if (!el || !el.value) return 0;
        return parseFloat(el.value) || 0;
    }

    function calculateCosts() {
        // 1. Discover all cost elements
        const costElements = document.querySelectorAll('[data-cost-type]');
        
        const breakdown = [];
        const totalsByMaterial = {
            'Copper': { weight: 0, cost: 0 },
            'Aluminium': { weight: 0, cost: 0 },
            'Iron Core': { weight: 0, cost: 0 },
            'Bobbin': { weight: 0, cost: 0 },
            'Clamp': { weight: 0, cost: 0 }
        };

        let grandTotal = 0;

        costElements.forEach(el => {
            const type = el.getAttribute('data-cost-type');
            const name = el.getAttribute('data-cost-name') || 'Unknown';
            let weight = parseFloat(el.value) || 0;
            
            // Skip zero weights
            if (weight <= 0) return;

            let material = name; // Default to name for non-windings (e.g., 'Iron Core', 'Bobbin', 'Clamp')
            
            // If it's a winding, dynamically find its material
            if (type === 'winding') {
                const sourceId = el.getAttribute('data-cost-material-source');
                if (sourceId) {
                    const sourceEl = document.getElementById(sourceId);
                    if (sourceEl) {
                        material = sourceEl.value; // e.g., 'Copper' or 'Aluminium'
                    }
                }
            }

            // Ensure material exists in our tracking
            if (!totalsByMaterial[material]) {
                totalsByMaterial[material] = { weight: 0, cost: 0 };
            }

            const pricePerKg = getPriceForMaterial(material);
            const subtotal = weight * pricePerKg;

            breakdown.push({
                name: name,
                material: material,
                weight: weight,
                pricePerKg: pricePerKg,
                subtotal: subtotal
            });

            totalsByMaterial[material].weight += weight;
            totalsByMaterial[material].cost += subtotal;
            grandTotal += subtotal;
        });

        renderCostUI(breakdown, totalsByMaterial, grandTotal);
    }

    function renderCostUI(breakdown, totalsByMaterial, grandTotal) {
        const renderTableBody = (containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = '';
            if (breakdown.length === 0) {
                container.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#777;">No data available</td></tr>';
                return;
            }

            breakdown.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.material}</td>
                    <td>${item.weight.toFixed(3)}</td>
                    <td>${item.pricePerKg > 0 ? formatCurrency(item.pricePerKg) : '-'}</td>
                    <td>${item.subtotal > 0 ? formatCurrency(item.subtotal) : '-'}</td>
                `;
                container.appendChild(tr);
            });
        };

        const renderTotals = (containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = '';
            
            // Only show totals for materials that have > 0 weight
            Object.keys(totalsByMaterial).forEach(material => {
                const data = totalsByMaterial[material];
                if (data.weight > 0) {
                    const div = document.createElement('div');
                    div.className = 'cost-total-item';
                    div.innerHTML = `
                        <div class="cost-total-label">Total ${material}</div>
                        <div class="cost-total-values">
                            <span>${data.weight.toFixed(3)} kg</span>
                            <strong>${formatCurrency(data.cost)}</strong>
                        </div>
                    `;
                    container.appendChild(div);
                }
            });
        };

        // Update Live View
        renderTableBody('liveCostBody');
        renderTotals('liveCostTotals');
        const liveGt = document.getElementById('liveGrandTotal');
        if (liveGt) liveGt.innerHTML = `Grand Total: <span>${formatCurrency(grandTotal)}</span>`;

        // Update Summary View
        renderTableBody('summaryCostBody');
        renderTotals('summaryCostTotals');
        const summaryGt = document.getElementById('summaryGrandTotal');
        if (summaryGt) summaryGt.innerHTML = `Grand Total: <span>${formatCurrency(grandTotal)}</span>`;
    }

    // Initialize
    window.addEventListener('DOMContentLoaded', () => {
        loadPrices();
        calculateCosts();

        // Listen to any input changes on the page to trigger recalculation
        document.body.addEventListener('input', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('price-input')) {
                savePrices();
            }
            // Delay slightly to ensure engineering calculations have finished
            setTimeout(calculateCosts, 50);
        });
    });

    // Also export calculateCosts if needed externally
    window.CostEstimation = {
        calculate: calculateCosts
    };

})();
