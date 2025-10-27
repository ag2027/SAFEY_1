// Calculator Disguise Template
// Working calculator with invisible PIN unlock

export class CalculatorTemplate {
    constructor() {
        this.display = '0';
        this.operand = null;
        this.operation = null;
        this.newNumber = true;
        this.pinSequence = '';
        this.unlockCallback = null;
    }

    /**
     * Render calculator UI
     */
    render() {
        return `
            <div class="max-w-md mx-auto p-4 h-screen bg-gray-900 text-white">
                <div class="h-full flex flex-col">
                    <div class="text-right p-4 text-3xl font-mono mb-4 bg-gray-800 rounded">
                        <div id="calc-display" class="min-h-12 break-all">${this.display}</div>
                    </div>
                    <div class="grid grid-cols-4 gap-2 flex-1">
                        <button class="calc-btn bg-gray-600 hover:bg-gray-500 rounded text-xl font-bold py-4" data-value="C">C</button>
                        <button class="calc-btn bg-gray-600 hover:bg-gray-500 rounded text-xl font-bold py-4" data-value="+/-">+/−</button>
                        <button class="calc-btn bg-gray-600 hover:bg-gray-500 rounded text-xl font-bold py-4" data-value="%">%</button>
                        <button class="calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="/">÷</button>
                        
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="7">7</button>
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="8">8</button>
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="9">9</button>
                        <button class="calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="*">×</button>
                        
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="4">4</button>
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="5">5</button>
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="6">6</button>
                        <button class="calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="-">−</button>
                        
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="1">1</button>
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="2">2</button>
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value="3">3</button>
                        <button class="calc-btn bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold py-4" data-value="+">+</button>
                        
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4 col-span-2" data-value="0">0</button>
                        <button class="calc-btn bg-gray-700 hover:bg-gray-600 rounded text-xl font-bold py-4" data-value=".">.</button>
                        <button class="calc-btn bg-green-600 hover:bg-green-500 rounded text-xl font-bold py-4" data-value="=">=</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Handle calculator input
     */
    handleInput(value, pin) {
        const displayElement = document.getElementById('calc-display');
        
        // Track number inputs for PIN unlock
        if (/^\d$/.test(value)) {
            this.pinSequence += value;
            if (this.pinSequence.length > 10) {
                this.pinSequence = this.pinSequence.slice(-10);
            }
        }

        // Clear button
        if (value === 'C') {
            this.display = '0';
            this.operand = null;
            this.operation = null;
            this.newNumber = true;
            this.pinSequence = '';
        }
        // Equals button - check for PIN unlock
        else if (value === '=') {
            // Check if entered sequence ends with PIN
            if (this.pinSequence.endsWith(pin)) {
                if (this.unlockCallback) {
                    this.unlockCallback();
                }
                return;
            }

            // Normal calculation
            if (this.operation && this.operand !== null) {
                const current = parseFloat(this.display);
                let result;
                switch (this.operation) {
                    case '+': result = this.operand + current; break;
                    case '-': result = this.operand - current; break;
                    case '*': result = this.operand * current; break;
                    case '/': result = this.operand / current; break;
                }
                this.display = this._formatNumber(result);
                this.operand = null;
                this.operation = null;
                this.newNumber = true;
            }
        }
        // Operation buttons
        else if (['+', '-', '*', '/'].includes(value)) {
            this.operand = parseFloat(this.display);
            this.operation = value;
            this.newNumber = true;
        }
        // Plus/minus toggle
        else if (value === '+/-') {
            this.display = this._formatNumber(-parseFloat(this.display));
        }
        // Percentage
        else if (value === '%') {
            this.display = this._formatNumber(parseFloat(this.display) / 100);
        }
        // Number or decimal input
        else {
            if (this.newNumber) {
                this.display = value;
                this.newNumber = false;
            } else {
                if (value === '.' && this.display.includes('.')) return;
                this.display = this.display === '0' && value !== '.' ? value : this.display + value;
            }
        }
        
        if (displayElement) {
            displayElement.textContent = this.display;
        }
    }

    /**
     * Format number for display
     */
    _formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) return 'Error';
        
        // Handle very large or very small numbers
        if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6);
        }
        
        // Format with appropriate decimal places
        const formatted = parseFloat(num.toFixed(8)).toString();
        return formatted;
    }

    /**
     * Set unlock callback
     */
    setUnlockCallback(callback) {
        this.unlockCallback = callback;
    }

    /**
     * Reset state
     */
    reset() {
        this.display = '0';
        this.operand = null;
        this.operation = null;
        this.newNumber = true;
        this.pinSequence = '';
    }

    /**
     * Get title for document.title
     */
    getTitle() {
        return 'Calculator';
    }
}
