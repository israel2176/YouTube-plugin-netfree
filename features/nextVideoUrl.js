let debugLog;
let handle418StatusModule;

async function loadDependencies() {
    if (!debugLog) {
        const { debugLog: importedDebugLog } = await import('../utils/debug.js');
        debugLog = importedDebugLog;
        debugLog('nextVideoUrl', 'Dependencies loaded');
    }

    if (!handle418StatusModule) {
        try {
            debugLog('nextVideoUrl', 'Attempting to import handle418Status.js');
            handle418StatusModule = await import('./handle418Status.js');
            debugLog('nextVideoUrl', 'handle418Status.js imported successfully');
        } catch (error) {
            debugLog('nextVideoUrl', `Error importing handle418Status: ${error.message}`);
        }
    }
}

async function getRandomVideoId() {
    try {
        const { getRandomId } = await import('./id.js');
        const randomId =await getRandomId();
        debugLog('nextVideoUrl', `Random video ID selected: ${randomId}`);
        return randomId;
    } catch (error) {
        debugLog('nextVideoUrl', `Error getting random video ID: ${error.message}`);
        throw error;
    }
}

async function sendToAlternativeVideo(videoId) {
    try {
        const { setAlternativeVideo } = await import('../utils/alternativeVideo.js');
        await setAlternativeVideo(videoId);
        debugLog('nextVideoUrl', `Alternative video set with ID: ${videoId}`);
    } catch (error) {
        debugLog('nextVideoUrl', `Error setting alternative video: ${error.message}`);
        throw error;
    }
}

export async function handleNextVideoUrl() {
    await loadDependencies();
    debugLog('nextVideoUrl', 'Handling next video URL');
    
    try {
        const handle418StatusPromise = handle418StatusModule?.handle418Status?.() || Promise.resolve();
        const randomVideoPromise = (async () => {
            const randomVideoId = await getRandomVideoId();
            await sendToAlternativeVideo(randomVideoId);
        })();

        await Promise.all([handle418StatusPromise, randomVideoPromise]);
        
        debugLog('nextVideoUrl', 'Next video URL and handle418Status handled concurrently');
    } catch (error) {
        debugLog('nextVideoUrl', `Error handling next video URL: ${error.message}`);
    }
}