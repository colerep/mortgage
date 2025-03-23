/**
 * Mortgage Comparison Tool: 5/1 ARM vs Fixed Rate
 * 
 * This script provides the simulation and visualization functionality 
 * for comparing 5/1 ARMs with fixed-rate mortgages over 30 years.
 */

// Global variables for charts
let distributionChart = null;
let savingsChart = null;
let ratePathsChart = null;

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
    // Distribution chart
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    distributionChart = new Chart(distributionCtx, {
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
                    text: 'Distribution of 5/1 ARM Total Costs',
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
    
    // Savings chart
    const savingsCtx = document.getElementById('savingsChart').getContext('2d');
    savingsChart = new Chart(savingsCtx, {
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
                    text: 'Potential Savings/Loss with ARM vs Fixed Rate',
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
    
    // Rate paths chart
    const ratePathsCtx = document.getElementById('ratePathsChart').getContext('2d');
    ratePathsChart = new Chart(ratePathsCtx, {
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
                    text: 'ARM Interest Rate Projections',
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
 * Run the Monte Carlo simulation with the user input parameters
 */
function runSimulation() {
    try {
        // Get user inputs
        const loanAmount = parseFloat(document.getElementById('loanAmount').value);
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const fixedRate = parseFloat(document.getElementById('fixedRate').value);
        const armInitialRate = parseFloat(document.getElementById('armRate').value);
        const armMargin = parseFloat(document.getElementById('armMargin').value);
        const initialCap = parseFloat(document.getElementById('initialCap').value);
        const annualCap = parseFloat(document.getElementById('annualCap').value);
        const lifetimeCap = parseFloat(document.getElementById('lifetimeCap').value);
        const numSimulations = parseInt(document.getElementById('numSimulations').value);
        
        // Validate inputs
        if (loanAmount <= 0 || fixedRate < 0 || armInitialRate < 0 || armMargin < 0) {
            throw new Error("Loan amount must be positive and rates cannot be negative");
        }
        
        if (initialCap < 0 || annualCap < 0 || lifetimeCap < 0) {
            throw new Error("Rate caps cannot be negative");
        }
        
        if (loanTerm <= 5) {
            throw new Error("Loan term must be greater than 5 years for 5/1 ARM comparison");
        }
        
        if (numSimulations <= 0) {
            throw new Error("Number of simulations must be positive");
        }
        
        // Calculate fixed-rate mortgage total cost
        const fixedCost = calculateFixedCost(loanAmount, fixedRate, loanTerm);
        
        // Run Monte Carlo simulations for ARM
        const armCosts = [];
        const armRatePaths = [];
        
        // Update status
        const simulationStatus = document.getElementById('simulationStatus');
        simulationStatus.textContent = 'Running Monte Carlo simulation...';
        
        // We'll process the simulations in batches to avoid locking up the UI
        const batchSize = 100;
        const totalBatches = Math.ceil(numSimulations / batchSize);
        let currentBatch = 0;
        
        // Function to process a batch of simulations
        function processBatch() {
            const startIdx = currentBatch * batchSize;
            const endIdx = Math.min(startIdx + batchSize, numSimulations);
            
            for (let i = startIdx; i < endIdx; i++) {
                // Simulate ARM rates
                const [monthlyRates, annualRates] = simulateArmRates(
                    armInitialRate, armMargin, initialCap, annualCap, lifetimeCap, loanTerm
                );
                
                // Calculate ARM cost
                const armCost = calculateArmCost(loanAmount, monthlyRates);
                armCosts.push(armCost);
                
                // Save every 50th rate path for visualization
                if (i % 50 === 0) {
                    armRatePaths.push(annualRates);
                }
                
                // Update progress
                const progress = ((i + 1) / numSimulations) * 100;
                updateProgress(progress);
            }
            
            currentBatch++;
            
            // Update status
            simulationStatus.textContent = `Running simulation ${endIdx}/${numSimulations}...`;
            
            // Check if we're done
            if (currentBatch < totalBatches) {
                setTimeout(processBatch, 0); // Continue with next batch
            } else {
                // All simulations are complete
                finishSimulation(fixedCost, armCosts, armRatePaths, fixedRate, armInitialRate, loanTerm);
            }
        }
        
        // Start processing batches
        processBatch();
    } catch (error) {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.visibility = 'hidden';
        
        // Show error message
        alert('Error: ' + error.message);
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
 * Calculate fixed-rate mortgage total cost
 */
function calculateFixedCost(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) {
        return principal;
    }
    
    const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return monthlyPayment * numPayments;
}

/**
 * Simulate future ARM rates with mean reversion and level-based sampling
 * This replaces the original simulateArmRates function in the mortgage-simulation.js file
 */
function simulateArmRates(initialRate, margin, initialCap, annualCap, lifetimeCap, years) {
    // First 5 years are at the fixed initial rate
    const annualRates = Array(5).fill(initialRate);
    
    // Create a level-based distribution of historical rates
    // We'll use the monthlyTreasuryRates array from historical-data.js
    const historicalRateLevels = monthlyTreasuryRates.map(data => data.rate);
    
    // Calculate long-term average for mean reversion
    // Use more recent data (last 20 years) to better reflect modern monetary policy
    const recentRateLevels = historicalTreasuryRates
        .filter(data => data.date >= new Date('1965-01-01'))
        .map(data => data.rate);
    const longTermAverage = recentRateLevels.reduce((sum, rate) => sum + rate, 0) / recentRateLevels.length;
    
    // Mean reversion strength (between 0 and 1)
    // Higher values mean stronger reversion to the long-term average
    const meanReversionStrength = 0;
    
    // Get current index rate (most recent historical value)
    let currentIndexRate = getLatestRate();
    
    // Remaining years after the 5-year fixed period
    const numRemainingYears = years - 5;
    
    // Last ARM rate is the initial rate
    let lastArmRate = initialRate;
    
    for (let year = 0; year < numRemainingYears; year++) {
        // Apply mean reversion - pull current rate toward long-term average
        const reversionEffect = (longTermAverage - currentIndexRate) * meanReversionStrength;
        
        // Sample a random rate level from historical data
        const randomIndex = Math.floor(Math.random() * historicalRateLevels.length);
        const sampledRateLevel = historicalRateLevels[randomIndex];
        
        // Blend the sampled rate, current rate, and mean reversion effect
        // This makes the simulation more realistic with some persistence and mean reversion
        currentIndexRate = currentIndexRate * 0.4 + sampledRateLevel * 0.4 + reversionEffect;
        
        // Apply a floor for index rate
        currentIndexRate = Math.max(0.5, currentIndexRate);
        
        // Calculate new ARM rate (index + margin)
        let newArmRate = currentIndexRate + margin;
        
        // Apply caps (and also allow for decreases)
        if (year === 0) {
            // First adjustment after fixed period - apply initial adjustment cap
            const maxIncrease = initialCap;
            if (newArmRate > lastArmRate + maxIncrease) {
                newArmRate = lastArmRate + maxIncrease;
            }
            // No floor on decrease for first adjustment (other than the 0.5% absolute floor)
        } else {
            // Subsequent adjustments - apply periodic adjustment cap
            const maxIncrease = annualCap;
            if (newArmRate > lastArmRate + maxIncrease) {
                newArmRate = lastArmRate + maxIncrease;
            }
            // No floor on decrease for subsequent adjustments (other than the 0.5% absolute floor)
        }
        
        // Apply lifetime cap
        const lifetimeMax = initialRate + lifetimeCap;
        if (newArmRate > lifetimeMax) {
            newArmRate = lifetimeMax;
        }
        
        // Ensure rate doesn't go below 0.5% absolute floor
        newArmRate = Math.max(newArmRate, 0.5);
        
        annualRates.push(newArmRate);
        lastArmRate = newArmRate;
    }
    
    // Convert annual rates to monthly rates
    const monthlyRates = [];
    for (const annualRate of annualRates) {
        const monthlyRate = annualRate / 100 / 12;
        for (let i = 0; i < 12; i++) {
            monthlyRates.push(monthlyRate);
        }
    }
    
    return [monthlyRates, annualRates];
}

/**
 * This function can be used to analyze the distribution of simulated rate paths
 * It's not part of the main application but can be used for testing
 */
function analyzeSimulatedRatePaths(initialRate, margin, initialCap, annualCap, lifetimeCap, years, numSimulations) {
    const allPaths = [];
    
    for (let i = 0; i < numSimulations; i++) {
        const [_, annualRates] = simulateArmRates(initialRate, margin, initialCap, annualCap, lifetimeCap, years);
        allPaths.push(annualRates);
    }
    
    // Calculate statistics for each year
    const yearlyStats = [];
    
    for (let year = 0; year < years; year++) {
        const ratesForYear = allPaths.map(path => path[year] || 0);
        ratesForYear.sort((a, b) => a - b);
        
        const min = ratesForYear[0];
        const max = ratesForYear[ratesForYear.length - 1];
        const median = ratesForYear[Math.floor(ratesForYear.length * 0.5)];
        const lowerQuantile = ratesForYear[Math.floor(ratesForYear.length * 0.05)];
        const upperQuantile = ratesForYear[Math.floor(ratesForYear.length * 0.95)];
        const average = ratesForYear.reduce((sum, rate) => sum + rate, 0) / ratesForYear.length;
        
        yearlyStats.push({
            year: year + 1,
            min,
            max,
            median,
            lowerQuantile,
            upperQuantile,
            average
        });
    }
    
    return yearlyStats;
}

/**
 * Calculate the total cost of an ARM mortgage over time
 */
function calculateArmCost(principal, monthlyRates) {
    let remainingPrincipal = principal;
    let totalPaid = 0;
    
    // Payment recalculation months (at beginning and then annually after fixed period)
    const recalcMonths = [0].concat([...Array(26).keys()].map(i => (5 + i) * 12));
    
    let currentPayment = null;
    
    for (let month = 0; month < monthlyRates.length; month++) {
        const rate = monthlyRates[month];
        
        // Recalculate payment at start and annually after fixed period
        if (recalcMonths.includes(month)) {
            const remainingMonths = monthlyRates.length - month;
            
            if (rate === 0) {
                currentPayment = remainingPrincipal / remainingMonths;
            } else {
                currentPayment = (remainingPrincipal * rate * Math.pow(1 + rate, remainingMonths)) / 
                               (Math.pow(1 + rate, remainingMonths) - 1);
            }
        }
        
        // Calculate interest and principal payment
        const interest = remainingPrincipal * rate;
        const principalPayment = Math.min(currentPayment - interest, remainingPrincipal);
        
        // Update remaining principal
        remainingPrincipal -= principalPayment;
        
        // Update total paid
        totalPaid += currentPayment;
        
        // Handle final payment rounding issues
        if (remainingPrincipal < 0.01) {
            remainingPrincipal = 0;
        }
    }
    
    return totalPaid;
}

/**
 * Process simulation results and update UI
 */
function finishSimulation(fixedCost, armCosts, armRatePaths, fixedRate, armInitialRate, loanTerm) {
    // Calculate statistics
    const armMean = armCosts.reduce((sum, cost) => sum + cost, 0) / armCosts.length;
    
    // Sort for median and percentiles
    const sortedCosts = [...armCosts].sort((a, b) => a - b);
    const armMedian = sortedCosts[Math.floor(sortedCosts.length / 2)];
    
    // Calculate standard deviation
    const armStd = Math.sqrt(
        armCosts.reduce((sum, cost) => sum + Math.pow(cost - armMean, 2), 0) / armCosts.length
    );
    
    const armMin = Math.min(...armCosts);
    const armMax = Math.max(...armCosts);
    
    // Calculate 95% confidence interval
    const armCiLowIndex = Math.floor(sortedCosts.length * 0.025);
    const armCiHighIndex = Math.floor(sortedCosts.length * 0.975);
    const armCiLow = sortedCosts[armCiLowIndex];
    const armCiHigh = sortedCosts[armCiHighIndex];
    
    // Probability that ARM is cheaper
    const probArmCheaper = armCosts.filter(cost => cost < fixedCost).length / armCosts.length * 100;
    
    // Expected savings with ARM
    const expectedSavings = fixedCost - armMedian;
    
    // Determine which option is better based on median
    let conclusion, confidenceStatement;
    if (fixedCost < armMedian) {
        conclusion = "Based on historical patterns, the fixed-rate mortgage is likely to be less expensive.";
        confidenceStatement = `The ARM was more expensive in ${(100 - probArmCheaper).toFixed(1)}% of simulations.`;
    } else {
        conclusion = "Based on historical patterns, the 5/1 ARM is likely to be less expensive.";
        confidenceStatement = `The ARM was less expensive in ${probArmCheaper.toFixed(1)}% of simulations.`;
    }
    
    // Format results text
    const resultsText = 
        `Fixed-Rate (${fixedRate}%) Total Cost: $${formatMoney(fixedCost)}\n` +
        `5/1 ARM (Initial: ${armInitialRate}%) Median Cost: $${formatMoney(armMedian)}\n` +
        `Expected Savings with ${expectedSavings > 0 ? 'ARM' : 'Fixed Rate'}: $${formatMoney(Math.abs(expectedSavings))}\n` +
        `5/1 ARM 95% Confidence Interval: $${formatMoney(armCiLow)} to $${formatMoney(armCiHigh)}\n\n` +
        `${conclusion} ${confidenceStatement}`;
    
    // Update results text
    document.getElementById('resultsText').innerText = resultsText;
    
    // Update charts
    updateCharts(fixedCost, armCosts, armRatePaths, fixedRate, armInitialRate, loanTerm, 
                armMedian, armCiLow, armCiHigh, probArmCheaper);
    
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
function updateCharts(fixedCost, armCosts, armRatePaths, fixedRate, armInitialRate, loanTerm, 
                    armMedian, armCiLow, armCiHigh, probArmCheaper) {
    // Clear previous charts
    distributionChart.data.labels = [];
    distributionChart.data.datasets = [];
    savingsChart.data.labels = [];
    savingsChart.data.datasets = [];
    ratePathsChart.data.labels = [];
    ratePathsChart.data.datasets = [];
    
    // 1. Distribution of ARM costs
    // Create histogram data
    const min = Math.min(...armCosts);
    const max = Math.max(...armCosts);
    const range = max - min;
    const numBins = 30;
    const binWidth = range / numBins;
    
    const bins = Array(numBins).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < numBins; i++) {
        const binStart = min + (i * binWidth);
        const binEnd = binStart + binWidth;
        binLabels.push(`$${formatMoney(binStart)}`);
        
        // Count values in this bin
        for (const cost of armCosts) {
            if (cost >= binStart && (cost < binEnd || (i === numBins - 1 && cost <= binEnd))) {
                bins[i]++;
            }
        }
    }
    
    // Update distribution chart
    distributionChart.data.labels = binLabels;
    distributionChart.data.datasets = [
        {
            label: 'Frequency',
            data: bins,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }
    ];
    
    // Add reference lines
    distributionChart.options.plugins.annotation = {
        annotations: {
            fixedRateLine: {
                type: 'line',
                yMin: 0,
                yMax: Math.max(...bins),
                xMin: findClosestBinIndex(fixedCost, min, binWidth),
                xMax: findClosestBinIndex(fixedCost, min, binWidth),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                label: {
                    content: 'Fixed Rate',
                    enabled: true,
                    position: 'top'
                }
            },
            medianLine: {
                type: 'line',
                yMin: 0,
                yMax: Math.max(...bins),
                xMin: findClosestBinIndex(armMedian, min, binWidth),
                xMax: findClosestBinIndex(armMedian, min, binWidth),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                label: {
                    content: 'ARM Median',
                    enabled: true,
                    position: 'top'
                }
            }
        }
    };
    
    // 2. Savings/Loss with ARM vs Fixed
    // Calculate savings
    const savings = armCosts.map(cost => fixedCost - cost);
    
    // Create histogram data for savings
    const savingsMin = Math.min(...savings);
    const savingsMax = Math.max(...savings);
    const savingsRange = savingsMax - savingsMin;
    const savingsBinWidth = savingsRange / numBins;
    
    const savingsBins = Array(numBins).fill(0);
    const savingsBinLabels = [];
    
    for (let i = 0; i < numBins; i++) {
        const binStart = savingsMin + (i * savingsBinWidth);
        const binEnd = binStart + savingsBinWidth;
        savingsBinLabels.push(`$${formatMoney(binStart)}`);
        
        // Count values in this bin
        for (const saving of savings) {
            if (saving >= binStart && (saving < binEnd || (i === numBins - 1 && saving <= binEnd))) {
                savingsBins[i]++;
            }
        }
    }
    
    // Update savings chart
    savingsChart.data.labels = savingsBinLabels;
    savingsChart.data.datasets = [
        {
            label: 'Frequency',
            data: savingsBins,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }
    ];
    
    // Add reference line at zero
    savingsChart.options.plugins.annotation = {
        annotations: {
            zeroLine: {
                type: 'line',
                yMin: 0,
                yMax: Math.max(...savingsBins),
                xMin: findClosestBinIndex(0, savingsMin, savingsBinWidth),
                xMax: findClosestBinIndex(0, savingsMin, savingsBinWidth),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                label: {
                    content: 'Break Even',
                    enabled: true,
                    position: 'top'
                }
            }
        }
    };
    
    // 3. Sample of ARM rate paths
    // Create labels for years
    const yearLabels = [];
    for (let i = 1; i <= loanTerm; i++) {
        yearLabels.push(`Year ${i}`);
    }
    
    // Add sample rate paths
    const datasets = [];
    
    // Add sample paths
    for (let i = 0; i < Math.min(5, armRatePaths.length); i++) {
        datasets.push({
            label: `Sample Path ${i + 1}`,
            data: armRatePaths[i],
            borderColor: `rgba(54, 162, 235, ${0.3 + (i * 0.1)})`,
            backgroundColor: 'transparent',
            borderWidth: 1,
            pointRadius: 0
        });
    }
    
    // Calculate statistics for rate paths
    if (armRatePaths.length > 0) {
        // Create arrays for each year's statistics
        const medianPath = [];
        const lowerPath = []; // 5th percentile
        const upperPath = []; // 95th percentile
        const minPath = [];
        const maxPath = [];
        
        for (let year = 0; year < loanTerm; year++) {
            const ratesForYear = armRatePaths.map(path => path[year] || 0);
            ratesForYear.sort((a, b) => a - b);
            
            // Calculate statistics for this year
            minPath.push(ratesForYear[0]);
            maxPath.push(ratesForYear[ratesForYear.length - 1]);
            
            const lowerIdx = Math.floor(ratesForYear.length * 0.05);
            const medianIdx = Math.floor(ratesForYear.length * 0.5);
            const upperIdx = Math.floor(ratesForYear.length * 0.95);
            
            lowerPath.push(ratesForYear[lowerIdx]);
            medianPath.push(ratesForYear[medianIdx]);
            upperPath.push(ratesForYear[upperIdx]);
        }
        
        // Add 95% confidence interval band
        datasets.push({
            label: '95% Confidence Interval',
            data: upperPath,
            borderColor: 'rgba(75, 192, 192, 0.3)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 1,
            pointRadius: 0,
            fill: '+1'
        });
        
        // Add median path
        datasets.push({
            label: 'Median ARM Rate',
            data: medianPath,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 1
        });
        
        // Add lower bound of confidence interval
        datasets.push({
            label: 'Lower 5%',
            data: lowerPath,
            borderColor: 'rgba(75, 192, 192, 0.3)',
            backgroundColor: 'transparent',
            borderWidth: 1,
            pointRadius: 0,
            fill: false
        });
    }
    
    // Add fixed rate reference line
    datasets.push({
        label: 'Fixed Rate',
        data: Array(loanTerm).fill(fixedRate),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
    });
    
    // Update rate paths chart
    ratePathsChart.data.labels = yearLabels;
    ratePathsChart.data.datasets = datasets;
    
    // Update all charts
    distributionChart.update();
    savingsChart.update();
    ratePathsChart.update();
}

/**
 * Find the closest bin index for a value
 */
function findClosestBinIndex(value, min, binWidth) {
    return (value - min) / binWidth;
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