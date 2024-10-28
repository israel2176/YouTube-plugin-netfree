const debugLogModule = await import('../utils/debug.js');
const videoInfoModule = await import('../utils/videoInfo.js');
const alternativeVideoModule = await import('../utils/alternativeVideo.js');
const { default: config } = await import('../utils/config.js');

const { debugLog } = debugLogModule;
const { getCurrentVideoInfo, getVideoIdImproved } = videoInfoModule;
const { setAlternativeVideo } = alternativeVideoModule;

export async function handle418Status() {
    debugLog('Starting handle418Status');

    let alternativeVideoId = null;
    try {
        const currentVideoInfo = getCurrentVideoInfo();
        if (!currentVideoInfo || !currentVideoInfo.title) {
            debugLog('Failed to get current video info or title is missing');
            return null;
        }

        const titleWords = currentVideoInfo.title.split(' ').filter(word => /^[a-zA-Z\u0590-\u05FF]+$/.test(word));
        if (titleWords.length < 2) {
            debugLog('Not enough words in the title for search.');
            return null;
        }

        alternativeVideoId = await searchAndCheckVideos(titleWords.slice(-2).join(' '));
        if (!alternativeVideoId) {
            alternativeVideoId = await searchAndCheckVideos(titleWords.slice(0, 2).join(' '));
        }

        if (!alternativeVideoId) {
            debugLog('No valid alternative video found.');
        } else {
            debugLog(`Found valid alternative video: ${alternativeVideoId}`);
            await setAlternativeVideo(alternativeVideoId);
        }
    } catch (error) {
        debugLog(`Error during handle418Status: ${error.message}`);
    }
    return alternativeVideoId;
}

async function searchAndCheckVideos(searchQuery) {
    const currentVideoId = getVideoIdImproved();
    const searchResults = await searchVideos(searchQuery);
    for (const videoUrl of searchResults) {
        const urlVideoId = extractVideoId(videoUrl);
        
        if (urlVideoId === currentVideoId) {
            debugLog(`[Search] Skipping current video: ${urlVideoId}`);
            continue;
        }
        
        const status = await checkVideoStatus(videoUrl);
        if (status === 200) {
            debugLog(`[Search] Found valid video: ${urlVideoId}`);
            return urlVideoId;
        }
    }
    debugLog(`[Search] No valid videos found for query: "${searchQuery}"`);
    return null;
}

async function searchVideos(query) {
    try {
        const encodedQuery = encodeURIComponent(`site:www.youtube.com ${query}`);
        const searchUrl = `${config.SERVER_URL}${config.API_ENDPOINTS.SEARCH}?query=${encodedQuery}`;

        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const resultCount = data?.videoUrls?.length ?? 0;
        debugLog(`[Search] Found ${resultCount} results for query: "${query}"`);
        return data?.videoUrls ?? [];
    } catch (error) {
        debugLog(`[Search] Error: ${error.message}`);
        return [];
    }
}

function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}

async function checkVideoStatus(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        debugLog(`[Check] ${url} (status: ${response.status})`);
        return response.status;
    } catch (error) {
        debugLog(`[Check] ${url} (error: ${error.message})`);
        return null;
    }
}