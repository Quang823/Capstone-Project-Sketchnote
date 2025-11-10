import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseJsonInBackground } from "./jsonUtils";

const OFFLINE_PROJECT_PREFIX = "@OfflineProject:";
const SYNC_QUEUE_KEY = "@SyncQueue";

/**
 * Saves a project's data locally.
 * @param {string} projectId The ID of the project.
 * @param {object} projectData The project data to save.
 */
export const saveProjectLocally = async (projectId, projectData) => {
  try {
    const key = `${OFFLINE_PROJECT_PREFIX}${projectId}`;
    const jsonValue = JSON.stringify(projectData);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Failed to save project locally", e);
  }
};

/**
 * Loads a project's data from local storage.
 * @param {string} projectId The ID of the project.
 * @returns {Promise<object|null>} The project data or null if not found.
 */
export const loadProjectLocally = async (projectId) => {
  try {
    const key = `${OFFLINE_PROJECT_PREFIX}${projectId}`;
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue == null) {
      return null;
    }
    // Use background parser to avoid blocking UI
    return await parseJsonInBackground(jsonValue);
  } catch (e) {
    console.error("Failed to load project locally", e);
    return null;
  }
};

/**
 * Adds a project ID to the synchronization queue.
 * @param {string} projectId The ID of the project that needs to be synced.
 */
export const addProjectToSyncQueue = async (projectId) => {
  try {
    let queue = await getProjectsToSync();
    if (!queue.includes(projectId)) {
      queue.push(projectId);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      // (`Project ${projectId} added to sync queue.`);
    }
  } catch (e) {
    console.error("Failed to add project to sync queue", e);
  }
};

/**
 * Retrieves the list of project IDs that need to be synced.
 * @returns {Promise<string[]>} An array of project IDs.
 */
export const getProjectsToSync = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!jsonValue) return [];
    
    // ✅ Use background parser to avoid blocking UI
    const queue = await parseJsonInBackground(jsonValue);
    return Array.isArray(queue) ? queue : [];
  } catch (e) {
    console.error("Failed to get sync queue", e);
    return [];
  }
};

/**
 * Removes a project ID from the synchronization queue.
 * @param {string} projectId The ID of the project that has been synced.
 */
export const removeProjectFromSyncQueue = async (projectId) => {
  try {
    let queue = await getProjectsToSync();
    const newQueue = queue.filter((id) => id !== projectId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
  } catch (e) {
    console.error("Failed to remove project from sync queue", e);
  }
};
