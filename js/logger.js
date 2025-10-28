// SAFETY logging helper
// Controls console output based on debug mode while keeping warnings/errors visible
(() => {
    const originalLog = console.log.bind(console);
    const originalInfo = console.info ? console.info.bind(console) : originalLog;
    const originalWarn = console.warn.bind(console);
    const originalError = console.error.bind(console);

    let debugEnabled = false;

    const logWithTag = (tag, loggerFn, args) => {
        loggerFn(`[SAFEY:${tag}]`, ...args);
    };

    window.safeyLogger = {
        setDebugEnabled(enabled) {
            debugEnabled = Boolean(enabled);
        },
        isDebugEnabled() {
            return debugEnabled;
        },
        debug(...args) {
            if (debugEnabled) {
                logWithTag('DEBUG', originalLog, args);
            }
        },
        info(...args) {
            if (debugEnabled) {
                logWithTag('INFO', originalInfo, args);
            }
        },
        warn(...args) {
            logWithTag('WARN', originalWarn, args);
        },
        error(...args) {
            logWithTag('ERROR', originalError, args);
        }
    };

    console.log = (...args) => {
        if (debugEnabled) {
            originalLog(...args);
        }
    };

    console.info = (...args) => {
        if (debugEnabled) {
            originalInfo(...args);
        }
    };

    console.warn = (...args) => {
        originalWarn(...args);
    };

    console.error = (...args) => {
        originalError(...args);
    };
})();
