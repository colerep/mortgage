/**
 * Historical 1-year Treasury rate data (1962-2025)
 * 
 * This data is used for simulating ARM interest rate changes
 * Source: Federal Reserve Economic Data (FRED) - 1-Year Treasury Constant Maturity Rate
 */
const historicalTreasuryRates = [
    // 1960s
    {date: new Date('1962-01-01'), rate: 2.90},
    {date: new Date('1963-01-01'), rate: 2.93},
    {date: new Date('1964-01-01'), rate: 3.55},
    {date: new Date('1965-01-01'), rate: 3.95},
    {date: new Date('1966-01-01'), rate: 4.65},
    {date: new Date('1967-01-01'), rate: 4.61},
    {date: new Date('1968-01-01'), rate: 5.07},
    {date: new Date('1969-01-01'), rate: 6.30},
    // 1970s (period of rising rates)
    {date: new Date('1970-01-01'), rate: 7.91},
    {date: new Date('1971-01-01'), rate: 4.91},
    {date: new Date('1972-01-01'), rate: 4.07},
    {date: new Date('1973-01-01'), rate: 5.94},
    {date: new Date('1974-01-01'), rate: 7.38},
    {date: new Date('1975-01-01'), rate: 7.13},
    {date: new Date('1976-01-01'), rate: 5.87},
    {date: new Date('1977-01-01'), rate: 5.10},
    {date: new Date('1978-01-01'), rate: 7.22},
    {date: new Date('1979-01-01'), rate: 10.04},
    // 1980s (high rate period)
    {date: new Date('1980-01-01'), rate: 12.06},
    {date: new Date('1980-07-01'), rate: 9.82},
    {date: new Date('1981-01-01'), rate: 13.82},
    {date: new Date('1981-07-01'), rate: 16.30},
    {date: new Date('1982-01-01'), rate: 14.57},
    {date: new Date('1982-07-01'), rate: 12.92},
    {date: new Date('1983-01-01'), rate: 8.62},
    {date: new Date('1983-07-01'), rate: 9.40},
    {date: new Date('1984-01-01'), rate: 9.90},
    {date: new Date('1984-07-01'), rate: 11.96},
    {date: new Date('1985-01-01'), rate: 9.00},
    {date: new Date('1985-07-01'), rate: 7.88},
    {date: new Date('1986-01-01'), rate: 7.73},
    {date: new Date('1986-07-01'), rate: 6.56},
    {date: new Date('1987-01-01'), rate: 5.87},
    {date: new Date('1987-07-01'), rate: 6.65},
    {date: new Date('1988-01-01'), rate: 6.83},
    {date: new Date('1988-07-01'), rate: 7.75},
    {date: new Date('1989-01-01'), rate: 9.16},
    {date: new Date('1989-07-01'), rate: 8.45},
    // 1990s
    {date: new Date('1990-01-01'), rate: 8.21},
    {date: new Date('1990-07-01'), rate: 8.15},
    {date: new Date('1991-01-01'), rate: 6.91},
    {date: new Date('1991-07-01'), rate: 6.26},
    {date: new Date('1992-01-01'), rate: 4.43},
    {date: new Date('1992-07-01'), rate: 3.68},
    {date: new Date('1993-01-01'), rate: 3.51},
    {date: new Date('1993-07-01'), rate: 3.43},
    {date: new Date('1994-01-01'), rate: 3.54},
    {date: new Date('1994-07-01'), rate: 5.28},
    {date: new Date('1995-01-01'), rate: 7.05},
    {date: new Date('1995-07-01'), rate: 5.85},
    {date: new Date('1996-01-01'), rate: 5.09},
    {date: new Date('1996-07-01'), rate: 5.64},
    {date: new Date('1997-01-01'), rate: 5.61},
    {date: new Date('1997-07-01'), rate: 5.60},
    {date: new Date('1998-01-01'), rate: 5.24},
    {date: new Date('1998-07-01'), rate: 5.46},
    {date: new Date('1999-01-01'), rate: 4.51},
    {date: new Date('1999-07-01'), rate: 5.00},
    // 2000s
    {date: new Date('2000-01-01'), rate: 6.12},
    {date: new Date('2000-07-01'), rate: 6.21},
    {date: new Date('2001-01-01'), rate: 5.16},
    {date: new Date('2001-07-01'), rate: 3.65},
    {date: new Date('2002-01-01'), rate: 2.14},
    {date: new Date('2002-07-01'), rate: 1.93},
    {date: new Date('2003-01-01'), rate: 1.37},
    {date: new Date('2003-07-01'), rate: 1.08},
    {date: new Date('2004-01-01'), rate: 1.13},
    {date: new Date('2004-07-01'), rate: 1.80},
    {date: new Date('2005-01-01'), rate: 2.78},
    {date: new Date('2005-07-01'), rate: 3.61},
    {date: new Date('2006-01-01'), rate: 4.42},
    {date: new Date('2006-07-01'), rate: 5.11},
    {date: new Date('2007-01-01'), rate: 5.05},
    {date: new Date('2007-07-01'), rate: 4.82},
    {date: new Date('2008-01-01'), rate: 2.71},
    {date: new Date('2008-07-01'), rate: 2.36},
    {date: new Date('2009-01-01'), rate: 0.44},
    {date: new Date('2009-07-01'), rate: 0.56},
    // 2010s (low rate period)
    {date: new Date('2010-01-01'), rate: 0.35},
    {date: new Date('2010-07-01'), rate: 0.29},
    {date: new Date('2011-01-01'), rate: 0.29},
    {date: new Date('2011-07-01'), rate: 0.19},
    {date: new Date('2012-01-01'), rate: 0.12},
    {date: new Date('2012-07-01'), rate: 0.17},
    {date: new Date('2013-01-01'), rate: 0.14},
    {date: new Date('2013-07-01'), rate: 0.15},
    {date: new Date('2014-01-01'), rate: 0.13},
    {date: new Date('2014-07-01'), rate: 0.12},
    {date: new Date('2015-01-01'), rate: 0.25},
    {date: new Date('2015-07-01'), rate: 0.31},
    {date: new Date('2016-01-01'), rate: 0.65},
    {date: new Date('2016-07-01'), rate: 0.51},
    {date: new Date('2017-01-01'), rate: 0.85},
    {date: new Date('2017-07-01'), rate: 1.22},
    {date: new Date('2018-01-01'), rate: 1.89},
    {date: new Date('2018-07-01'), rate: 2.44},
    {date: new Date('2019-01-01'), rate: 2.57},
    {date: new Date('2019-07-01'), rate: 1.94},
    // 2020s
    {date: new Date('2020-01-01'), rate: 1.53},
    {date: new Date('2020-04-01'), rate: 0.23},
    {date: new Date('2020-07-01'), rate: 0.16},
    {date: new Date('2020-10-01'), rate: 0.13},
    {date: new Date('2021-01-01'), rate: 0.10},
    {date: new Date('2021-04-01'), rate: 0.06},
    {date: new Date('2021-07-01'), rate: 0.07},
    {date: new Date('2021-10-01'), rate: 0.13},
    {date: new Date('2022-01-01'), rate: 0.51},
    {date: new Date('2022-04-01'), rate: 1.64},
    {date: new Date('2022-07-01'), rate: 2.83},
    {date: new Date('2022-10-01'), rate: 4.08},
    {date: new Date('2023-01-01'), rate: 4.65},
    {date: new Date('2023-04-01'), rate: 4.69},
    {date: new Date('2023-07-01'), rate: 5.12},
    {date: new Date('2023-10-01'), rate: 5.39},
    {date: new Date('2024-01-01'), rate: 4.57},
    {date: new Date('2024-04-01'), rate: 4.83},
    {date: new Date('2024-07-01'), rate: 4.35},
    {date: new Date('2024-10-01'), rate: 4.15},
    {date: new Date('2025-01-01'), rate: 4.10}
];

