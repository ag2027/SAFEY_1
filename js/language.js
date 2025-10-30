// Language Manager for SAFEY
// Handles language switching between English and Spanish

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en'; // default to English
        this.translations = {
            en: {
                // Home Screen
                'home.welcome': 'Welcome back, you're in control.',
                'home.subtitle': 'Your safety starts here.',
                'home.chatbot.placeholder': 'Ask the Safety Assistant…',
                'home.assessment': 'Start Assessment',
                'home.safetyPlan': 'My Safety Plan',
                'home.resources': 'Resources',
                'home.emergency': 'Emergency Mode',
                'home.privacy': 'Your data stays private and offline.',
                
                // Assessment Screen
                'assessment.title': 'Personal Safety Check',
                'assessment.subtitle': 'Answer honestly — this stays on your device.',
                'assessment.question': 'Question',
                'assessment.of': 'of',
                'assessment.results.title': 'Your Assessment Results',
                'assessment.generatePlan': 'Generate My Safety Plan',
                'assessment.viewResources': 'View Local Resources',
                'assessment.retake': 'Take Assessment Again',
                
                // Safety Plan Screen
                'plan.title': 'Your Personalized Safety Plan',
                'plan.subtitle': 'Edit and save steps you feel comfortable with.',
                'plan.download': 'Download as PDF',
                'plan.progress': 'Plan Progress',
                'plan.complete': 'complete',
                'plan.of': 'of',
                'plan.items': 'items',
                
                // Resources Screen
                'resources.title': 'Resources',
                'resources.search': 'Find nearby shelters, legal aid, or hotlines',
                'resources.all': 'All',
                'resources.hotlines': 'Hotlines',
                'resources.shelters': 'Shelters',
                'resources.legal': 'Legal',
                'resources.counseling': 'Counseling',
                'resources.financial': 'Financial',
                'resources.childServices': 'Child Services',
                'resources.lgbtq': 'LGBTQ+',
                'resources.techSafety': 'Tech Safety',
                'resources.call': 'Call',
                'resources.website': 'Website',
                'resources.offline': 'Offline mode: showing saved resources',
                
                // Emergency Screen
                'emergency.title': 'Emergency Mode',
                'emergency.subtitle': 'Quick access to emergency resources',
                'emergency.call911': 'Call 911',
                'emergency.textContact': 'Text Trusted Contact',
                'emergency.viewResources': 'View Nearby Resources',
                'emergency.silentMode': 'Silent Emergency Mode',
                'emergency.silentDescription': 'Activate emergency without visible changes',
                'emergency.silentInfo': 'Silent Mode: When enabled, you can trigger a silent emergency by triple-tapping the bottom-right corner of the screen. This will log the event without any visible changes.',
                
                // Chatbot Screen
                'chatbot.title': 'Safety Assistant',
                'chatbot.subtitle': 'Talk to our AI safety assistant',
                'chatbot.placeholder': 'Type your message...',
                'chatbot.thinking': 'Thinking...',
                'chatbot.welcome': 'Hi! I\'m here to help you with safety concerns. You can ask me about resources, safety planning, or just talk about what\'s on your mind. Everything stays private on your device.',
                
                // Settings Modal
                'settings.title': 'Settings',
                'settings.language': 'Language',
                'settings.languageDesc': 'Choose your preferred language',
                'settings.english': 'English',
                'settings.spanish': 'Spanish',
                'settings.pinLength': 'PIN Length',
                'settings.pinLengthDesc': 'Longer PINs are more secure but take longer to enter',
                'settings.stealthPin': 'Stealth Mode PIN',
                'settings.stealthPinPlaceholder': 'Enter 6-digit PIN',
                'settings.stealthPinDesc': 'Used to unlock stealth mode. Current PIN: ****',
                'settings.disguiseTemplate': 'Disguise Template',
                'settings.templateDesc': 'Choose how SAFEY appears in stealth mode',
                'settings.calculator': 'Calculator',
                'settings.notes': 'Notes',
                'settings.weather': 'Weather',
                'settings.autoLock': 'Auto-Lock Timeout',
                'settings.autoLockDesc': 'Automatically activate stealth after inactivity',
                'settings.triggers': 'Activation Triggers',
                'settings.logoTap': 'Logo double-tap',
                'settings.cornerTap': 'Corner multi-tap',
                'settings.cornerSettings': 'Corner Tap Settings',
                'settings.safetyAlerts': 'Safety Alert Behavior',
                'settings.autoSend': 'Auto-Send High-Risk Alerts',
                'settings.autoSendDesc': 'Automatically send critical safety alerts after 10s',
                'settings.trustedContacts': 'Trusted Contacts',
                'settings.trustedContactsDesc': 'Add trusted contacts to send quick alerts during emergencies. All information stays encrypted on this device.',
                'settings.noContacts': 'No trusted contacts yet. Add up to 5 people you can safely reach out to.',
                'settings.addContact': 'Add Trusted Contact',
                'settings.contactName': 'Contact name',
                'settings.contactPhone': 'Phone number',
                'settings.alertMessage': 'Default Alert Message',
                'settings.alertMessagePlaceholder': 'Write the alert message that will be shared with trusted contacts.',
                'settings.emergencyMode': 'Emergency Mode',
                'settings.silentEmergency': 'Enable Silent Emergency Mode',
                'settings.silentEmergencyDesc': 'Triple-tap bottom-right corner to trigger silent emergency',
                'settings.about': 'About SAFEY',
                'settings.aboutDesc': 'Built to empower and protect. All data stays private on your device.',
                'settings.clearData': 'Clear All Data',
                
                // Common buttons
                'button.back': 'Go back to home',
                'button.send': 'Send',
                'button.add': 'Add',
                'button.remove': 'Remove',
                'button.save': 'Save',
                'button.close': 'Close',
                
                // Safety plan sections
                'planSection.urgentActions': 'Urgent Actions',
                'planSection.emergencyContacts': 'Emergency Contacts',
                'planSection.importantDocuments': 'Important Documents',
                'planSection.essentialItems': 'Essential Items',
                'planSection.safetySteps': 'Safety Steps',
                'planSection.communicationPlan': 'Communication Plan',
                'planSection.supportNetwork': 'Support Network',
                'planSection.techSafety': 'Technology Safety',
                'planSection.financialSafety': 'Financial Safety',
                'planSection.legalPreparation': 'Legal Preparation',
                'planSection.workplaceSafety': 'Workplace Safety',
                'planSection.weaponSafety': 'Weapon Safety',
                'planSection.childSafety': 'Child Safety',
                'planSection.scenarioProtocols': 'Scenario Plans',
                'planSection.selfCare': 'Self-Care & Recovery',
                'planSection.followUpReminders': 'Follow-Up Reminders',
                'planSection.safePlace': 'Safe Place Plan',
                'planSection.notes': 'Additional Notes'
            },
            es: {
                // Home Screen
                'home.welcome': 'Bienvenido de nuevo, tú tienes el control.',
                'home.subtitle': 'Tu seguridad comienza aquí.',
                'home.chatbot.placeholder': 'Pregúntale al Asistente de Seguridad…',
                'home.assessment': 'Iniciar Evaluación',
                'home.safetyPlan': 'Mi Plan de Seguridad',
                'home.resources': 'Recursos',
                'home.emergency': 'Modo de Emergencia',
                'home.privacy': 'Tus datos permanecen privados y sin conexión.',
                
                // Assessment Screen
                'assessment.title': 'Verificación de Seguridad Personal',
                'assessment.subtitle': 'Responde honestamente — esto permanece en tu dispositivo.',
                'assessment.question': 'Pregunta',
                'assessment.of': 'de',
                'assessment.results.title': 'Los Resultados de Tu Evaluación',
                'assessment.generatePlan': 'Generar Mi Plan de Seguridad',
                'assessment.viewResources': 'Ver Recursos Locales',
                'assessment.retake': 'Tomar la Evaluación de Nuevo',
                
                // Safety Plan Screen
                'plan.title': 'Tu Plan de Seguridad Personalizado',
                'plan.subtitle': 'Edita y guarda los pasos con los que te sientes cómodo.',
                'plan.download': 'Descargar como PDF',
                'plan.progress': 'Progreso del Plan',
                'plan.complete': 'completo',
                'plan.of': 'de',
                'plan.items': 'elementos',
                
                // Resources Screen
                'resources.title': 'Recursos',
                'resources.search': 'Encuentra refugios, ayuda legal o líneas de ayuda cercanas',
                'resources.all': 'Todos',
                'resources.hotlines': 'Líneas de Ayuda',
                'resources.shelters': 'Refugios',
                'resources.legal': 'Legal',
                'resources.counseling': 'Consejería',
                'resources.financial': 'Financiero',
                'resources.childServices': 'Servicios para Niños',
                'resources.lgbtq': 'LGBTQ+',
                'resources.techSafety': 'Seguridad Tecnológica',
                'resources.call': 'Llamar',
                'resources.website': 'Sitio Web',
                'resources.offline': 'Modo sin conexión: mostrando recursos guardados',
                
                // Emergency Screen
                'emergency.title': 'Modo de Emergencia',
                'emergency.subtitle': 'Acceso rápido a recursos de emergencia',
                'emergency.call911': 'Llamar al 911',
                'emergency.textContact': 'Enviar Mensaje a Contacto de Confianza',
                'emergency.viewResources': 'Ver Recursos Cercanos',
                'emergency.silentMode': 'Modo de Emergencia Silencioso',
                'emergency.silentDescription': 'Activar emergencia sin cambios visibles',
                'emergency.silentInfo': 'Modo Silencioso: Cuando está habilitado, puedes activar una emergencia silenciosa tocando tres veces la esquina inferior derecha de la pantalla. Esto registrará el evento sin cambios visibles.',
                
                // Chatbot Screen
                'chatbot.title': 'Asistente de Seguridad',
                'chatbot.subtitle': 'Habla con nuestro asistente de seguridad con IA',
                'chatbot.placeholder': 'Escribe tu mensaje...',
                'chatbot.thinking': 'Pensando...',
                'chatbot.welcome': '¡Hola! Estoy aquí para ayudarte con preocupaciones de seguridad. Puedes preguntarme sobre recursos, planificación de seguridad, o simplemente hablar sobre lo que tienes en mente. Todo permanece privado en tu dispositivo.',
                
                // Settings Modal
                'settings.title': 'Configuración',
                'settings.language': 'Idioma',
                'settings.languageDesc': 'Elige tu idioma preferido',
                'settings.english': 'Inglés',
                'settings.spanish': 'Español',
                'settings.pinLength': 'Longitud del PIN',
                'settings.pinLengthDesc': 'Los PINs más largos son más seguros pero tardan más en ingresarse',
                'settings.stealthPin': 'PIN del Modo Oculto',
                'settings.stealthPinPlaceholder': 'Ingresa un PIN de 6 dígitos',
                'settings.stealthPinDesc': 'Se usa para desbloquear el modo oculto. PIN actual: ****',
                'settings.disguiseTemplate': 'Plantilla de Disfraz',
                'settings.templateDesc': 'Elige cómo aparece SAFEY en modo oculto',
                'settings.calculator': 'Calculadora',
                'settings.notes': 'Notas',
                'settings.weather': 'Clima',
                'settings.autoLock': 'Tiempo de Bloqueo Automático',
                'settings.autoLockDesc': 'Activar modo oculto automáticamente después de inactividad',
                'settings.triggers': 'Disparadores de Activación',
                'settings.logoTap': 'Doble toque en el logo',
                'settings.cornerTap': 'Multi-toque en la esquina',
                'settings.cornerSettings': 'Configuración de Toque en Esquina',
                'settings.safetyAlerts': 'Comportamiento de Alertas de Seguridad',
                'settings.autoSend': 'Envío Automático de Alertas de Alto Riesgo',
                'settings.autoSendDesc': 'Enviar automáticamente alertas críticas de seguridad después de 10s',
                'settings.trustedContacts': 'Contactos de Confianza',
                'settings.trustedContactsDesc': 'Agrega contactos de confianza para enviar alertas rápidas durante emergencias. Toda la información permanece cifrada en este dispositivo.',
                'settings.noContacts': 'Aún no hay contactos de confianza. Agrega hasta 5 personas con las que puedas contactar de forma segura.',
                'settings.addContact': 'Agregar Contacto de Confianza',
                'settings.contactName': 'Nombre del contacto',
                'settings.contactPhone': 'Número de teléfono',
                'settings.alertMessage': 'Mensaje de Alerta Predeterminado',
                'settings.alertMessagePlaceholder': 'Escribe el mensaje de alerta que se compartirá con los contactos de confianza.',
                'settings.emergencyMode': 'Modo de Emergencia',
                'settings.silentEmergency': 'Habilitar Modo de Emergencia Silencioso',
                'settings.silentEmergencyDesc': 'Toca tres veces la esquina inferior derecha para activar emergencia silenciosa',
                'settings.about': 'Acerca de SAFEY',
                'settings.aboutDesc': 'Creado para empoderar y proteger. Todos los datos permanecen privados en tu dispositivo.',
                'settings.clearData': 'Borrar Todos los Datos',
                
                // Common buttons
                'button.back': 'Volver al inicio',
                'button.send': 'Enviar',
                'button.add': 'Agregar',
                'button.remove': 'Eliminar',
                'button.save': 'Guardar',
                'button.close': 'Cerrar',
                
                // Safety plan sections
                'planSection.urgentActions': 'Acciones Urgentes',
                'planSection.emergencyContacts': 'Contactos de Emergencia',
                'planSection.importantDocuments': 'Documentos Importantes',
                'planSection.essentialItems': 'Artículos Esenciales',
                'planSection.safetySteps': 'Pasos de Seguridad',
                'planSection.communicationPlan': 'Plan de Comunicación',
                'planSection.supportNetwork': 'Red de Apoyo',
                'planSection.techSafety': 'Seguridad Tecnológica',
                'planSection.financialSafety': 'Seguridad Financiera',
                'planSection.legalPreparation': 'Preparación Legal',
                'planSection.workplaceSafety': 'Seguridad en el Lugar de Trabajo',
                'planSection.weaponSafety': 'Seguridad con Armas',
                'planSection.childSafety': 'Seguridad Infantil',
                'planSection.scenarioProtocols': 'Planes de Escenarios',
                'planSection.selfCare': 'Autocuidado y Recuperación',
                'planSection.followUpReminders': 'Recordatorios de Seguimiento',
                'planSection.safePlace': 'Plan de Lugar Seguro',
                'planSection.notes': 'Notas Adicionales'
            }
        };
    }

    async init() {
        // Load saved language preference
        const savedLang = localStorage.getItem('safey_language');
        if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
            this.currentLanguage = savedLang;
        }
        
        // Apply language to the page
        this.applyLanguage();
    }

    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'es') {
            console.error('Invalid language:', lang);
            return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('safey_language', lang);
        this.applyLanguage();
        
        // Trigger event for other modules to react
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    getLanguage() {
        return this.currentLanguage;
    }

    translate(key) {
        const translation = this.translations[this.currentLanguage][key];
        if (!translation) {
            console.warn('Missing translation for key:', key);
            return key;
        }
        return translation;
    }

    applyLanguage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            // Check if we should update text content or placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder !== undefined) {
                    element.placeholder = translation;
                }
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update aria-label attributes
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const translation = this.translate(key);
            element.setAttribute('aria-label', translation);
        });

        // Dynamic content translation - refresh screens if they're currently active
        this.refreshDynamicContent();
    }

    refreshDynamicContent() {
        // Refresh the currently visible screen if it has dynamic content
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;

        // Refresh safety plan if it's active
        if (activeScreen.id === 'safety-plan-screen' && typeof displaySafetyPlan === 'function') {
            displaySafetyPlan();
        }

        // Refresh resources if it's active
        if (activeScreen.id === 'resources-screen' && typeof displayResources === 'function') {
            const activeFilter = document.querySelector('.filter-btn.active');
            const category = activeFilter ? activeFilter.dataset.category : 'all';
            displayResources(category);
        }

        // Refresh chatbot welcome message if it's active
        if (activeScreen.id === 'chatbot-screen') {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const welcomeMsg = chatMessages.querySelector('.message-content');
                if (welcomeMsg && welcomeMsg.parentElement.classList.contains('assistant')) {
                    const firstUserMsg = Array.from(chatMessages.children).find(msg => 
                        msg.classList.contains('user')
                    );
                    // Only update if it's still the initial welcome message
                    if (!firstUserMsg) {
                        welcomeMsg.textContent = this.translate('chatbot.welcome');
                    }
                }
            }
        }
    }

    getSpanishPromptModifier() {
        if (this.currentLanguage === 'es') {
            return '\n- Speak Spanish fluently in all your responses.\n';
        }
        return '';
    }
}

// Export singleton instance
const languageManager = new LanguageManager();
