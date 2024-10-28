// utils/debug.js

let config;

async function loadConfig() {
    if (!config) {
        const module = await import('./config.js');
        config = module.default;
    }
}

async function sendLogToServer(message, data) {
    await loadConfig();
    try {
        const response = await fetch(`${config.SERVER_URL}${config.API_ENDPOINTS.LOG}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, data }),
        });
        if (!response.ok) {
            console.error('Failed to send log to server');
        }
    } catch (error) {
        console.error('Error sending log to server:', error);
    }
}

export async function debugLog(functionName, message, data) {
    await loadConfig();
    if (!config.DEBUG_MODE) return;

    let logMessage = `[DEBUG] [${functionName}] ${message}`;
    
    if (data !== undefined) {
        console.log(logMessage, data);
        sendLogToServer(logMessage, data);
    } else {
        console.log(logMessage);
        sendLogToServer(logMessage);
    }
}

export async function setDebugMode(mode) {
    await loadConfig();
    config.DEBUG_MODE = mode;
    console.log(`Debug mode set to: ${mode}`);
}

export async function getDebugMode() {
    await loadConfig();
    return config.DEBUG_MODE;
}