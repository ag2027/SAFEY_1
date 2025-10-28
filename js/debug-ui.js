// Debug UI for QA testing
// Shows masked event logs and stealth system status

class DebugUI {
    constructor() {
        this.isVisible = false;
        this.panel = null;
    }

    // Toggle debug panel
    async toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            await this.show();
        }
    }

    // Show debug panel
    async show() {
        if (this.panel) {
            this.panel.remove();
        }
        
        const debugInfo = await stealthController.getDebugInfo();
        const queueStatus = unlockHandler.getSafetyQueueStatus();
        
        this.panel = document.createElement('div');
        this.panel.id = 'debug-panel';
        this.panel.className = 'fixed top-0 right-0 w-80 h-screen bg-gray-900 text-white p-4 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
        this.panel.innerHTML = `
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-bold">Debug Mode</h2>
                <button id="debug-close" class="p-2 hover:bg-gray-800 rounded">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 mb-2">System Status</h3>
                    <div class="bg-gray-800 rounded p-3 text-xs space-y-1">
                        <div>Stealth Active: <span class="font-mono ${debugInfo.isActive ? 'text-green-400' : 'text-gray-400'}">${debugInfo.isActive}</span></div>
                        <div>Template: <span class="font-mono text-blue-400">${debugInfo.settings?.disguiseTemplate || 'none'}</span></div>
                        <div>Suspicious Count: <span class="font-mono text-yellow-400">${debugInfo.suspiciousCounter}</span></div>
                        <div>Last Activity: <span class="font-mono text-gray-400">${debugInfo.lastActivity}</span></div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 mb-2">Safety Queue</h3>
                    <div class="bg-gray-800 rounded p-3 text-xs space-y-1">
                        <div>Queue Size: <span class="font-mono ${queueStatus.queueSize > 0 ? 'text-yellow-400' : 'text-green-400'}">${queueStatus.queueSize}/${queueStatus.maxSize}</span></div>
                        <div>Flushing: <span class="font-mono ${queueStatus.isFlushingQueue ? 'text-yellow-400' : 'text-gray-400'}">${queueStatus.isFlushingQueue}</span></div>
                        ${queueStatus.queue.length > 0 ? `
                            <div class="mt-2 pt-2 border-t border-gray-700">
                                <div class="text-gray-400 mb-1">Queued Alerts:</div>
                                ${queueStatus.queue.map(alert => {
                                    const riskColor = alert.riskLevel === 'high' ? 'text-red-400' : 
                                                     alert.riskLevel === 'medium' ? 'text-orange-400' : 'text-yellow-400';
                                    const riskIcon = alert.riskLevel === 'high' ? '🔴' : 
                                                    alert.riskLevel === 'medium' ? '🟡' : '🟢';
                                    return `
                                    <div class="text-xs ${riskColor} truncate" title="${alert.reason}">
                                        ${riskIcon} ${alert.reason}
                                    </div>
                                `}).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 mb-2">Settings</h3>
                    <div class="bg-gray-800 rounded p-3 text-xs space-y-1">
                        <div>Auto-lock: <span class="font-mono text-blue-400">${debugInfo.settings?.autoLockTimeout || 5} min</span></div>
                        <div>Auto-Alerts: <span class="font-mono ${debugInfo.settings?.autoAlertsEnabled !== false ? 'text-green-400' : 'text-yellow-400'}">${debugInfo.settings?.autoAlertsEnabled !== false ? 'ENABLED' : 'MANUAL ONLY'}</span></div>
                        <div>Logo Tap: <span class="font-mono ${debugInfo.settings?.triggersEnabled?.logoDoubleTap ? 'text-green-400' : 'text-red-400'}">${debugInfo.settings?.triggersEnabled?.logoDoubleTap ? 'ON' : 'OFF'}</span></div>
                        <div>Corner Tap: <span class="font-mono ${debugInfo.settings?.triggersEnabled?.cornerMultiTap ? 'text-green-400' : 'text-red-400'}">${debugInfo.settings?.triggersEnabled?.cornerMultiTap ? 'ON' : 'OFF'}</span></div>
                        <div>Corner: <span class="font-mono text-blue-400">${debugInfo.settings?.cornerTapConfig?.corner || 'top-right'}</span></div>
                        <div>Taps: <span class="font-mono text-blue-400">${debugInfo.settings?.cornerTapConfig?.tapCount || 4}</span></div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 mb-2">Recent Events (Masked)</h3>
                    <div class="bg-gray-800 rounded p-3 text-xs space-y-2 max-h-64 overflow-y-auto">
                        ${debugInfo.recentEvents.length > 0 ? debugInfo.recentEvents.map(event => `
                            <div class="border-b border-gray-700 pb-2 mb-2 last:border-0">
                                <div class="font-mono text-yellow-400">${event.type}</div>
                                <div class="text-gray-500">${event.timestamp}</div>
                                ${event.metadata !== 'none' ? `<div class="text-gray-600 text-xs">${event.metadata}</div>` : ''}
                            </div>
                        `).join('') : '<div class="text-gray-500">No events logged</div>'}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 mb-2">Actions</h3>
                    <div class="space-y-2">
                        <button id="debug-activate" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs font-semibold transition">
                            Activate Stealth
                        </button>
                        <button id="debug-refresh" class="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-xs font-semibold transition">
                            Refresh Info
                        </button>
                        <button id="debug-clear-events" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-xs font-semibold transition">
                            Clear Events
                        </button>
                        <button id="debug-flush-queue" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-xs font-semibold transition">
                            Flush Queue Now
                        </button>
                        <button id="debug-clear-queue" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-xs font-semibold transition">
                            Clear Queue
                        </button>
                    </div>
                </div>
                
                <div class="text-xs text-gray-500 pt-4 border-t border-gray-800">
                    <p>Debug mode for QA testing only.</p>
                    <p class="mt-1">Web Crypto: ${cryptoUtils.hasWebCrypto ? '✓' : '✗'}</p>
                    <p>IndexedDB: ${storageUtils.hasIndexedDB ? '✓' : '✗'}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
        
        // Slide in
        setTimeout(() => {
            this.panel.classList.remove('translate-x-full');
        }, 50);
        
        this.isVisible = true;
        
        // Attach event listeners
        document.getElementById('debug-close').addEventListener('click', () => this.hide());
        document.getElementById('debug-activate').addEventListener('click', async () => {
            await stealthController.triggerStealth();
            this.hide();
        });
        document.getElementById('debug-refresh').addEventListener('click', async () => {
            await this.show();
        });
        document.getElementById('debug-clear-events').addEventListener('click', async () => {
            if (confirm('Clear all event logs?')) {
                await eventLogger.clearEvents();
                await this.show();
            }
        });
        document.getElementById('debug-flush-queue').addEventListener('click', async () => {
            console.log('[DEBUG] Manual queue flush triggered');
            await unlockHandler.flushSafetyQueue();
            await this.show();
        });
        document.getElementById('debug-clear-queue').addEventListener('click', async () => {
            if (confirm('Clear safety check queue?')) {
                await unlockHandler.clearSafetyQueue();
                await this.show();
            }
        });
    }

    // Hide debug panel
    hide() {
        if (this.panel) {
            this.panel.classList.add('translate-x-full');
            setTimeout(() => {
                this.panel?.remove();
                this.panel = null;
            }, 300);
        }
        this.isVisible = false;
    }

    // Enable debug mode keyboard shortcut (Ctrl+Shift+D)
    enableKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
}

// Export singleton
const debugUI = new DebugUI();
