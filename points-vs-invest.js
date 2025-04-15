/**
 * Mortgage Points vs. Investment Calculator
 * 
 * This script provides the simulation and visualization functionality 
 * for comparing buying mortgage discount points versus investing that money
 * in the stock market.
 */

// Global variables for charts
let netWorthOverTimeChart = null;

// DOM elements
document.addEventListener('DOMContentLoaded', function() {
    console.log("Document loaded, initializing calculator...");
    
    // Get DOM elements
    const runButton = document.getElementById('runSimulation');
    const resultsCard = document.getElementById('resultsCard');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const simulationProgress = document.getElementById('simulationProgress');
    const simulationStatus = document.getElementById('simulationStatus');
    
    // Check if all elements exist
    if (!runButton || !resultsCard || !loadingOverlay || !simulationProgress || !simulationStatus) {
        console.error("One or more required DOM elements not found!");
        return;
    }
    
    // Add event listeners
    runButton.addEventListener('click', startSimulation);
    console.log("Run button event listener added");
    
    // Initialize charts
    try {
        initializeCharts();
        console.log("Charts initialized successfully");
    } catch (error) {
        console.error("Error initializing charts:", error);
    }
});

/**
 * Initialize the chart containers with empty data
 */
function initializeCharts() {
    console.log("Initializing charts...");
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded!");
        return;
    }
    
    // Net Worth Over Time Chart (using breakEvenChart container)
    const netWorthCtx = document.getElementById('breakEvenChart');
    if (!netWorthCtx) {
        console.error("Chart canvas not found!");
        return;
    }
    
    // Hide the other chart containers since we're not using them
    const distributionContainer = document.getElementById('netWorthDistribution');
    const savingsContainer = document.getElementById('savingsChart');
    
    if (distributionContainer && distributionContainer.parentNode) {
        distributionContainer.parentNode.style.display = 'none';
    }
    
    if (savingsContainer && savingsContainer.parentNode) {
        savingsContainer.parentNode.style.display = 'none';
    }
    
    // Create the Net Worth Over Time chart
    netWorthOverTimeChart = new Chart(netWorthCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Year 0', 'Year 1'],
            datasets: [{
                label: 'Placeholder',
                data: [0, 0],
                borderColor: 'rgba(200, 200, 200, 0.5)',
                backgroundColor: 'rgba(200, 200, 200, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Net Worth Over Time: Points Savings vs. Investment Returns',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + formatMoney(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + formatMoney(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Years'
                    }
                }
            }
        }
    });
    
    // Add responsive behavior for mobile
    handleChartResponsiveness();
    window.addEventListener('resize', handleChartResponsiveness);
}

/**
 * Handle chart responsiveness based on screen size
 */
function handleChartResponsiveness() {
    const isMobile = window.innerWidth < 768;
    
    if (netWorthOverTimeChart) {
        // Adjust legend position based on screen size
        netWorthOverTimeChart.options.plugins.legend.position = isMobile ? 'bottom' : 'top';
        
        // Configure legend display on mobile
        if (isMobile) {
            // Set smaller font size and box width for the legend on mobile
            netWorthOverTimeChart.options.plugins.legend.labels = {
                boxWidth: 8,
                font: {
                    size: 10
                }
            };
            
            // Make chart container taller for mobile
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                chartContainer.style.height = '400px';
            }
        }
        
        netWorthOverTimeChart.update();
    }
}

/**
 * Start the simulation and show loading overlay
 */
function startSimulation() {
    console.log("Starting simulation...");
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.visibility = 'visible';
    
    // Reset progress
    const simulationProgress = document.getElementById('simulationProgress');
    simulationProgress.style.width = '0%';
    
    // Update status message
    const simulationStatus = document.getElementById('simulationStatus');
    simulationStatus.textContent = 'Running simulation...';
    
    // Use setTimeout to allow the UI to update before starting the simulation
    setTimeout(runSimulation, 100);
}

/**
 * Run the simulation with the user input parameters
 */
