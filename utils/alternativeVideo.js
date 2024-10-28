// utils/alternativeVideo.js

import { debugLog } from './debug.js';

function getCurrentTabId() {
    return window.getYouTubeTabId();
}

export async function setAlternativeVideo(videoId) {
    try {
        const tabId = getCurrentTabId();
        await chrome.storage.local.set({ [tabId]: videoId });
        debugLog('setAlternativeVideo', `Alternative video ID set for tab ${tabId}: ${videoId}`);
    } catch (error) {
        debugLog('setAlternativeVideo', `Error setting alternative video ID: ${error.message}`);
        throw error;
    }
}

export async function getAlternativeVideo() {
    try {
        const tabId = getCurrentTabId();
        const result = await chrome.storage.local.get(tabId.toString());
        const videoId = result[tabId];
        debugLog('getAlternativeVideo', `Retrieved alternative video ID for tab ${tabId}: ${videoId}`);
        return videoId;
    } catch (error) {
        debugLog('getAlternativeVideo', `Error getting alternative video ID: ${error.message}`);
        throw error;
    }
}

export async function clearAlternativeVideo() {
    try {
        const tabId = getCurrentTabId();
        await chrome.storage.local.remove(tabId.toString());
        debugLog('clearAlternativeVideo', `Alternative video ID cleared for tab ${tabId}`);
    } catch (error) {
        debugLog('clearAlternativeVideo', `Error clearing alternative video ID: ${error.message}`);
        throw error;
    }
}