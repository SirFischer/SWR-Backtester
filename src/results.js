import { domElements, getSimulationParams } from './dom-utils.js';

// Display aggregate results from all simulations with enhanced styling
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

    // Calculate additional metrics
    const avgFinalReal = finalRealValues.length > 0 ? d3.mean(finalRealValues) : 0;
    const successRateColor = successRate >= 95 ? 'text-green-600' : successRate >= 85 ? 'text-yellow-600' : 'text-red-600';
    const successRateGradient = successRate >= 95 ? 'from-green-500 to-emerald-600' : successRate >= 85 ? 'from-yellow-500 to-orange-600' : 'from-red-500 to-red-600';

    domElements.resultsSummary.classList.remove('hidden');
    domElements.resultsSummary.innerHTML = `
        <div class="mb-6">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Stress Test Results
            </h2>
            <p class="text-gray-600">Results shown in today's purchasing power (inflation-adjusted)</p>
        </div>
        
        <!-- Success Rate Hero Metric -->
        <div class="text-center mb-8 p-6 rounded-2xl bg-gradient-to-r ${successRateGradient} text-white">
            <div class="text-6xl font-bold mb-2">${successRate.toFixed(1)}%</div>
            <div class="text-xl font-medium opacity-90">Historical Success Rate</div>
            <div class="text-sm opacity-75 mt-2">${successfulRuns.length} successful out of ${results.length} historical periods</div>
        </div>

        <!-- Detailed Metrics Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="metric-card text-center">
                <div class="text-2xl font-bold text-indigo-600">${successfulRuns.length}</div>
                <div class="text-xs text-gray-500 mt-1">Successful Periods</div>
            </div>
            <div class="metric-card text-center">
                <div class="text-2xl font-bold text-red-600">${failedRuns.length}</div>
                <div class="text-xs text-gray-500 mt-1">Failed Periods</div>
            </div>
            <div class="metric-card text-center">
                <div class="text-2xl font-bold text-purple-600">$${(medianFinalReal / 1000000).toFixed(1)}M</div>
                <div class="text-xs text-gray-500 mt-1">Median Final Value</div>
            </div>
            <div class="metric-card text-center">
                <div class="text-2xl font-bold text-green-600">$${(maxFinalReal / 1000000).toFixed(1)}M</div>
                <div class="text-xs text-gray-500 mt-1">Best Case Final</div>
            </div>
            <div class="metric-card text-center">
                <div class="text-2xl font-bold text-orange-600">$${(avgFinalReal / 1000000).toFixed(1)}M</div>
                <div class="text-xs text-gray-500 mt-1">Average Final Value</div>
            </div>
            <div class="metric-card text-center">
                <div class="text-2xl font-bold text-red-500">$${(worstCaseDrawdown / 1000000).toFixed(1)}M</div>
                <div class="text-xs text-gray-500 mt-1">Worst Drawdown</div>
            </div>
        </div>

        <!-- Performance Insights -->
        ${generatePerformanceInsights(successRate, results.length, worstCaseDrawdown, maxFinalReal)}
    `;
    
    if (failedRuns.length > 0) {
        domElements.failureAnalysisDiv.classList.remove('hidden');
        domElements.failureYearsDiv.textContent = failedRuns.map(r => r.startYear).join(', ');
        
        // Update failure description based on current criteria
        const params = getSimulationParams();
        const failureDescription = document.getElementById('failure-description');
        if (params.failureCriteria === 'avoid_bankruptcy') {
            failureDescription.textContent = 'A period fails if the portfolio runs out of money (reaches zero).';
        } else {
            failureDescription.textContent = 'A period fails if the portfolio runs out of money OR its inflation-adjusted value at the end of the period is less than the starting value.';
        }
    } else {
        domElements.failureAnalysisDiv.classList.add('hidden');
    }

    drawPortfolioChart(results);
}

// Generate performance insights based on results
function generatePerformanceInsights(successRate, totalPeriods, worstDrawdown, bestCase) {
    let insights = [];
    
    if (successRate >= 95) {
        insights.push({
            type: 'success',
            icon: '🎉',
            text: 'Excellent strategy! This approach would have worked in nearly all historical market conditions.'
        });
    } else if (successRate >= 85) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            text: 'Good strategy, but consider stress-testing with lower withdrawal rates for added safety.'
        });
    } else {
        insights.push({
            type: 'danger',
            icon: '🚨',
            text: 'High failure rate detected. Consider reducing withdrawal rate or choosing a more conservative strategy.'
        });
    }

    if (bestCase / worstDrawdown > 10) {
        insights.push({
            type: 'info',
            icon: '📊',
            text: 'Wide range of outcomes - market timing significantly impacts results with this strategy.'
        });
    }

    return `
        <div class="mt-6 space-y-3">
            <h4 class="font-semibold text-gray-900 mb-3">💡 Key Insights</h4>
            ${insights.map(insight => `
                <div class="flex items-start space-x-3 p-4 rounded-lg ${getInsightColor(insight.type)}">
                    <span class="text-lg">${insight.icon}</span>
                    <p class="text-sm leading-relaxed">${insight.text}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function getInsightColor(type) {
    switch (type) {
        case 'success': return 'bg-green-50 border border-green-200';
        case 'warning': return 'bg-yellow-50 border border-yellow-200';
        case 'danger': return 'bg-red-50 border border-red-200';
        case 'info': return 'bg-blue-50 border border-blue-200';
        default: return 'bg-gray-50 border border-gray-200';
    }
}

