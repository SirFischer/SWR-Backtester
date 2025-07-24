import { updateControlVisibility } from './dom-utils.js';

// Setup all form controls and event listeners
export function setupControls() {
    setupSliderWithNumberInput('initialPortfolio', 'initialPortfolioValue');
    setupSliderWithNumberInput('withdrawalRate', 'withdrawalRateValue');
    setupSliderWithNumberInput('retirementDuration', 'retirementDurationValue');
    setupSliderWithNumberInput('elasticityFactor', 'elasticityFactorValue');
    setupSliderWithNumberInput('movingAverageYears', 'movingAverageYearsValue');
    setupSliderWithNumberInput('workShieldTrigger', 'workShieldTriggerValue');

    // Strategy selector
    const strategyOptions = document.getElementById('strategy-options');
    strategyOptions.addEventListener('change', () => {
        const selectedStrategy = document.querySelector('input[name="strategy"]:checked').value;
        updateControlVisibility(selectedStrategy);
    });
}

// Helper function to setup slider with bidirectional number input synchronization
function setupSliderWithNumberInput(sliderId, inputId) {
    const slider = document.getElementById(sliderId);
    const numberInput = document.getElementById(inputId);
    
    // Sync number input when slider changes
    slider.addEventListener('input', () => {
        numberInput.value = slider.value;
    });
    
    // Sync slider when number input changes (but allow temporary invalid states)
    numberInput.addEventListener('input', () => {
        const value = parseFloat(numberInput.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        
        // Only update slider if we have a valid number within range
        if (!isNaN(value) && value >= min && value <= max) {
            slider.value = value;
        }
        // Allow empty field or partial input during typing
    });
    
    // Handle blur and Enter key to ensure valid values
    const validateAndCorrect = () => {
        const value = parseFloat(numberInput.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        
        if (isNaN(value) || numberInput.value.trim() === '') {
            // If empty or invalid, reset to slider value
            numberInput.value = slider.value;
        } else if (value < min) {
            // If below minimum, set to minimum
            numberInput.value = min;
            slider.value = min;
        } else if (value > max) {
            // If above maximum, set to maximum
            numberInput.value = max;
            slider.value = max;
        } else {
            // Valid value, ensure slider is synced
            slider.value = value;
        }
    };
    
    numberInput.addEventListener('blur', validateAndCorrect);
    numberInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            validateAndCorrect();
            numberInput.blur(); // Remove focus after Enter
        }
    });
}
