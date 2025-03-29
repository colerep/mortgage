/**
 * Historical S&P 500 Total Return Data (1928-2024)
 * 
 * This data is used for simulating stock market returns
 * Values represent annual total returns including dividends
 * Source: Historical S&P 500 data
 */
const historicalSP500Returns = [
    // 1920s
    {year: 1928, return: 37.88},
    {year: 1929, return: -11.91},
    // 1930s
    {year: 1930, return: -28.48},
    {year: 1931, return: -47.07},
    {year: 1932, return: -15.15},
    {year: 1933, return: 46.59},
    {year: 1934, return: -5.94},
    {year: 1935, return: 41.37},
    {year: 1936, return: 27.92},
    {year: 1937, return: -38.59},
    {year: 1938, return: 25.21},
    {year: 1939, return: -5.45},
    // 1940s
    {year: 1940, return: -15.29},
    {year: 1941, return: -17.86},
    {year: 1942, return: 12.43},
    {year: 1943, return: 19.45},
    {year: 1944, return: 13.80},
    {year: 1945, return: 30.72},
    {year: 1946, return: -11.87},
    {year: 1947, return: 0.00},
    {year: 1948, return: -0.65},
    {year: 1949, return: 10.26},
    // 1950s
    {year: 1950, return: 21.78},
    {year: 1951, return: 16.46},
    {year: 1952, return: 11.78},
    {year: 1953, return: -6.62},
    {year: 1954, return: 45.02},
    {year: 1955, return: 26.40},
    {year: 1956, return: 2.62},
    {year: 1957, return: -14.31},
    {year: 1958, return: 38.06},
    {year: 1959, return: 8.48},
    // 1960s
    {year: 1960, return: -2.97},
    {year: 1961, return: 23.13},
    {year: 1962, return: -11.81},
    {year: 1963, return: 18.89},
    {year: 1964, return: 12.97},
    {year: 1965, return: 9.06},
    {year: 1966, return: -13.09},
    {year: 1967, return: 20.09},
    {year: 1968, return: 7.66},
    {year: 1969, return: -11.36},
    // 1970s
    {year: 1970, return: 0.10},
    {year: 1971, return: 10.79},
    {year: 1972, return: 15.63},
    {year: 1973, return: -17.37},
    {year: 1974, return: -29.72},
    {year: 1975, return: 31.55},
    {year: 1976, return: 19.15},
    {year: 1977, return: -11.50},
    {year: 1978, return: 1.06},
    {year: 1979, return: 12.31},
    // 1980s
    {year: 1980, return: 25.77},
    {year: 1981, return: -9.73},
    {year: 1982, return: 14.76},
    {year: 1983, return: 17.27},
    {year: 1984, return: 1.40},
    {year: 1985, return: 26.33},
    {year: 1986, return: 14.62},
    {year: 1987, return: 2.03},
    {year: 1988, return: 12.40},
    {year: 1989, return: 27.25},
    // 1990s
    {year: 1990, return: -6.56},
    {year: 1991, return: 26.31},
    {year: 1992, return: 4.46},
    {year: 1993, return: 7.06},
    {year: 1994, return: -1.54},
    {year: 1995, return: 34.11},
    {year: 1996, return: 20.26},
    {year: 1997, return: 31.01},
    {year: 1998, return: 26.67},
    {year: 1999, return: 19.53},
    // 2000s
    {year: 2000, return: -10.14},
    {year: 2001, return: -13.04},
    {year: 2002, return: -23.37},
    {year: 2003, return: 26.38},
    {year: 2004, return: 8.99},
    {year: 2005, return: 3.00},
    {year: 2006, return: 13.62},
    {year: 2007, return: 3.53},
    {year: 2008, return: -38.49},
    {year: 2009, return: 23.45},
    // 2010s
    {year: 2010, return: 12.78},
    {year: 2011, return: 0.00},
    {year: 2012, return: 13.41},
    {year: 2013, return: 29.60},
    {year: 2014, return: 11.39},
    {year: 2015, return: -0.73},
    {year: 2016, return: 9.54},
    {year: 2017, return: 19.42},
    {year: 2018, return: -6.24},
    {year: 2019, return: 28.88},
    // 2020s
    {year: 2020, return: 16.26},
    {year: 2021, return: 26.89},
    {year: 2022, return: -19.44},
    {year: 2023, return: 24.23},
    {year: 2024, return: 23.31}
];

/**
 * Get all possible 30-year periods from the data
 * @returns {Array} Array of 30-year period returns
 */
function getAllThirtyYearPeriods() {
    const periods = [];
    
    // For each possible starting year
    for (let i = 0; i <= historicalSP500Returns.length - 30; i++) {
        const startYear = historicalSP500Returns[i].year;
        const endYear = startYear + 29;
        
        // Extract the returns for this 30-year period
        const periodReturns = historicalSP500Returns.slice(i, i + 30).map(item => item.return);
        
        periods.push({
            startYear,
            endYear,
            returns: periodReturns
        });
    }
    
    return periods;
}

/**
 * Get all possible N-year periods from the data
 * @param {number} years - Number of years for each period
 * @returns {Array} Array of N-year period returns
 */
function getAllPeriods(years) {
    if (years <= 0 || years > historicalSP500Returns.length) {
        throw new Error("Invalid period length");
    }
    
    const periods = [];
    
    // For each possible starting year
    for (let i = 0; i <= historicalSP500Returns.length - years; i++) {
        const startYear = historicalSP500Returns[i].year;
        const endYear = startYear + years - 1;
        
        // Extract the returns for this period
        const periodReturns = historicalSP500Returns.slice(i, i + years).map(item => item.return);
        
        periods.push({
            startYear,
            endYear,
            returns: periodReturns
        });
    }
    
    return periods;
}

/**
 * Calculate the compound annual growth rate (CAGR) for a period
 * @param {Array} returns - Array of annual returns (as percentages)
 * @returns {number} The compound annual growth rate
 */
function calculateCAGR(returns) {
    // Convert percentage returns to multipliers (e.g., 10% becomes 1.10)
    const multipliers = returns.map(ret => 1 + (ret / 100));
    
    // Multiply all values
    const totalReturn = multipliers.reduce((acc, val) => acc * val, 1);
    
    // Calculate CAGR
    const years = returns.length;
    const cagr = (Math.pow(totalReturn, 1 / years) - 1) * 100;
    
    return cagr;
}

/**
 * Get statistics about all 30-year periods
 * @returns {Object} Statistics about the 30-year periods
 */
function getThirtyYearStatistics() {
    const periods = getAllThirtyYearPeriods();
    const cagrs = periods.map(period => calculateCAGR(period.returns));
    
    // Sort CAGRs to find percentiles
    const sortedCagrs = [...cagrs].sort((a, b) => a - b);
    
    return {
        count: periods.length,
        minCAGR: Math.min(...cagrs),
        maxCAGR: Math.max(...cagrs),
        medianCAGR: sortedCagrs[Math.floor(sortedCagrs.length / 2)],
        avgCAGR: cagrs.reduce((sum, cagr) => sum + cagr, 0) / cagrs.length,
        percentile10: sortedCagrs[Math.floor(sortedCagrs.length * 0.1)],
        percentile90: sortedCagrs[Math.floor(sortedCagrs.length * 0.9)]
    };
}