function runSimulation() {
    console.log("Running simulation...");
    
    try {
        // Get user inputs
        const loanAmount = parseFloat(document.getElementById('loanAmount').value);
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const baseRate = parseFloat(document.getElementById('baseRate').value);
        const pointsCost = parseFloat(document.getElementById('pointsCost').value);
        const rateReduction = parseFloat(document.getElementById('rateReduction').value);
        const numPoints = parseFloat(document.getElementById('numPoints').value);
        const plannedOwnership = parseInt(document.getElementById('plannedOwnership').value);
        
        console.log("Input values:", { 
            loanAmount, loanTerm, baseRate, pointsCost, 
            rateReduction, numPoints, plannedOwnership 
        });
        
        // Validate inputs
        if (loanAmount <= 0 || baseRate <= 0) {
            throw new Error("Loan amount and interest rate must be positive");
        }
        
        if (plannedOwnership > loanTerm) {
            throw new Error("Planned ownership period cannot exceed loan term");
        }
        
        // Calculate cost of points
        const pointsTotalCost = loanAmount * (pointsCost / 100) * numPoints;
        
        // Calculate reduced interest rate after applying points
        const reducedRate = baseRate - (rateReduction * numPoints);
        
        if (reducedRate <= 0) {
            throw new Error("Reduced interest rate must be positive");
        }
        
        // Calculate monthly payment for both scenarios
        const baseMonthlyRate = baseRate / 100 / 12;
        const reducedMonthlyRate = reducedRate / 100 / 12;
        const numPayments = loanTerm * 12;
        
        const baseMonthlyPayment = calculateMonthlyPayment(loanAmount, baseMonthlyRate, numPayments);
        const reducedMonthlyPayment = calculateMonthlyPayment(loanAmount, reducedMonthlyRate, numPayments);
        
        // Calculate monthly savings from reduced rate
        const monthlySavings = baseMonthlyPayment - reducedMonthlyPayment;
        
        // Calculate amortization schedules for both scenarios up to the planned ownership period
        const plannedMonths = plannedOwnership * 12;
        const baseSchedule = calculateAmortizationSchedule(loanAmount, baseMonthlyRate, baseMonthlyPayment, plannedMonths);
        const reducedSchedule = calculateAmortizationSchedule(loanAmount, reducedMonthlyRate, reducedMonthlyPayment, plannedMonths);
        
        // Calculate interest savings from points over the planned ownership period
        const baseInterestPaid = baseSchedule.totalInterestPaid;
        const reducedInterestPaid = reducedSchedule.totalInterestPaid;
        const interestSavings = baseInterestPaid - reducedInterestPaid;
        
        console.log("Monthly payments:", { baseMonthlyPayment, reducedMonthlyPayment, monthlySavings });
        console.log("Interest paid:", { baseInterestPaid, reducedInterestPaid, interestSavings });
        
        // Calculate monthly interest savings
        const monthlySavingsData = [];
        let cumulativeSavings = -pointsTotalCost; // Start with negative points cost
        monthlySavingsData.push(cumulativeSavings); // Add initial value (year 0)
        
        for (let month = 1; month <= plannedMonths; month++) {
            const baseInterest = baseSchedule.monthlyInterest[month - 1];
            const reducedInterest = reducedSchedule.monthlyInterest[month - 1];
            const monthlySaving = baseInterest - reducedInterest;
            cumulativeSavings += monthlySaving;
            
            // Only save yearly values (every 12 months)
            if (month % 12 === 0) {
                monthlySavingsData.push(cumulativeSavings);
            }
        }
        
        // Check if historical data is available
        if (typeof getAllPeriods !== 'function') {
            throw new Error("Historical data functions not available. Make sure 'historical-data-stockmarket.js' is loaded correctly.");
        }
        
        // Get all historical return sequences for simulation
        console.log("Getting historical periods for", plannedOwnership, "years");
        const allPeriods = getAllPeriods(plannedOwnership);
        console.log("Found", allPeriods.length, "historical periods");
        
        // Run investment simulations for each historical period
        const investmentResults = [];
        
        // Update status
        const simulationStatus = document.getElementById('simulationStatus');
        simulationStatus.textContent = 'Running historical simulations...';
        
        // Process simulations
        for (let i = 0; i < allPeriods.length; i++) {
            const period = allPeriods[i];
            
            // Simulate investing the points money using actual historical return sequence
            const yearlyValues = simulateInvestmentOverTime(pointsTotalCost, period.returns, plannedOwnership);
            
            // Save results
            investmentResults.push({
                period: `${period.startYear}-${period.endYear}`,
                yearlyValues: yearlyValues,
                finalValue: yearlyValues[yearlyValues.length - 1]
            });
            
            // Update progress
            const progress = ((i + 1) / allPeriods.length) * 100;
            updateProgress(progress);
        }
        
        console.log("Investment simulations complete");
        
        // Process and display results
        finishSimulation(
            loanAmount,
            baseRate,
            reducedRate,
            pointsTotalCost,
            monthlySavings,
            interestSavings,
            monthlySavingsData,
            investmentResults,
            plannedOwnership
        );
        
    } catch (error) {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.visibility = 'hidden';
        
        // Show error message
        console.error("Simulation error:", error);
        alert('Error: ' + error.message);
    }
}

