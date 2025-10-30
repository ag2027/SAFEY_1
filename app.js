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

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.safey-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `safey-toast fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 max-w-sm`;
    
    // Set colors based on type
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white'
    };
    
    toast.classList.add(...colors[type].split(' '));
    toast.innerHTML = `
        <div class="flex items-center">
            <div class="flex-1">${message}</div>
            <button class="ml-2 opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

// UI Utils
//let uiUtils;

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
// Weight system: Critical (3), Severe (2), Moderate (1.5), Standard (1)
const assessmentQuestions = [
    // Physical Violence & Escalation
    {
        id: 1,
        question: "Has the violence increased in severity or frequency in the past month?",
        weight: 2,
        category: "escalation",
        type: "boolean"
    },
    {
        id: 2,
        question: "Has your partner ever choked or strangled you?",
        weight: 3,
        category: "physical",
        type: "boolean"
    },
    {
        id: 3,
        question: "Has your partner ever forced or coerced you into sexual activity?",
        weight: 3,
        category: "sexual",
        type: "boolean"
    },
    
    // Weapons & Access
    {
        id: 4,
        question: "Does your partner own or have access to a gun?",
        weight: 3,
        category: "weapons",
        type: "boolean"
    },
    {
        id: 5,
        question: "Does your partner have access to other weapons (knives, bats, etc.)?",
        weight: 2,
        category: "weapons",
        type: "boolean"
    },
    
    // Threats & Control
    {
        id: 6,
        question: "Has your partner ever threatened to kill you or themselves?",
        weight: 3,
        category: "threats",
        type: "boolean"
    },
    {
        id: 7,
        question: "Has your partner ever threatened to harm your children or used them against you?",
        weight: 2,
        category: "threats",
        type: "boolean"
    },
    {
        id: 8,
        question: "Does your partner try to control most or all of your daily activities?",
        weight: 1.5,
        category: "control",
        type: "boolean"
    },
    {
        id: 9,
        question: "Does your partner control your finances and prevent you from working?",
        weight: 2,
        category: "control",
        type: "boolean"
    },
    
    // Stalking & Isolation
    {
        id: 10,
        question: "Has your partner ever stalked, followed, or harassed you outside the home?",
        weight: 2,
        category: "stalking",
        type: "boolean"
    },
    
    // Behavioral Indicators
    {
        id: 11,
        question: "Does your partner use drugs or alcohol excessively?",
        weight: 1.5,
        category: "behavior",
        type: "boolean"
    },
    {
        id: 12,
        question: "Are you afraid of your partner?",
        weight: 1.5,
        category: "behavior",
        type: "boolean"
    },
    {
        id: 13,
        question: "Have you left or tried to leave the relationship in the past year?",
        weight: 1,
        category: "history",
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

// Safety Plan Utilities and Template
const RESOURCE_LABELS = {
    hotline: 'Hotlines',
    shelter: 'Shelters',
    legal: 'Legal Aid',
    counseling: 'Counseling'
};

function generatePlanItemId(sectionKey) {
    try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return `${sectionKey}-${crypto.randomUUID()}`;
        }
        if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
            return `${sectionKey}-${window.crypto.randomUUID()}`;
        }
    } catch (err) {
        // Ignore and fall back to timestamp-based id
    }
    return `${sectionKey}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function createPlanItem(sectionKey, text, options = {}) {
    const normalized = typeof text === 'string' ? text.trim() : '';
    if (!normalized) {
        return null;
    }
    return {
        id: options.id || generatePlanItemId(sectionKey),
        text: normalized,
        checked: Boolean(options.checked),
        source: options.source || 'template',
        priority: options.priority || 'standard'
    };
}

function createPlanItems(sectionKey, texts = [], options = {}) {
    const { source = 'template', priority, checked = false, idPrefix = 'base' } = options;
    return texts
        .map((text, index) => createPlanItem(sectionKey, text, {
            source,
            priority,
            checked,
            id: `${sectionKey}-${idPrefix}-${index}`
        }))
        .filter(Boolean);
}

function buildSafetyPlanTemplate() {
    return {
        emergencyContacts: [],
        safePlace: '',
        notes: '',
        urgentActions: createPlanItems('urgentActions', [
            "Keep your phone charged and within reach",
            "Identify the fastest exit route from every room",
            "Store a spare key, cash, and documents with someone you trust",
            "Share your code word with trusted contacts"
        ], { priority: 'critical' }),
        importantDocuments: createPlanItems('importantDocuments', [
            "ID/Driver's License",
            "Birth certificates",
            "Social Security cards",
            "Bank account information",
            "Insurance documents",
            "Medical records",
            "School records for children"
        ]),
        essentialItems: createPlanItems('essentialItems', [
            "Medications",
            "Keys (house, car)",
            "Phone and charger",
            "Money/credit cards",
            "Change of clothes",
            "Important phone numbers",
            "Spare glasses or contact lenses"
        ]),
        safetySteps: createPlanItems('safetySteps', [
            "Identify two safe areas in your home with exits",
            "Plan escape routes and practice them when safe to do so",
            "Pack an emergency bag and store it outside the home if possible",
            "Establish a code word with trusted contacts",
            "Keep important documents and keys ready",
            "Save emergency numbers in your phone and on paper"
        ], { priority: 'high' }),
        communicationPlan: createPlanItems('communicationPlan', [
            "Choose two trusted contacts for daily check-ins",
            "Create a code word or emoji that means 'I need help'",
            "Schedule regular check-in times that feel natural",
            "Store emergency contacts under innocuous names if needed"
        ], { priority: 'high' }),
        supportNetwork: createPlanItems('supportNetwork', [
            "Identify a friend or family member who can provide temporary shelter",
            "List nearby shelters or advocacy centers you trust",
            "Save contact information for a legal advocate or counselor"
        ], { priority: 'high' }),
        techSafety: createPlanItems('techSafety', [
            "Use private/incognito browsing when researching support",
            "Regularly clear browser history and delete sensitive texts",
            "Change passwords for email, banking, and social media accounts",
            "Check devices for unknown tracking or monitoring apps"
        ]),
        financialSafety: createPlanItems('financialSafety', [
            "Save small amounts of cash in a safe location",
            "Gather financial documents and statements",
            "Open a separate bank account if possible",
            "Monitor credit reports for unusual activity"
        ], { priority: 'medium' }),
        legalPreparation: createPlanItems('legalPreparation', [
            "Document incidents with dates, photos, and witness names",
            "Store copies of legal documents in a safe place",
            "Research protective order options in your state",
            "Identify a legal aid service that can assist if needed"
        ], { priority: 'medium' }),
        workplaceSafety: createPlanItems('workplaceSafety', [
            "Update workplace emergency contacts",
            "Ask security or reception to screen unexpected visitors",
            "Arrange a safe parking spot or escort when leaving work",
            "Give a trusted coworker your code word and plan"
        ]),
        weaponSafety: createPlanItems('weaponSafety', [
            "Know where weapons are stored and avoid those areas during conflicts",
            "If possible, store weapons locked and separate from ammunition",
            "Plan escape routes that avoid areas where weapons are kept"
        ], { priority: 'critical' }),
        childSafety: createPlanItems('childSafety', [
            "Teach children how to dial 911 and what to say",
            "Identify safe rooms or neighbors' homes children can go to",
            "Pack a comfort item and essentials for each child",
            "Inform school or childcare who is authorized for pickup"
        ], { priority: 'high' }),
        selfCare: createPlanItems('selfCare', [
            "Identify one grounding technique you can use daily",
            "Schedule small moments for rest or calming activities",
            "Stay connected with supportive friends or groups",
            "Plan a safe way to access counseling or support services"
        ]),
        scenarioProtocols: [
            {
                id: 'during-incident',
                title: 'If violence starts at home',
                priority: 'critical',
                steps: [
                    "Move to a room with an exit and no weapons",
                    "Keep your phone and emergency numbers within reach",
                    "Use your code word to alert trusted contacts",
                    "If safe, leave immediately using your planned route"
                ]
            },
            {
                id: 'preparing-to-leave',
                title: 'When preparing to leave',
                priority: 'high',
                steps: [
                    "Choose a time when the abusive person is away",
                    "Load emergency items into your vehicle or give them to a trusted person",
                    "Plan transportation and destination in advance",
                    "Disable location sharing on devices before leaving"
                ]
            },
            {
                id: 'after-leaving',
                title: 'After leaving',
                priority: 'high',
                steps: [
                    "Change locks, passcodes, and security settings",
                    "Update mailing address and secure important accounts",
                    "Inform schools and workplaces about safety protocols",
                    "Work with an advocate to document ongoing threats"
                ]
            }
        ],
        followUpReminders: createPlanItems('followUpReminders', [
            "Review and update this plan once a month",
            "Store a printed copy in a secure location away from home",
            "Share relevant parts of the plan with trusted supporters",
            "Schedule regular safety check-ins with yourself or an advocate"
        ])
    };
}

const safetyPlanTemplate = buildSafetyPlanTemplate();

