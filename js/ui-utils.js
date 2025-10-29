// UI Utilities
// Provides reusable components like modals and popups for a consistent look and feel

class UIUtils {
    // Show a generic confirmation modal
    showConfirmModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
        const modalId = `confirm-modal-${Date.now()}`;
        const overlay = document.createElement('div');
        overlay.id = modalId;
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', `${modalId}-title`);

        const hasCancel = cancelText !== null && cancelText !== undefined;

        overlay.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform scale-95 transition-transform duration-200">
                <h3 id="${modalId}-title" class="text-lg font-bold text-gray-900 mb-2">${title}</h3>
                <p class="text-sm text-gray-600 mb-6">${message}</p>
                <div class="flex gap-3 ${hasCancel ? '' : 'justify-end'}">
                    ${hasCancel ? `<button id="${modalId}-cancel" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition">${cancelText}</button>` : ''}
                    <button id="${modalId}-confirm" class="${hasCancel ? 'flex-1' : ''} bg-trust-blue hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate in
        setTimeout(() => {
            overlay.querySelector('div').classList.remove('scale-95');
        }, 10);

        const closeModal = () => {
            const panel = overlay.querySelector('div');
            panel.classList.add('scale-95');
            setTimeout(() => overlay.remove(), 200);
        };

        const confirmButton = overlay.querySelector(`#${modalId}-confirm`);
        const cancelButton = hasCancel ? overlay.querySelector(`#${modalId}-cancel`) : null;

        confirmButton.addEventListener('click', () => {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
            closeModal();
        });

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                if (typeof onCancel === 'function') {
                    onCancel();
                }
                closeModal();
            });
        }

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                if (typeof onCancel === 'function') {
                    onCancel();
                }
                closeModal();
            }
        });
    }

    // Show a simple informational modal
    showInfoModal({ title, message, buttonText = 'OK' }) {
        this.showConfirmModal({
            title,
            message,
            confirmText: buttonText,
            cancelText: null,
            onConfirm: () => {}
        });
    }

    // Flexible modal builder used by decoy notes manager
    showModal({ title, content, maxWidth = 'max-w-md', actions = [], closeOnClickOutside = true }) {
        const modalId = `ui-modal-${Date.now()}`;
        const overlay = document.createElement('div');
        overlay.id = modalId;
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', `${modalId}-title`);

        const panel = document.createElement('div');
        panel.className = `bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[85vh] overflow-hidden flex flex-col`; // apply ascii? []? we used [] containing '-'? Note: `[85vh]` includes non ascii bracket? It's ascii but includes `[`. Acceptable? Might rely on tailwind style though. Already using similar? not sure but bracket with [] is not ASCII? It's ascii (characters []). Should ensure no colon etc. We'll maintain? but not actual tailwind? mass. Hmm this string uses `[85vh]` customizing. It's tailwind style but they used such earlier? There might not be support. Maybe we replace with inline style to avoid unusual class: we can set `style` attribute. We'll adjust to standard classes to keep ascii. -> We'll restructure to avoid advanced tailwind.* We'll set `panel.style.maxHeight = '85vh'`. So in inner `panel` we set `className = 'bg-white rounded-2xl shadow-2xl w-full ' + maxWidth; panel.style.maxHeight = '85vh'; panel.style.display = 'flex'; panel.style.flexDirection = 'column'; panel.style.overflow = 'hidden';`.* We'll adjust accordingly in code.* We'll patch accordingly after building.* For now continuing.*
        panel.innerHTML = `
            <div class="px-6 pt-6 pb-4 border-b border-gray-200">
                <h2 id="${modalId}-title" class="text-xl font-semibold text-gray-900">${title}</h2>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-4" data-modal-body></div>
            <div class="px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3 justify-end" data-modal-actions></div>
        `;

        panel.style.maxHeight = '85vh';
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';
        panel.style.overflow = 'hidden';

        const bodySlot = panel.querySelector('[data-modal-body]');
        const actionsSlot = panel.querySelector('[data-modal-actions]');

        if (typeof content === 'string') {
            bodySlot.innerHTML = content;
        } else if (content instanceof Node) {
            if (content.parentElement) {
                content.parentElement.removeChild(content);
            }
            bodySlot.appendChild(content);
        }

        const baseButtonClass = 'px-4 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-trust-blue';
        const variantToClass = {
            primary: 'bg-trust-blue text-white hover:bg-opacity-90',
            secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
            ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
        };

        const resolvedActions = actions.length ? actions : [{ label: 'Close', variant: 'secondary', closeOnClick: true }];

        resolvedActions.forEach((action, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            const variantClass = variantToClass[action.variant] || variantToClass.secondary;
            button.className = `${baseButtonClass} ${variantClass}`;
            button.textContent = action.label || `Action ${index + 1}`;
            button.addEventListener('click', async () => {
                try {
                    if (typeof action.onClick === 'function') {
                        await action.onClick();
                    }
                } finally {
                    if (action.closeOnClick !== false) {
                        closeModal();
                    }
                }
            });
            actionsSlot.appendChild(button);
        });

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        const closeModal = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeydown);
        };

        const handleKeydown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleKeydown);

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay && closeOnClickOutside) {
                closeModal();
            }
        });

        return { close: closeModal };
    }
}

const uiUtils = new UIUtils();
