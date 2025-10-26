// SAFEY - Safety Assessment and Resource Platform
// All data is stored locally - nothing leaves the device

// State Management
const AppState = {
    currentScreen: 'home',
    stealthMode: false,
    assessmentAnswers: [],
    currentQuestion: 0,
    riskScore: 0,
    pin: localStorage.getItem('safey_pin') || '1234',
    checkInEvents: [],
    safetyPlan: null
};

// Risk Assessment Questions
const assessmentQuestions = [
    {
        id: 1,
        question: "Has the violence increased in severity or frequency over the past year?",
        type: "boolean"
    },
    {
        id: 2,
        question: "Does your partner own or have access to a gun?",
        type: "boolean"
    },
    {
        id: 3,
        question: "Have you left or tried to leave the relationship in the past year?",
        type: "boolean"
    },
    {
        id: 4,
        question: "Does your partner try to control most or all of your daily activities?",
        type: "boolean"
    },
    {
        id: 5,
        question: "Has your partner ever threatened to kill you or themselves?",
        type: "boolean"
    },
    {
        id: 6,
        question: "Does your partner use drugs or alcohol excessively?",
        type: "boolean"
    },
    {
        id: 7,
        question: "Are you afraid of your partner?",
        type: "boolean"
    },
    {
        id: 8,
        question: "Has your partner ever choked or strangled you?",
        type: "boolean"
    }
];

// Resources Data
const resources = [
    {
        name: "National Domestic Violence Hotline",
        category: "hotline",
        phone: "1-800-799-7233",
        description: "24/7 confidential support",
        available: "24/7"
    },
    {
        name: "Safe Haven Shelter",
        category: "shelter",
        phone: "1-555-0101",
        address: "Confidential location",
        description: "Emergency housing and support services"
    },
    {
        name: "Women's Legal Aid",
        category: "legal",
        phone: "1-555-0202",
        description: "Free legal consultation and representation",
        hours: "Mon-Fri 9AM-5PM"
    },
    {
        name: "Healing Hearts Counseling",
        category: "counseling",
        phone: "1-555-0303",
        description: "Trauma-informed therapy services",
        hours: "Mon-Sat 8AM-8PM"
    },
    {
        name: "Crisis Text Line",
        category: "hotline",
        phone: "Text HOME to 741741",
        description: "24/7 crisis support via text",
        available: "24/7"
    },
    {
        name: "Family Justice Center",
        category: "legal",
        phone: "1-555-0404",
        description: "Protection orders and legal advocacy",
        hours: "Mon-Fri 8AM-6PM"
    },
    {
        name: "New Beginnings Shelter",
        category: "shelter",
        phone: "1-555-0505",
        address: "Confidential location",
        description: "Safe housing for families"
    },
    {
        name: "Support Circle Counseling",
        category: "counseling",
        phone: "1-555-0606",
        description: "Group and individual therapy",
        hours: "Daily 9AM-9PM"
    }
];

// Safety Plan Template
const safetyPlanTemplate = {
    emergencyContacts: [],
    safePlace: "",
    importantDocuments: [
        "ID/Driver's License",
        "Birth certificates",
        "Social Security cards",
        "Bank account information",
        "Insurance documents",
        "Medical records",
        "School records for children"
    ],
    essentialItems: [
        "Medications",
        "Keys (house, car)",
        "Phone and charger",
        "Money/credit cards",
        "Change of clothes",
        "Important phone numbers"
    ],
    safetySteps: [
        "Identify safe areas in your home",
        "Plan escape routes",
        "Pack an emergency bag",
        "Establish a code word with trusted contacts",
        "Keep important documents ready",
        "Save emergency numbers in phone"
    ]
};

// Behavioral Check-in System
function trackEvent(eventType) {
    const event = {
        type: eventType,
        timestamp: Date.now()
    };
    AppState.checkInEvents.push(event);
    
    // Keep only last 50 events
    if (AppState.checkInEvents.length > 50) {
        AppState.checkInEvents = AppState.checkInEvents.slice(-50);
    }
    
    // Save to localStorage
    localStorage.setItem('safey_events', JSON.stringify(AppState.checkInEvents));
    
    // Check for concerning patterns
    checkBehavioralPatterns();
}

