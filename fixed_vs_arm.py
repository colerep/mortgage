import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import tkinter as tk
from tkinter import ttk, messagebox
import requests
from io import StringIO
import threading
import os

# Set visual style
sns.set_style("whitegrid")
plt.rcParams["font.family"] = "serif"

class MortgageComparisonApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Mortgage Comparison Tool: 5/1 ARM vs Fixed Rate")
        self.root.geometry("1000x800")
        self.root.resizable(True, True)
        
        # Create frame for inputs
        input_frame = ttk.LabelFrame(root, text="Mortgage Parameters")
        input_frame.pack(padx=10, pady=10, fill="x")
        
        # Loan amount
        ttk.Label(input_frame, text="Loan Amount ($):").grid(row=0, column=0, sticky="w", padx=5, pady=5)
        self.loan_amount = ttk.Entry(input_frame)
        self.loan_amount.insert(0, "300000")
        self.loan_amount.grid(row=0, column=1, padx=5, pady=5)
        
        # Loan term
        ttk.Label(input_frame, text="Loan Term (years):").grid(row=1, column=0, sticky="w", padx=5, pady=5)
        self.loan_term = ttk.Entry(input_frame)
        self.loan_term.insert(0, "30")
        self.loan_term.grid(row=1, column=1, padx=5, pady=5)
        
        # Fixed rate
        ttk.Label(input_frame, text="Fixed Rate (%):").grid(row=2, column=0, sticky="w", padx=5, pady=5)
        self.fixed_rate = ttk.Entry(input_frame)
        self.fixed_rate.insert(0, "6.75")
        self.fixed_rate.grid(row=2, column=1, padx=5, pady=5)
        
        # ARM Initial rate
        ttk.Label(input_frame, text="5/1 ARM Initial Rate (%):").grid(row=3, column=0, sticky="w", padx=5, pady=5)
        self.arm_rate = ttk.Entry(input_frame)
        self.arm_rate.insert(0, "6.25")
        self.arm_rate.grid(row=3, column=1, padx=5, pady=5)
        
        # ARM Margin
        ttk.Label(input_frame, text="ARM Margin (%):").grid(row=4, column=0, sticky="w", padx=5, pady=5)
        self.arm_margin = ttk.Entry(input_frame)
        self.arm_margin.insert(0, "2.75")
        self.arm_margin.grid(row=4, column=1, padx=5, pady=5)
        
        # ARM Rate Caps
        ttk.Label(input_frame, text="ARM Rate Caps (Initial/Annual/Lifetime %):").grid(row=5, column=0, sticky="w", padx=5, pady=5)
        caps_frame = ttk.Frame(input_frame)
        caps_frame.grid(row=5, column=1, padx=5, pady=5)
        
        self.initial_cap = ttk.Entry(caps_frame, width=5)
        self.initial_cap.insert(0, "2")
        self.initial_cap.pack(side=tk.LEFT, padx=2)
        
        ttk.Label(caps_frame, text="/").pack(side=tk.LEFT)
        
        self.annual_cap = ttk.Entry(caps_frame, width=5)
        self.annual_cap.insert(0, "2")
        self.annual_cap.pack(side=tk.LEFT, padx=2)
        
        ttk.Label(caps_frame, text="/").pack(side=tk.LEFT)
        
        self.lifetime_cap = ttk.Entry(caps_frame, width=5)
        self.lifetime_cap.insert(0, "5")
        self.lifetime_cap.pack(side=tk.LEFT, padx=2)
        
        # Number of simulations
        ttk.Label(input_frame, text="Number of Monte Carlo Simulations:").grid(row=6, column=0, sticky="w", padx=5, pady=5)
        self.num_simulations = ttk.Entry(input_frame)
        self.num_simulations.insert(0, "1000")
        self.num_simulations.grid(row=6, column=1, padx=5, pady=5)
        
        # Run simulation button
        self.run_button = ttk.Button(input_frame, text="Run Simulation", command=self.start_simulation)
        self.run_button.grid(row=7, column=0, columnspan=2, padx=5, pady=10)
        
        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(input_frame, variable=self.progress_var, maximum=100)
        self.progress_bar.grid(row=8, column=0, columnspan=2, padx=5, pady=5, sticky="ew")
        
        # Create frame for outputs
        self.output_frame = ttk.LabelFrame(root, text="Simulation Results")
        self.output_frame.pack(padx=10, pady=10, fill="both", expand=True)
        
        # Status label
        self.status_label = ttk.Label(self.output_frame, text="Enter parameters and click 'Run Simulation'")
        self.status_label.pack(padx=10, pady=10)
        
        # Results text
        self.results_text = tk.Text(self.output_frame, height=6, width=80)
        self.results_text.pack(padx=10, pady=5, fill="x")
        
        # Figure for the plots
        self.fig = plt.Figure(figsize=(10, 8), dpi=100)
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.output_frame)
        self.canvas.get_tk_widget().pack(padx=10, pady=10, fill="both", expand=True)
        
        # Historical data
        self.historical_rates = None
        self.status_label.config(text="Loading historical interest rate data...")
        threading.Thread(target=self.load_historical_data, daemon=True).start()

    def load_historical_data(self):
        """Load historical interest rate data for 1-year Treasury rates."""
        try:
            # Try to load from FRED API (Federal Reserve Economic Data)
            url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=GS1"
            response = requests.get(url)
            
            if response.status_code == 200:
                data = pd.read_csv(StringIO(response.text))
                data.columns = ['date', 'rate']
                data['date'] = pd.to_datetime(data['date'])
                data = data.sort_values('date')
                data = data.dropna()
                
                self.historical_rates = data
                self.root.after(0, lambda: self.status_label.config(text="Historical data loaded successfully. Ready to run simulation."))
            else:
                self.root.after(0, lambda: self.status_label.config(text="Failed to load live data. Using embedded historical data."))
                self.load_embedded_historical_data()
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            self.root.after(0, lambda: self.status_label.config(text="Error loading live data. Using embedded historical data."))
            self.load_embedded_historical_data()
    
    def load_embedded_historical_data(self):
        """Load embedded historical 1-year Treasury rate data."""
        try:
            # Create a list of historical 1-year Treasury rate data points
            # This is a selection of key data points from 1962 to present
            # Format: List of [date_string, rate] pairs
            historical_data_points = [
                # 1960s
                ["1962-01-01", 2.90], ["1963-01-01", 2.93], ["1964-01-01", 3.55], 
                ["1965-01-01", 3.95], ["1966-01-01", 4.65], ["1967-01-01", 4.61],
                ["1968-01-01", 5.07], ["1969-01-01", 6.30],
                # 1970s (period of rising rates)
                ["1970-01-01", 7.91], ["1971-01-01", 4.91], ["1972-01-01", 4.07],
                ["1973-01-01", 5.94], ["1974-01-01", 7.38], ["1975-01-01", 7.13],
                ["1976-01-01", 5.87], ["1977-01-01", 5.10], ["1978-01-01", 7.22],
                ["1979-01-01", 10.04],
                # 1980s (high rate period)
                ["1980-01-01", 12.06], ["1980-07-01", 9.82], ["1981-01-01", 13.82],
                ["1981-07-01", 16.30], ["1982-01-01", 14.57], ["1982-07-01", 12.92],
                ["1983-01-01", 8.62], ["1983-07-01", 9.40], ["1984-01-01", 9.90],
                ["1984-07-01", 11.96], ["1985-01-01", 9.00], ["1985-07-01", 7.88],
                ["1986-01-01", 7.73], ["1986-07-01", 6.56], ["1987-01-01", 5.87],
                ["1987-07-01", 6.65], ["1988-01-01", 6.83], ["1988-07-01", 7.75],
                ["1989-01-01", 9.16], ["1989-07-01", 8.45],
                # 1990s
                ["1990-01-01", 8.21], ["1990-07-01", 8.15], ["1991-01-01", 6.91],
                ["1991-07-01", 6.26], ["1992-01-01", 4.43], ["1992-07-01", 3.68],
                ["1993-01-01", 3.51], ["1993-07-01", 3.43], ["1994-01-01", 3.54],
                ["1994-07-01", 5.28], ["1995-01-01", 7.05], ["1995-07-01", 5.85],
                ["1996-01-01", 5.09], ["1996-07-01", 5.64], ["1997-01-01", 5.61],
                ["1997-07-01", 5.60], ["1998-01-01", 5.24], ["1998-07-01", 5.46],
                ["1999-01-01", 4.51], ["1999-07-01", 5.00],
                # 2000s
                ["2000-01-01", 6.12], ["2000-07-01", 6.21], ["2001-01-01", 5.16],
                ["2001-07-01", 3.65], ["2002-01-01", 2.14], ["2002-07-01", 1.93],
                ["2003-01-01", 1.37], ["2003-07-01", 1.08], ["2004-01-01", 1.13],
                ["2004-07-01", 1.80], ["2005-01-01", 2.78], ["2005-07-01", 3.61],
                ["2006-01-01", 4.42], ["2006-07-01", 5.11], ["2007-01-01", 5.05],
                ["2007-07-01", 4.82], ["2008-01-01", 2.71], ["2008-07-01", 2.36],
                ["2009-01-01", 0.44], ["2009-07-01", 0.56],
                # 2010s (low rate period)
                ["2010-01-01", 0.35], ["2010-07-01", 0.29], ["2011-01-01", 0.29],
                ["2011-07-01", 0.19], ["2012-01-01", 0.12], ["2012-07-01", 0.17],
                ["2013-01-01", 0.14], ["2013-07-01", 0.15], ["2014-01-01", 0.13],
                ["2014-07-01", 0.12], ["2015-01-01", 0.25], ["2015-07-01", 0.31],
                ["2016-01-01", 0.65], ["2016-07-01", 0.51], ["2017-01-01", 0.85],
                ["2017-07-01", 1.22], ["2018-01-01", 1.89], ["2018-07-01", 2.44],
                ["2019-01-01", 2.57], ["2019-07-01", 1.94],
                # 2020s
                ["2020-01-01", 1.53], ["2020-04-01", 0.23], ["2020-07-01", 0.16],
                ["2020-10-01", 0.13], ["2021-01-01", 0.10], ["2021-04-01", 0.06],
                ["2021-07-01", 0.07], ["2021-10-01", 0.13], ["2022-01-01", 0.51],
                ["2022-04-01", 1.64], ["2022-07-01", 2.83], ["2022-10-01", 4.08],
                ["2023-01-01", 4.65], ["2023-04-01", 4.69], ["2023-07-01", 5.12],
                ["2023-10-01", 5.39], ["2024-01-01", 4.57], ["2024-04-01", 4.83],
                ["2024-07-01", 4.35], ["2024-10-01", 4.15], ["2025-01-01", 4.10]
            ]
            
            # Convert to DataFrame
            df = pd.DataFrame(historical_data_points, columns=['date', 'rate'])
            df['date'] = pd.to_datetime(df['date'])
            
            # Sort by date
            df = df.sort_values('date')
            
            # Resample to monthly frequency using linear interpolation
            df = df.set_index('date')
            monthly_df = df.resample('MS').asfreq()  # Monthly start frequency
            monthly_df['rate'] = monthly_df['rate'].interpolate(method='linear')
            
            # Reset index to get date as a column again
            monthly_df = monthly_df.reset_index()
            
            self.historical_rates = monthly_df
            self.root.after(0, lambda: self.status_label.config(
                text="Using embedded historical data. Ready to run simulation."))
            
        except Exception as e:
            print(f"Error loading embedded data: {str(e)}")
            self.root.after(0, lambda: self.status_label.config(
                text="Error loading embedded data. Generating synthetic data instead."))
            self.generate_synthetic_data()
    
    def generate_synthetic_data(self):
        """Generate synthetic interest rate data based on historical patterns.
        This is only used as a last resort if both live and embedded data fail.
        """
        # Create dates from 1954 to present (matching FRED GS1 data range)
        dates = pd.date_range(start='1954-01-01', end=pd.Timestamp.now(), freq='M')
        
        # Generate rates with historical-like properties
        # Start with a random walk with mean reversion
        np.random.seed(42)  # For reproducibility
        rates = np.zeros(len(dates))
        rates[0] = 3.0  # Starting value
        
        # Parameters based on historical data
        mean_rate = 4.5
        volatility = 1.2
        mean_reversion = 0.05
        
        for i in range(1, len(rates)):
            # Mean reversion random walk
            rates[i] = rates[i-1] + mean_reversion * (mean_rate - rates[i-1]) + volatility * np.random.normal() / np.sqrt(12)
            rates[i] = max(0.5, rates[i])  # Ensure rates don't go below 0.5%
        
        # Add some regime changes and persistence to make it more realistic
        # Create high inflation period similar to 1970s-early 1980s
        high_period_start = np.where(dates >= pd.Timestamp('1972-01-01'))[0][0]
        high_period_end = np.where(dates >= pd.Timestamp('1985-01-01'))[0][0]
        rates[high_period_start:high_period_end] = rates[high_period_start:high_period_end] * 2
        
        # Create low interest rate period similar to 2008-2015
        low_period_start = np.where(dates >= pd.Timestamp('2008-01-01'))[0][0]
        low_period_end = np.where(dates >= pd.Timestamp('2015-01-01'))[0][0]
        rates[low_period_start:low_period_end] = rates[low_period_start:low_period_end] * 0.5
        
        # Create DataFrame
        self.historical_rates = pd.DataFrame({
            'date': dates,
            'rate': rates
        })
    
    def calculate_fixed_payment(self, principal, annual_rate, years):
        """Calculate the monthly payment for a fixed-rate mortgage."""
        monthly_rate = annual_rate / 100 / 12
        num_payments = years * 12
        
        if monthly_rate == 0:
            return principal / num_payments
        
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)
        return monthly_payment
    
    def simulate_arm_rates(self, initial_rate, margin, initial_cap, annual_cap, lifetime_cap, years=30):
        """Simulate future ARM rates based on historical patterns."""
        # First 5 years are at the fixed initial rate
        annual_rates = [initial_rate] * 5
        
        # For the remaining years, simulate rates based on historical changes
        if self.historical_rates is not None and len(self.historical_rates) > 12:
            # Resample to annual data and calculate annual rates
            annual_hist_rates = self.historical_rates.set_index('date')['rate'].resample('Y').mean()
            
            # Calculate year-over-year changes
            annual_changes = annual_hist_rates.diff().dropna().values
            
            # Randomly sample from historical changes
            num_remaining_years = years - 5
            sampled_changes = np.random.choice(annual_changes, size=num_remaining_years, replace=True)
            
            # Current index rate (most recent historical value)
            current_index_rate = self.historical_rates['rate'].iloc[-1]
            
            # Calculate future rates (index + margin)
            future_index_rate = current_index_rate
            last_arm_rate = initial_rate
            
            for year, annual_change in enumerate(sampled_changes):
                # Apply the sampled change to the index rate
                future_index_rate += annual_change
                future_index_rate = max(0.5, future_index_rate)  # Floor at 0.5%
                
                # Calculate new ARM rate (index + margin)
                new_arm_rate = future_index_rate + margin
                
                # Apply caps
                if year == 0:  # First adjustment after fixed period
                    # Apply initial adjustment cap
                    max_increase = initial_cap
                    max_decrease = float('inf')  # No limit on decreases
                else:  # Subsequent adjustments
                    # Apply periodic adjustment cap
                    max_increase = annual_cap
                    max_decrease = float('inf')  # No limit on decreases
                
                # Apply caps
                if new_arm_rate > last_arm_rate + max_increase:
                    new_arm_rate = last_arm_rate + max_increase
                
                # Apply lifetime cap
                lifetime_max = initial_rate + lifetime_cap
                if new_arm_rate > lifetime_max:
                    new_arm_rate = lifetime_max
                
                annual_rates.append(new_arm_rate)
                last_arm_rate = new_arm_rate
        
        # Ensure we have exactly 'years' years
        annual_rates = annual_rates[:years]
        if len(annual_rates) < years:
            # If we don't have enough data, repeat the last value
            annual_rates.extend([annual_rates[-1]] * (years - len(annual_rates)))
        
        # Convert annual rates to monthly rates
        monthly_rates = []
        for annual_rate in annual_rates:
            monthly_rates.extend([annual_rate / 100 / 12] * 12)
            
        return monthly_rates, annual_rates
    
    def calculate_arm_cost(self, principal, monthly_rates):
        """Calculate the total cost of a 5/1 ARM mortgage over time."""
        remaining_principal = principal
        total_paid = 0
        
        # Payment recalculation months (at beginning and then annually after fixed period)
        recalc_months = [0] + list(range(5*12, len(monthly_rates), 12))
        
        current_payment = None
        
        for month, rate in enumerate(monthly_rates):
            # Recalculate payment at start and annually after fixed period
            if month in recalc_months:
                remaining_months = len(monthly_rates) - month
                
                if rate == 0:
                    current_payment = remaining_principal / remaining_months
                else:
                    current_payment = remaining_principal * (rate * (1 + rate) ** remaining_months) / ((1 + rate) ** remaining_months - 1)
            
            # Calculate interest and principal payment
            interest = remaining_principal * rate
            principal_payment = min(current_payment - interest, remaining_principal)
            
            # Update remaining principal
            remaining_principal -= principal_payment
            
            # Update total paid
            total_paid += current_payment
            
            # Handle final payment rounding issues
            if remaining_principal < 0.01:
                remaining_principal = 0
        
        return total_paid
    
    def calculate_fixed_cost(self, principal, annual_rate, years):
        """Calculate total cost of a fixed-rate mortgage."""
        monthly_payment = self.calculate_fixed_payment(principal, annual_rate, years)
        return monthly_payment * 12 * years
    
    def start_simulation(self):
        """Start the simulation in a separate thread to keep GUI responsive."""
        # Disable the run button to prevent multiple simulations
        self.run_button.config(state="disabled")
        self.progress_var.set(0)
        
        # Start simulation thread
        thread = threading.Thread(target=self.run_simulation, daemon=True)
        thread.start()
    
    def run_simulation(self):
        """Run the Monte Carlo simulation and update the GUI with results."""
        try:
            # Get input values
            loan_amount = float(self.loan_amount.get())
            loan_term = int(self.loan_term.get())
            fixed_rate = float(self.fixed_rate.get())
            arm_initial_rate = float(self.arm_rate.get())
            arm_margin = float(self.arm_margin.get())
            initial_cap = float(self.initial_cap.get())
            annual_cap = float(self.annual_cap.get())
            lifetime_cap = float(self.lifetime_cap.get())
            num_simulations = int(self.num_simulations.get())
            
            # Validate inputs
            if loan_amount <= 0 or fixed_rate < 0 or arm_initial_rate < 0 or arm_margin < 0:
                raise ValueError("Loan amount must be positive and rates cannot be negative")
            
            if initial_cap < 0 or annual_cap < 0 or lifetime_cap < 0:
                raise ValueError("Rate caps cannot be negative")
            
            if loan_term <= 5:
                raise ValueError("Loan term must be greater than 5 years for 5/1 ARM comparison")
            
            if num_simulations <= 0:
                raise ValueError("Number of simulations must be positive")
            
            # Calculate fixed-rate mortgage total cost
            fixed_cost = self.calculate_fixed_cost(loan_amount, fixed_rate, loan_term)
            
            # Run Monte Carlo simulations for ARM
            arm_costs = []
            arm_rate_paths = []
            
            self.root.after(0, lambda: self.status_label.config(text="Running Monte Carlo simulation..."))
            
            for i in range(num_simulations):
                # Simulate ARM rates
                monthly_rates, annual_rates = self.simulate_arm_rates(
                    arm_initial_rate, arm_margin, initial_cap, annual_cap, lifetime_cap, loan_term)
                
                # Calculate ARM cost
                arm_cost = self.calculate_arm_cost(loan_amount, monthly_rates)
                arm_costs.append(arm_cost)
                
                # Save every 50th rate path for visualization
                if i % 50 == 0:
                    arm_rate_paths.append(annual_rates)
                
                # Update progress
                progress = (i + 1) / num_simulations * 100
                self.root.after(0, lambda p=progress: self.progress_var.set(p))
                
                # Update status every 100 simulations
                if i % 100 == 0:
                    self.root.after(0, lambda c=i: self.status_label.config(
                        text=f"Running simulation {c+1}/{num_simulations}..."))
            
            # Calculate statistics
            arm_mean = np.mean(arm_costs)
            arm_median = np.median(arm_costs)
            arm_std = np.std(arm_costs)
            arm_min = np.min(arm_costs)
            arm_max = np.max(arm_costs)
            
            # Calculate 95% confidence interval
            arm_ci_low = np.percentile(arm_costs, 2.5)
            arm_ci_high = np.percentile(arm_costs, 97.5)
            
            # Probability that ARM is cheaper
            prob_arm_cheaper = np.sum(np.array(arm_costs) < fixed_cost) / num_simulations * 100
            
            # Expected savings with ARM
            expected_savings = fixed_cost - arm_median
            
            # Determine which option is better based on median
            if fixed_cost < arm_median:
                conclusion = "Based on historical patterns, the fixed-rate mortgage is likely to be less expensive."
                confidence_statement = f"The ARM was more expensive in {100-prob_arm_cheaper:.1f}% of simulations."
            else:
                conclusion = "Based on historical patterns, the 5/1 ARM is likely to be less expensive."
                confidence_statement = f"The ARM was less expensive in {prob_arm_cheaper:.1f}% of simulations."
            
            # Format results text
            results_text = (
                f"Fixed-Rate ({fixed_rate}%) Total Cost: ${fixed_cost:,.2f}\n"
                f"5/1 ARM (Initial: {arm_initial_rate}%) Median Cost: ${arm_median:,.2f}\n"
                f"Expected Savings with {'ARM' if expected_savings > 0 else 'Fixed Rate'}: ${abs(expected_savings):,.2f}\n"
                f"5/1 ARM 95% Confidence Interval: ${arm_ci_low:,.2f} to ${arm_ci_high:,.2f}\n\n"
                f"{conclusion} {confidence_statement}"
            )
            
            # Update GUI elements
            self.root.after(0, lambda: self.results_text.delete(1.0, tk.END))
            self.root.after(0, lambda: self.results_text.insert(tk.END, results_text))
            
            # Create visualization
            self.root.after(0, lambda: self.update_plots(
                fixed_cost, arm_costs, arm_rate_paths, fixed_rate, arm_initial_rate, 
                loan_term, arm_median, arm_ci_low, arm_ci_high, prob_arm_cheaper))
            
            self.root.after(0, lambda: self.status_label.config(text="Simulation complete!"))
            
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Error", str(e)))
            self.root.after(0, lambda: self.status_label.config(text=f"Error: {str(e)}"))
        finally:
            # Re-enable the run button
            self.root.after(0, lambda: self.run_button.config(state="normal"))
    
    def update_plots(self, fixed_cost, arm_costs, arm_rate_paths, fixed_rate, 
                    arm_initial_rate, loan_term, arm_median, arm_ci_low, arm_ci_high, prob_arm_cheaper):
        """Update the visualization plots with simulation results."""
        # Clear previous plots
        self.fig.clear()
        
        # Create subplots
        gs = self.fig.add_gridspec(4, 2)
        ax1 = self.fig.add_subplot(gs[0:2, 0:2])  # Top half
        ax2 = self.fig.add_subplot(gs[2, 0:2])    # Bottom left
        ax3 = self.fig.add_subplot(gs[3, 0:2])    # Bottom right
        
        # Plot 1: Distribution of ARM costs
        sns.histplot(arm_costs, kde=True, ax=ax1, color='skyblue')
        ax1.axvline(fixed_cost, color='r', linestyle='--', linewidth=2, label='Fixed Rate')
        ax1.axvline(arm_median, color='g', linestyle='-', linewidth=2, label='ARM Median')
        ax1.axvline(arm_ci_low, color='b', linestyle=':', linewidth=2, label='95% CI Lower')
        ax1.axvline(arm_ci_high, color='b', linestyle=':', linewidth=2, label='95% CI Upper')
        ax1.set_xlabel('Total Cost ($)', fontsize=10)
        ax1.set_ylabel('Frequency', fontsize=10)
        ax1.set_title('Distribution of 5/1 ARM Total Costs', fontsize=12)
        ax1.legend(loc='upper right', fontsize=9)
        
        # Format X-axis as currency
        ax1.xaxis.set_major_formatter('${x:,.0f}')
        
        # Plot 2: Savings/Loss with ARM vs Fixed
        savings = np.array(fixed_cost) - np.array(arm_costs)
        sns.histplot(savings, kde=True, ax=ax2, color='lightgreen')
        ax2.axvline(0, color='r', linestyle='--', linewidth=2, label='Break Even')
        ax2.axvline(np.median(savings), color='g', linestyle='-', linewidth=2, label='Median Savings')
        ax2.set_xlabel('Savings with ARM vs Fixed Rate ($)', fontsize=10)
        ax2.set_ylabel('Frequency', fontsize=10)
        ax2.set_title('Potential Savings/Loss with ARM vs Fixed Rate', fontsize=12)
        ax2.legend(fontsize=9)
        
        # Format X-axis as currency
        ax2.xaxis.set_major_formatter('${x:,.0f}')
        
        # Plot 3: Sample of ARM rate paths
        years = list(range(1, loan_term + 1))
        
        # Plot sample rate paths
        for i, rates in enumerate(arm_rate_paths[:min(10, len(arm_rate_paths))]):
            ax3.plot(years, rates, alpha=0.3, linewidth=1, color='lightblue')
        
        # Calculate and plot median rate path
        if arm_rate_paths:
            path_array = np.array(arm_rate_paths)
            median_rates = np.median(path_array, axis=0)
            ax3.plot(years, median_rates, color='blue', linewidth=2, label='Median ARM Rate')
            
            # Calculate and plot 95% confidence interval
            lower_rates = np.percentile(path_array, 2.5, axis=0)
            upper_rates = np.percentile(path_array, 97.5, axis=0)
            ax3.fill_between(years, lower_rates, upper_rates, color='blue', alpha=0.1, label='95% CI')
        
        # Add fixed rate reference line
        ax3.axhline(fixed_rate, color='r', linestyle='--', linewidth=2, label='Fixed Rate')
        
        ax3.set_xlabel('Year', fontsize=10)
        ax3.set_ylabel('Interest Rate (%)', fontsize=10)
        ax3.set_title('ARM Interest Rate Projections', fontsize=12)
        ax3.legend(fontsize=9)
        
        # Add text with key stats
        stats_text = (
            f"Fixed Rate: {fixed_rate:.2f}%\n"
            f"Initial ARM Rate: {arm_initial_rate:.2f}%\n"
            f"Probability ARM is cheaper: {prob_arm_cheaper:.1f}%\n"
            f"95% Confidence Interval for ARM Rate in Year 30: "
            f"{lower_rates[-1]:.2f}% to {upper_rates[-1]:.2f}%"
        )
        self.fig.text(0.02, 0.01, stats_text, fontsize=9, bbox=dict(facecolor='white', alpha=0.8))
        
        # Adjust layout and draw
        self.fig.suptitle(f'30-Year Cost Comparison: Fixed vs. 5/1 ARM Mortgage (${int(fixed_cost):,} vs. ${int(arm_median):,})', 
                        fontsize=14, y=0.98)
        self.fig.tight_layout(rect=[0, 0.03, 1, 0.95])
        self.canvas.draw()

# Main entry point
if __name__ == "__main__":
    root = tk.Tk()
    app = MortgageComparisonApp(root)
    root.mainloop()