// SAFEY - Safety Assessment and Resource Platform
// All data is stored locally - nothing leaves the device
// Development mode indicator
const isDevelopment = (window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1') &&
                     window.location.port === '5500';

if (isDevelopment) {
    console.log('🚀 SAFEY Development Mode - Caching disabled');
    // Add visual indicator
    document.addEventListener('DOMContentLoaded', () => {
        const indicator = document.createElement('div');
        indicator.textContent = 'DEV MODE';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
            opacity: 0.8;
        `;
        document.body.appendChild(indicator);
    });
}
console.log('SAFEY App loaded at:', new Date().toISOString());
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
    
    // Pattern detection now handled by unlock-handler.js smart safety check system
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
        <div class="bg-white rounded-card material-shadow-lg p-8 fade-in max-w-xl mx-auto">
            <p class="text-lg text-gray-800 mb-8 text-center font-medium">${question.question}</p>
            <div class="flex gap-4">
                <button onclick="answerQuestion(true)" class="flex-1 bg-gentle-green hover:bg-opacity-90 text-white font-semibold py-4 px-6 rounded-card transition btn-scale" aria-label="Answer yes">
                    Yes
                </button>
                <button onclick="answerQuestion(false)" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-card transition btn-scale" aria-label="Answer no">
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
    
    let riskLevel, emoji, color, message;
    
    if (AppState.riskScore < 0.3) {
        riskLevel = 'Low Risk';
        emoji = '🟢';
        color = 'text-gentle-green';
        message = 'You\'re taking the right steps. Here\'s how to stay safe: Continue building your support network and keep safety resources accessible.';
    } else if (AppState.riskScore < 0.6) {
        riskLevel = 'Moderate Risk';
        emoji = '🟡';
        color = 'text-yellow-500';
        message = 'You\'re taking the right steps. Here\'s how to stay safe: We recommend creating a safety plan and reviewing available resources. Consider reaching out to a domestic violence advocate.';
    } else {
        riskLevel = 'High Risk';
        emoji = '🔴';
        color = 'text-alert-red';
        message = 'You\'re taking the right steps. Here\'s how to stay safe: Your safety is our priority. Please consider contacting the National Domestic Violence Hotline (1-800-799-7233) and review the resources and safety plan features.';
    }
    
    scoreDisplay.innerHTML = `
        <div class="text-center py-6">
            <div class="text-6xl mb-3">${emoji}</div>
            <div class="${color} text-3xl font-bold mb-2">${riskLevel}</div>
        </div>
    `;
    
    guidance.innerHTML = `
        <p class="mb-6 text-gray-700 leading-relaxed">${message}</p>
        <div class="bg-hopeful-teal bg-opacity-10 border border-hopeful-teal border-opacity-30 rounded-card p-4">
            <p class="text-sm text-gray-700">
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
            <div class="bg-alert-red bg-opacity-10 border border-alert-red border-opacity-30 rounded-card p-5">
                <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span class="text-xl">⚠️</span>
                    <span>Urgent Actions</span>
                </h3>
                <ul class="space-y-2">
                    ${plan.urgentActions.map(action => `
                        <li class="flex items-start gap-3">
                            <input type="checkbox" class="mt-1 rounded border-gray-300 text-trust-blue focus:ring-trust-blue" aria-label="Mark action as complete">
                            <span class="text-sm text-gray-700">${action}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    html += `
        <div class="bg-white rounded-card material-shadow-lg p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="text-xl">📞</span>
                <span>Emergency Contacts</span>
            </h3>
            <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-neutral-bg rounded-lg">
                    <span class="font-medium text-gray-700 text-sm">National DV Hotline:</span>
                    <a href="tel:18007997233" class="text-trust-blue font-semibold flex items-center gap-2 hover:underline">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        1-800-799-7233
                    </a>
                </div>
                <div class="flex items-center justify-between p-3 bg-neutral-bg rounded-lg">
                    <span class="font-medium text-gray-700 text-sm">Emergency:</span>
                    <a href="tel:911" class="text-alert-red font-semibold flex items-center gap-2 hover:underline">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        911
                    </a>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-card material-shadow-lg p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="text-xl">📋</span>
                <span>Important Documents</span>
            </h3>
            <div class="space-y-2">
                ${plan.importantDocuments.map(doc => `
                    <label class="flex items-center gap-3 p-2 hover:bg-neutral-bg rounded-lg cursor-pointer transition">
                        <input type="checkbox" class="rounded border-gray-300 text-gentle-green focus:ring-gentle-green checkmark-animate" aria-label="Mark ${doc} as ready">
                        <span class="text-sm text-gray-700">${doc}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        
        <div class="bg-white rounded-card material-shadow-lg p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="text-xl">🎒</span>
                <span>Essential Items</span>
            </h3>
            <div class="space-y-2">
                ${plan.essentialItems.map(item => `
                    <label class="flex items-center gap-3 p-2 hover:bg-neutral-bg rounded-lg cursor-pointer transition">
                        <input type="checkbox" class="rounded border-gray-300 text-gentle-green focus:ring-gentle-green checkmark-animate" aria-label="Mark ${item} as packed">
                        <span class="text-sm text-gray-700">${item}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        
        <div class="bg-white rounded-card material-shadow-lg p-5">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="text-xl">✅</span>
                <span>Safety Steps</span>
            </h3>
            <ol class="space-y-3">
                ${plan.safetySteps.map((step, idx) => `
                    <li class="flex gap-3">
                        <span class="flex-shrink-0 w-6 h-6 bg-trust-blue text-white rounded-full flex items-center justify-center text-xs font-bold">${idx + 1}</span>
                        <span class="text-sm text-gray-700 pt-0.5">${step}</span>
                    </li>
                `).join('')}
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
    
    const categoryIcons = {
        'hotline': '☎️',
        'shelter': '🏠',
        'legal': '⚖️',
        'counseling': '💬'
    };
    
    container.innerHTML = filtered.map(resource => `
        <div class="bg-white rounded-card material-shadow-lg p-5">
            <div class="flex items-start gap-3 mb-3">
                <div class="w-10 h-10 flex items-center justify-center rounded-full bg-trust-blue bg-opacity-10 flex-shrink-0">
                    <span class="text-xl">${categoryIcons[resource.category] || '📌'}</span>
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-gray-800 text-base mb-1">${resource.name}</h3>
                    <p class="text-sm text-gray-600">${resource.description}</p>
                </div>
            </div>
            <div class="space-y-2 mb-4">
                ${resource.phone ? `
                    <div class="flex items-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span class="text-gray-700">${resource.phone}</span>
                    </div>
                ` : ''}
                ${resource.hours ? `
                    <div class="flex items-center gap-2 text-sm">
                        <svg class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-gray-600">${resource.hours}</span>
                    </div>
                ` : ''}
                ${resource.available ? `
                    <div class="flex items-center gap-2 text-sm">
                        <svg class="h-4 w-4 text-gentle-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-gentle-green font-medium">${resource.available}</span>
                    </div>
                ` : ''}
                ${resource.address ? `
                    <div class="flex items-center gap-2 text-sm">
                        <svg class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="text-gray-600">${resource.address}</span>
                    </div>
                ` : ''}
            </div>
            ${resource.phone ? `
                <div class="flex gap-2">
                    <a href="tel:${resource.phone.replace(/[^0-9]/g, '')}" class="flex-1 bg-trust-blue hover:bg-opacity-90 text-white font-semibold py-2.5 px-4 rounded-lg text-center transition btn-scale flex items-center justify-center gap-2" aria-label="Call ${resource.name}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                    </a>
                    ${resource.address && resource.address !== 'Confidential location' ? `
                        <button class="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition btn-scale flex items-center justify-center gap-2" aria-label="Get directions to ${resource.name}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Directions
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Old Stealth Mode Functions (now handled by stealth-controller.js)
// Keeping for backward compatibility but these are no longer used


// Emergency Mode
async function activateEmergencyMode() {
    trackEvent('emergency_mode');
    await eventLogger.logEvent('emergencyToggled');
    
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
        
        // Check for suspicious patterns after emergency activation
        await unlockHandler.checkSuspiciousPatterns();
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

// Legacy functions - now handled by stealth system
function updatePin() {
    // This is now handled in setupStealthSettingsListeners()
    console.log('updatePin called - using new stealth system');
}

async function clearAllData() {
    if (confirm('This will delete all your data including assessment results, safety plan, and stealth settings. Are you sure?')) {
        // Clear old localStorage data
        localStorage.clear();
        
        // Clear app state
        AppState.assessmentAnswers = [];
        AppState.riskScore = 0;
        AppState.safetyPlan = null;
        AppState.checkInEvents = [];
        
        // Clear stealth data using new system
        await stealthController.clearAllData();
        
        alert('All data cleared');
        hideSettings();
        showScreen('home');
    }
}


// Initialize App
async function init() {
    // Initialize stealth system first
    await stealthController.init();
    
    // Enable debug keyboard shortcut
    debugUI.enableKeyboardShortcut();
    
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
    
    // Stealth toggle now uses the new system
    document.getElementById('stealth-toggle').addEventListener('click', async () => {
        await stealthController.activate();
    });
    
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    
    // Event Listeners - Assessment Screen
    document.getElementById('assessment-back').addEventListener('click', () => showScreen('home'));
    document.getElementById('view-plan-from-results').addEventListener('click', () => {
        showScreen('safety-plan');
        displaySafetyPlan();
    });
    document.getElementById('view-resources-from-results').addEventListener('click', () => {
        showScreen('resources');
        displayResources();
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
                b.classList.remove('active', 'bg-trust-blue', 'text-white');
                b.classList.add('bg-white', 'text-gray-700');
            });
            e.target.classList.add('active', 'bg-trust-blue', 'text-white');
            e.target.classList.remove('bg-white', 'text-gray-700');
            
            const category = e.target.dataset.category;
            displayResources(category);
        });
    });
    
    // Event Listeners - Settings Modal
    document.getElementById('close-settings').addEventListener('click', hideSettings);
    document.getElementById('clear-data').addEventListener('click', clearAllData);
    
    // New stealth settings listeners
    setupStealthSettingsListeners();
    
    // Track app start
    trackEvent('app_start');
    await eventLogger.logEvent('appStart');
    
    console.log('SAFEY initialized - All data stays on your device');
}

// Setup stealth settings listeners
function setupStealthSettingsListeners() {
    // PIN input
    document.getElementById('pin-input').addEventListener('blur', async (e) => {
        const pin = e.target.value;
        if (pin && pin.length === 4 && /^\d{4}$/.test(pin)) {
            try {
                await stealthController.updatePin(pin);
                alert('PIN updated successfully');
                e.target.value = '';
            } catch (error) {
                alert(error.message);
            }
        }
    });
    
    // Disguise template
    const templateSelect = document.getElementById('disguise-template');
    templateSelect.addEventListener('change', async (e) => {
        const template = e.target.value;
        
        if (template === 'custom') {
            document.getElementById('custom-url-section').classList.remove('hidden');
        } else {
            document.getElementById('custom-url-section').classList.add('hidden');
            await stealthController.changeTemplate(template);
        }
    });
    
    // Load current template
    const currentTemplate = stealthSettings.getSetting('disguiseTemplate');
    if (currentTemplate) {
        templateSelect.value = currentTemplate;
        if (currentTemplate === 'custom') {
            document.getElementById('custom-url-section').classList.remove('hidden');
        }
    }
    
    // Custom URL
    document.getElementById('save-custom-url').addEventListener('click', async () => {
        const url = document.getElementById('custom-url-input').value;
        if (url) {
            try {
                const saved = await stealthController.setCustomUrl(url);
                if (saved) {
                    alert('Custom URL saved successfully');
                }
            } catch (error) {
                alert(error.message);
            }
        }
    });
    
    // Auto-lock timeout
    document.getElementById('autolock-timeout').addEventListener('change', async (e) => {
        const minutes = parseInt(e.target.value);
        await stealthSettings.updateAutoLockTimeout(minutes);
    });
    
    // Load current timeout
    const currentTimeout = stealthSettings.getSetting('autoLockTimeout');
    if (currentTimeout) {
        document.getElementById('autolock-timeout').value = currentTimeout;
    }
    
    // Triggers
    document.getElementById('trigger-logo').addEventListener('change', async (e) => {
        await stealthTriggerHandler.updateSettings({
            triggersEnabled: { logoDoubleTap: e.target.checked }
        });
    });
    
    document.getElementById('trigger-corner').addEventListener('change', async (e) => {
        await stealthTriggerHandler.updateSettings({
            triggersEnabled: { cornerMultiTap: e.target.checked }
        });
    });
    
    // Corner tap config
    document.getElementById('corner-position').addEventListener('change', async (e) => {
        await stealthTriggerHandler.updateSettings({
            cornerConfig: { corner: e.target.value }
        });
    });
    
    document.getElementById('corner-taps').addEventListener('change', async (e) => {
        await stealthTriggerHandler.updateSettings({
            cornerConfig: { tapCount: parseInt(e.target.value) }
        });
    });
    
    // Load current corner config
    const cornerConfig = stealthSettings.getSetting('cornerTapConfig');
    if (cornerConfig) {
        document.getElementById('corner-position').value = cornerConfig.corner || 'top-right';
        document.getElementById('corner-taps').value = cornerConfig.tapCount || 4;
    }
    
    // Auto-alerts toggle
    document.getElementById('auto-alerts-enabled').addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        stealthSettings.settings.autoAlertsEnabled = enabled;
        await stealthSettings.saveSettings();
        console.log(`[SAFEY] Auto-alerts ${enabled ? 'enabled' : 'disabled'}`);
    });
    
    // Load current auto-alerts setting
    const autoAlertsEnabled = stealthSettings.getSetting('autoAlertsEnabled');
    if (autoAlertsEnabled !== undefined) {
        document.getElementById('auto-alerts-enabled').checked = autoAlertsEnabled;
    }
    
    // Debug toggle
    document.getElementById('toggle-debug').addEventListener('click', () => {
        debugUI.toggle();
    });
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