function checkBehavioralPatterns() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const recentEvents = AppState.checkInEvents.filter(e => e.timestamp > lastHour);
    
    // Pattern: Multiple emergency mode activations
    const emergencyEvents = recentEvents.filter(e => e.type === 'emergency_mode');
    if (emergencyEvents.length >= 3) {
        promptSafetyCheck('Multiple emergency activations detected');
        return;
    }
    
    // Pattern: Extended inactivity after emergency
    const lastEvent = AppState.checkInEvents[AppState.checkInEvents.length - 1];
    if (lastEvent && lastEvent.type === 'emergency_mode') {
        const timeSinceEmergency = now - lastEvent.timestamp;
        if (timeSinceEmergency > 30 * 60 * 1000) { // 30 minutes
            // Could prompt check-in, but we'll keep it passive for MVP
        }
    }
}

function promptSafetyCheck(reason) {
    if (confirm(`${reason}. Would you like to send a safety check to a trusted contact?`)) {
        sendSafetyCheck();
    }
}

function sendSafetyCheck() {
    // In production, this would send to a trusted contact
    // For MVP, we log to console
    console.log('Safety check sent at:', new Date().toISOString());
    alert('Safety check would be sent to your trusted contact (demo mode)');
    trackEvent('safety_check_sent');
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`${screenId}-screen`).classList.add('active');
    AppState.currentScreen = screenId;
    
    if (screenId !== 'stealth') {
        trackEvent(`view_${screenId}`);
    }
}

// Risk Assessment Functions
function startAssessment() {
    AppState.currentQuestion = 0;
    AppState.assessmentAnswers = [];
    showScreen('assessment');
    displayQuestion();
}

