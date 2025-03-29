/**
 * Mortgage vs. Investment Comparison Tool
 * 
 * This script provides the simulation and visualization functionality 
 * for comparing the net worth impact of making extra mortgage payments
 * versus investing that extra money in the S&P 500 over 30 years.
 */

// Global variables for charts
let netWorthChart = null;
let netWorthOverTimeChart = null;
let mortgagePayoffChart = null;

// DOM elements
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const runButton = document.getElementById('runSimulation');
    const resultsCard = document.getElementById('resultsCard');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const simulationProgress = document.getElementById('simulationProgress');
    const simulationStatus = document.getElementById('simulationStatus');
    
    // Add event listeners
    runButton.addEventListener('click', startSimulation);
    
    // Initialize charts
    initializeCharts();
});

/**
 * Initialize the chart containers with empty data
 */
function initializeCharts() {
    // Net worth comparison chart
    const netWorthCtx = document.getElementById('netWorthChart').getContext('2d');
    netWorthChart = new Chart(netWorthCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Net Worth After 30 Years: Extra Mortgage Payment vs. Investing',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
    
    // Net Worth Over Time chart (replacing distribution chart)
    const netWorthOverTimeCtx = document.getElementById('distributionChart').getContext('2d');
    netWorthOverTimeChart = new Chart(netWorthOverTimeCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Net Worth Over Time Comparison',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
    
    // Mortgage payoff chart
    const mortgagePayoffCtx = document.getElementById('mortgagePayoffChart').getContext('2d');
    mortgagePayoffChart = new Chart(mortgagePayoffCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Mortgage Balance Over Time',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
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
    
    if (netWorthChart && netWorthOverTimeChart && mortgagePayoffChart) {
        // Adjust legend position based on screen size
        netWorthChart.options.plugins.legend.position = isMobile ? 'bottom' : 'top';
        netWorthOverTimeChart.options.plugins.legend.position = isMobile ? 'bottom' : 'top';
        mortgagePayoffChart.options.plugins.legend.position = isMobile ? 'bottom' : 'top';
        
        // Configure legend display on mobile
        if (isMobile) {
            // Set smaller font size and box width for the legend on mobile
            netWorthChart.options.plugins.legend.labels = {
                boxWidth: 8,
                font: {
                    size: 10
                }
            };
            
            netWorthOverTimeChart.options.plugins.legend.labels = {
                boxWidth: 8,
                font: {
                    size: 10
                }
            };
            
            mortgagePayoffChart.options.plugins.legend.labels = {
                boxWidth: 8,
                font: {
                    size: 10
                }
            };
            
            // Adjust chart height
            const chartContainers = document.querySelectorAll('.chart-container');
            chartContainers.forEach(container => {
                container.style.height = '300px';
            });
        }
        
        netWorthChart.update();
        netWorthOverTimeChart.update();
        mortgagePayoffChart.update();
    }
}

/**
 * Start the simulation and show loading overlay
 */
function startSimulation() {
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
    try {
        // Get user inputs
        const loanAmount = parseFloat(document.getElementById('loanAmount').value);
        const interestRate = parseFloat(document.getElementById('interestRate').value);
        const extraPayment = parseFloat(document.getElementById('extraPayment').value);
        const houseValue = loanAmount; // Assume house value is equal to loan amount initially
        
        // Validate inputs
        if (loanAmount <= 0 || interestRate < 0 || extraPayment < 0) {
            throw new Error("Loan amount must be positive, interest rate and extra payment cannot be negative");
        }
        
        // Calculate base monthly payment (30-year fixed)
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = 30 * 12;
        const baseMonthlyPayment = calculateMonthlyPayment(loanAmount, monthlyRate, numPayments);
        
        // Calculate mortgage scenarios
        const regularMortgage = simulateRegularMortgage(loanAmount, monthlyRate, baseMonthlyPayment, numPayments);
        const extraPaymentMortgage = simulateExtraPaymentMortgage(loanAmount, monthlyRate, baseMonthlyPayment, extraPayment, numPayments);
        
        // Get all possible 30-year periods from historical data
        const allPeriods = getAllPeriods(30);
        
        // Run investment simulations for each historical period
        const investmentResults = [];
        const extraPaymentResults = [];
        
        // Update status
        const simulationStatus = document.getElementById('simulationStatus');
        simulationStatus.textContent = 'Running historical simulations...';
        
        // Process simulations
        for (let i = 0; i < allPeriods.length; i++) {
            const period = allPeriods[i];
            
            // Simulate investing the extra payment using actual historical 30-year sequence
            const investmentScenario = simulateInvestment(
                extraPayment,
                baseMonthlyPayment,
                period.returns,
                extraPaymentMortgage.payoffMonth,
                numPayments,
                houseValue,
                false
            );
            
            // Simulate the early mortgage payoff scenario with subsequent investments
            const extraPaymentScenario = simulateExtraPaymentWithInvestment(
                extraPayment,
                baseMonthlyPayment,
                period.returns,
                extraPaymentMortgage.payoffMonth,
                numPayments,
                houseValue
            );
            
            // Save results
            investmentResults.push({
                period: `${period.startYear}-${period.endYear}`,
                finalNetWorth: investmentScenario.finalNetWorth,
                monthlyNetWorth: investmentScenario.monthlyNetWorth
            });
            
            extraPaymentResults.push({
                period: `${period.startYear}-${period.endYear}`,
                finalNetWorth: extraPaymentScenario.finalNetWorth,
                monthlyNetWorth: extraPaymentScenario.monthlyNetWorth
            });
            
            // Update progress
            const progress = ((i + 1) / allPeriods.length) * 100;
            updateProgress(progress);
        }
        
        // Process and display results
        finishSimulation(regularMortgage, extraPaymentMortgage, investmentResults, extraPaymentResults, houseValue);
        
    } catch (error) {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.visibility = 'hidden';
        
        // Show error message
        alert('Error: ' + error.message);
        console.error(error);
    }
}

/**
 * Update the progress bar
 */
function updateProgress(progress) {
    const simulationProgress = document.getElementById('simulationProgress');
    simulationProgress.style.width = `${progress}%`;
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
 * Simulate a regular mortgage (no extra payments)
 */
function simulateRegularMortgage(principal, monthlyRate, monthlyPayment, numPayments) {
    let balance = principal;
    let monthlyBalances = [balance];
    let totalInterestPaid = 0;
    
    for (let month = 1; month <= numPayments; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        totalInterestPaid += interestPayment;
        balance -= principalPayment;
        
        if (balance < 0.01) {
            balance = 0;
        }
        
        monthlyBalances.push(balance);
    }
    
    return {
        initialBalance: principal,
        finalBalance: balance,
        equity: principal - balance,
        totalInterestPaid: totalInterestPaid,
        monthlyBalances: monthlyBalances,
        payoffMonth: numPayments
    };
}

/**
 * Simulate a mortgage with extra payments
 */
function simulateExtraPaymentMortgage(principal, monthlyRate, monthlyPayment, extraPayment, maxMonths) {
    let balance = principal;
    let monthlyBalances = [balance];
    let totalInterestPaid = 0;
    let payoffMonth = maxMonths;
    
    for (let month = 1; month <= maxMonths; month++) {
        const interestPayment = balance * monthlyRate;
        const regularPrincipalPayment = monthlyPayment - interestPayment;
        const totalPrincipalPayment = regularPrincipalPayment + extraPayment;
        
        totalInterestPaid += interestPayment;
        balance -= totalPrincipalPayment;
        
        if (balance <= 0) {
            balance = 0;
            monthlyBalances.push(balance);
            payoffMonth = month;
            break;
        }
        
        monthlyBalances.push(balance);
    }
    
    // Pad the remaining months with zeros if paid off early
    if (payoffMonth < maxMonths) {
        monthlyBalances = monthlyBalances.concat(Array(maxMonths - payoffMonth).fill(0));
    }
    
    return {
        initialBalance: principal,
        finalBalance: balance,
        equity: principal - balance,
        totalInterestPaid: totalInterestPaid,
        monthlyBalances: monthlyBalances,
        payoffMonth: payoffMonth
    };
}

/**
 * Simulate investing the extra payment in the stock market
 * @param {number} extraPayment - Monthly extra payment amount
 * @param {number} baseMonthlyPayment - Regular monthly mortgage payment
 * @param {Array} annualReturns - Array of annual returns for the 30-year period
 * @param {number} mortgagePayoffMonth - Month when mortgage is paid off in extra payment scenario
 * @param {number} totalMonths - Total simulation period (360 for 30 years)
 * @param {number} houseValue - Value of the house at the end of the simulation
 * @param {boolean} isRegularMortgage - Whether this is the regular mortgage scenario (defaults to false)
 */
function simulateInvestment(extraPayment, baseMonthlyPayment, annualReturns, mortgagePayoffMonth, totalMonths, houseValue, isRegularMortgage = false) {
    let balance = 0;
    let monthlyBalances = [0];
    let monthlyNetWorth = [houseValue]; // Start with house value
    
    // Convert annual returns to monthly returns
    const monthlyReturns = [];
    for (const annualReturn of annualReturns) {
        const monthlyReturn = Math.pow(1 + (annualReturn / 100), 1/12) - 1;
        for (let month = 0; month < 12; month++) {
            monthlyReturns.push(monthlyReturn);
        }
    }
    
    // Ensure we have enough monthly returns
    while (monthlyReturns.length < totalMonths) {
        monthlyReturns.push(monthlyReturns[monthlyReturns.length - 1]);
    }
    
    // Simulate investment strategy - continue paying mortgage while investing extra
    let remainingMortgage = isRegularMortgage ? 0 : totalMonths;
    
    for (let month = 1; month <= totalMonths; month++) {
        const monthlyReturn = monthlyReturns[month - 1];
        
        // Grow existing balance
        balance *= (1 + monthlyReturn);
        
        // Add new investment
        balance += extraPayment;
        
        // Track monthly balances
        monthlyBalances.push(balance);
        
        // Calculate mortgage remaining balance - decreases linearly from loan amount to 0
        if (!isRegularMortgage) {
            remainingMortgage = (month <= totalMonths) ? (totalMonths - month) / totalMonths * houseValue : 0;
        }
        
        // Net worth = investment balance + house value - remaining mortgage
        const netWorth = balance + houseValue - remainingMortgage;
        monthlyNetWorth.push(netWorth);
    }
    
    const finalNetWorth = balance + houseValue - (isRegularMortgage ? 0 : remainingMortgage);
    
    return {
        investmentBalance: balance,
        finalNetWorth: finalNetWorth,
        monthlyBalances: monthlyBalances,
        monthlyNetWorth: monthlyNetWorth
    };
}

/**
 * Simulate early mortgage payoff with subsequent investment of all freed-up cash
 * @param {number} extraPayment - Monthly extra payment amount
 * @param {number} baseMonthlyPayment - Regular monthly mortgage payment
 * @param {Array} annualReturns - Array of annual returns for the 30-year period
 * @param {number} mortgagePayoffMonth - Month when mortgage is paid off in extra payment scenario
 * @param {number} totalMonths - Total simulation period (360 for 30 years)
 * @param {number} houseValue - Value of the house at the end of the simulation
 */
function simulateExtraPaymentWithInvestment(extraPayment, baseMonthlyPayment, annualReturns, mortgagePayoffMonth, totalMonths, houseValue) {
    let balance = 0;
    let monthlyBalances = [0];
    let monthlyNetWorth = [houseValue - houseValue]; // Start with home equity which is 0 initially
    
    // Convert annual returns to monthly returns
    const monthlyReturns = [];
    for (const annualReturn of annualReturns) {
        const monthlyReturn = Math.pow(1 + (annualReturn / 100), 1/12) - 1;
        for (let month = 0; month < 12; month++) {
            monthlyReturns.push(monthlyReturn);
        }
    }
    
    // Ensure we have enough monthly returns
    while (monthlyReturns.length < totalMonths) {
        monthlyReturns.push(monthlyReturns[monthlyReturns.length - 1]);
    }
    
    // Phase 1: Before mortgage is paid off - no investments, but building equity
    for (let month = 1; month <= mortgagePayoffMonth; month++) {
        // No investment growth yet
        monthlyBalances.push(balance);
        
        // Calculate equity - increases linearly from 0 to loan amount
        const equity = (month / mortgagePayoffMonth) * houseValue;
        
        // Net worth = investment balance (0) + house value - remaining mortgage
        const netWorth = balance + equity;
        monthlyNetWorth.push(netWorth);
    }
    
    // Phase 2: After mortgage is paid off - invest both the regular payment and extra payment
    for (let month = mortgagePayoffMonth + 1; month <= totalMonths; month++) {
        const monthlyReturn = monthlyReturns[month - 1];
        
        // Grow existing balance
        balance *= (1 + monthlyReturn);
        
        // Add both extra payment and regular payment
        balance += (extraPayment + baseMonthlyPayment);
        
        monthlyBalances.push(balance);
        
        // Net worth = investment balance + house value (fully owned)
        const netWorth = balance + houseValue;
        monthlyNetWorth.push(netWorth);
    }
    
    const finalNetWorth = balance + houseValue;
    
    return {
        investmentBalance: balance,
        finalNetWorth: finalNetWorth,
        monthlyBalances: monthlyBalances,
        monthlyNetWorth: monthlyNetWorth
    };
}

/**
 * Process simulation results and update UI
 */
function finishSimulation(regularMortgage, extraPaymentMortgage, investmentResults, extraPaymentResults, houseValue) {
    // Calculate statistics
    const investNetWorths = investmentResults.map(result => result.finalNetWorth);
    const extraMortgageNetWorths = extraPaymentResults.map(result => result.finalNetWorth);
    
    // Sort for median and percentiles (investment strategy)
    const sortedInvestNetWorths = [...investNetWorths].sort((a, b) => a - b);
    const medianInvestNetWorth = sortedInvestNetWorths[Math.floor(sortedInvestNetWorths.length / 2)];
    
    // Calculate 90% confidence interval (investment strategy)
    const lowerPercentileIndex = Math.floor(sortedInvestNetWorths.length * 0.05);
    const upperPercentileIndex = Math.floor(sortedInvestNetWorths.length * 0.95);
    const lowerPercentile = sortedInvestNetWorths[lowerPercentileIndex];
    const upperPercentile = sortedInvestNetWorths[upperPercentileIndex];
    
    // Sort for median and percentiles (extra mortgage payment strategy)
    const sortedExtraMortgageNetWorths = [...extraMortgageNetWorths].sort((a, b) => a - b);
    const medianExtraMortgageNetWorth = sortedExtraMortgageNetWorths[Math.floor(sortedExtraMortgageNetWorths.length / 2)];
    
    // Calculate 90% confidence interval (extra mortgage payment strategy)
    const extraLowerPercentileIndex = Math.floor(sortedExtraMortgageNetWorths.length * 0.05);
    const extraUpperPercentileIndex = Math.floor(sortedExtraMortgageNetWorths.length * 0.95);
    const extraLowerPercentile = sortedExtraMortgageNetWorths[extraLowerPercentileIndex];
    const extraUpperPercentile = sortedExtraMortgageNetWorths[extraUpperPercentileIndex];
    
    // Probability that investing beats extra mortgage payment
    const differences = [];
    for (let i = 0; i < investmentResults.length; i++) {
        differences.push(investmentResults[i].finalNetWorth - extraPaymentResults[i].finalNetWorth);
    }
    const probInvestingWins = differences.filter(diff => diff > 0).length / differences.length * 100;
    
    // Determine which option is better based on median
    let conclusion;
    if (medianInvestNetWorth > medianExtraMortgageNetWorth) {
        conclusion = `Based on historical returns, investing the extra payment is likely to result in higher net worth.`;
    } else {
        conclusion = `Based on historical returns, making extra mortgage payments is likely to result in higher net worth.`;
    }
    
    // Get median monthly net worth for both strategies (for time series chart)
    let medianInvestIndex = Math.floor(investmentResults.length / 2);
    let medianExtraPaymentIndex = Math.floor(extraPaymentResults.length / 2);
    
    // Sort result array by final net worth to find the median result
    const investResultsWithIndex = investmentResults.map((result, index) => ({ result, index }));
    investResultsWithIndex.sort((a, b) => a.result.finalNetWorth - b.result.finalNetWorth);
    medianInvestIndex = investResultsWithIndex[Math.floor(investResultsWithIndex.length / 2)].index;
    
    const extraPaymentResultsWithIndex = extraPaymentResults.map((result, index) => ({ result, index }));
    extraPaymentResultsWithIndex.sort((a, b) => a.result.finalNetWorth - b.result.finalNetWorth);
    medianExtraPaymentIndex = extraPaymentResultsWithIndex[Math.floor(extraPaymentResultsWithIndex.length / 2)].index;
    
    // Format results text
    const resultsText = 
        `Extra Mortgage Payment Strategy:\n` +
        `- Mortgage paid off in ${extraPaymentMortgage.payoffMonth} months (${(extraPaymentMortgage.payoffMonth / 12).toFixed(1)} years)\n` +
        `- Total interest saved: ${formatMoney(regularMortgage.totalInterestPaid - extraPaymentMortgage.totalInterestPaid)}\n` +
        `- Final Net Worth (including ${formatMoney(houseValue)} house value): ${formatMoney(medianExtraMortgageNetWorth)}\n` +
        `- 90% Confidence Interval: ${formatMoney(extraLowerPercentile)} to ${formatMoney(extraUpperPercentile)}\n\n` +
        
        `Investment Strategy (Median Result):\n` +
        `- Final Net Worth (including ${formatMoney(houseValue)} house value): ${formatMoney(medianInvestNetWorth)}\n` +
        `- 90% Confidence Interval: ${formatMoney(lowerPercentile)} to ${formatMoney(upperPercentile)}\n` +
        `- ${probInvestingWins.toFixed(1)}% chance of better outcome than extra mortgage payments\n\n` +
        
        `${conclusion}`;
    
    // Update results text
    document.getElementById('resultsText').innerText = resultsText;
    
    // Update charts
    updateCharts(
        regularMortgage, 
        extraPaymentMortgage, 
        investmentResults, 
        extraPaymentResults, 
        houseValue, 
        medianInvestIndex,
        medianExtraPaymentIndex
    );
    
    // Show results card
    document.getElementById('resultsCard').style.display = 'block';
    
    // Hide loading overlay
    document.getElementById('loadingOverlay').style.visibility = 'hidden';
    
    // Scroll to results
    document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Update the visualization charts with simulation results
 */
function updateCharts(
    regularMortgage, 
    extraPaymentMortgage, 
    investmentResults, 
    extraPaymentResults, 
    houseValue,
    medianInvestIndex,
    medianExtraPaymentIndex
) {
    // 1. Net Worth Comparison Chart
    netWorthChart.data.labels = ['Extra Mortgage Payments', 'Investing (Median)', 'Investing (10th %ile)', 'Investing (90th %ile)'];
    
    // Sort for percentiles
    const investNetWorths = investmentResults.map(result => result.finalNetWorth);
    const sortedInvestNetWorths = [...investNetWorths].sort((a, b) => a - b);
    const percentile10 = sortedInvestNetWorths[Math.floor(sortedInvestNetWorths.length * 0.1)];
    const percentile90 = sortedInvestNetWorths[Math.floor(sortedInvestNetWorths.length * 0.9)];
    const medianNetWorth = sortedInvestNetWorths[Math.floor(sortedInvestNetWorths.length * 0.5)];
    
    // Sort for extra mortgage payment percentiles
    const extraMortgageNetWorths = extraPaymentResults.map(result => result.finalNetWorth);
    const sortedExtraMortgageNetWorths = [...extraMortgageNetWorths].sort((a, b) => a - b);
    const extraMortgageMedianNetWorth = sortedExtraMortgageNetWorths[Math.floor(sortedExtraMortgageNetWorths.length * 0.5)];
    
    netWorthChart.data.datasets = [{
        label: 'Net Worth After 30 Years',
        data: [extraMortgageMedianNetWorth, medianNetWorth, percentile10, percentile90],
        backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
    }];
    
    // 2. Net Worth Over Time Chart (replacing distribution chart)
    // Generate labels for years
    const yearLabels = [];
    for (let i = 0; i <= 30; i++) {
        yearLabels.push(`Year ${i}`);
    }
    
    netWorthOverTimeChart.data.labels = yearLabels;
    
    // Get median net worth over time for both strategies
    const medianInvestmentNetWorthOverTime = investmentResults[medianInvestIndex].monthlyNetWorth.filter((_, index) => index % 12 === 0);
    const medianExtraPaymentNetWorthOverTime = extraPaymentResults[medianExtraPaymentIndex].monthlyNetWorth.filter((_, index) => index % 12 === 0);
    
    netWorthOverTimeChart.data.datasets = [
        {
            label: 'Investment Strategy Net Worth',
            data: medianInvestmentNetWorthOverTime,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderWidth: 2,
            fill: true,
            pointRadius: 0
        },
        {
            label: 'Extra Payment Strategy Net Worth',
            data: medianExtraPaymentNetWorthOverTime,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2,
            fill: true,
            pointRadius: 0
        }
    ];
    
    // 3. Mortgage Balance Chart
    // Generate labels for months
    const monthLabels = [];
    for (let i = 0; i <= 30; i++) {
        monthLabels.push(`Year ${i}`);
    }
    
    mortgagePayoffChart.data.labels = monthLabels;
    mortgagePayoffChart.data.datasets = [
        {
            label: 'Regular Mortgage',
            data: regularMortgage.monthlyBalances.filter((_, index) => index % 12 === 0),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0
        },
        {
            label: 'With Extra Payment',
            data: extraPaymentMortgage.monthlyBalances.filter((_, index) => index % 12 === 0),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0
        }
    ];
    
    // Update all charts
    netWorthChart.update();
    netWorthOverTimeChart.update();
    mortgagePayoffChart.update();
    
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