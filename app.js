document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Landing Cost Form Inputs
    const priceYuanInput = document.getElementById('priceYuan');
    const conversionRateInput = document.getElementById('conversionRate');
    const lalamoveYuanInput = document.getElementById('lalamoveYuan');
    const gstPercentInput = document.getElementById('gstPercent');
    const cbmValueInput = document.getElementById('cbmValue');
    const ratePerCbmInput = document.getElementById('ratePerCbm');
    const weightKgInput = document.getElementById('weightKg');
    const shippingPerKgInput = document.getElementById('shippingPerKg');
    const marginValInput = document.getElementById('marginVal');

    // Toggles
    const cbmCurrencyToggle = document.getElementById('cbmCurrencyToggle');
    const cbmRatePrefix = document.getElementById('cbmRatePrefix');
    const marginTypeToggle = document.getElementById('marginTypeToggle');
    const marginSuffix = document.getElementById('marginSuffix');
    const themeToggle = document.getElementById('themeToggle');

    // Results Display
    const resProductCost = document.getElementById('resProductCost');
    const resProductCostYuan = document.getElementById('resProductCostYuan');
    const resLalamoveCost = document.getElementById('resLalamoveCost');
    const resLalamoveCostSub = document.getElementById('resLalamoveCostSub');
    const resGstCost = document.getElementById('resGstCost');
    const resGstCostSub = document.getElementById('resGstCostSub');
    const resFreightCost = document.getElementById('resFreightCost');
    const resFreightCostSub = document.getElementById('resFreightCostSub');
    const resDomesticCost = document.getElementById('resDomesticCost');
    const resDomesticCostSub = document.getElementById('resDomesticCostSub');
    const resLandingCost = document.getElementById('resLandingCost');
    const resMarginAmt = document.getElementById('resMarginAmt');
    const resGrandTotal = document.getElementById('resGrandTotal');

    // Reset Buttons
    const resetCalcBtn = document.getElementById('resetCalcBtn');

    // Sizing Converter Inputs
    const sizingInputs = {
        mm: document.getElementById('sizeMm'),
        cm: document.getElementById('sizeCm'),
        m: document.getElementById('sizeM'),
        inch: document.getElementById('sizeInch'),
        foot: document.getElementById('sizeFoot')
    };
    const resetSizingBtn = document.getElementById('resetSizingBtn');

    // --- State Variables ---
    let cbmFreightCurrency = 'CNY'; // 'CNY' or 'INR'
    let marginType = 'percent'; // 'percent' or 'fixed'

    // --- Local Storage Initialization ---
    function loadSavedSettings() {
        // Theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.replace('dark-theme', 'light-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }

        // Calculator default overrides
        if (localStorage.getItem('conversionRate')) {
            conversionRateInput.value = localStorage.getItem('conversionRate');
        }
        if (localStorage.getItem('lalamoveYuan')) {
            lalamoveYuanInput.value = localStorage.getItem('lalamoveYuan');
        }
        if (localStorage.getItem('gstPercent')) {
            gstPercentInput.value = localStorage.getItem('gstPercent');
        }
        if (localStorage.getItem('ratePerCbm')) {
            ratePerCbmInput.value = localStorage.getItem('ratePerCbm');
        }
        if (localStorage.getItem('shippingPerKg')) {
            shippingPerKgInput.value = localStorage.getItem('shippingPerKg');
        }
        if (localStorage.getItem('cbmFreightCurrency')) {
            cbmFreightCurrency = localStorage.getItem('cbmFreightCurrency');
            cbmCurrencyToggle.querySelectorAll('.toggle-option').forEach(el => {
                if (el.getAttribute('data-val') === cbmFreightCurrency) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
            cbmRatePrefix.textContent = cbmFreightCurrency === 'CNY' ? '¥' : '₹';
        }
        if (localStorage.getItem('marginType')) {
            marginType = localStorage.getItem('marginType');
            marginTypeToggle.querySelectorAll('.toggle-option').forEach(el => {
                if (el.getAttribute('data-val') === marginType) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
            marginSuffix.textContent = marginType === 'percent' ? '%' : '₹';
        }
    }

    // Save current settings to localStorage
    function saveSettings() {
        localStorage.setItem('conversionRate', conversionRateInput.value);
        localStorage.setItem('lalamoveYuan', lalamoveYuanInput.value);
        localStorage.setItem('gstPercent', gstPercentInput.value);
        localStorage.setItem('ratePerCbm', ratePerCbmInput.value);
        localStorage.setItem('shippingPerKg', shippingPerKgInput.value);
        localStorage.setItem('cbmFreightCurrency', cbmFreightCurrency);
        localStorage.setItem('marginType', marginType);
    }

    // --- Calculation Functions ---

    // Format currency to INR format
    function formatINR(val) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(val);
    }

    // Format currency to Yuan format
    function formatCNY(val) {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            maximumFractionDigits: 2
        }).format(val);
    }

    // Main Calculator Logic
    function calculateCosts() {
        const priceYuan = parseFloat(priceYuanInput.value) || 0;
        const conversionRate = parseFloat(conversionRateInput.value) || 14.5;
        const lalamoveYuan = parseFloat(lalamoveYuanInput.value) || 0;
        const gstPercent = parseFloat(gstPercentInput.value) || 0;
        const cbmValue = parseFloat(cbmValueInput.value) || 0;
        const ratePerCbm = parseFloat(ratePerCbmInput.value) || 0;
        const weightKg = parseFloat(weightKgInput.value) || 0;
        const shippingPerKg = parseFloat(shippingPerKgInput.value) || 0;
        const marginVal = parseFloat(marginValInput.value) || 0;

        // 1. Product Cost
        const productCostINR = priceYuan * conversionRate;

        // 2. Local China Shipping (Lalamove) Cost
        const lalamoveCostINR = lalamoveYuan * conversionRate;

        // 3. GST Import Tax (5% default of product cost in India)
        const gstCostINR = productCostINR * (gstPercent / 100);

        // 4. Freight Cost
        let freightCostINR = 0;
        if (cbmFreightCurrency === 'CNY') {
            freightCostINR = cbmValue * ratePerCbm * conversionRate;
        } else {
            freightCostINR = cbmValue * ratePerCbm;
        }

        // 5. Domestic Delivery Cost
        const domesticCostINR = weightKg > 0 ? (weightKg * shippingPerKg) : 0;

        // 6. Base Landing Cost
        const landingCostINR = productCostINR + lalamoveCostINR + gstCostINR + freightCostINR + domesticCostINR;

        // 7. Margin / Profit Cost
        let marginAmountINR = 0;
        if (marginType === 'percent') {
            marginAmountINR = landingCostINR * (marginVal / 100);
        } else {
            marginAmountINR = marginVal;
        }

        // 8. Grand Total
        const grandTotalINR = landingCostINR + marginAmountINR;

        // Update UI
        resProductCost.textContent = formatINR(productCostINR);
        resProductCostYuan.textContent = formatCNY(priceYuan);

        resLalamoveCost.textContent = formatINR(lalamoveCostINR);
        resLalamoveCostSub.textContent = formatCNY(lalamoveYuan);
        
        resGstCost.textContent = formatINR(gstCostINR);
        resGstCostSub.textContent = `${gstPercent.toFixed(2)}% of Product`;

        resFreightCost.textContent = formatINR(freightCostINR);
        resFreightCostSub.textContent = `${cbmValue.toFixed(4)} CBM @ ${cbmFreightCurrency === 'CNY' ? '¥' : '₹'}${ratePerCbm}`;

        resDomesticCost.textContent = formatINR(domesticCostINR);
        resDomesticCostSub.textContent = weightKg > 0 ? `${weightKg.toFixed(2)} kg @ ₹${shippingPerKg}/kg` : 'No weight entered';

        resLandingCost.textContent = formatINR(landingCostINR);
        resMarginAmt.textContent = formatINR(marginAmountINR);
        resGrandTotal.textContent = formatINR(grandTotalINR);

        // Auto Save to localStorage
        saveSettings();
    }

    // Sizing Converter Logic
    function convertLength(value, sourceUnit) {
        if (isNaN(value) || value === null || value === '') {
            for (let unit in sizingInputs) {
                if (unit !== sourceUnit) sizingInputs[unit].value = '';
            }
            return;
        }

        // Convert the input value to Millimeters
        let mm = 0;
        switch(sourceUnit) {
            case 'mm': mm = value; break;
            case 'cm': mm = value * 10; break;
            case 'm':  mm = value * 1000; break;
            case 'inch': mm = value * 25.4; break;
            case 'foot': mm = value * 304.8; break;
        }

        // Convert mm to other units and set input values
        for (let unit in sizingInputs) {
            if (unit !== sourceUnit) {
                let convertedVal = 0;
                switch(unit) {
                    case 'mm': convertedVal = mm; break;
                    case 'cm': convertedVal = mm / 10; break;
                    case 'm':  convertedVal = mm / 1000; break;
                    case 'inch': convertedVal = mm / 25.4; break;
                    case 'foot': convertedVal = mm / 304.8; break;
                }
                
                // Format to maximum 5 decimal places and trim trailing zeros
                sizingInputs[unit].value = parseFloat(convertedVal.toFixed(5));
            }
        }
    }

    // --- Event Listeners ---

    // Calculator inputs listeners
    const calcInputs = [priceYuanInput, conversionRateInput, lalamoveYuanInput, gstPercentInput, cbmValueInput, ratePerCbmInput, weightKgInput, shippingPerKgInput, marginValInput];
    calcInputs.forEach(input => {
        input.addEventListener('input', calculateCosts);
    });

    // CBM Currency Toggle Click
    cbmCurrencyToggle.addEventListener('click', (e) => {
        const option = e.target.closest('.toggle-option');
        if (!option) return;

        cbmCurrencyToggle.querySelectorAll('.toggle-option').forEach(el => el.classList.remove('active'));
        option.classList.add('active');

        cbmFreightCurrency = option.getAttribute('data-val');
        cbmRatePrefix.textContent = cbmFreightCurrency === 'CNY' ? '¥' : '₹';
        
        calculateCosts();
    });

    // Margin Type Toggle Click
    marginTypeToggle.addEventListener('click', (e) => {
        const option = e.target.closest('.toggle-option');
        if (!option) return;

        marginTypeToggle.querySelectorAll('.toggle-option').forEach(el => el.classList.remove('active'));
        option.classList.add('active');

        marginType = option.getAttribute('data-val');
        marginSuffix.textContent = marginType === 'percent' ? '%' : '₹';
        
        calculateCosts();
    });

    // Sizing Converter Input Listeners
    for (let unit in sizingInputs) {
        sizingInputs[unit].addEventListener('input', (e) => {
            convertLength(parseFloat(e.target.value), unit);
        });
    }

    // Theme Toggle Click
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        if (isDark) {
            document.body.classList.replace('dark-theme', 'light-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });

    // Reset Buttons
    resetCalcBtn.addEventListener('click', (e) => {
        e.preventDefault();
        priceYuanInput.value = 100;
        conversionRateInput.value = 14.5;
        lalamoveYuanInput.value = 0;
        gstPercentInput.value = 5;
        cbmValueInput.value = 0.1;
        ratePerCbmInput.value = 1200;
        weightKgInput.value = '';
        shippingPerKgInput.value = 50;
        marginValInput.value = 30;
        
        // Reset currencies
        cbmFreightCurrency = 'CNY';
        cbmCurrencyToggle.querySelectorAll('.toggle-option').forEach(el => {
            if (el.getAttribute('data-val') === 'CNY') el.classList.add('active');
            else el.classList.remove('active');
        });
        cbmRatePrefix.textContent = '¥';

        marginType = 'percent';
        marginTypeToggle.querySelectorAll('.toggle-option').forEach(el => {
            if (el.getAttribute('data-val') === 'percent') el.classList.add('active');
            else el.classList.remove('active');
        });
        marginSuffix.textContent = '%';

        calculateCosts();
    });

    resetSizingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        for (let unit in sizingInputs) {
            sizingInputs[unit].value = '';
        }
    });

    // --- Onload Actions ---
    loadSavedSettings();
    calculateCosts();
});