/**
 * Generate monthly data by linearly interpolating the data points
 */
function generateMonthlyRates() {
    const sortedRates = [...historicalTreasuryRates].sort((a, b) => a.date - b.date);
    const monthlyRates = [];
    
    // Iterate through each pair of data points
    for (let i = 0; i < sortedRates.length - 1; i++) {
        const startDate = sortedRates[i].date;
        const endDate = sortedRates[i + 1].date;
        const startRate = sortedRates[i].rate;
        const endRate = sortedRates[i + 1].rate;
        
        // Calculate the number of months between the dates
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
        
        // Add the start point
        monthlyRates.push({
            date: new Date(startDate),
            rate: startRate
        });
        
        // Interpolate intermediate months
        if (months > 1) {
            const rateStep = (endRate - startRate) / months;
            for (let j = 1; j < months; j++) {
                const interpolatedDate = new Date(startDate);
                interpolatedDate.setMonth(startDate.getMonth() + j);
                
                monthlyRates.push({
                    date: interpolatedDate,
                    rate: startRate + (rateStep * j)
                });
            }
        }
    }
    
    // Add the last data point
    monthlyRates.push({
        date: new Date(sortedRates[sortedRates.length - 1].date),
        rate: sortedRates[sortedRates.length - 1].rate
    });
    
    return monthlyRates;
}

// Generate the monthly data when the script loads
const monthlyTreasuryRates = generateMonthlyRates();

/**
 * Calculate year-to-year changes in rates for simulation
 */
function calculateRateChanges() {
    const sortedRates = [...historicalTreasuryRates].sort((a, b) => a.date - b.date);
    const changes = [];
    
    for (let i = 0; i < sortedRates.length - 1; i++) {
        const currentDate = sortedRates[i].date;
        const nextDate = sortedRates[i + 1].date;
        
        // Only consider pairs that are roughly a year apart (10-14 months)
        const monthsDiff = (nextDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                          (nextDate.getMonth() - currentDate.getMonth());
        
        if (monthsDiff >= 10 && monthsDiff <= 14) {
            changes.push(sortedRates[i + 1].rate - sortedRates[i].rate);
        }
    }
    
    return changes;
}

// Calculate the annual changes for simulation
const annualRateChanges = calculateRateChanges();

// Add a function to get the most recent rate
function getLatestRate() {
    const sortedRates = [...historicalTreasuryRates].sort((a, b) => b.date - a.date);
    return sortedRates[0].rate;
}