const SAFETY_PLAN_SECTIONS = [
    { key: 'urgentActions', type: 'checklist', icon: '⚠️', title: 'Urgent Actions', highlighted: true, allowAdd: true, priority: 'critical', resourceCategories: ['hotline', 'shelter'] },
    { key: 'emergencyContacts', type: 'emergency', icon: '📞', title: 'Emergency Contacts' },
    { key: 'importantDocuments', type: 'checklist', icon: '📋', title: 'Important Documents', allowAdd: true, resourceCategories: ['legal'] },
    { key: 'essentialItems', type: 'checklist', icon: '🎒', title: 'Essential Items', allowAdd: true },
    { key: 'safetySteps', type: 'checklist', icon: '✅', title: 'Safety Steps', numbered: true, allowAdd: true, priority: 'high' },
    { key: 'communicationPlan', type: 'checklist', icon: '🧑‍🤝‍🧑', title: 'Communication Plan', allowAdd: true, priority: 'high', resourceCategories: ['hotline'] },
    { key: 'supportNetwork', type: 'checklist', icon: '🤝', title: 'Support Network', allowAdd: true, priority: 'high', resourceCategories: ['shelter', 'counseling'] },
    { key: 'techSafety', type: 'checklist', icon: '💻', title: 'Technology Safety', allowAdd: true },
    { key: 'financialSafety', type: 'checklist', icon: '💰', title: 'Financial Safety', allowAdd: true, priority: 'medium', resourceCategories: ['legal'] },
    { key: 'legalPreparation', type: 'checklist', icon: '⚖️', title: 'Legal Preparation', allowAdd: true, resourceCategories: ['legal'] },
    { key: 'workplaceSafety', type: 'checklist', icon: '🏢', title: 'Workplace Safety', allowAdd: true },
    { key: 'weaponSafety', type: 'checklist', icon: '🛡️', title: 'Weapon Safety', allowAdd: true, priority: 'critical' },
    { key: 'childSafety', type: 'checklist', icon: '🧒', title: 'Child Safety', allowAdd: true, priority: 'high' },
    { key: 'scenarioProtocols', type: 'protocols', icon: '🧭', title: 'Scenario Plans' },
    { key: 'selfCare', type: 'checklist', icon: '❤️', title: 'Self-Care & Recovery', allowAdd: true, resourceCategories: ['counseling'] },
    { key: 'followUpReminders', type: 'checklist', icon: '🔄', title: 'Follow-Up Reminders', allowAdd: true },
    { key: 'safePlace', type: 'text', icon: '📍', title: 'Safe Place Plan', placeholder: 'Add details about where you can go quickly if you need to leave.' },
    { key: 'notes', type: 'text', icon: '📝', title: 'Additional Notes', placeholder: 'Use this space for important details, license plates, schedules, or other reminders.' }
];

const SAFETY_PLAN_CHECKLIST_KEYS = SAFETY_PLAN_SECTIONS
    .filter(section => section.type === 'checklist')
    .map(section => section.key);

function normalizeRawChecklistItem(rawItem, sectionKey, index) {
    if (!rawItem) {
        return null;
    }
    if (typeof rawItem === 'string') {
        return createPlanItem(sectionKey, rawItem, {
            source: 'custom',
            id: `${sectionKey}-raw-${index}`
        });
    }
    if (typeof rawItem === 'object') {
        const text = rawItem.text || rawItem.value || rawItem.label || rawItem.name || '';
        return createPlanItem(sectionKey, text, {
            id: rawItem.id || `${sectionKey}-raw-${index}`,
            checked: Boolean(rawItem.checked || rawItem.complete),
            priority: rawItem.priority || rawItem.level || 'standard',
            source: rawItem.source || (rawItem.id ? 'custom' : 'imported')
        });
    }
    return null;
}

function mergeChecklistItems(baseItems = [], rawItems, sectionKey) {
    const result = Array.isArray(baseItems)
        ? baseItems.map(item => ({ ...item }))
        : [];
    if (!Array.isArray(rawItems)) {
        return result;
    }

    rawItems.forEach((rawItem, index) => {
        const normalized = normalizeRawChecklistItem(rawItem, sectionKey, index);
        if (!normalized) {
            return;
        }
        const existingIndex = result.findIndex(existing =>
            existing.id === normalized.id || existing.text.toLowerCase() === normalized.text.toLowerCase()
        );
        if (existingIndex > -1) {
            result[existingIndex] = {
                ...result[existingIndex],
                checked: normalized.checked ?? result[existingIndex].checked,
                source: normalized.source || result[existingIndex].source,
                priority: normalized.priority || result[existingIndex].priority
            };
        } else {
            result.push(normalized);
        }
    });

    return result;
}

function hydrateSafetyPlan(rawPlan) {
    const base = JSON.parse(JSON.stringify(buildSafetyPlanTemplate()));
    const plan = base;
    const raw = rawPlan && typeof rawPlan === 'object' ? rawPlan : {};

    SAFETY_PLAN_CHECKLIST_KEYS.forEach((sectionKey) => {
        plan[sectionKey] = mergeChecklistItems(plan[sectionKey], raw[sectionKey], sectionKey);
    });

    if (Array.isArray(raw.emergencyContacts)) {
        plan.emergencyContacts = raw.emergencyContacts
            .map(contact => (typeof contact === 'string' ? contact.trim() : ''))
            .filter(contact => contact.length > 0);
    }

    if (Array.isArray(raw.scenarioProtocols)) {
        raw.scenarioProtocols.forEach((rawProtocol, index) => {
            if (!rawProtocol || typeof rawProtocol !== 'object') {
                return;
            }
            const baseProtocol = plan.scenarioProtocols.find(protocol => protocol.id === rawProtocol.id);
            if (baseProtocol && Array.isArray(rawProtocol.steps)) {
                rawProtocol.steps.forEach((step) => {
                    if (typeof step === 'string') {
                        const normalizedStep = step.trim();
                        if (normalizedStep && !baseProtocol.steps.includes(normalizedStep)) {
                            baseProtocol.steps.push(normalizedStep);
                        }
                    }
                });
            } else if (!baseProtocol) {
                const steps = Array.isArray(rawProtocol.steps)
                    ? rawProtocol.steps
                        .map(step => (typeof step === 'string' ? step.trim() : ''))
                        .filter(step => step.length > 0)
                    : [];
                if (steps.length === 0) {
                    return;
                }
                plan.scenarioProtocols.push({
                    id: rawProtocol.id || `scenario-${index}`,
                    title: rawProtocol.title || 'Custom Scenario Plan',
                    priority: rawProtocol.priority || 'standard',
                    steps
                });
            }
        });
    }

    if (typeof raw.safePlace === 'string') {
        plan.safePlace = raw.safePlace;
    }

    if (typeof raw.notes === 'string') {
        plan.notes = raw.notes;
    }

    return plan;
}

const SAFETY_PLAN_SECURE_KEY = 'safety_plan';
const SAFETY_PLAN_LOCAL_KEY = 'safey_plan';
const SAFETY_PLAN_ENCRYPTED_KEY = 'safey_plan_encrypted';
const SAFETY_PLAN_PERSIST_DELAY = 200;
let safetyPlanPersistTimer = null;
let lastSavedPlanSignature = null;

function clonePlan(plan) {
    try {
        return JSON.parse(JSON.stringify(plan || {}));
    } catch (error) {
        console.error('Failed to clone safety plan', error);
        return plan;
    }
}

async function persistSafetyPlan(plan) {
    try {
        const payload = {
            version: 1,
            updatedAt: Date.now(),
            data: plan
        };
        const encrypted = await cryptoUtils.encrypt(payload);
        if (!encrypted) {
            return;
        }
        await storageUtils.saveData('settings', SAFETY_PLAN_SECURE_KEY, encrypted);
        localStorage.setItem(SAFETY_PLAN_ENCRYPTED_KEY, encrypted);
    } catch (error) {
        console.error('Error securely saving safety plan:', error);
    }
}

function queueSafetyPlanPersist(plan) {
    if (safetyPlanPersistTimer) {
        clearTimeout(safetyPlanPersistTimer);
    }
    const snapshot = clonePlan(plan);
    safetyPlanPersistTimer = setTimeout(() => {
        safetyPlanPersistTimer = null;
        persistSafetyPlan(snapshot);
    }, SAFETY_PLAN_PERSIST_DELAY);
}

async function loadPersistedSafetyPlan() {
    try {
        let encrypted = await storageUtils.loadData('settings', SAFETY_PLAN_SECURE_KEY);
        if (encrypted && typeof encrypted === 'object' && encrypted.value) {
            encrypted = encrypted.value;
        }
        if (!encrypted) {
            encrypted = localStorage.getItem(SAFETY_PLAN_ENCRYPTED_KEY);
        }
        if (encrypted) {
            const decrypted = await cryptoUtils.decrypt(encrypted);
            if (decrypted && typeof decrypted === 'object') {
                const planData = decrypted.data || decrypted.plan || decrypted;
                if (planData) {
                    const hydrated = hydrateSafetyPlan(planData);
                    localStorage.setItem(SAFETY_PLAN_LOCAL_KEY, JSON.stringify(hydrated));
                    try {
                        lastSavedPlanSignature = JSON.stringify(hydrated);
                    } catch (error) {
                        lastSavedPlanSignature = null;
                    }
                    return hydrated;
                }
            }
        }
    } catch (error) {
        console.error('Error loading encrypted safety plan:', error);
    }

    try {
        const fallback = localStorage.getItem(SAFETY_PLAN_LOCAL_KEY);
        if (fallback) {
            const hydrated = hydrateSafetyPlan(JSON.parse(fallback));
            try {
                lastSavedPlanSignature = JSON.stringify(hydrated);
            } catch (error) {
                lastSavedPlanSignature = null;
            }
            return hydrated;
        }
    } catch (error) {
        console.error('Error loading safety plan from localStorage:', error);
    }

    return null;
}

