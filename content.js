let currentTabId = null;
let debugLog;

window.getYouTubeTabId = function() {
    return currentTabId;
};

async function initializeDebugModule() {
    try {
        const debugModule = await import('./utils/debug.js');
        debugLog = debugModule.debugLog;
        debugLog('initializeDebugModule', 'Debug module loaded successfully');
    } catch (error) {
        console.error('Error loading debug module:', error);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startChecking") {
        currentTabId = message.tabId;
        startChecking();
        sendResponse({ status: "Checks starting" });
    }
});

async function startChecking() {
    await initializeDebugModule();
    debugLog('startChecking', 'Starting checks');
    await loadModules();
    performChecks();
}

async function loadModules() {
    try {
        debugLog('loadModules', 'Loading modules');
        const nextVideoUrlModule = await import('./features/nextVideoUrl.js');
        window.YouTubeExtension = {
            debugLog: debugLog,
            handleNextVideoUrl: (statusCode) => nextVideoUrlModule.handleNextVideoUrl(statusCode, currentTabId),
        };
        debugLog('loadModules', 'Modules loaded successfully');
    } catch (error) {
        debugLog('loadModules', `Error loading modules: ${error.message}`);
    }
}

async function performChecks() {
    debugLog('performChecks', 'Starting checks');
    await checkCurrentUrlForDebug();
    await checkNextVideo();
}

async function checkCurrentUrlForDebug() {
    const currentUrl = window.location.href;
    try {
        const response = await fetch(currentUrl, { method: 'HEAD' });
        debugLog('checkCurrentUrlForDebug', `Checking current URL (debug): ${response.status}`);
    } catch (error) {
        debugLog('checkCurrentUrlForDebug', `Error checking current URL (debug): ${error.message}`);
    }
}

async function checkNextVideo(retryCount = 0) {
    const nextVideoElement = document.querySelector('.ytp-next-button');
    
    if (nextVideoElement) {
        const nextVideoUrl = nextVideoElement.getAttribute('href');
        if (nextVideoUrl) {
            debugLog('checkNextVideo', `Next video URL found: ${nextVideoUrl}`);
            await checkNextVideoResponse(nextVideoUrl);
        } else {
            await retryOrFail(retryCount);
        }
    } else {
        await retryOrFail(retryCount);
    }
}

async function checkNextVideoResponse(nextVideoUrl) {
    try {
        const response = await fetch(nextVideoUrl, { method: 'HEAD' });
        debugLog('checkNextVideoResponse', `Checking next video: ${response.status}`);
        if (response.status === 418) {
            await window.YouTubeExtension.handleNextVideoUrl(response.status);
        }
    } catch (error) {
        debugLog('checkNextVideoResponse', `Error checking next video: ${error.message}`);
    }
}

async function retryOrFail(retryCount) {
    if (retryCount < 3) {
        debugLog('retryOrFail', `Retrying to find next video (attempt ${retryCount + 1})`);
        setTimeout(() => checkNextVideo(retryCount + 1), 1000);
    } else {
        debugLog('retryOrFail', 'Failed to find next video after 3 attempts');
    }
}
