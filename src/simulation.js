import { HISTORICAL_DATA } from './data.js';

// Run a single simulation for a given start year and parameters
export function runSingleSimulation(params, startYear) {
    let portfolio = params.initialPortfolio;
    let lastWithdrawal = portfolio * params.initialWithdrawalRate;
    const history = [{ year: startYear - 1, portfolio: portfolio }];
    let cumulativeInflation = 1;
    const portfolioHistoryForMA = [params.initialPortfolio];
    let isWorkShieldActive = false;
    let peakRealPortfolio = params.initialPortfolio;
    let minRealPortfolio = params.initialPortfolio;
    
    for (let i = 0; i < params.retirementYears; i++) {
        const year = startYear + i;
        const yearData = HISTORICAL_DATA[year];
        if (!yearData) return { history: history, success: false, startYear: startYear, minRealPortfolio: minRealPortfolio };

        // Calculate blended portfolio return based on stock/bond allocation
        const stockAllocation = params.stockAllocation / 100;
        const bondAllocation = 1 - stockAllocation;
        const portfolioReturn = (yearData.market_return * stockAllocation) + (yearData.bond_return * bondAllocation);

        let currentWithdrawal = 0;
        
        // Work Shield Logic is a wrapper around Elastic Band
        if (params.strategy === 'work_shield') {
            const realPortfolio = portfolio / cumulativeInflation;
            if (!isWorkShieldActive && portfolioReturn < -params.workShieldTrigger / 100) {
                isWorkShieldActive = true;
            }
            if (isWorkShieldActive && realPortfolio >= peakRealPortfolio) {
                isWorkShieldActive = false;
            }

            if (isWorkShieldActive) {
                currentWithdrawal = 0;
                portfolio += lastWithdrawal; // Simulate work income covering expenses
            } else {
                // Default to Elastic Band when not in shield mode
                const targetWithdrawal = portfolio * params.initialWithdrawalRate;
                const upperBound = lastWithdrawal * (1 + params.elasticityFactor / 100);
                const lowerBound = lastWithdrawal * (1 - params.elasticityFactor / 100);
                currentWithdrawal = Math.max(lowerBound, Math.min(targetWithdrawal, upperBound));
            }
        } else {
            // Other strategies
            currentWithdrawal = calculateWithdrawal(params, portfolio, lastWithdrawal, year, yearData, portfolioHistoryForMA);
        }
        
        portfolio -= currentWithdrawal;
        
        if (portfolio <= 0) {
            portfolio = 0;
            history.push({ year, portfolio });
            return { history: history, success: false, startYear: startYear, minRealPortfolio: 0 };
        }

        portfolio *= (1 + portfolioReturn);
        lastWithdrawal = currentWithdrawal;
        
        history.push({ year, portfolio });
        portfolioHistoryForMA.push(portfolio);
        cumulativeInflation *= (1 + yearData.inflation);

        const currentRealPortfolio = portfolio / cumulativeInflation;
        if(currentRealPortfolio < minRealPortfolio) minRealPortfolio = currentRealPortfolio;
        if (currentRealPortfolio > peakRealPortfolio) peakRealPortfolio = currentRealPortfolio;
    }

    const finalPortfolio = history[history.length - 1].portfolio;
    const finalRealValue = finalPortfolio / cumulativeInflation;
    
    // Determine success based on failure criteria
    let success;
    if (params.failureCriteria === 'avoid_bankruptcy') {
        success = finalPortfolio > 0;
    } else {
        // Default: preserve_real_value
        success = finalPortfolio > 0 && finalRealValue >= params.initialPortfolio;
    }

    return { history: history, success: success, startYear: startYear, finalRealValue: finalRealValue, minRealPortfolio: minRealPortfolio };
}

// Calculate withdrawal based on strategy
function calculateWithdrawal(params, portfolio, lastWithdrawal, year, yearData, portfolioHistoryForMA) {
    switch (params.strategy) {
        case '4_percent_rule':
            return lastWithdrawal * (1 + yearData.inflation);
            
        case 'fixed_percentage':
            return portfolio * params.initialWithdrawalRate;
            
        case 'guyton_klinger':
            let potentialWithdrawal = lastWithdrawal * (1 + yearData.inflation);
            let currentRate = portfolio > 0 ? potentialWithdrawal / portfolio : Infinity;
            if (currentRate > params.initialWithdrawalRate * 1.2) potentialWithdrawal = lastWithdrawal * 0.9;
            if (currentRate < params.initialWithdrawalRate * 0.8) potentialWithdrawal *= 1.1;
            return potentialWithdrawal;
            
        case 'elastic_band':
            const targetWithdrawal = portfolio * params.initialWithdrawalRate;
            const upperBound = lastWithdrawal * (1 + params.elasticityFactor / 100);
            const lowerBound = lastWithdrawal * (1 - params.elasticityFactor / 100);
            return Math.max(lowerBound, Math.min(targetWithdrawal, upperBound));
            
        case 'variable_percentage':
            const prevYear = year - 1;
            const prevYearData = HISTORICAL_DATA[prevYear];
            let prevYearReturn = 0;
            if (prevYearData) {
                const stockAllocation = params.stockAllocation / 100;
                const bondAllocation = 1 - stockAllocation;
                prevYearReturn = (prevYearData.market_return * stockAllocation) + (prevYearData.bond_return * bondAllocation);
            }
            let rate = 0.04;
            if (prevYearReturn < 0) rate = 0.03;
            if (prevYearReturn > 0.10) rate = 0.05;
            return portfolio * rate;
            
        case 'moving_average':
            const avgPortfolio = portfolioHistoryForMA.slice(-params.movingAverageYears).reduce((a, b) => a + b, 0) / Math.min(portfolioHistoryForMA.length, params.movingAverageYears);
            return avgPortfolio * params.initialWithdrawalRate;
            
        default:
            return portfolio * params.initialWithdrawalRate;
    }
}