function saveSafetyPlan(plan) {
    const safePlan = clonePlan(plan);
    let serialized = null;
    try {
        serialized = JSON.stringify(safePlan);
    } catch (error) {
        console.error('Failed to serialize safety plan:', error);
    }

    AppState.safetyPlan = safePlan;

    if (serialized && serialized === lastSavedPlanSignature) {
        return;
    }

    if (serialized) {
        lastSavedPlanSignature = serialized;
        try {
            localStorage.setItem(SAFETY_PLAN_LOCAL_KEY, serialized);
        } catch (error) {
            console.error('Error writing safety plan to localStorage:', error);
        }
        queueSafetyPlanPersist(safePlan);
    }
}

function addUniquePlanItems(plan, sectionKey, items = [], options = {}) {
    if (!plan || !Array.isArray(plan[sectionKey]) || !Array.isArray(items)) {
        return;
    }
    items.forEach((text, idx) => {
        const newItem = createPlanItem(sectionKey, text, {
            source: options.source || 'custom',
            priority: options.priority,
            checked: options.checked,
            id: options.idPrefix ? `${sectionKey}-${options.idPrefix}-${idx}` : undefined
        });
        if (!newItem) {
            return;
        }
        const existing = plan[sectionKey].find(item => item.text.toLowerCase() === newItem.text.toLowerCase());
        if (existing) {
            if (options.checked === true) {
                existing.checked = true;
            }
            if (options.priority && existing.priority === 'standard') {
                existing.priority = options.priority;
            }
            if (options.source && existing.source === 'template') {
                existing.source = options.source;
            }
        } else {
            plan[sectionKey].push(newItem);
        }
    });
}