/**
 * Update the progress bar
 */
function updateProgress(progress) {
    const simulationProgress = document.getElementById('simulationProgress');
    if (simulationProgress) {
        simulationProgress.style.width = `${progress}%`;
    }
}

/**
 * Calculate monthly mortgage payment
 */
function calculateMonthlyPayment(principal, monthlyRate, numPayments) {
    if (monthlyRate === 0) {
        return principal / numPayments;
    }
    
    return principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
}

/**
 * Calculate amortization schedule
 */
function calculateAmortizationSchedule(principal, monthlyRate, monthlyPayment, numMonths) {
    let balance = principal;
    let totalInterestPaid = 0;
    const monthlyInterest = [];
    const monthlyBalances = [balance];
    
    for (let month = 1; month <= numMonths; month++) {
        // Calculate interest and principal portions of this payment
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        // Update totals
        totalInterestPaid += interestPayment;
        balance -= principalPayment;
        
        if (balance < 0) {
            balance = 0;
        }
        
        // Store monthly data
        monthlyInterest.push(interestPayment);
        monthlyBalances.push(balance);
    }
    
    return {
        monthlyInterest: monthlyInterest,
        monthlyBalances: monthlyBalances,
        totalInterestPaid: totalInterestPaid,
        remainingBalance: balance
    };
}

/**
 * Simulate investment growth over time, returning values for each year
 */
function simulateInvestmentOverTime(initialAmount, annualReturns, years) {
    const yearlyValues = [initialAmount]; // Start with initial investment
    let balance = initialAmount;
    
    // Use the specified number of years of returns from the annualReturns array
    for (let year = 0; year < years && year < annualReturns.length; year++) {
        const annualReturn = annualReturns[year];
        balance *= (1 + (annualReturn / 100));
        yearlyValues.push(balance);
    }
    
    return yearlyValues;
}

/**
 * Calculate yearly percentiles (10th, 50th, 90th) for all investment paths
 */
function calculateYearlyPercentiles(investmentResults, years) {
    // Initialize arrays to store values for each year
    const yearlyValues = Array(years + 1).fill().map(() => []);
    
    // Collect all values for each year
    investmentResults.forEach(result => {
        const values = result.yearlyValues;
        for (let year = 0; year <= years && year < values.length; year++) {
            yearlyValues[year].push(values[year]);
        }
    });
    
    // Calculate percentiles for each year
    const percentiles = {
        median: [],
        lower: [], // 10th percentile
        upper: []  // 90th percentile
    };
    
    yearlyValues.forEach(values => {
        // Sort values for this year
        const sorted = [...values].sort((a, b) => a - b);
        
        // Calculate percentiles
        const medianIndex = Math.floor(sorted.length * 0.5);
        const lowerIndex = Math.floor(sorted.length * 0.1);
        const upperIndex = Math.floor(sorted.length * 0.9);
        
        percentiles.median.push(sorted[medianIndex]);
        percentiles.lower.push(sorted[lowerIndex]);
        percentiles.upper.push(sorted[upperIndex]);
    });
    
    return percentiles;
}

/**
 * Process simulation results and update UI
 */
