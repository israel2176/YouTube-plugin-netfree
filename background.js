function debugLog(message) {
  if (config.DEBUG_MODE) {
      console.debug(`[DEBUG] ${message}`);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (isYouTubeWatchPage(tab.url)) {
      const videoId = extractVideoId(tab.url);
      if (videoId) {
        handleTab(tabId, videoId);
      }
    } else {
      debugLog(`Tab ${tabId} is no longer on a YouTube watch page. Clearing stored value.`);
      clearStoredValue(tabId.toString());
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  debugLog(`Tab ${tabId} was closed. Clearing stored value.`);
  clearStoredValue(tabId.toString());
});

async function handleTab(tabId, currentVideoId) {
  debugLog(`Handling tab ${tabId} with video ${currentVideoId}`);
  
  const is418 = await checkFor418Response(currentVideoId);
  if (is418) {
    debugLog(`Video ${currentVideoId} returned 418 status. Checking for stored value.`);
    const storedValue = await getStoredValue(tabId.toString());
    if (storedValue) {
      debugLog(`Stored value found for tab ${tabId}: ${storedValue}`);
      if (storedValue !== currentVideoId) {
        const redirectSuccessful = await redirectToAlternativeVideo(tabId, storedValue);
        if (redirectSuccessful) {
          debugLog(`Redirect successful for tab ${tabId} to video ${storedValue}`);
          checkAfterRedirect(tabId, storedValue);
        } else {
          debugLog(`Redirect unsuccessful for tab ${tabId}, keeping stored value`);
        }
      } else {
        debugLog(`Stored value ${storedValue} is the same as current video ${currentVideoId}. Clearing stored value.`);
        await clearStoredValue(tabId.toString());
        scheduleContentScriptStart(tabId);
      }
    } else {
      debugLog(`No stored value for tab ${tabId}`);
    }
  } else {
    debugLog(`Video ${currentVideoId} did not return 418 status. No action taken.`);
    scheduleContentScriptStart(tabId);
  }
}

async function checkFor418Response(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { method: 'HEAD' });
    return response.status === 418;
  } catch (error) {
    debugLog(`Error checking for 418 response: ${error.message}`);
    return false;
  }
}

function checkAfterRedirect(tabId, expectedVideoId) {
  setTimeout(async () => {
    const tab = await chrome.tabs.get(tabId);
    const currentVideoId = extractVideoId(tab.url);
    if (currentVideoId === expectedVideoId) {
      debugLog(`Video ID ${currentVideoId} matches expected ID ${expectedVideoId}. Clearing stored value.`);
      await clearStoredValue(tabId.toString());
    } else {
      debugLog(`Video ID ${currentVideoId} does not match expected ID ${expectedVideoId}. Keeping stored value.`);
    }
  }, 2000);
}

function extractVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

function getStoredValue(key) {
  return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
          resolve(result[key]);
      });
  });
}

function redirectToAlternativeVideo(tabId, videoId) {
  return new Promise((resolve) => {
    const newUrl = `https://www.youtube.com/watch?v=${videoId}`;
    chrome.tabs.update(tabId, { url: newUrl }, (tab) => {
      if (chrome.runtime.lastError) {
        debugLog(`Error redirecting to: ${newUrl}. Error: ${chrome.runtime.lastError.message}`);
        resolve(false);
      } else {
        debugLog(`Redirected to: ${newUrl}`);
        chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
          if (updatedTabId === tabId && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve(true);
          }
        });
      }
    });
  });
}

function scheduleContentScriptStart(tabId) {
  debugLog(`Scheduling content script start after ${config.START_DELAY / 1000} seconds`);
  setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: "startChecking", tabId: tabId });
  }, config.START_DELAY);
}

function clearStoredValue(key) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        debugLog(`Error clearing stored value: ${chrome.runtime.lastError.message}`);
        resolve(false);
      } else {
        debugLog(`Successfully cleared stored value for key: ${key}`);
        resolve(true);
      }
    });
  });
}

function isYouTubeWatchPage(url) {
  return url && url.includes('youtube.com/watch');
}

const config = {
  DEBUG_MODE: true,
  START_DELAY: 1000, 
};