function displayQuestion() {
    const container = document.getElementById('question-container');
    const question = assessmentQuestions[AppState.currentQuestion];
    const total = assessmentQuestions.length;
    const progress = ((AppState.currentQuestion + 1) / total) * 100;
    
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('current-question').textContent = AppState.currentQuestion + 1;
    document.getElementById('total-questions').textContent = total;
    
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 fade-in">
            <p class="text-lg text-gray-800 mb-6">${question.question}</p>
            <div class="flex gap-4">
                <button onclick="answerQuestion(true)" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                    Yes
                </button>
                <button onclick="answerQuestion(false)" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                    No
                </button>
            </div>
        </div>
    `;
}

function answerQuestion(answer) {
    AppState.assessmentAnswers.push({
        questionId: assessmentQuestions[AppState.currentQuestion].id,
        answer: answer
    });
    
    if (AppState.currentQuestion < assessmentQuestions.length - 1) {
        AppState.currentQuestion++;
        displayQuestion();
    } else {
        calculateRiskScore();
        showResults();
    }
}

function calculateRiskScore() {
    // Simple scoring: each "yes" adds to risk
    // Questions 2, 5, 8 are weighted higher (gun, threats, choking)
    let score = 0;
    const highRiskQuestions = [2, 5, 8];
    
    AppState.assessmentAnswers.forEach(answer => {
        if (answer.answer) {
            if (highRiskQuestions.includes(answer.questionId)) {
                score += 2;
            } else {
                score += 1;
            }
        }
    });
    
    // Normalize to 0-1 scale
    const maxScore = assessmentQuestions.length + 3; // 8 + 3 extra for weighted questions
    AppState.riskScore = score / maxScore;
    
    // Save to localStorage
    localStorage.setItem('safey_risk_score', AppState.riskScore);
    localStorage.setItem('safey_assessment_date', new Date().toISOString());
}

function showResults() {
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('results-container').classList.remove('hidden');
    
    const scoreDisplay = document.getElementById('risk-score-display');
    const guidance = document.getElementById('risk-guidance');
    
    let riskLevel, color, message;
    
    if (AppState.riskScore < 0.3) {
        riskLevel = 'Low Risk';
        color = 'text-green-600';
        message = 'Your assessment indicates a lower risk level. However, if you ever feel unsafe, please reach out to the resources available.';
    } else if (AppState.riskScore < 0.6) {
        riskLevel = 'Moderate Risk';
        color = 'text-yellow-600';
        message = 'Your assessment indicates moderate risk. We recommend creating a safety plan and reviewing available resources. Consider reaching out to a domestic violence advocate.';
    } else {
        riskLevel = 'High Risk';
        color = 'text-red-600';
        message = 'Your assessment indicates high risk. Your safety is our priority. Please consider contacting the National Domestic Violence Hotline (1-800-799-7233) and review the resources and safety plan features.';
    }
    
    scoreDisplay.innerHTML = `
        <div class="text-center">
            <div class="${color} text-4xl font-bold mb-2">${riskLevel}</div>
            <div class="text-gray-600">Risk Score: ${(AppState.riskScore * 100).toFixed(0)}%</div>
        </div>
    `;
    
    guidance.innerHTML = `
        <p class="mb-4">${message}</p>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">
                <strong>Remember:</strong> This assessment is a tool, not a diagnosis. Trust your instincts. If you feel unsafe, seek help immediately.
            </p>
        </div>
    `;
    
    trackEvent('assessment_completed');
    
    // Generate safety plan based on risk score
    generateSafetyPlan();
}

// Safety Plan Functions
function generateSafetyPlan() {
    AppState.safetyPlan = JSON.parse(JSON.stringify(safetyPlanTemplate));
    
    // Customize based on risk score
    if (AppState.riskScore >= 0.6) {
        AppState.safetyPlan.urgentActions = [
            "Keep your phone charged and accessible",
            "Identify the safest room in your home (with exits, no weapons)",
            "Consider packing an emergency bag with essentials",
            "Tell someone you trust about your situation",
            "Know where to go if you need to leave quickly"
        ];
    }
    
    localStorage.setItem('safey_plan', JSON.stringify(AppState.safetyPlan));
}

function displaySafetyPlan() {
    const plan = AppState.safetyPlan || JSON.parse(localStorage.getItem('safey_plan') || JSON.stringify(safetyPlanTemplate));
    const container = document.getElementById('safety-plan-content');
    
    let html = '';
    
    if (plan.urgentActions) {
        html += `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 class="font-bold text-red-800 mb-2">⚠️ Urgent Actions</h3>
                <ul class="list-disc list-inside space-y-1 text-sm text-red-700">
                    ${plan.urgentActions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    html += `
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-gray-800 mb-3">📞 Emergency Contacts</h3>
            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <span class="font-semibold">National DV Hotline:</span>
                    <a href="tel:18007997233" class="text-blue-600">1-800-799-7233</a>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-semibold">Emergency:</span>
                    <a href="tel:911" class="text-red-600">911</a>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-gray-800 mb-3">📋 Important Documents</h3>
            <ul class="space-y-1 text-sm">
                ${plan.importantDocuments.map(doc => `
                    <li class="flex items-center gap-2">
                        <input type="checkbox" class="rounded">
                        <span>${doc}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-gray-800 mb-3">🎒 Essential Items</h3>
            <ul class="space-y-1 text-sm">
                ${plan.essentialItems.map(item => `
                    <li class="flex items-center gap-2">
                        <input type="checkbox" class="rounded">
                        <span>${item}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-gray-800 mb-3">✅ Safety Steps</h3>
            <ol class="list-decimal list-inside space-y-2 text-sm">
                ${plan.safetySteps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
    `;
    
    container.innerHTML = html;
    trackEvent('view_safety_plan');
}

function exportSafetyPlan() {
    const plan = AppState.safetyPlan || JSON.parse(localStorage.getItem('safey_plan') || '{}');
    const text = JSON.stringify(plan, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safety-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('export_plan');
}

// Resources Functions
function displayResources(category = 'all') {
    const container = document.getElementById('resource-list');
    const filtered = category === 'all' ? resources : resources.filter(r => r.category === category);
    
    container.innerHTML = filtered.map(resource => `
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="font-bold text-gray-800 mb-2">${resource.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${resource.description}</p>
            <div class="space-y-1 text-sm">
                ${resource.phone ? `
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href="tel:${resource.phone.replace(/[^0-9]/g, '')}" class="text-blue-600">${resource.phone}</a>
                    </div>
                ` : ''}
                ${resource.hours ? `<div class="text-gray-600">⏰ ${resource.hours}</div>` : ''}
                ${resource.available ? `<div class="text-green-600">✓ ${resource.available}</div>` : ''}
                ${resource.address ? `<div class="text-gray-600">📍 ${resource.address}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// Stealth Mode Functions
function activateStealthMode() {
    AppState.stealthMode = true;
    showScreen('stealth');
    document.title = 'Calculator';
    trackEvent('stealth_mode_activated');
}

function deactivateStealthMode() {
    const enteredPin = prompt('Enter PIN to unlock:');
    if (enteredPin === AppState.pin) {
        AppState.stealthMode = false;
        document.title = 'Notes';
        showScreen('home');
        trackEvent('stealth_mode_deactivated');
    } else {
        alert('Incorrect PIN');
        trackEvent('failed_unlock');
    }
}

// Calculator functionality for stealth mode
let calcDisplay = '0';
let calcOperand = null;
let calcOperation = null;
let calcNewNumber = true;

function handleCalcInput(value) {
    const display = document.getElementById('calc-display');
    
    if (value === '=') {
        if (calcOperation && calcOperand !== null) {
            const current = parseFloat(calcDisplay);
            let result;
            switch (calcOperation) {
                case '+': result = calcOperand + current; break;
                case '-': result = calcOperand - current; break;
                case '*': result = calcOperand * current; break;
                case '/': result = calcOperand / current; break;
            }
            calcDisplay = result.toString();
            calcOperand = null;
            calcOperation = null;
            calcNewNumber = true;
        }
    } else if (['+', '-', '*', '/'].includes(value)) {
        calcOperand = parseFloat(calcDisplay);
        calcOperation = value;
        calcNewNumber = true;
    } else {
        if (calcNewNumber) {
            calcDisplay = value;
            calcNewNumber = false;
        } else {
            calcDisplay = calcDisplay === '0' ? value : calcDisplay + value;
        }
    }
    
    display.textContent = calcDisplay;
}

// Emergency Mode
function activateEmergencyMode() {
    trackEvent('emergency_mode');
    
    if (confirm('This will show you emergency resources and hotlines. Continue?')) {
        showScreen('resources');
        displayResources('hotline');
        
        // Highlight emergency resources
        setTimeout(() => {
            const hotlineCategory = document.querySelector('[data-category="hotline"]');
            if (hotlineCategory) {
                hotlineCategory.click();
            }
        }, 100);
    }
}

// Settings Functions
function showSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
    document.getElementById('settings-modal').classList.add('flex');
}

function hideSettings() {
    document.getElementById('settings-modal').classList.remove('flex');
    document.getElementById('settings-modal').classList.add('hidden');
}

function updatePin() {
    const pin = document.getElementById('pin-input').value;
    if (pin.length === 4 && /^\d{4}$/.test(pin)) {
        AppState.pin = pin;
        localStorage.setItem('safey_pin', pin);
        alert('PIN updated successfully');
        document.getElementById('pin-input').value = '';
    } else {
        alert('Please enter a 4-digit PIN');
    }
}

function clearAllData() {
    if (confirm('This will delete all your data including assessment results and safety plan. Are you sure?')) {
        localStorage.clear();
        AppState.assessmentAnswers = [];
        AppState.riskScore = 0;
        AppState.safetyPlan = null;
        AppState.checkInEvents = [];
        alert('All data cleared');
        hideSettings();
        showScreen('home');
    }
}

// Initialize App
function init() {
    // Load saved events
    const savedEvents = localStorage.getItem('safey_events');
    if (savedEvents) {
        AppState.checkInEvents = JSON.parse(savedEvents);
    }
    
    // Load saved plan
    const savedPlan = localStorage.getItem('safey_plan');
    if (savedPlan) {
        AppState.safetyPlan = JSON.parse(savedPlan);
    }
    
    // Event Listeners - Home Screen
    document.getElementById('assessment-btn').addEventListener('click', startAssessment);
    document.getElementById('safety-plan-btn').addEventListener('click', () => {
        showScreen('safety-plan');
        displaySafetyPlan();
    });
    document.getElementById('resources-btn').addEventListener('click', () => {
        showScreen('resources');
        displayResources();
    });
    document.getElementById('emergency-btn').addEventListener('click', activateEmergencyMode);
    document.getElementById('stealth-toggle').addEventListener('click', activateStealthMode);
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    
    // Event Listeners - Assessment Screen
    document.getElementById('assessment-back').addEventListener('click', () => showScreen('home'));
    document.getElementById('view-plan-from-results').addEventListener('click', () => {
        showScreen('safety-plan');
        displaySafetyPlan();
    });
    document.getElementById('restart-assessment').addEventListener('click', startAssessment);
    
    // Event Listeners - Safety Plan Screen
    document.getElementById('plan-back').addEventListener('click', () => showScreen('home'));
    document.getElementById('export-plan').addEventListener('click', exportSafetyPlan);
    
    // Event Listeners - Resources Screen
    document.getElementById('resources-back').addEventListener('click', () => showScreen('home'));
    
    // Resource filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-teal-600', 'text-white');
                b.classList.add('bg-gray-200', 'text-gray-700');
            });
            e.target.classList.add('active', 'bg-teal-600', 'text-white');
            e.target.classList.remove('bg-gray-200', 'text-gray-700');
            
            const category = e.target.dataset.category;
            displayResources(category);
        });
    });
    
    // Event Listeners - Stealth Mode
    document.getElementById('calc-unlock').addEventListener('click', deactivateStealthMode);
    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = e.target.dataset.value;
            handleCalcInput(value);
        });
    });
    
    // Event Listeners - Settings Modal
    document.getElementById('close-settings').addEventListener('click', hideSettings);
    document.getElementById('pin-input').addEventListener('change', updatePin);
    document.getElementById('clear-data').addEventListener('click', clearAllData);
    
    // Track app start
    trackEvent('app_start');
    
    console.log('SAFEY initialized - All data stays on your device');
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