function finishSimulation(
    loanAmount,
    baseRate,
    reducedRate,
    pointsCost,
    monthlySavings,
    interestSavings,
    yearlySavingsData,
    investmentResults,
    plannedOwnership
) {
    console.log("Finishing simulation and updating UI");
    
    // Calculate statistics for investment results
    const finalValues = investmentResults.map(result => result.finalValue);
    
    // Sort for median and percentiles of final values
    const sortedFinalValues = [...finalValues].sort((a, b) => a - b);
    const medianFinalValue = sortedFinalValues[Math.floor(sortedFinalValues.length / 2)];
    
    // Calculate percentiles
    const lowerPercentileIndex = Math.floor(sortedFinalValues.length * 0.1);
    const upperPercentileIndex = Math.floor(sortedFinalValues.length * 0.9);
    const lowerPercentileFinal = sortedFinalValues[lowerPercentileIndex];
    const upperPercentileFinal = sortedFinalValues[upperPercentileIndex];
    
    // Calculate yearly percentiles for the investment growth
    const yearlyPercentiles = calculateYearlyPercentiles(investmentResults, plannedOwnership);
    
    // Calculate probability that investing beats points
    const probInvestingWins = finalValues.filter(value => value > interestSavings).length / finalValues.length * 100;
    
    // Find the break-even point (in months)
    // First convert monthlySavingsData to an array with all monthly values
    const allMonthlySavings = [];
    allMonthlySavings.push(yearlySavingsData[0]); // Initial value
    
    for (let year = 1; year < yearlySavingsData.length; year++) {
        const prevYearValue = yearlySavingsData[year - 1];
        const yearValue = yearlySavingsData[year];
        const monthlyIncrement = (yearValue - prevYearValue) / 12;
        
        for (let month = 1; month <= 12; month++) {
            allMonthlySavings.push(prevYearValue + (monthlyIncrement * month));
        }
    }
    
    // Find break-even month
    let breakEvenMonth = allMonthlySavings.findIndex(savings => savings >= 0);
    if (breakEvenMonth === -1) {
        breakEvenMonth = allMonthlySavings.length; // No break-even within planned period
    } else {
        breakEvenMonth += 1; // Convert from 0-based to 1-based
    }
    
    // Convert to years for display
    const breakEvenYears = (breakEvenMonth / 12).toFixed(1);
    
    console.log("Investment results stats:", { 
        medianFinalValue, lowerPercentileFinal, upperPercentileFinal, 
        probInvestingWins, breakEvenMonth, breakEvenYears 
    });
    
    // Create labels for year-by-year charts
    const yearLabels = [];
    for (let year = 0; year <= plannedOwnership; year++) {
        yearLabels.push(`Year ${year}`);
    }
    
    // Format results text
    const resultsText = 
        `Points Strategy Summary:\n` +
        `- Upfront Points Cost: $${formatMoney(pointsCost)}\n` +
        `- Interest Rate Reduction: ${baseRate}% → ${reducedRate}%\n` +
        `- Monthly Payment Savings: $${formatMoney(monthlySavings)}\n` +
        `- Total Interest Savings (${plannedOwnership} years): $${formatMoney(interestSavings)}\n` +
        `- Break-Even Point: ${breakEvenYears} years\n\n` +
        
        `Investment Strategy Summary (${plannedOwnership} years):\n` +
        `- Median Investment Value: $${formatMoney(medianFinalValue)}\n` +
        `- 10th Percentile: $${formatMoney(lowerPercentileFinal)}\n` +
        `- 90th Percentile: $${formatMoney(upperPercentileFinal)}\n` +
        `- Probability Investment Beats Points: ${probInvestingWins.toFixed(1)}%\n\n` +
        
        `${probInvestingWins > 50 ? 
            `Based on historical returns, investing the points money has a ${probInvestingWins.toFixed(1)}% chance of outperforming buying points over a ${plannedOwnership}-year timeframe.` : 
            `Based on historical returns, buying points has a ${(100 - probInvestingWins).toFixed(1)}% chance of outperforming investing over a ${plannedOwnership}-year timeframe.`}`;
    
    // Update results text
    document.getElementById('resultsText').innerText = resultsText;
    
    // Update chart with net worth over time data
    updateNetWorthChart(
        yearLabels,
        yearlySavingsData,
        yearlyPercentiles
    );
    
    // Show results card
    document.getElementById('resultsCard').style.display = 'block';
    
    // Hide loading overlay
    document.getElementById('loadingOverlay').style.visibility = 'hidden';
    
    // Scroll to results
    document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Update the net worth over time chart
 */
function updateNetWorthChart(
    yearLabels,
    pointsSavingsData,
    investmentPercentiles
) {
    console.log("Updating net worth chart with simulation results");
    
    netWorthOverTimeChart.data.labels = yearLabels;
    netWorthOverTimeChart.data.datasets = [
        {
            label: 'Points Interest Savings',
            data: pointsSavingsData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 3,
            fill: true,
            pointRadius: 0
        },
        {
            label: 'Investment (Median)',
            data: investmentPercentiles.median,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointRadius: 0
        },
        {
            label: 'Investment (10th Percentile)',
            data: investmentPercentiles.lower,
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            borderDash: [5, 5]
        },
        {
            label: 'Investment (90th Percentile)',
            data: investmentPercentiles.upper,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            borderDash: [5, 5]
        }
    ];
    
    // Add zero reference line
    netWorthOverTimeChart.options.plugins.annotation = {
        annotations: {
            zeroLine: {
                type: 'line',
                yMin: 0,
                yMax: 0,
                borderColor: '#888888',
                borderWidth: 1,
                borderDash: [3, 3]
            }
        }
    };
    
    try {
        // Update chart
        netWorthOverTimeChart.update();
        console.log("Chart updated successfully");
    } catch (error) {
        console.error("Error updating chart:", error);
    }
    
    // Handle responsiveness after chart update
    handleChartResponsiveness();
}

/**
 * Format money values
 */
function formatMoney(value) {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}