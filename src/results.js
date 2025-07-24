import { domElements } from './dom-utils.js';

// Display aggregate results from all simulations
export function displayAggregateResults(results) {
    const successfulRuns = results.filter(r => r.success);
    const failedRuns = results.filter(r => !r.success);
    const successRate = (successfulRuns.length / results.length) * 100;

    const finalRealValues = successfulRuns.map(r => r.finalRealValue);
    const minFinalReal = finalRealValues.length > 0 ? Math.min(...finalRealValues) : 0;
    const maxFinalReal = finalRealValues.length > 0 ? Math.max(...finalRealValues) : 0;
    const medianFinalReal = finalRealValues.length > 0 ? d3.median(finalRealValues) : 0;
    
    const minRealPortfolios = successfulRuns.map(r => r.minRealPortfolio);
    const worstCaseDrawdown = minRealPortfolios.length > 0 ? Math.min(...minRealPortfolios) : 0;

    domElements.resultsSummary.classList.remove('hidden');
    domElements.resultsSummary.innerHTML = `
        <h2 class="text-2xl font-bold">Stress Test Results (in Today's Money)</h2>
        <div class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
                <p class="text-3xl md:text-4xl font-bold ${successRate >= 90 ? 'text-green-600' : 'text-red-600'}">${successRate.toFixed(1)}%</p>
                <p class="text-sm text-gray-500">Success Rate</p>
            </div>
            <div>
                <p class="text-3xl md:text-4xl font-bold text-gray-800">${successfulRuns.length}</p>
                <p class="text-sm text-gray-500">Successful Periods</p>
            </div>
            <div>
                <p class="text-3xl md:text-4xl font-bold text-red-600">${failedRuns.length}</p>
                <p class="text-sm text-gray-500">Failed Periods</p>
            </div>
            <div>
                 <p class="text-3xl md:text-4xl font-bold text-indigo-600">${(medianFinalReal / 1000000).toFixed(1)}M</p>
                 <p class="text-sm text-gray-500">Median Final Value</p>
            </div>
             <div>
                 <p class="text-3xl md:text-4xl font-bold text-green-500">${(maxFinalReal / 1000000).toFixed(1)}M</p>
                 <p class="text-sm text-gray-500">Highest Final Value</p>
            </div>
            <div>
                 <p class="text-3xl md:text-4xl font-bold text-red-500">${(worstCaseDrawdown / 1000000).toFixed(1)}M</p>
                 <p class="text-sm text-gray-500">Lowest Portfolio Point</p>
            </div>
        </div>
    `;
    
    if (failedRuns.length > 0) {
        domElements.failureAnalysisDiv.classList.remove('hidden');
        domElements.failureYearsDiv.textContent = failedRuns.map(r => r.startYear).join(', ');
    } else {
        domElements.failureAnalysisDiv.classList.add('hidden');
    }

    drawPortfolioChart(results);
}

// Draw the portfolio trajectories chart using D3
export function drawPortfolioChart(results) {
    d3.select("#portfolio-chart").selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const chartDiv = document.getElementById('portfolio-chart');
    const width = chartDiv.clientWidth - margin.left - margin.right;
    const height = chartDiv.clientHeight - margin.top - margin.bottom;

    const svg = d3.select("#portfolio-chart").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${chartDiv.clientWidth} ${chartDiv.clientHeight}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, parseInt(document.getElementById('retirementDuration').value)])
        .range([0, width]);

    const yMax = d3.max(results.flatMap(r => r.history), d => d.portfolio);
    const y = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `Year ${d}`));

    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `${(d / 1000000).toFixed(1)}M`));

    const line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d.portfolio));

    // Draw successful runs in blue
    results.filter(r => r.success).forEach(run => {
        svg.append("path")
            .datum(run.history)
            .attr("fill", "none")
            .attr("stroke", "#4f46e5")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.2)
            .attr("d", line);
    });
    
    // Draw failed runs in red
    results.filter(r => !r.success).forEach(run => {
        svg.append("path")
            .datum(run.history)
            .attr("fill", "none")
            .attr("stroke", "#dc2626")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.8)
            .attr("d", line);
    });
}
