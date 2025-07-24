# SWR Backtester - Project Structure

This retirement strategy backtester has been organized into a modular structure for better maintainability and readability.

## File Structure

```
├── index.html          # Main HTML file with UI components
├── index.css           # All custom styles and CSS
├── src/
│   ├── app.js          # Main application entry point and initialization
│   ├── controls.js     # Form controls setup and event handlers
│   ├── data.js         # Historical market data (1950-2023)
│   ├── dom-utils.js    # DOM element references and utility functions
│   ├── results.js      # Results display and D3.js chart rendering
│   └── simulation.js   # Core simulation engine and withdrawal strategies
```

## Module Breakdown

### `index.html`
- Contains the complete UI structure
- Loads external dependencies (Tailwind CSS, D3.js, Inter font)
- Includes the main CSS file and JavaScript entry point

### `index.css` 
- Custom slider styles
- Loader and progress bar animations
- Tooltip styles
- General UI styling not covered by Tailwind

### `src/app.js`
- Main entry point that initializes the application
- Coordinates between all modules
- Handles the debounced simulation triggering
- Contains the main backtesting loop

### `src/controls.js`
- Sets up all form controls and sliders
- Handles real-time value updates for sliders
- Manages strategy-specific control visibility

### `src/data.js`
- Contains the historical market data from 1950-2023
- Market returns and inflation data for backtesting

### `src/dom-utils.js`
- DOM element references for easy access
- Utility functions for showing/hiding loader
- Progress updates
- Form parameter extraction

### `src/results.js`
- Processes and displays simulation results
- Handles the D3.js chart rendering
- Calculates success rates and statistics

### `src/simulation.js`
- Core simulation engine
- Implements all withdrawal strategies:
  - Work Shield Hybrid
  - Elastic Band
  - Moving Average
  - Market-Aware 3-4-5%
  - Guyton-Klinger
  - Classic 4% Rule
  - Fixed Percentage

## Running the Application

Simply open `index.html` in a modern web browser. The application uses ES6 modules, so it needs to be served over HTTP (not file://) for local development.

For local development, you can use a simple HTTP server:
```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# VS Code Live Server extension
```

Then visit `http://localhost:8000` in your browser.

## Benefits of This Structure

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Maintainability**: Easier to find and modify specific functionality
3. **Readability**: Smaller, focused files are easier to understand
4. **Reusability**: Modules can be independently tested and reused
5. **Scalability**: New features can be added as separate modules