function addUniqueProtocolSteps(protocol, steps = []) {
    if (!protocol || !Array.isArray(protocol.steps) || !Array.isArray(steps)) {
        return;
    }
    steps.forEach(step => {
        if (typeof step !== 'string') {
            return;
        }
        const normalized = step.trim();
        if (normalized && !protocol.steps.includes(normalized)) {
            protocol.steps.push(normalized);
        }
    });
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function calculateChecklistProgress(items = []) {
    const total = Array.isArray(items) ? items.length : 0;
    const completed = Array.isArray(items)
        ? items.filter(item => item && item.checked).length
        : 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
}

function getPlanProgress(plan) {
    const totals = SAFETY_PLAN_CHECKLIST_KEYS.reduce((acc, key) => {
        const progress = calculateChecklistProgress(plan[key]);
        acc.completed += progress.completed;
        acc.total += progress.total;
        return acc;
    }, { completed: 0, total: 0 });
    const percent = totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;
    return { ...totals, percent };
}

function getSafetyPlanWarnings(plan, riskScore) {
    const warnings = [];
    const addWarning = (severity, message, sectionKey) => {
        warnings.push({ severity, message, sectionKey });
    };

    const checkSection = (sectionKey, config) => {
        const items = plan[sectionKey] || [];
        if (config.requireItems && items.length === 0) {
            addWarning(config.severity || 'medium', config.emptyMessage, sectionKey);
            return;
        }
        const progress = calculateChecklistProgress(items);
        if (items.length > 0 && progress.completed === 0) {
            addWarning(config.severity || 'medium', config.message, sectionKey);
        }
    };

    checkSection('urgentActions', {
        severity: riskScore >= 0.5 ? 'high' : 'medium',
        message: 'Mark at least one urgent action as in progress so you have a clear first step.',
        emptyMessage: 'Add urgent actions so you know what to do immediately.',
        requireItems: true
    });

    checkSection('communicationPlan', {
        severity: 'high',
        message: 'Complete your communication plan so trusted contacts know when to check in.',
        emptyMessage: 'Add trusted contacts and code words to your communication plan.',
        requireItems: true
    });

    checkSection('supportNetwork', {
        severity: 'high',
        message: 'Build your support network so you have people ready to help when needed.',
        emptyMessage: 'Add at least one support person or service you can contact quickly.',
        requireItems: true
    });

    if ((plan.weaponSafety || []).length > 0) {
        checkSection('weaponSafety', {
            severity: 'high',
            message: 'Review weapon safety steps to reduce danger during confrontations.'
        });
    }

    if ((plan.childSafety || []).length > 0) {
        checkSection('childSafety', {
            severity: 'high',
            message: 'Complete child safety steps so young ones know how to stay safe.'
        });
    }

    if (riskScore >= 0.5) {
        checkSection('financialSafety', {
            severity: 'medium',
            message: 'Add financial safety steps to help you leave on your own terms.'
        });
    }

    return warnings;
}

function renderPlanSummary(progress) {
    const percent = progress.percent || 0;
    return `
        <section class="bg-white rounded-card material-shadow-lg p-5 mb-4">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🗂️</span>
                    <div>
                        <h3 class="text-gray-800 font-bold text-base">Plan Progress</h3>
                        <p class="text-sm text-gray-600">${progress.completed} of ${progress.total} items complete</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <div class="flex items-center gap-2 text-trust-blue font-semibold text-sm">
                        <span>${percent}%</span>
                    </div>
                    <div class="w-full sm:w-36 h-2 bg-neutral-bg rounded-full overflow-hidden">
                        <div class="h-full bg-trust-blue transition-all" style="width: ${percent}%;"></div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderPlanWarnings(warnings) {
    if (!warnings.length) {
        return '';
    }
    const severityStyles = {
        high: {
            classes: 'bg-alert-red bg-opacity-15 border border-alert-red border-opacity-40 text-alert-red',
            icon: '🚨'
        },
        medium: {
            classes: 'bg-yellow-50 border border-yellow-200 text-yellow-900',
            icon: '⚠️'
        },
        low: {
            classes: 'bg-neutral-bg border border-gray-200 text-gray-700',
            icon: 'ℹ️'
        }
    };
    return `
        <div class="space-y-3 mb-4" data-plan-warnings>
            ${warnings.map(warning => {
                const severity = severityStyles[warning.severity] || severityStyles.medium;
                return `
                    <div class="${severity.classes} rounded-card p-4 flex items-start gap-3">
                        <span class="text-xl leading-none">${severity.icon}</span>
                        <p class="text-sm leading-relaxed">${escapeHtml(warning.message)}</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderPlanItemBadges(item) {
    const badges = [];
    if (item.priority === 'critical') {
        badges.push({ label: 'Critical', classes: 'bg-alert-red bg-opacity-10 text-alert-red' });
    } else if (item.priority === 'high') {
        badges.push({ label: 'High Priority', classes: 'bg-yellow-100 text-yellow-800' });
    }
    if (item.source === 'risk') {
        badges.push({ label: 'Suggested', classes: 'bg-trust-blue bg-opacity-10 text-trust-blue' });
    }
    if (item.source === 'custom') {
        badges.push({ label: 'Custom', classes: 'bg-purple-100 text-purple-700' });
    }
    return badges.length
        ? `
            <div class="flex flex-wrap gap-2 mt-2">
                ${badges.map(badge => `
                    <span class="px-2 py-0.5 text-[11px] font-semibold rounded-full ${badge.classes}">${escapeHtml(badge.label)}</span>
                `).join('')}
            </div>
        `
        : '';
}

function renderChecklistItem(meta, item) {
    const checkboxClasses = meta.highlighted
        ? 'text-alert-red focus:ring-alert-red'
        : 'text-gentle-green focus:ring-gentle-green';
    const removable = item.source !== 'template';
    return `
        <li class="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-bg transition" data-plan-item="${item.id}">
            <input type="checkbox" class="mt-1.5 rounded border-gray-300 ${checkboxClasses} checkmark-animate" data-plan-checkbox data-section="${meta.key}" data-item-id="${item.id}" ${item.checked ? 'checked' : ''} aria-label="Mark ${escapeHtml(meta.title)} task as complete">
            <div class="flex-1">
                <p class="text-sm text-gray-700">${escapeHtml(item.text)}</p>
                ${renderPlanItemBadges(item)}
            </div>
            ${removable ? `
                <button type="button" class="text-xs text-gray-400 hover:text-alert-red focus:outline-none" data-plan-remove data-section="${meta.key}" data-item-id="${item.id}" aria-label="Remove ${escapeHtml(meta.title)} item">
                    Remove
                </button>
            ` : ''}
        </li>
    `;
}

function renderResourceFooter(meta) {
    if (!meta.resourceCategories || !meta.resourceCategories.length) {
        return '';
    }
    const buttons = meta.resourceCategories.map(category => {
        const label = RESOURCE_LABELS[category] || 'Resources';
        return `
            <button type="button" class="px-3 py-1 rounded-full bg-neutral-bg hover:bg-trust-blue hover:text-white text-xs font-semibold transition" data-plan-resource="${category}">
                View ${escapeHtml(label)}
            </button>
        `;
    }).join('');

    return `
        <div class="mt-4 pt-3 border-t border-neutral-200 flex flex-wrap gap-2 items-center justify-between text-xs text-gray-600">
            <span class="font-medium text-gray-700">Need support?</span>
            <div class="flex gap-2 flex-wrap">${buttons}</div>
        </div>
    `;
}

function renderAddItemForm(meta) {
    const placeholder = meta.addPlaceholder || `Add a new ${meta.title.toLowerCase()}`;
    return `
        <form class="flex gap-2 mt-4" data-plan-add="${meta.key}">
            <label class="sr-only" for="${meta.key}-add-input">Add ${escapeHtml(meta.title)} item</label>
            <input id="${meta.key}-add-input" data-plan-add-input type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue focus:border-transparent" placeholder="${escapeHtml(placeholder)}" autocomplete="off">
            <button type="submit" class="px-3 py-2 bg-trust-blue hover:bg-opacity-90 text-white text-sm font-semibold rounded-lg transition">
                Add
            </button>
        </form>
    `;
}

function renderChecklistSection(meta, items = []) {
    const progress = calculateChecklistProgress(items);
    const baseClasses = meta.highlighted
        ? 'bg-alert-red bg-opacity-10 border border-alert-red border-opacity-30'
        : 'bg-white material-shadow-lg';
    const headerSubtitle = progress.total
        ? `${progress.completed} of ${progress.total} complete`
        : 'Add steps that apply to you';
    return `
        <section class="${baseClasses} rounded-card p-5 mb-4" data-plan-section="${meta.key}">
            <div class="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div class="flex items-center gap-3">
                    <span class="text-xl">${meta.icon}</span>
                    <div>
                        <h3 class="font-bold text-gray-800">${escapeHtml(meta.title)}</h3>
                        <p class="text-xs text-gray-500">${escapeHtml(headerSubtitle)}</p>
                    </div>
                </div>
                ${progress.total ? `
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <span class="text-xs font-semibold text-trust-blue">${progress.percent}%</span>
                        <div class="w-full sm:w-32 h-2 bg-neutral-bg rounded-full overflow-hidden">
                            <div class="h-full bg-trust-blue transition-all" style="width: ${progress.percent}%;"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
            <ul class="space-y-2">
                ${items.length ? items.map(item => renderChecklistItem(meta, item)).join('') : `
                    <li class="text-sm text-gray-500 italic bg-neutral-bg rounded-lg p-3">
                        No steps yet. Add the actions that make sense for you.
                    </li>
                `}
            </ul>
            ${meta.allowAdd ? renderAddItemForm(meta) : ''}
            ${renderResourceFooter(meta)}
        </section>
    `;
}

function getEditableSafetyPlan() {
    return AppState.safetyPlan
        ? clonePlan(AppState.safetyPlan)
        : hydrateSafetyPlan({});
}

function handlePlanCheckboxChange(sectionKey, itemId, checked) {
    const plan = getEditableSafetyPlan();
    const items = Array.isArray(plan[sectionKey]) ? plan[sectionKey] : [];
    const target = items.find(item => item.id === itemId);
    if (!target) {
        return;
    }
    target.checked = checked;
    saveSafetyPlan(plan);
    trackEvent(checked ? 'plan_item_checked' : 'plan_item_unchecked');
    displaySafetyPlan();
}

function handlePlanItemRemoval(sectionKey, itemId) {
    const plan = getEditableSafetyPlan();
    const items = Array.isArray(plan[sectionKey]) ? plan[sectionKey] : [];
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) {
        return;
    }
    items.splice(index, 1);
    plan[sectionKey] = items;
    saveSafetyPlan(plan);
    trackEvent('plan_item_removed');
    showToast('Item removed from your plan.', 'info', 2200);
    displaySafetyPlan();
}

function handlePlanItemAddition(sectionKey, value) {
    const normalized = (value || '').trim();
    if (!normalized) {
        showToast('Add a detail before submitting.', 'warning', 2200);
        return false;
    }

    const plan = getEditableSafetyPlan();
    if (!Array.isArray(plan[sectionKey])) {
        plan[sectionKey] = [];
    }

    const duplicate = plan[sectionKey].some(item =>
        item && typeof item.text === 'string' && item.text.toLowerCase() === normalized.toLowerCase()
    );
    if (duplicate) {
        showToast('That item is already on your list.', 'warning', 2200);
        return false;
    }

    const newItem = createPlanItem(sectionKey, normalized, {
        source: 'custom'
    });
    if (!newItem) {
        return false;
    }

    plan[sectionKey].push(newItem);
    saveSafetyPlan(plan);
    trackEvent('plan_item_added');
    showToast('Added to your plan.', 'success', 2000);
    displaySafetyPlan();
    setTimeout(() => {
        const container = document.getElementById('safety-plan-content');
        if (!container) {
            return;
        }
        const nextInput = container.querySelector(`form[data-plan-add="${sectionKey}"] [data-plan-add-input]`);
        if (nextInput) {
            nextInput.focus();
        }
    }, 60);
    return true;
}

function handlePlanTextUpdate(key, value) {
    const plan = getEditableSafetyPlan();
    if (typeof value === 'string') {
        plan[key] = value;
        saveSafetyPlan(plan);
        trackEvent('plan_text_updated');
    }
}

function handlePlanContactAddition(value) {
    const normalized = (value || '').trim();
    if (!normalized) {
        showToast('Enter a contact before adding.', 'warning', 2200);
        return false;
    }

    const plan = getEditableSafetyPlan();
    if (!Array.isArray(plan.emergencyContacts)) {
        plan.emergencyContacts = [];
    }

    const exists = plan.emergencyContacts.some(contact =>
        typeof contact === 'string' && contact.toLowerCase() === normalized.toLowerCase()
    );
    if (exists) {
        showToast('That contact is already saved.', 'warning', 2200);
        return false;
    }

    plan.emergencyContacts.push(normalized);
    saveSafetyPlan(plan);
    trackEvent('plan_contact_added');
    showToast('Contact added.', 'success', 2000);
    displaySafetyPlan();
    setTimeout(() => {
        const container = document.getElementById('safety-plan-content');
        if (!container) {
            return;
        }
        const nextInput = container.querySelector('[data-plan-contact-input]');
        if (nextInput) {
            nextInput.focus();
        }
    }, 60);
    return true;
}

function handlePlanContactRemoval(index) {
    const plan = getEditableSafetyPlan();
    if (!Array.isArray(plan.emergencyContacts)) {
        return;
    }
    const idx = Number(index);
    if (Number.isNaN(idx) || idx < 0 || idx >= plan.emergencyContacts.length) {
        return;
    }
    plan.emergencyContacts.splice(idx, 1);
    saveSafetyPlan(plan);
    trackEvent('plan_contact_removed');
    showToast('Contact removed.', 'info', 2000);
    displaySafetyPlan();
}

function setupSafetyPlanInteractions(container) {
    container.querySelectorAll('[data-plan-checkbox]').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const target = event.currentTarget;
            const sectionKey = target.getAttribute('data-section');
            const itemId = target.getAttribute('data-item-id');
            handlePlanCheckboxChange(sectionKey, itemId, target.checked);
        });
    });

    container.querySelectorAll('[data-plan-remove]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const target = event.currentTarget;
            const sectionKey = target.getAttribute('data-section');
            const itemId = target.getAttribute('data-item-id');
            handlePlanItemRemoval(sectionKey, itemId);
        });
    });

    container.querySelectorAll('form[data-plan-add]').forEach(form => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const sectionKey = form.getAttribute('data-plan-add');
            const input = form.querySelector('[data-plan-add-input]');
            const value = input ? input.value : '';
            const added = handlePlanItemAddition(sectionKey, value);
            if (added && input) {
                input.value = '';
            }
        });
    });

    const contactForm = container.querySelector('form[data-plan-add-contact]');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = contactForm.querySelector('[data-plan-contact-input]');
            const value = input ? input.value : '';
            const added = handlePlanContactAddition(value);
            if (added && input) {
                input.value = '';
            }
        });
    }

    container.querySelectorAll('[data-plan-remove-contact]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const index = event.currentTarget.getAttribute('data-plan-remove-contact');
            handlePlanContactRemoval(index);
        });
    });

    container.querySelectorAll('[data-plan-resource]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.currentTarget.getAttribute('data-plan-resource');
            if (category) {
                trackEvent('plan_resource_shortcut');
                showScreen('resources');
                displayResources(category);
            }
        });
    });

    container.querySelectorAll('[data-plan-text]').forEach(textarea => {
        textarea.addEventListener('change', (event) => {
            const key = event.currentTarget.getAttribute('data-plan-text');
            handlePlanTextUpdate(key, event.currentTarget.value);
        });
    });
}