// Draw the portfolio trajectories chart using D3 with enhanced styling
export function drawPortfolioChart(results) {
    d3.select("#portfolio-chart").selectAll("*").remove();

    const margin = { top: 30, right: 40, bottom: 60, left: 100 };
    const chartDiv = document.getElementById('portfolio-chart');
    const width = chartDiv.clientWidth - margin.left - margin.right;
    const height = chartDiv.clientHeight - margin.top - margin.bottom;

    const svg = d3.select("#portfolio-chart").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${chartDiv.clientWidth} ${chartDiv.clientHeight}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add gradient definitions
    const defs = svg.append("defs");
    
    // Success gradient
    const successGradient = defs.append("linearGradient")
        .attr("id", "successGradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", height)
        .attr("x2", 0).attr("y2", 0);
    successGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.1);
    successGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1d4ed8").attr("stop-opacity", 0.3);

    // Failure gradient
    const failureGradient = defs.append("linearGradient")
        .attr("id", "failureGradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", height)
        .attr("x2", 0).attr("y2", 0);
    failureGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444").attr("stop-opacity", 0.2);
    failureGradient.append("stop").attr("offset", "100%").attr("stop-color", "#dc2626").attr("stop-opacity", 0.4);

    const x = d3.scaleLinear()
        .domain([0, parseInt(document.getElementById('retirementDuration').value)])
        .range([0, width]);

    const yMax = d3.max(results.flatMap(r => r.history), d => d.portfolio);
    const y = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);

    // Enhanced axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickFormat(d => `Year ${d}`)
            .tickSize(-height)
            .tickPadding(10))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "2,2"))
        .call(g => g.selectAll(".tick text")
            .attr("fill", "#6b7280")
            .style("font-size", "12px"));

    svg.append("g")
        .call(d3.axisLeft(y)
            .tickFormat(d => `$${(d / 1000000).toFixed(1)}M`)
            .tickSize(-width)
            .tickPadding(10))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "2,2"))
        .call(g => g.selectAll(".tick text")
            .attr("fill", "#6b7280")
            .style("font-size", "12px"));

    // Add axis labels
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", "#4b5563")
        .text("Portfolio Value (Today's $)");

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", "#4b5563")
        .text("Years into Retirement");

    const line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d.portfolio))
        .curve(d3.curveMonotoneX);

    // Draw successful runs with gradient
    const successfulRuns = results.filter(r => r.success);
    const failedRuns = results.filter(r => !r.success);

    // Add area fill for successful runs
    const area = d3.area()
        .x((d, i) => x(i))
        .y0(height)
        .y1(d => y(d.portfolio))
        .curve(d3.curveMonotoneX);

    // Draw successful runs
    successfulRuns.forEach((run, index) => {
        if (index === 0) {
            // Fill area for first successful run as example
            svg.append("path")
                .datum(run.history)
                .attr("fill", "url(#successGradient)")
                .attr("d", area)
                .style("opacity", 0.3);
        }
        
        svg.append("path")
            .datum(run.history)
            .attr("fill", "none")
            .attr("stroke", "#3b82f6")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.6)
            .attr("d", line)
            .style("filter", "drop-shadow(0 1px 2px rgba(59, 130, 246, 0.1))");
    });
    
    // Draw failed runs with enhanced styling
    failedRuns.forEach((run, index) => {
        if (index === 0 && failedRuns.length > 0) {
            // Fill area for first failed run as warning
            svg.append("path")
                .datum(run.history)
                .attr("fill", "url(#failureGradient)")
                .attr("d", area)
                .style("opacity", 0.2);
        }
        
        svg.append("path")
            .datum(run.history)
            .attr("fill", "none")
            .attr("stroke", "#ef4444")
            .attr("stroke-width", 2.5)
            .attr("stroke-opacity", 0.8)
            .attr("d", line)
            .style("filter", "drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2))");
    });

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 200}, 20)`);

    legend.append("rect")
        .attr("width", 180)
        .attr("height", 60)
        .attr("fill", "rgba(255, 255, 255, 0.9)")
        .attr("stroke", "#e5e7eb")
        .attr("rx", 8);

    legend.append("line")
        .attr("x1", 10)
        .attr("x2", 30)
        .attr("y1", 20)
        .attr("y2", 20)
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2);

    legend.append("text")
        .attr("x", 35)
        .attr("y", 24)
        .style("font-size", "12px")
        .style("fill", "#374151")
        .text(`Successful (${successfulRuns.length})`);

    legend.append("line")
        .attr("x1", 10)
        .attr("x2", 30)
        .attr("y1", 40)
        .attr("y2", 40)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2);

    legend.append("text")
        .attr("x", 35)
        .attr("y", 44)
        .style("font-size", "12px")
        .style("fill", "#374151")
        .text(`Failed (${failedRuns.length})`);
}
