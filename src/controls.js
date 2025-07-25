import { updateControlVisibility } from './dom-utils.js';

// Setup all form controls and event listeners
export function setupControls() {
    setupSliderWithNumberInput('initialPortfolio', 'initialPortfolioValue');
    setupSliderWithNumberInput('withdrawalRate', 'withdrawalRateValue');
    setupSliderWithNumberInput('retirementDuration', 'retirementDurationValue');
    setupSliderWithNumberInput('elasticityFactor', 'elasticityFactorValue');
    setupSliderWithNumberInput('movingAverageYears', 'movingAverageYearsValue');
    setupSliderWithNumberInput('workShieldTrigger', 'workShieldTriggerValue');

    // Create enhanced strategy cards
    createStrategyCards();
    
    // Setup failure criteria cards
    setupFailureCriteriaCards();

    // Strategy selector
    const strategyOptions = document.getElementById('strategy-options');
    strategyOptions.addEventListener('change', (e) => {
        if (e.target.name === 'strategy') {
            updateControlVisibility(e.target.value);
            updateStrategyCardSelection(e.target.value);
        }
    });
}

// Create enhanced strategy cards with collapsible descriptions
function createStrategyCards() {
    const strategyOptions = document.getElementById('strategy-options');
    const strategies = [
        {
            id: 'work_shield',
            name: 'Work Shield Hybrid 💪',
            description: 'Combines the Elastic Band strategy with a safety rule. If the market drops by more than the \'Trigger %\', all withdrawals are paused and a simulated work income is added until the portfolio\'s real value recovers to its previous peak.',
            badge: 'Recommended',
            badgeColor: 'bg-green-100 text-green-800'
        },
        {
            id: 'elastic_band',
            name: 'Elastic Band 👑',
            description: 'A flexible strategy. Your withdrawal is always trying to return to the \'Target %\' of your current portfolio, but it\'s not allowed to change by more than the \'Max Annual Change %\' in a single year. Provides a very smooth income.',
            badge: 'Popular',
            badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
            id: 'moving_average',
            name: 'Moving Average 🌊',
            description: 'Calculates your withdrawal based on the average portfolio value over the last \'X\' years (set by the slider). This creates an extremely stable income stream that is less reactive to short-term market swings.',
            badge: 'Stable',
            badgeColor: 'bg-purple-100 text-purple-800'
        },
        {
            id: 'variable_percentage',
            name: 'Market-Aware 3-4-5%',
            description: 'A simple, proactive rule. Withdraws 3% after a negative market year, 4% after a modest year (0-10% return), and 5% after a great year (>10% return). Directly ties spending to recent market performance.',
            badge: 'Simple',
            badgeColor: 'bg-yellow-100 text-yellow-800'
        },
        {
            id: 'guyton_klinger',
            name: 'Guyton-Klinger',
            description: 'An academic strategy with guardrails. Your spending gets an inflation adjustment each year, a 10% cut if your withdrawal rate gets too high, and a 10% bonus raise if the rate gets very low.',
            badge: 'Academic',
            badgeColor: 'bg-indigo-100 text-indigo-800'
        },
        {
            id: '4_percent_rule',
            name: 'Classic 4% Rule',
            description: 'The original. You withdraw your initial amount in Year 1, and then adjust that same amount for inflation every year after, regardless of market performance. Very predictable income.',
            badge: 'Classic',
            badgeColor: 'bg-gray-100 text-gray-800'
        },
        {
            id: 'fixed_percentage',
            name: 'Fixed Percentage',
            description: 'The simplest rule. You withdraw a fixed percentage of your current portfolio value each year. Your income is directly tied to market performance, leading to high volatility.',
            badge: 'Basic',
            badgeColor: 'bg-red-100 text-red-800'
        }
    ];

    strategies.forEach((strategy, index) => {
        const isChecked = strategy.id === 'work_shield';
        const card = document.createElement('div');
        card.className = `strategy-card ${isChecked ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="strategy-header">
                <div class="strategy-main">
                    <input id="strategy-${strategy.id}" name="strategy" type="radio" value="${strategy.id}" ${isChecked ? 'checked' : ''} 
                           class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 flex-shrink-0 mt-1">
                    <div class="strategy-content">
                        <div class="strategy-title-row">
                            <label for="strategy-${strategy.id}" class="strategy-name">
                                ${strategy.name}
                            </label>
                            <span class="strategy-badge px-2 py-1 text-xs font-medium rounded-full ${strategy.badgeColor}">
                                ${strategy.badge}
                            </span>
                        </div>
                    </div>
                </div>
                <button type="button" class="strategy-toggle" data-strategy="${strategy.id}">
                    <svg viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                    </svg>
                </button>
            </div>
            <div class="strategy-description">
                <p class="text-sm text-gray-600 leading-relaxed">${strategy.description}</p>
            </div>
        `;

        // Add click handler for the toggle button
        const toggleBtn = card.querySelector('.strategy-toggle');
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('expanded');
        });

        // Add click handler for the entire card (except toggle) to select radio
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.strategy-toggle')) {
                const radio = card.querySelector('input[type="radio"]');
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        strategyOptions.appendChild(card);
    });
}

// Update strategy card selection styling
function updateStrategyCardSelection(selectedStrategy) {
    const cards = document.querySelectorAll('.strategy-card');
    cards.forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        if (radio.value === selectedStrategy) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// Setup failure criteria cards with collapsible behavior
function setupFailureCriteriaCards() {
    const failureCriteriaCards = document.querySelectorAll('[name="failureCriteria"]').forEach(radio => {
        const card = radio.closest('.strategy-card');
        const toggleBtn = card.querySelector('.strategy-toggle');
        
        // Add click handler for the toggle button
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('expanded');
        });

        // Add click handler for the entire card (except toggle) to select radio
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.strategy-toggle')) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                updateFailureCriteriaSelection(radio.value);
            }
        });
        
        // Add change listener to update selection styling
        radio.addEventListener('change', () => {
            if (radio.checked) {
                updateFailureCriteriaSelection(radio.value);
            }
        });
    });
}

// Update failure criteria card selection styling
function updateFailureCriteriaSelection(selectedCriteria) {
    const cards = document.querySelectorAll('[name="failureCriteria"]').forEach(radio => {
        const card = radio.closest('.strategy-card');
        if (radio.value === selectedCriteria) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
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