function renderEmergencyContactsSection(plan) {
    const extraContacts = Array.isArray(plan.emergencyContacts) ? plan.emergencyContacts : [];
    const extraMarkup = extraContacts.length
        ? `
            <div class="border-t border-neutral-200 mt-4 pt-4 space-y-2">
                ${extraContacts.map((contact, index) => `
                    <div class="flex items-start gap-3 text-sm text-gray-700">
                        <span class="mt-0.5 text-trust-blue">•</span>
                        <span class="flex-1">${escapeHtml(contact)}</span>
                        <button type="button" class="text-xs text-gray-400 hover:text-alert-red" data-plan-remove-contact="${index}" aria-label="Remove contact">
                            Remove
                        </button>
                    </div>
                `).join('')}
            </div>
        `
        : '';

    return `
        <section class="bg-white rounded-card material-shadow-lg p-5 mb-4" data-plan-section="emergencyContacts">
            <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">📞</span>
                <div>
                    <h3 class="font-bold text-gray-800">Emergency Contacts</h3>
                    <p class="text-xs text-gray-500">Call quickly if you feel unsafe.</p>
                </div>
            </div>
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
            ${extraMarkup}
            <form class="flex gap-2 mt-4" data-plan-add-contact>
                <label class="sr-only" for="plan-add-contact-input">Add emergency contact</label>
                <input id="plan-add-contact-input" data-plan-contact-input type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue" placeholder="Add a trusted person or service">
                <button type="submit" class="px-3 py-2 bg-trust-blue hover:bg-opacity-90 text-white text-sm font-semibold rounded-lg transition">Add</button>
            </form>
        </section>
    `;
}

function renderProtocolSection(meta, protocols = []) {
    if (!Array.isArray(protocols) || !protocols.length) {
        return '';
    }
    const cards = protocols.map(protocol => {
        const steps = Array.isArray(protocol.steps)
            ? protocol.steps.map(step => `<li class="pl-1">${escapeHtml(step)}</li>`).join('')
            : '';
        if (!steps) {
            return '';
        }
        return `
            <div class="bg-white rounded-card material-shadow-lg p-5">
                <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span class="text-lg">${meta.icon}</span>
                    <span>${escapeHtml(protocol.title || 'Scenario Plan')}</span>
                </h3>
                <ol class="space-y-3 list-decimal list-inside text-sm text-gray-700">
                    ${steps}
                </ol>
            </div>
        `;
    }).filter(Boolean).join('');
    if (!cards) {
        return '';
    }
    return `
        <section class="space-y-4 mb-4" data-plan-section="${meta.key}">
            ${cards}
        </section>
    `;
}

function renderTextSection(meta, value) {
    return `
        <section class="bg-white rounded-card material-shadow-lg p-5 mb-4" data-plan-section="${meta.key}">
            <div class="flex items-center gap-3 mb-3">
                <span class="text-xl">${meta.icon}</span>
                <h3 class="font-bold text-gray-800">${escapeHtml(meta.title)}</h3>
            </div>
            <textarea data-plan-text="${meta.key}" class="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue focus:border-transparent text-sm" placeholder="${escapeHtml(meta.placeholder || '')}">${escapeHtml(value || '')}</textarea>
        </section>
    `;
}

function renderPlanSection(meta, plan) {
    switch (meta.type) {
        case 'checklist':
            return renderChecklistSection(meta, plan[meta.key] || []);
        case 'emergency':
            return renderEmergencyContactsSection(plan);
        case 'protocols':
            return renderProtocolSection(meta, plan[meta.key]);
        case 'text':
            return renderTextSection(meta, plan[meta.key] || '');
        default:
            return '';
    }
}

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
    // Weighted scoring based on lethality research
    // Critical indicators (3pts): strangulation, gun access, sexual violence, threats to kill
    // Severe indicators (2pts): other weapons, threats involving children, financial control, stalking, recent escalation
    // Moderate (1.5pts): control tactics, substance abuse, fear
    // Standard (1pt): history of leaving
    
    let score = 0;
    let maxScore = 0;
    
    AppState.assessmentAnswers.forEach(answer => {
        const question = assessmentQuestions.find(q => q.id === answer.questionId);
        if (question) {
            maxScore += question.weight;
            if (answer.answer) {
                score += question.weight;
            }
        }
    });
    
    // Normalize to 0-1 scale
    AppState.riskScore = maxScore > 0 ? score / maxScore : 0;
    
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
    
    // Updated thresholds based on new weighting system
    if (AppState.riskScore < 0.25) {
        riskLevel = 'Low Risk';
        emoji = '🟢';
        color = 'text-gentle-green';
        message = 'You\'re taking the right steps. Here\'s how to stay safe: Continue building your support network and keep safety resources accessible.';
    } else if (AppState.riskScore < 0.50) {
        riskLevel = 'Moderate Risk';
        emoji = '🟡';
        color = 'text-yellow-500';
        message = 'You\'re taking the right steps. Here\'s how to stay safe: We recommend creating a safety plan and reviewing available resources. Consider reaching out to a domestic violence advocate.';
    } else if (AppState.riskScore < 0.75) {
        riskLevel = 'High Risk';
        emoji = '🔴';
        color = 'text-alert-red';
        message = 'You\'re taking the right steps. Here\'s how to stay safe: Your safety is our priority. Please consider contacting the National Domestic Violence Hotline (1-800-799-7233) and review the resources and safety plan features.';
    } else {
        riskLevel = 'Extreme Risk';
        emoji = '🚨';
        color = 'text-alert-red';
        message = 'IMMEDIATE ACTION RECOMMENDED: You may be in serious danger. Please contact the National Domestic Violence Hotline (1-800-799-7233) immediately or call 911 if you need emergency help. Consider accessing emergency shelter and safety resources now.';
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
    const previousPlan = AppState.safetyPlan ? hydrateSafetyPlan(AppState.safetyPlan) : null;
    const plan = hydrateSafetyPlan(previousPlan || {});
    const answers = Array.isArray(AppState.assessmentAnswers) ? AppState.assessmentAnswers : [];
    const answeredYes = (id) => answers.some(entry => entry.questionId === id && entry.answer === true);
    const getProtocol = (protocolId) => plan.scenarioProtocols.find(protocol => protocol.id === protocolId);

    const risk = typeof AppState.riskScore === 'number' ? AppState.riskScore : 0;
    const moderateUrgent = [
        "Keep your phone charged and within reach at all times",
        "Share your code word with trusted contacts and test it",
        "Identify the fastest exit route from every room",
        "Store a spare key, cash, and copies of documents with someone you trust"
    ];
    const highUrgent = [
        ...moderateUrgent,
        "Pack and hide an emergency bag outside your home if possible",
        "Sleep with your phone, keys, and shoes nearby",
        "Let a trusted person know when you expect to check in next"
    ];
    const extremeUrgent = [
        ...highUrgent,
        "Move medications, IDs, and critical documents to your go-bag now",
        "Arrange transportation for an emergency departure",
        "Keep a charged backup phone or portable battery in your go-bag"
    ];

    if (risk >= 0.25) {
        addUniquePlanItems(plan, 'urgentActions', moderateUrgent, { source: 'risk', priority: 'critical' });
    }
    if (risk >= 0.5) {
        addUniquePlanItems(plan, 'urgentActions', highUrgent, { source: 'risk', priority: 'critical' });
    }
    if (risk >= 0.75) {
        addUniquePlanItems(plan, 'urgentActions', extremeUrgent, { source: 'risk', priority: 'critical' });
    }

    // Personalise sections based on assessment responses
    if (answeredYes(4) || answeredYes(5)) {
        addUniquePlanItems(plan, 'weaponSafety', [
            "Plan which doors or windows you can use that avoid the area where weapons are stored",
            "Create a signal to alert children or other household members to leave immediately",
            "If safe, ask a trusted person to store weapons separately or remove ammunition"
        ], { source: 'risk', priority: 'critical' });
        const incidentProtocol = getProtocol('during-incident');
        if (incidentProtocol) {
            addUniqueProtocolSteps(incidentProtocol, [
                "Do not try to grab or control the weapon; focus on creating distance",
                "If you cannot leave safely, put a solid object between you and the weapon"
            ]);
        }
    }

    if (answeredYes(7)) {
        addUniquePlanItems(plan, 'childSafety', [
            "Pack identification, medical info, and comfort items for each child",
            "Practice a calm exit plan with children when it is safe to do so",
            "Share your child safety plan with schools or caregivers"
        ], { source: 'risk', priority: 'high' });
        const leavingProtocol = getProtocol('preparing-to-leave');
        if (leavingProtocol) {
            addUniqueProtocolSteps(leavingProtocol, [
                "Arrange childcare or safe pickup plans before leaving",
                "Keep copies of custody documents and birth certificates with your emergency items"
            ]);
        }
    }

    if (answeredYes(3)) {
        addUniquePlanItems(plan, 'supportNetwork', [
            "Schedule a confidential medical check-up or trauma-informed counseling appointment",
            "Identify a sexual assault services provider and store their hotline number"
        ], { source: 'risk', priority: 'high' });
        addUniquePlanItems(plan, 'followUpReminders', [
            "Plan a health check with a medical professional when safe"
        ], { source: 'risk' });
    }

    if (answeredYes(9)) {
        addUniquePlanItems(plan, 'financialSafety', [
            "Gather pay stubs, tax returns, and benefit documents",
            "Set up paperless statements sent to a secure email account",
            "Identify a safe location to store cash and financial documents"
        ], { source: 'risk', priority: 'medium' });
    }

    if (answeredYes(10)) {
        addUniquePlanItems(plan, 'techSafety', [
            "Document stalking incidents with dates, times, and screenshots",
            "Disable location sharing in social media, messaging apps, and photo services",
            "Vary your daily routines and routes when possible"
        ], { source: 'risk' });
        addUniquePlanItems(plan, 'workplaceSafety', [
            "Ask building security for assistance when arriving or leaving",
            "Request a temporary workspace change if you have been followed to work"
        ], { source: 'risk' });
    }

    if (answeredYes(6)) {
        addUniquePlanItems(plan, 'urgentActions', [
            "If threats escalate, call emergency services immediately",
            "Share specific threat details with an advocate or trusted contact"
        ], { source: 'risk', priority: 'critical' });
        const afterLeavingProtocol = getProtocol('after-leaving');
        if (afterLeavingProtocol) {
            addUniqueProtocolSteps(afterLeavingProtocol, [
                "File a police report documenting threats when it is safe",
                "Discuss protective order options with a legal advocate"
            ]);
        }
    }

    if (answeredYes(2)) {
        const afterLeavingProtocol = getProtocol('after-leaving');
        if (afterLeavingProtocol) {
            addUniqueProtocolSteps(afterLeavingProtocol, [
                "Seek medical attention for strangulation, even if no injuries are visible",
                "Document injuries with photos or medical reports for legal protection"
            ]);
        }
    }

    if (answeredYes(1)) {
        const incidentProtocol = getProtocol('during-incident');
        if (incidentProtocol) {
            addUniqueProtocolSteps(incidentProtocol, [
                "Have a backup escape route if the situation escalates unexpectedly"
            ]);
        }
        addUniquePlanItems(plan, 'followUpReminders', [
            "Review this plan weekly while the situation is escalating"
        ], { source: 'risk' });
    }

    if (answeredYes(8)) {
        addUniquePlanItems(plan, 'supportNetwork', [
            "Record controlling incidents in a secure journal or app",
            "Share patterns of control with an advocate to build documentation"
        ], { source: 'risk', priority: 'high' });
    }

    if (answeredYes(11)) {
        addUniquePlanItems(plan, 'selfCare', [
            "Plan safe places to stay when substance use increases risk",
            "Keep emergency contacts informed about patterns tied to substance use"
        ], { source: 'risk' });
    }

    if (answeredYes(12)) {
        addUniquePlanItems(plan, 'communicationPlan', [
            "Schedule daily emotional check-ins with someone you trust",
            "Create a calming routine you can access quickly when you feel afraid"
        ], { source: 'risk', priority: 'high' });
    }

    if (answeredYes(13)) {
        const leavingProtocol = getProtocol('preparing-to-leave');
        if (leavingProtocol) {
            addUniqueProtocolSteps(leavingProtocol, [
                "Create multiple exit plans in case the first attempt is blocked",
                "Keep transportation options flexible (rideshare, public transit, trusted driver)"
            ]);
        }
        addUniquePlanItems(plan, 'supportNetwork', [
            "Debrief with a trusted person after any attempt to leave to adjust your plan"
        ], { source: 'risk', priority: 'high' });
    }

    saveSafetyPlan(plan);
}

