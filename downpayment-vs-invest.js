/**
 * Down Payment vs. Investment Calculator
 * 
 * This script compares the financial outcomes of using money for
 * different down payment levels (with corresponding PMI costs) versus
 * putting down 5% and investing the rest in the stock market.
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
    
    // Set default PMI rate
    if (document.getElementById('pmiRate')) {
        document.getElementById('pmiRate').value = "1.5";
    }
    
    // Add event listeners
    runButton.addEventListener('click', startSimulation);
    console.log("Run button event listener added");
    
    // Add event listener for toggling between PMI rate and monthly PMI cost
    const pmiToggle = document.getElementById('pmiToggle');
    if (pmiToggle) {
        pmiToggle.addEventListener('change', togglePmiInput);
    }
    
    // Initialize charts
    try {
        initializeCharts();
        console.log("Charts initialized successfully");
    } catch (error) {
        console.error("Error initializing charts:", error);
    }
});

/**
 * Toggle between PMI rate and monthly PMI cost inputs
 */
function togglePmiInput() {
    const pmiRateInput = document.getElementById('pmiRateInput');
    const pmiCostInput = document.getElementById('pmiCostInput');
    
    if (document.getElementById('pmiToggle').checked) {
        // Show monthly cost input
        pmiRateInput.style.display = 'none';
        pmiCostInput.style.display = 'block';
    } else {
        // Show rate input
        pmiRateInput.style.display = 'block';
        pmiCostInput.style.display = 'none';
    }
}

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
    
    // Net Worth Over Time Chart
    const netWorthCtx = document.getElementById('netWorthChart');
    if (!netWorthCtx) {
        console.error("Chart canvas not found!");
        return;
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
                    text: 'Net Worth Over Time: Different Down Payment Strategies',
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
                        text: 'Net Worth ($)'
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
        const housePrice = parseFloat(document.getElementById('housePrice').value);
        const interestRate = parseFloat(document.getElementById('interestRate').value);
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const simulationYears = parseInt(document.getElementById('simulationYears').value);
        const homeAppreciation = parseFloat(document.getElementById('homeAppreciation').value);
        
        // Get PMI info - either rate or monthly cost
        let pmiRate = 0;
        let monthlyPmiCost = 0;
        
        if (document.getElementById('pmiToggle') && document.getElementById('pmiToggle').checked) {
            // Using monthly PMI cost
            monthlyPmiCost = parseFloat(document.getElementById('monthlyPmiCost').value);
        } else {
            // Using PMI rate
            pmiRate = parseFloat(document.getElementById('pmiRate').value);
        }
        
        console.log("Input values:", { 
            housePrice, interestRate, loanTerm, simulationYears, 
            homeAppreciation, pmiRate, monthlyPmiCost
        });
        
        // Validate inputs
        if (housePrice <= 0 || interestRate <= 0) {
            throw new Error("House price and interest rate must be positive");
        }
        
        if (simulationYears > loanTerm) {
            simulationYears = loanTerm;
            console.log("Adjusted simulation years to match loan term:", simulationYears);
        }
        
        // Define down payment percentages to compare
        const downPaymentPercentages = [0.05, 0.10, 0.15, 0.20];
        
        // Calculate down payment amounts
        const downPaymentAmounts = downPaymentPercentages.map(percent => housePrice * percent);
        
        // Amount to invest if using 5% down instead of higher percentages
        const investmentAmounts = downPaymentAmounts.map((amount, index) => {
            if (index === 0) return 0; // No investment for 5% down scenario
            return amount - downPaymentAmounts[0]; // Difference between this down payment and 5%
        });
        
        console.log("Down payment amounts:", downPaymentAmounts);
        console.log("Investment amounts:", investmentAmounts);
        
        // Calculate monthly payment for each down payment scenario
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;
        
        const loanAmounts = downPaymentAmounts.map(downPayment => housePrice - downPayment);
        const monthlyPayments = loanAmounts.map(loanAmount => 
            calculateMonthlyPayment(loanAmount, monthlyRate, numPayments)
        );
        
        // Calculate PMI costs for each scenario
        const monthlyPmiCosts = downPaymentPercentages.map((percent, index) => {
            if (percent >= 0.20) return 0; // No PMI for 20% or more down
            
            if (monthlyPmiCost > 0) {
                return monthlyPmiCost; // Use specified monthly PMI cost
            } else {
                // Calculate PMI based on loan amount and PMI rate
                return loanAmounts[index] * (pmiRate / 100) / 12;
            }
        });
        
        console.log("Loan amounts:", loanAmounts);
        console.log("Monthly payments:", monthlyPayments);
        console.log("Monthly PMI costs:", monthlyPmiCosts);
        
        // Calculate months until PMI drops off for each scenario
        const pmiDropoffMonths = calculatePmiDropoffMonths(
            downPaymentPercentages, 
            loanAmounts, 
            monthlyPayments, 
            monthlyRate, 
            homeAppreciation
        );
        
        console.log("PMI dropoff months:", pmiDropoffMonths);
        
        // Run Monte Carlo simulations using historical stock market data
        // Only need to simulate years, not full amortization
        const simulationMonths = simulationYears * 12;
        
        // Get all historical return sequences for simulation
        console.log("Getting historical periods for", simulationYears, "years");
        const allPeriods = getAllPeriods(simulationYears);
        console.log("Found", allPeriods.length, "historical periods");
        
        // Update status
        const simulationStatus = document.getElementById('simulationStatus');
        simulationStatus.textContent = 'Running historical simulations...';
        
        // Array to hold yearly percentiles for each investment amount
        const yearlyPercentiles = investmentAmounts.map(() => ({
            median: Array(simulationYears + 1).fill(0),
            lower: Array(simulationYears + 1).fill(0),
            upper: Array(simulationYears + 1).fill(0)
        }));
        
        // Run investment simulations for each investment amount and each historical period
        investmentAmounts.forEach((investmentAmount, investmentIndex) => {
            if (investmentAmount <= 0) return; // Skip 5% down scenario (no investment)
            
            const investmentResults = [];
            
            // Process simulations for this investment amount
            for (let i = 0; i < allPeriods.length; i++) {
                const period = allPeriods[i];
                
                // Simulate investing the down payment difference using actual historical return sequence
                const yearlyValues = simulateInvestmentOverTime(investmentAmount, period.returns, simulationYears);
                
                // Save results
                investmentResults.push({
                    period: `${period.startYear}-${period.endYear}`,
                    yearlyValues: yearlyValues,
                    finalValue: yearlyValues[yearlyValues.length - 1]
                });
                
                // Update progress - scale progress based on investment index and simulation count
                const progressIncrement = 80 / (investmentAmounts.length * allPeriods.length); // Leave 20% for final calculations
                const baseProgress = investmentIndex * (80 / investmentAmounts.length);
                const progress = baseProgress + ((i + 1) * progressIncrement);
                updateProgress(progress);
            }
            
            // Calculate yearly percentiles for this investment amount
            const percentiles = calculateYearlyPercentiles(investmentResults, simulationYears);
            yearlyPercentiles[investmentIndex] = percentiles;
        });
        
        // Calculate net worth over time for each down payment scenario
        const netWorthOverTime = calculateNetWorthOverTime(
            housePrice,
            downPaymentAmounts,
            loanAmounts,
            monthlyPayments,
            monthlyPmiCosts,
            pmiDropoffMonths,
            homeAppreciation,
            yearlyPercentiles,
            simulationYears
        );
        
        // Update progress to 100%
        updateProgress(100);
        
        // Process and display results
        finishSimulation(
            housePrice,
            downPaymentPercentages,
            downPaymentAmounts,
            investmentAmounts,
            monthlyPayments,
            monthlyPmiCosts,
            pmiDropoffMonths,
            netWorthOverTime,
            simulationYears
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
 * Calculate months until PMI drops off for each scenario
 * PMI drops off when loan-to-value ratio reaches 80% (20% equity)
 */
function calculatePmiDropoffMonths(
    downPaymentPercentages, 
    loanAmounts, 
    monthlyPayments, 
    monthlyRate, 
    homeAppreciation
) {
    // Monthly appreciation rate
    const monthlyAppreciationRate = Math.pow(1 + (homeAppreciation / 100), 1/12) - 1;
    
    return downPaymentPercentages.map((percent, index) => {
        if (percent >= 0.20) return 0; // No PMI for 20% or more down
        
        let loanAmount = loanAmounts[index];
        let propertyValue = loanAmount / (1 - percent); // Initial property value
        let month = 0;
        
        // Loop until LTV reaches 80% (meaning 20% equity)
        while ((loanAmount / propertyValue) > 0.80 && month < 360) { // 30 years max
            month++;
            
            // Calculate interest for this month
            const interest = loanAmount * monthlyRate;
            
            // Calculate principal paid this month
            const principalPayment = monthlyPayments[index] - interest;
            
            // Update loan amount
            loanAmount -= principalPayment;
            
            // Update property value with appreciation
            propertyValue *= (1 + monthlyAppreciationRate);
        }
        
        return month;
    });
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
 * Calculate net worth over time for each down payment scenario
 */
function calculateNetWorthOverTime(
    housePrice,
    downPaymentAmounts,
    loanAmounts,
    monthlyPayments,
    monthlyPmiCosts,
    pmiDropoffMonths,
    homeAppreciation,
    yearlyPercentiles,
    simulationYears
) {
    // Calculate yearly house value with appreciation
    const houseValues = [housePrice];
    for (let year = 1; year <= simulationYears; year++) {
        houseValues.push(housePrice * Math.pow(1 + (homeAppreciation / 100), year));
    }
    
    // Calculate remaining loan balance at each year
    const yearlyLoanBalances = [];
    const monthlyRate = homeAppreciation / 100 / 12;
    
    // For each down payment scenario
    loanAmounts.forEach((initialLoanAmount, scenarioIndex) => {
        const balances = [initialLoanAmount];
        let loanAmount = initialLoanAmount;
        
        for (let year = 1; year <= simulationYears; year++) {
            // Calculate loan balance after 12 more months
            for (let month = 1; month <= 12; month++) {
                const monthsSoFar = (year - 1) * 12 + month;
                const interest = loanAmount * monthlyRate;
                const principalPayment = monthlyPayments[scenarioIndex] - interest;
                
                // Add PMI if applicable
                let pmi = 0;
                if (monthsSoFar <= pmiDropoffMonths[scenarioIndex]) {
                    pmi = monthlyPmiCosts[scenarioIndex];
                }
                
                // Reduce loan amount by principal payment
                loanAmount -= principalPayment;
                
                // Don't let it go negative
                if (loanAmount < 0) loanAmount = 0;
            }
            
            balances.push(loanAmount);
        }
        
        yearlyLoanBalances.push(balances);
    });
    
    // Calculate cash savings for each scenario (difference in monthly payments + PMI)
    const monthlyCashFlowDifferences = [];
    
    // For each down payment scenario (compare to 20% down)
    for (let i = 0; i < monthlyPayments.length; i++) {
        const differences = [];
        
        for (let year = 0; year <= simulationYears; year++) {
            // No cash flow difference at year 0 (initial state)
            if (year === 0) {
                differences.push(0);
                continue;
            }
            
            // For each month in this year
            let yearDifference = 0;
            for (let month = 1; month <= 12; month++) {
                const monthsSoFar = (year - 1) * 12 + month;
                
                // Base mortgage payment difference (compared to 20% down)
                let paymentDiff = monthlyPayments[3] - monthlyPayments[i];
                
                // Add PMI if applicable
                if (monthsSoFar <= pmiDropoffMonths[i]) {
                    paymentDiff -= monthlyPmiCosts[i]; // Negative because PMI is a cost
                }
                
                yearDifference += paymentDiff;
            }
            
            // Add previous year's difference (cumulative)
            if (differences.length > 0) {
                yearDifference += differences[differences.length - 1];
            }
            
            differences.push(yearDifference);
        }
        
        monthlyCashFlowDifferences.push(differences);
    }
    
    // Calculate net worth over time for each scenario
    const netWorthOverTime = [];
    
    // For each down payment scenario
    for (let i = 0; i < downPaymentAmounts.length; i++) {
        const netWorth = [];
        
        for (let year = 0; year <= simulationYears; year++) {
            let worthAtYear = 0;
            
            // House equity
            worthAtYear += houseValues[year] - yearlyLoanBalances[i][year];
            
            // Cash flow savings (compared to 20% down)
            worthAtYear += monthlyCashFlowDifferences[i][year];
            
            // Investment growth (for 5%, 10%, 15% scenarios)
            if (i < 3 && yearlyPercentiles[i+1] && yearlyPercentiles[i+1].median[year]) {
                worthAtYear += yearlyPercentiles[i+1].median[year];
            }
            
            netWorth.push(worthAtYear);
        }
        
        netWorthOverTime.push(netWorth);
    }
    
    return {
        houseValues,
        loanBalances: yearlyLoanBalances,
        cashFlowDifferences: monthlyCashFlowDifferences,
        netWorthOverTime,
        yearlyPercentiles
    };
}

/**
 * Process simulation results and update UI
 */
function finishSimulation(
    housePrice,
    downPaymentPercentages,
    downPaymentAmounts,
    investmentAmounts,
    monthlyPayments,
    monthlyPmiCosts,
    pmiDropoffMonths,
    netWorthData,
    simulationYears
) {
    console.log("Finishing simulation and updating UI");
    
    // Create labels for year-by-year charts
    const yearLabels = [];
    for (let year = 0; year <= simulationYears; year++) {
        yearLabels.push(`Year ${year}`);
    }
    
    // Format PMI dropoff time for display
    const pmiDropoffFormatted = pmiDropoffMonths.map(months => {
        if (months === 0) return "No PMI";
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return `${years}y ${remainingMonths}m`;
    });
    
    // Calculate final net worth for each scenario
    const finalNetWorth = netWorthData.netWorthOverTime.map(scenario => 
        scenario[scenario.length - 1]
    );
    
    // Find best strategy based on final net worth
    const bestStrategyIndex = finalNetWorth.indexOf(Math.max(...finalNetWorth));
    const bestStrategy = ['5%', '10%', '15%', '20%'][bestStrategyIndex];
    
    // Format results text
    let resultsText = `House Price: $${formatMoney(housePrice)}\n\n`;
    
    // Add scenario summaries
    downPaymentPercentages.forEach((percent, index) => {
        const percentFormatted = (percent * 100).toFixed(0);
        const downPayment = downPaymentAmounts[index];
        const monthlyPayment = monthlyPayments[index];
        const monthlyPmi = monthlyPmiCosts[index];
        const pmiDropoff = pmiDropoffFormatted[index];
        const endNetWorth = finalNetWorth[index];
        
        resultsText += `${percentFormatted}% Down Payment Strategy:\n`;
        resultsText += `- Down Payment: $${formatMoney(downPayment)}\n`;
        resultsText += `- Monthly Payment: $${formatMoney(monthlyPayment)}\n`;
        
        if (monthlyPmi > 0) {
            resultsText += `- Monthly PMI: $${formatMoney(monthlyPmi)}\n`;
            resultsText += `- PMI Drops Off After: ${pmiDropoff}\n`;
        }
        
        if (index === 0) {
            // 5% down scenario
            resultsText += `- Money Invested: $0\n`;
        } else {
            // Other scenarios with potential investments
            resultsText += `- Money Invested (5% scenario): $${formatMoney(investmentAmounts[index])}\n`;
        }
        
        resultsText += `- Net Worth After ${simulationYears} Years: $${formatMoney(endNetWorth)}\n\n`;
    });
    
    resultsText += `Based on this simulation, the ${bestStrategy} down payment strategy would result in the highest net worth after ${simulationYears} years.`;
    
    // Update results text
    document.getElementById('resultsText').innerText = resultsText;
    
    // Update chart
    updateNetWorthChart(
        yearLabels,
        netWorthData.netWorthOverTime,
        netWorthData.yearlyPercentiles,
        downPaymentPercentages
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
    netWorthData,
    yearlyPercentiles,
    downPaymentPercentages
) {
    console.log("Updating net worth chart with simulation results");
    
    netWorthOverTimeChart.data.labels = yearLabels;
    
    // Define colors for each strategy
    const colors = [
        { border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.1)' },  // 5% - Red
        { border: 'rgba(255, 159, 64, 1)', background: 'rgba(255, 159, 64, 0.1)' },  // 10% - Orange
        { border: 'rgba(255, 205, 86, 1)', background: 'rgba(255, 205, 86, 0.1)' },  // 15% - Yellow
        { border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.1)' }   // 20% - Green
    ];
    
    // Create datasets for each down payment scenario
    const datasets = [];
    
    netWorthData.forEach((data, index) => {
        const percentFormatted = (downPaymentPercentages[index] * 100).toFixed(0);
        
        datasets.push({
            label: `${percentFormatted}% Down Payment`,
            data: data,
            borderColor: colors[index].border,
            backgroundColor: 'transparent',
            borderWidth: 3,
            fill: false,
            pointRadius: 0
        });
    });
    
    // We're not displaying percentile ranges on the chart as requested
    // The percentiles are still calculated and reported in the text results
    
    netWorthOverTimeChart.data.datasets = datasets;
    
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