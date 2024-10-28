  import { debugLog } from './debug.js';

function getVideoTitle() {
  debugLog('getVideoTitle', "Attempting to get video title");
  let title;
  
  try {
    const metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) {
      title = metaTitle.content;
      debugLog('getVideoTitle', "Title found in meta tag:", title);
    }
    
    if (!title) {
      title = document.title;
      debugLog('getVideoTitle', "Title found in document title:", title);
    }
    
    title = title.replace(/ - YouTube$/, '').trim();
    
    debugLog('getVideoTitle', "Final video title:", title);
    return title;
  } catch (error) {
    debugLog('getVideoTitle', "Error getting video title:", error.message);
    return null;
  }
}

function getVideoIdImproved() {
  debugLog('getVideoIdImproved', "Attempting to get video ID");
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let videoId = urlParams.get('v');
    
    if (videoId) {
      debugLog('getVideoIdImproved', "Video ID found:", videoId);
    } else {
      debugLog('getVideoIdImproved', "No video ID found");
    }
    
    return videoId || '';
  } catch (error) {
    debugLog('getVideoIdImproved', "Error getting video ID:", error.message);
    return '';
  }
}

function getCurrentVideoInfo() {
  debugLog('getCurrentVideoInfo', "Starting to collect current video info");
  const videoInfo = {
    title: getVideoTitle()
  };
  debugLog('getCurrentVideoInfo', "Video info summary:", videoInfo);
  return videoInfo;
}

export { getCurrentVideoInfo, getVideoTitle, getVideoIdImproved };