function displaySafetyPlan() {
    const container = document.getElementById('safety-plan-content');
    if (!container) {
        return;
    }

    const rawPlan = AppState.safetyPlan || (() => {
        try {
            const stored = localStorage.getItem(SAFETY_PLAN_LOCAL_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error reading safety plan snapshot:', error);
            return null;
        }
    })();

    const plan = hydrateSafetyPlan(rawPlan);
    saveSafetyPlan(plan);

    const progress = getPlanProgress(plan);
    const riskScore = typeof AppState.riskScore === 'number' ? AppState.riskScore : 0;
    const warnings = getSafetyPlanWarnings(plan, riskScore);
    const sectionsHtml = SAFETY_PLAN_SECTIONS
        .map(section => renderPlanSection(section, plan))
        .join('');

    container.innerHTML = `${renderPlanSummary(progress)}${renderPlanWarnings(warnings)}${sectionsHtml}`;
    setupSafetyPlanInteractions(container, plan);
    trackEvent('view_safety_plan');
}

function exportSafetyPlan() {
    // Merge stored plan with defaults so the export always has full content
    const storedPlan = AppState.safetyPlan || (() => {
        try {
            const raw = localStorage.getItem(SAFETY_PLAN_LOCAL_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Error reading stored safety plan for export:', error);
            return null;
        }
    })();
    const plan = hydrateSafetyPlan(storedPlan);

    const ensureArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === '') return [];
        return [value];
    };

    const esc = (str) => {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\n/g, '<br>');
    };

    const asPlainString = (item) => {
        if (item === null || item === undefined) return '';
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
            if (typeof item.text === 'string') {
                return item.text;
            }
            const name = item.name || item.label || '';
            const detail = item.phone || item.value || item.details || item.contact || '';
            const note = item.notes || '';
            const primary = [name, detail].filter(Boolean).join(': ');
            if (primary && note) return `${primary} (${note})`;
            return primary || note || '';
        }
        return String(item);
    };

    const normalizeChecklistItem = (item, index) => {
        if (item && typeof item === 'object' && typeof item.text === 'string') {
            const text = item.text.trim();
            if (!text) return null;
            return { text, checked: Boolean(item.checked) };
        }
        const fallback = asPlainString(item).trim();
        if (!fallback) {
            return null;
        }
        return { text: fallback, checked: false };
    };

    const listSection = (heading, items, options = {}) => {
        const { numbered = false, checkable = false } = options;
        const safeItems = checkable
            ? ensureArray(items).map(normalizeChecklistItem).filter(Boolean)
            : ensureArray(items).map(asPlainString).map(item => item.trim()).filter(item => item.length > 0);

        if (!safeItems.length) return '';

        const listTag = numbered ? 'ol' : 'ul';
        const listStyle = numbered
            ? 'margin:0;padding-left:22px;color:#374151;line-height:1.6;'
            : 'margin:0;padding-left:18px;color:#374151;line-height:1.6;';

        const itemsMarkup = safeItems
            .map((item, idx) => {
                if (checkable) {
                    const isObject = typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, 'text');
                    const text = isObject ? item.text : item;
                    const checked = isObject ? item.checked : false;
                    const mark = checked ? '☑' : '☐';
                    if (numbered) {
                        return `<li style="margin-bottom:6px">${idx + 1}. <span style="display:inline-block;width:18px;margin-left:6px;">${mark}</span> ${esc(text)}</li>`;
                    }
                    return `<li style="margin-bottom:6px"><span style="display:inline-block;width:16px;margin-right:8px;">${mark}</span>${esc(text)}</li>`;
                }
                return `<li style="margin-bottom:6px">${esc(item)}</li>`;
            })
            .join('');

        return `
            <section style="padding:16px 24px; border-bottom:1px solid #f1f5f9;">
                <h2 style="font-size:14px; margin:0 0 8px; color:#111827;">${esc(heading)}</h2>
                <${listTag} style="${listStyle}">
                    ${itemsMarkup}
                </${listTag}>
            </section>`;
    };

    const textSection = (heading, value, fallback) => {
        const normalized = value && typeof value === 'string' ? value.trim() : '';
        const content = normalized || fallback || '';
        if (!content) return '';
        return `
            <section style="padding:16px 24px; border-bottom:1px solid #f1f5f9;">
                <h2 style="font-size:14px; margin:0 0 8px; color:#111827;">${esc(heading)}</h2>
                <div style="color:#374151; line-height:1.6;">${esc(content)}</div>
            </section>`;
    };

    const protocolSection = (protocols) => {
        if (!Array.isArray(protocols) || !protocols.length) return '';
        const cards = protocols
            .filter(protocol => protocol && Array.isArray(protocol.steps) && protocol.steps.length)
            .map(protocol => {
                const steps = protocol.steps
                    .map(step => step && step.trim())
                    .filter(Boolean)
                    .map(step => `<li style="margin-bottom:6px">${esc(step)}</li>`)
                    .join('');
                if (!steps) return '';
                return `
                    <section style="padding:16px 24px; border-bottom:1px solid #f1f5f9;">
                        <h2 style="font-size:14px; margin:0 0 8px; color:#111827;">${esc(protocol.title || 'Scenario Plan')}</h2>
                        <ol style="margin:0;padding-left:22px;color:#374151;line-height:1.6;">
                            ${steps}
                        </ol>
                    </section>
                `;
            })
            .join('');
        return cards || '';
    };

    const emergencyContacts = [
        'National Domestic Violence Hotline: 1-800-799-7233',
        'Emergency Services: 911',
        ...ensureArray(plan.emergencyContacts)
    ];

    const title = 'Meeting Notes';
    const createdAt = new Date().toLocaleString();
    const header = `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; padding:24px;">
            <h1 style="margin:0 0 8px; font-size:20px; color:#111827;">${esc(title)}</h1>
            <div style="font-size:12px; color:#6b7280; margin-bottom:12px">Exported: ${esc(createdAt)}</div>
        </div>`;

    const html = `
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <title>${esc(title)}</title>
            <style>
                body { margin:0; background:#f8fafc; font-family: system-ui, -apple-system, Arial, sans-serif; }
                .page { max-width:800px; margin:18px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
                header { border-bottom:1px solid #e6e9ee; }
                h1,h2 { font-weight:600; }
                @media print { body { background:#fff; } .page { box-shadow:none; border-radius:0; margin:0; } }
            </style>
        </head>
        <body>
            <div class="page">
                <header>${header}</header>
                ${listSection('Urgent Actions', plan.urgentActions, { checkable: true })}
                ${listSection('Emergency Contacts', emergencyContacts)}
                ${listSection('Communication Plan', plan.communicationPlan, { checkable: true })}
                ${listSection('Support Network', plan.supportNetwork, { checkable: true })}
                ${listSection('Important Documents', plan.importantDocuments, { checkable: true })}
                ${listSection('Essential Items', plan.essentialItems, { checkable: true })}
                ${listSection('Safety Steps', plan.safetySteps, { numbered: true, checkable: true })}
                ${listSection('Technology Safety', plan.techSafety, { checkable: true })}
                ${listSection('Financial Safety', plan.financialSafety, { checkable: true })}
                ${listSection('Legal Preparation', plan.legalPreparation, { checkable: true })}
                ${listSection('Workplace Safety', plan.workplaceSafety, { checkable: true })}
                ${listSection('Weapon Safety', plan.weaponSafety, { checkable: true })}
                ${listSection('Child Safety', plan.childSafety, { checkable: true })}
                ${protocolSection(plan.scenarioProtocols)}
                ${listSection('Self-Care & Recovery', plan.selfCare, { checkable: true })}
                ${listSection('Follow-Up Reminders', plan.followUpReminders, { checkable: true })}
                ${textSection('Safe Place Plan', plan.safePlace, 'Add details about where you can go quickly if you need to leave.')}
                ${textSection('Additional Notes', plan.notes, 'Use this space for important details, license plates, schedules, or other reminders.')}
                <section style="padding:16px 24px; font-size:11px; color:#6b7280;">
                    Keep this plan secured and update it when your circumstances change.
                </section>
            </div>
        </body>
        </html>
    `;

    // Open printable view in a new window and trigger print. Many browsers will use document.title as default PDF filename.
    try {
        const win = window.open('', '_blank');
        if (!win) throw new Error('popup-blocked');
        win.document.open();
        win.document.write(html);
        win.document.close();
        // Set title (suggested filename for Save as PDF)
        try { win.document.title = title; } catch (e) {}
        // Give the new window a moment to render then trigger print
        setTimeout(() => {
            try {
                win.focus();
                win.print();
            } catch (err) {
                console.warn('Print failed', err);
            }
            // Close the window after a short delay to avoid leaving extra tabs open
            setTimeout(() => { try { win.close(); } catch (e) {} }, 800);
        }, 350);
    } catch (err) {
        // Fallback: if popup blocked, offer a .txt download (previous behaviour)
        const text = JSON.stringify(plan, null, 2);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes_export.txt'; // innocuous fallback name
        a.click();
        URL.revokeObjectURL(url);
    }

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


