// DOM element references and utilities - accessed lazily to ensure DOM is ready
export const domElements = {
    get controlsDiv() { return document.getElementById('controls'); },
    get loaderOverlay() { return document.getElementById('loader-overlay'); },
    get loaderText() { return document.getElementById('loader-text'); },
    get progressBarInner() { return document.getElementById('progress-bar-inner'); },
    get resultsSummary() { return document.getElementById('results-summary'); },
    get failureAnalysisDiv() { return document.getElementById('failure-analysis'); },
    get failureYearsDiv() { return document.getElementById('failure-years'); },
    get withdrawalRateControl() { return document.getElementById('withdrawal-rate-control'); },
    get elasticityControl() { return document.getElementById('elasticity-control'); },
    get movingAverageControl() { return document.getElementById('moving-average-control'); },
    get workShieldControl() { return document.getElementById('work-shield-control'); },
};

// Show loader overlay
export function showLoader() {
    domElements.loaderOverlay.classList.remove('hidden');
    domElements.loaderOverlay.classList.remove('opacity-0');
    domElements.loaderOverlay.style.zIndex = '9999';
}

// Hide loader overlay
export function hideLoader() {
    domElements.loaderOverlay.classList.add('opacity-0');
    setTimeout(() => {
        domElements.loaderOverlay.classList.add('hidden');
        domElements.loaderOverlay.style.zIndex = '-10';
    }, 300);
}

// Update progress bar
export function updateProgress(progress, text) {
    domElements.progressBarInner.style.width = `${progress}%`;
    domElements.loaderText.textContent = text;
}

// Show/hide controls based on strategy
export function updateControlVisibility(selectedStrategy) {
    domElements.elasticityControl.classList.toggle('hidden', selectedStrategy !== 'elastic_band');
    domElements.movingAverageControl.classList.toggle('hidden', selectedStrategy !== 'moving_average');
    domElements.workShieldControl.classList.toggle('hidden', selectedStrategy !== 'work_shield');
    domElements.withdrawalRateControl.classList.toggle('hidden', selectedStrategy === 'variable_percentage');
}

// Get current simulation parameters from form inputs
export function getSimulationParams() {
    const checkedStrategy = document.querySelector('input[name="strategy"]:checked');
    return {
        initialPortfolio: parseInt(document.getElementById('initialPortfolio').value),
        initialWithdrawalRate: parseFloat(document.getElementById('withdrawalRate').value) / 100,
        retirementYears: parseInt(document.getElementById('retirementDuration').value),
        strategy: checkedStrategy ? checkedStrategy.value : 'work_shield',
        elasticityFactor: parseFloat(document.getElementById('elasticityFactor').value) / 100,
        movingAverageYears: parseInt(document.getElementById('movingAverageYears').value),
        workShieldTrigger: parseFloat(document.getElementById('workShieldTrigger').value) / 100
    };
}
