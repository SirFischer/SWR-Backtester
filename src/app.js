import { setupControls } from './controls.js';
import { runSingleSimulation } from './simulation.js';
import { displayAggregateResults } from './results.js';
import { domElements, showLoader, hideLoader, updateProgress, getSimulationParams } from './dom-utils.js';

// Global state
let isSimulating = false;
let simulationTimeout;

// Main backtesting function
async function backtestAllPeriods() {
    if (isSimulating) return;
    isSimulating = true;
    showLoader();
    
    const params = getSimulationParams();
    
    const allResults = [];
    const lastPossibleStartYear = 2023 - params.retirementYears;
    const startYears = [];
    for (let year = 1950; year <= lastPossibleStartYear; year++) {
        startYears.push(year);
    }

    for (let i = 0; i < startYears.length; i++) {
        const year = startYears[i];
        allResults.push(runSingleSimulation(params, year));
        
        const progress = ((i + 1) / startYears.length) * 100;
        updateProgress(progress, `Testing start year ${year}...`);
        
        // Yield control to prevent UI blocking
        if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    displayAggregateResults(allResults);
    hideLoader();
    isSimulating = false;
}

// Debounced simulation trigger
function triggerSimulation() {
    if (isSimulating) return;
    clearTimeout(simulationTimeout);
    simulationTimeout = setTimeout(backtestAllPeriods, 250);
}

// Initialize the application
function initializeApp() {
    setupControls();
    
    // Add event listeners
    domElements.controlsDiv.addEventListener('input', triggerSimulation);
    domElements.controlsDiv.addEventListener('change', triggerSimulation);

    // Trigger initial strategy change to show/hide controls
    const checkedStrategy = document.querySelector('input[name="strategy"]:checked');
    if (checkedStrategy) {
        checkedStrategy.dispatchEvent(new Event('change', {bubbles:true}));
    }
    
    // Run initial simulation
    triggerSimulation();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