// Emergency Mode - start
// Helper function to sync silent mode toggles
function syncSilentModeToggles() {
    const silentModeEnabled = localStorage.getItem('safey_silent_emergency_enabled') === 'true';
    const silentModeToggle = document.getElementById('silent-mode-toggle');
    const silentEmergencyEnabledCheckbox = document.getElementById('silent-emergency-enabled');
    
    if (silentModeToggle) {
        silentModeToggle.checked = silentModeEnabled;
    }
    if (silentEmergencyEnabledCheckbox) {
        silentEmergencyEnabledCheckbox.checked = silentModeEnabled;
    }
}

// Show Emergency Mode Screen
function showEmergencyMode() {
    trackEvent('emergency_mode');
    eventLogger.logEvent('emergencyModeActivated');
    showScreen('emergency');
    
    // Sync the silent mode toggle with saved setting
    syncSilentModeToggles();
    
    // Suspend background safety checks to avoid conflicting popups
    if (window.unlockHandler && unlockHandler.pauseSafetyChecks) {
        unlockHandler.pauseSafetyChecks();
    }
}

// Silent Emergency Mode function
async function silentEmergencyMode() {
    // Check if silent emergency mode is enabled
    const silentModeEnabled = localStorage.getItem('safey_silent_emergency_enabled') === 'true';
    
    if (!silentModeEnabled) {
        console.log('Silent emergency mode is disabled');
        return;
    }
    
    // Log the event without any visible UI changes
    trackEvent('silent_emergency_triggered');
    await eventLogger.logEvent('silentEmergencyTriggered');
    
    // Add to encrypted event log
    console.log('Silent emergency event logged at:', new Date().toISOString());
    
    // Vibrate once for silent confirmation (if supported)
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
    
    // Add event to alert queue without showing it
    // This will be visible when stealth mode is exited
    const silentEvent = {
        type: 'silent_emergency',
        timestamp: Date.now(),
        message: 'Silent emergency triggered'
    };
    
    // Store in queue
    const eventQueue = JSON.parse(localStorage.getItem('safey_silent_events') || '[]');
    eventQueue.push(silentEvent);
    localStorage.setItem('safey_silent_events', JSON.stringify(eventQueue));
}

// Send Trusted Contact Alert (stub for now)
function sendTrustedContactAlert() {
    // TODO: Implement trusted contact messaging
    // For now, show a toast notification
    showToast('Trusted contact feature coming soon. Please use Call 911 for immediate help.', 'info', 5000);
    trackEvent('trusted_contact_attempted');
    eventLogger.logEvent('trustedContactAlertAttempted');
}

// Legacy emergency mode function - redirect to new implementation
async function activateEmergencyMode() {
    showEmergencyMode();
}
// Emergency Mode - end

// Settings Functions
function showSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
    document.getElementById('settings-modal').classList.add('flex');
    
    // Ensure unlock hint is properly set when modal opens
    const currentTemplate = stealthSettings.getSetting('disguiseTemplate') || 'calculator';
    const templateUnlockHint = document.getElementById('template-unlock-hint');
    if (templateUnlockHint) {
        if (currentTemplate === 'calculator') {
            templateUnlockHint.textContent = '🔒 Secure (= three times) - Enter PIN then press = three times to unlock';
            templateUnlockHint.classList.remove('hidden');
        } else {
            templateUnlockHint.classList.add('hidden');
        }
    }
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
        lastSavedPlanSignature = null;

        try {
            await storageUtils.deleteData('settings', SAFETY_PLAN_SECURE_KEY);
        } catch (error) {
            console.error('Failed to clear stored safety plan:', error);
        }
        
        // Clear stealth data using new system
        await stealthController.clearAllData();
        
        hideSettings();
        showScreen('home');
        showToast('All data cleared', 'success', 4000);
    }
}


