import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseJsonInBackground } from "./jsonUtils";

const OFFLINE_PROJECT_PREFIX = "@OfflineProject:";
const SYNC_QUEUE_KEY = "@SyncQueue";
const GUEST_PROJECT_PREFIX = "@GuestProject:";
const GUEST_PROJECT_LIST_KEY = "@GuestProjectList";
const MAX_GUEST_PROJECTS = 10; // Guest users can only create 2 projects

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

// ============================================================================
// GUEST PROJECT MANAGEMENT
// ============================================================================

/**
 * Save a complete guest/local project
 * @param {string} projectId - The local project ID (e.g., "local_12345")
 * @param {object} projectData - Complete project data including metadata and pages
 */
export const saveGuestProject = async (projectId, projectData) => {
  try {
    const key = `${GUEST_PROJECT_PREFIX}${projectId}`;
    const jsonValue = JSON.stringify(projectData);
    await AsyncStorage.setItem(key, jsonValue);

    // Add to project list
    await addToGuestProjectList(projectId);
  } catch (e) {
    console.error("Failed to save guest project", e);
    throw e;
  }
};

/**
 * Load a guest project by ID
 * @param {string} projectId - The local project ID
 * @returns {Promise<object|null>} The project data or null if not found
 */
export const loadGuestProject = async (projectId) => {
  try {
    const key = `${GUEST_PROJECT_PREFIX}${projectId}`;
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue == null) {
      return null;
    }
    // ✅ Add try-catch for parsing specifically
    try {
      return await parseJsonInBackground(jsonValue);
    } catch (parseError) {
      console.warn(`[offlineStorage] Failed to parse project ${projectId}:`, parseError);
      return null; // Return null instead of crashing
    }
  } catch (e) {
    console.error("Failed to load guest project", e);
    return null;
  }
};

/**
 * Get all guest projects
 * @returns {Promise<Array>} Array of guest project metadata
 */
export const getAllGuestProjects = async () => {
  try {
    const listJson = await AsyncStorage.getItem(GUEST_PROJECT_LIST_KEY);
    if (!listJson) return [];

    let projectIds = [];
    try {
      projectIds = await parseJsonInBackground(listJson);
    } catch (e) {
      console.warn("[offlineStorage] Failed to parse project list:", e);
      return [];
    }

    if (!Array.isArray(projectIds)) return [];

    const projects = [];
    for (const projectId of projectIds) {
      // ✅ loadGuestProject now handles errors internally and returns null
      const project = await loadGuestProject(projectId);
      if (project) {
        projects.push(project);
      }
    }

    // Sort by updatedAt desc
    return projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (e) {
    console.error("Failed to get all guest projects", e);
    return []; // ✅ Return empty array instead of throwing
  }
};

/**
 * Delete a guest project
 * @param {string} projectId - The local project ID
 */
export const deleteGuestProject = async (projectId) => {
  try {
    const key = `${GUEST_PROJECT_PREFIX}${projectId}`;
    await AsyncStorage.removeItem(key);

    // Remove from project list
    await removeFromGuestProjectList(projectId);
  } catch (e) {
    console.error("Failed to delete guest project", e);
    throw e;
  }
};

/**
 * Add project ID to the guest project list
 * @param {string} projectId - The project ID to add
 */
const addToGuestProjectList = async (projectId) => {
  try {
    const listJson = await AsyncStorage.getItem(GUEST_PROJECT_LIST_KEY);
    let projectIds = [];

    if (listJson) {
      try {
        projectIds = await parseJsonInBackground(listJson);
      } catch (e) {
        projectIds = [];
      }
      if (!Array.isArray(projectIds)) projectIds = [];
    }

    if (!projectIds.includes(projectId)) {
      projectIds.push(projectId);
      await AsyncStorage.setItem(GUEST_PROJECT_LIST_KEY, JSON.stringify(projectIds));
    }
  } catch (e) {
    console.error("Failed to add to guest project list", e);
  }
};

/**
 * Remove project ID from the guest project list
 * @param {string} projectId - The project ID to remove
 */
const removeFromGuestProjectList = async (projectId) => {
  try {
    const listJson = await AsyncStorage.getItem(GUEST_PROJECT_LIST_KEY);
    if (!listJson) return;

    let projectIds = [];
    try {
      projectIds = await parseJsonInBackground(listJson);
    } catch (e) {
      return;
    }

    if (!Array.isArray(projectIds)) return;

    const newList = projectIds.filter(id => id !== projectId);
    await AsyncStorage.setItem(GUEST_PROJECT_LIST_KEY, JSON.stringify(newList));
  } catch (e) {
    console.error("Failed to remove from guest project list", e);
  }
};

/**
 * Check if guest can create more projects
 * @returns {Promise<{canCreate: boolean, currentCount: number, limit: number}>}
 */
export const checkGuestProjectLimit = async () => {
  try {
    const projects = await getAllGuestProjects();
    return {
      canCreate: projects.length < MAX_GUEST_PROJECTS,
      currentCount: projects.length,
      limit: MAX_GUEST_PROJECTS,
    };
  } catch (error) {
    console.error('Failed to check guest project limit', error);
    return { canCreate: false, currentCount: 0, limit: MAX_GUEST_PROJECTS };
  }
};

/**
 * Check storage usage and warn if approaching limit
 * @returns {Promise<{used: number, total: number, percentage: number}>}
 */
export const checkStorageUsage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }

    // Approximate limits: 6MB Android, 10MB iOS
    const estimatedLimit = 6 * 1024 * 1024; // 6MB in bytes
    const percentage = (totalSize / estimatedLimit) * 100;

    return {
      used: totalSize,
      total: estimatedLimit,
      percentage: Math.round(percentage),
    };
  } catch (e) {
    console.error("Failed to check storage usage", e);
    return { used: 0, total: 0, percentage: 0 };
  }
};