// Initialize App
async function init() {
    // Initialize stealth system first
    await stealthController.init();

    // Initialize chatbot
    await chatbot.init();

    // Initialize inline chatbot after chatbot is ready
    initializeInlineChatbot();

    // Enable debug keyboard shortcut
    debugUI.enableKeyboardShortcut();
    
    // Load saved events
    const savedEvents = localStorage.getItem('safey_events');
    if (savedEvents) {
        AppState.checkInEvents = JSON.parse(savedEvents);
    }
    
    // Load saved plan with secure persistence
    const savedPlan = await loadPersistedSafetyPlan();
    if (savedPlan) {
        AppState.safetyPlan = savedPlan;
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


    
    // Emergency Mode - start
    // Event Listeners - Emergency Screen
    document.getElementById('emergency-back').addEventListener('click', () => showScreen('home'));
    document.getElementById('text-trusted-contact').addEventListener('click', sendTrustedContactAlert);
    document.getElementById('view-nearby-resources').addEventListener('click', () => {
        showScreen('resources');
        displayResources('hotline');
    });
    
    // Silent mode toggle on emergency screen
    const silentModeToggle = document.getElementById('silent-mode-toggle');
    silentModeToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        localStorage.setItem('safey_silent_emergency_enabled', enabled);
        
        // Sync with the settings toggle
        syncSilentModeToggles();
        
        showToast(
            enabled ? 'Silent emergency mode enabled' : 'Silent emergency mode disabled',
            'success'
        );
    });
    
    // Load saved silent mode setting
    syncSilentModeToggles();
    
    // Triple-tap gesture listener for silent emergency mode
    let tapCount = 0;
    let tapTimer = null;
    const TAP_TIMEOUT = 500; // ms between taps
    const CORNER_SIZE = 100; // pixels for corner detection
    
    document.addEventListener('click', (e) => {
        // Check if click is in bottom-right corner
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const isBottomRight = (
            e.clientX > (windowWidth - CORNER_SIZE) &&
            e.clientY > (windowHeight - CORNER_SIZE)
        );
        
        if (isBottomRight) {
            tapCount++;
            
            // Clear existing timer
            if (tapTimer) {
                clearTimeout(tapTimer);
            }
            
            // Check if we've reached 3 taps
            if (tapCount >= 3) {
                silentEmergencyMode();
                tapCount = 0;
                tapTimer = null;
            } else {
                // Reset counter after timeout
                tapTimer = setTimeout(() => {
                    tapCount = 0;
                    tapTimer = null;
                }, TAP_TIMEOUT);
            }
        }
    });
    // Emergency Mode - end
    
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

    // Event Listeners - Chatbot Screen
    document.getElementById('chatbot-back').addEventListener('click', () => showScreen('home'));
    document.getElementById('send-message').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    document.getElementById('save-api-key').addEventListener('click', saveApiKey);

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
    const pinInput = document.getElementById('pin-input');
    const updatePinInputValidation = () => {
        const pinLength = stealthSettings.getSetting('pinLength') || 6;
        pinInput.maxLength = pinLength;
        pinInput.placeholder = `Enter ${pinLength}-digit PIN`;
        pinInput.setAttribute('aria-label', `Set ${pinLength}-digit unlock PIN`);
    };
    
    pinInput.addEventListener('blur', async (e) => {
        const pin = e.target.value;
        const pinLength = stealthSettings.getSetting('pinLength') || 6;
        const pinRegex = new RegExp(`^\\d{${pinLength}}$`);
        
        if (pin && pin.length === pinLength && pinRegex.test(pin)) {
            try {
                await stealthController.updatePin(pin);
                showToast('PIN updated successfully', 'success');
                e.target.value = '';
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    });
    
    // Initialize PIN input validation
    updatePinInputValidation();
    
    // Disguise template
    const templateSelect = document.getElementById('disguise-template');
    const templateUnlockHint = document.getElementById('template-unlock-hint');
    
    // Function to update unlock hint based on template
    const updateUnlockHint = (template) => {
        if (templateUnlockHint) {
            if (template === 'calculator') {
                templateUnlockHint.textContent = '🔒 Secure (= three times) - Enter PIN then press = three times to unlock';
                templateUnlockHint.classList.remove('hidden');
            } else if (template === 'notes') {
                templateUnlockHint.textContent = '🔒 Secure (⋯ five times) - Press the three-dot menu five times to unlock';
                templateUnlockHint.classList.remove('hidden');
            } else if (template === 'weather') {
                templateUnlockHint.textContent = '🔒 Secure (double-tap) - Double-tap anywhere on screen to unlock';
                templateUnlockHint.classList.remove('hidden');
            } else {
                templateUnlockHint.classList.add('hidden');
            }
        }
    };
    
    templateSelect.addEventListener('change', async (e) => {
        const template = e.target.value;
        
        // Update unlock hint
        updateUnlockHint(template);
        
        await stealthController.changeTemplate(template);
    });
    
    // PIN length selector
    const pinLengthSelect = document.getElementById('pin-length-select');
    pinLengthSelect.addEventListener('change', async (e) => {
        const newLength = parseInt(e.target.value);
        try {
            await stealthSettings.updatePinLength(newLength);
            updatePinInputValidation();
            showToast(`PIN length updated to ${newLength} digits`, 'success');
        } catch (error) {
            showToast(error.message, 'error');
            // Reset to current value
            const currentLength = stealthSettings.getSetting('pinLength') || 6;
            pinLengthSelect.value = currentLength;
        }
    });
    
    // Load current PIN length
    const currentPinLength = stealthSettings.getSetting('pinLength') || 6;
    pinLengthSelect.value = currentPinLength;
    
    // Load current template
    const currentTemplate = stealthSettings.getSetting('disguiseTemplate') || 'calculator';
    templateSelect.value = currentTemplate;
    updateUnlockHint(currentTemplate);
    
    // Custom URL
    document.getElementById('save-custom-url').addEventListener('click', async () => {
        const url = document.getElementById('custom-url-input').value;
        if (url) {
            try {
                const saved = await stealthController.setCustomUrl(url);
                if (saved) {
                    showToast('Custom URL saved successfully', 'success');
                }
            } catch (error) {
                showToast(error.message, 'error');
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
    const triggerLogoCheckbox = document.getElementById('trigger-logo');
    const triggerCornerCheckbox = document.getElementById('trigger-corner');

    triggerLogoCheckbox.addEventListener('change', async (e) => {
        await stealthTriggerHandler.updateSettings({
            triggersEnabled: { logoDoubleTap: e.target.checked }
        });
    });
    
    triggerCornerCheckbox.addEventListener('change', async (e) => {
        await stealthTriggerHandler.updateSettings({
            triggersEnabled: { cornerMultiTap: e.target.checked }
        });
    });

    const triggersEnabled = stealthSettings.getSetting('triggersEnabled') || {};
    triggerLogoCheckbox.checked = triggersEnabled.logoDoubleTap !== false;
    triggerCornerCheckbox.checked = triggersEnabled.cornerMultiTap !== false;
    
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
    
    // Emergency Mode - start
    // Silent emergency toggle in settings
    const silentEmergencyEnabledCheckbox = document.getElementById('silent-emergency-enabled');
    if (silentEmergencyEnabledCheckbox) {
        silentEmergencyEnabledCheckbox.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('safey_silent_emergency_enabled', enabled);
            
            // Sync with the emergency screen toggle
            syncSilentModeToggles();
            
            showToast(
                enabled ? 'Silent emergency mode enabled' : 'Silent emergency mode disabled',
                'success'
            );
        });
        
        // Load current setting
        syncSilentModeToggles();
    }
    // Emergency Mode - end
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Determine the correct service worker path
        // For GitHub Pages project sites, we need to include the base path
        const getServiceWorkerPath = () => {
            const pathname = window.location.pathname;
            // If we're at a path like /SAFEY_1/, extract the base
            const match = pathname.match(/^(\/[^\/]+)\//);
            // Only apply base path for GitHub Pages (must end with .github.io)
            if (match && window.location.hostname.endsWith('.github.io')) {
                return match[1] + '/service-worker.js';
            }
            return '/service-worker.js';
        };
        
        const swPath = getServiceWorkerPath();
        
        navigator.serviceWorker.register(swPath)
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);
                
                // Check for updates periodically (every hour)
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
                
                // Handle waiting service worker (update available)
                if (registration.waiting) {
                    handleWaitingServiceWorker(registration.waiting);
                }
                
                // Listen for new service worker installing
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker installed and waiting
                            handleWaitingServiceWorker(newWorker);
                        }
                    });
                });
                
                // Listen for controller change (new SW activated)
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    // Reload to use the new service worker
                    window.location.reload();
                });
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Handle waiting service worker
function handleWaitingServiceWorker(worker) {
    // Notify user that an update is available
    const shouldUpdate = confirm(
        'A new version of SAFEY is available. Would you like to update now? ' +
        'Click OK to update (the page will reload) or Cancel to update later.'
    );
    
    if (shouldUpdate) {
        // Tell the waiting service worker to skip waiting
        worker.postMessage({ type: 'SKIP_WAITING' });
    }
}

// Chatbot Functions
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    if (!chatbot.isReady()) {
        showToast('Chatbot not ready. Please set API key in settings.', 'error');
        return;
    }

    // Add user message to UI
    addChatMessage('user', message);

    // Clear input
    input.value = '';

    // Show loading
    const loadingId = addChatMessage('assistant', 'Thinking...', true);

    try {
        const response = await chatbot.sendMessage(message);
        // Remove loading message
        removeChatMessage(loadingId);
        // Add actual response
        addChatMessage('assistant', response);
    } catch (error) {
        removeChatMessage(loadingId);
        addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        console.error('Chat error:', error);
    }
}

function addChatMessage(role, content, isLoading = false) {
    const container = document.getElementById('chat-messages');
    if (!container) return null;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role} ${isLoading ? 'loading' : ''}`;
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;

    return messageDiv; // Return for removal if loading
}

function removeChatMessage(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function displayChatHistory() {
    const messages = chatbot.getMessageHistory();
    const container = document.getElementById('chat-messages');
    if (!container) return;

    // Clear existing messages
    container.innerHTML = '';

    // Add all messages from history
    messages.forEach(message => {
        addChatMessage(message.role, message.content);
    });
}

async function saveApiKey() {
    const input = document.getElementById('groq-api-key');
    const apiKey = input.value.trim();

    if (!apiKey) {
        showToast('Please enter a Groq API key', 'error');
        return;
    }

    try {
        const success = await chatbot.setApiKey(apiKey);
        if (success) {
            input.value = '';
            showToast('Groq API key saved successfully', 'success');
        } else {
            showToast('Failed to save Groq API key', 'error');
        }
    } catch (error) {
        showToast('Error saving Groq API key', 'error');
        console.error('Groq API key save error:', error);
    }
}

// Inline Chatbot Logic
function initializeInlineChatbot() {
    const form = document.getElementById('inline-chatbot-form');
    const input = document.getElementById('inline-chatbot-input');
    const submitBtn = document.getElementById('inline-chatbot-submit');
    const sendIcon = document.getElementById('send-icon');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (!form || !input || !submitBtn || !sendIcon || !loadingSpinner) {
        console.error('Inline chatbot elements not found');
        return;
    }

    input.addEventListener('input', () => {
        submitBtn.disabled = input.value.trim() === '';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = input.value.trim();
        if (!userMessage) return;

        if (!chatbot.isReady()) {
            showToast('Chatbot not ready. Please try again later.', 'error');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        sendIcon.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        try {
            await chatbot.sendMessage(userMessage);
            
            // Transition to chatbot screen
            showScreen('chatbot');
            displayChatHistory();

            // Reset input
            input.value = '';

        } catch (error) {
            console.error('Inline chatbot error:', error);
            showToast('Sorry, I couldn\'t get a response. Please try again.', 'error');
        } finally {
            // Hide loading state
            submitBtn.disabled = false;
            sendIcon.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // ... existing event listeners ...
    // ... existing event listeners ...
});

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
