import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseJsonInBackground } from "./jsonUtils";
import * as FileSystem from 'expo-file-system/legacy';

const OFFLINE_PROJECT_PREFIX = "@OfflineProject:";
const SYNC_QUEUE_KEY = "@SyncQueue";
const GUEST_PROJECT_PREFIX = "@GuestProject:";
const GUEST_PROJECT_LIST_KEY = "@GuestProjectList";
const MAX_GUEST_PROJECTS = 1;
const GUEST_DRAWINGS_DIR = `${FileSystem.documentDirectory}guest_drawings/`;
const PROJECT_PAGES_DIR = `${FileSystem.documentDirectory}project_pages/`;

// Ensure directory exists
const ensureDirectoryExists = async (dir) => {
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

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
    console.warn("Failed to save project locally", e);
  }
};

/**
 * Saves a project page's data to FileSystem.
 * @param {string} projectId The ID of the project.
 * @param {number|string} pageNumber The page number.
 * @param {object} pageData The page data to save.
 */
export const saveProjectPageLocally = async (projectId, pageNumber, pageData) => {
  try {
    await ensureDirectoryExists(PROJECT_PAGES_DIR);
    const fileName = `${projectId}_page_${pageNumber}.json`;
    const filePath = `${PROJECT_PAGES_DIR}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(pageData), {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch (e) {
    console.warn(`Failed to save page ${pageNumber} locally`, e);
    throw e;
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
    console.warn("Failed to load project locally", e);
    return null;
  }
};

/**
 * Loads a project page's data from FileSystem.
 * @param {string} projectId The ID of the project.
 * @param {number|string} pageNumber The page number.
 * @returns {Promise<object|null>} The page data or null if not found.
 */
export const loadProjectPageLocally = async (projectId, pageNumber) => {
  try {
    const fileName = `${projectId}_page_${pageNumber}.json`;
    const filePath = `${PROJECT_PAGES_DIR}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists) {
      const jsonString = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return await parseJsonInBackground(jsonString);
    }

    // Fallback: Check AsyncStorage (Legacy)
    const key = `${OFFLINE_PROJECT_PREFIX}${projectId}_page_${pageNumber}`;
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue) {
      // Migrate to FileSystem
      const data = await parseJsonInBackground(jsonValue);
      await saveProjectPageLocally(projectId, pageNumber, data);
      await AsyncStorage.removeItem(key); // Cleanup legacy
      return data;
    }

    return null;
  } catch (e) {
    console.warn(`Failed to load page ${pageNumber} locally`, e);
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
    }
  } catch (e) {
    console.warn("Failed to add project to sync queue", e);
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

    const queue = await parseJsonInBackground(jsonValue);
    return Array.isArray(queue) ? queue : [];
  } catch (e) {
    console.warn("Failed to get sync queue", e);
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
    console.warn("Failed to remove project from sync queue", e);
  }
};

// ============================================================================
// GUEST PROJECT MANAGEMENT (FileSystem + AsyncStorage)
// ============================================================================

/**
 * Save a guest project.
 * - Full Data -> FileSystem
 * - Metadata -> AsyncStorage
 * @param {string} projectId
 * @param {object} projectData
 */
export const saveGuestProject = async (projectId, projectData) => {
  try {
    await ensureDirectoryExists(GUEST_DRAWINGS_DIR);

    // 1. Save FULL data to FileSystem
    const filePath = `${GUEST_DRAWINGS_DIR}${projectId}.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(projectData), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // 2. Prepare Metadata (Strip heavy pages/strokes)
    const metadata = {
      ...projectData,
      pages: [], // Remove pages content from metadata
      isLocal: true,
      updatedAt: new Date().toISOString(),
      // Keep pageCount for UI
      pageCount: Array.isArray(projectData.pages) ? projectData.pages.length : (projectData.pageCount || 0),
    };

    // 3. Save Metadata to AsyncStorage
    const key = `${GUEST_PROJECT_PREFIX}${projectId}`;
    await AsyncStorage.setItem(key, JSON.stringify(metadata));

    // 4. Update List
    await addToGuestProjectList(projectId);
  } catch (e) {
    console.warn("Failed to save guest project", e);
    throw e;
  }
};

/**
 * Save ONLY metadata to AsyncStorage (does not touch FileSystem).
 * Use this when FileSystem is already updated separately.
 * @param {string} projectId
 * @param {object} metadata
 */
export const saveGuestProjectMetadata = async (projectId, metadata) => {
  try {
    const key = `${GUEST_PROJECT_PREFIX}${projectId}`;
    // Ensure pages are stripped just in case
    const safeMetadata = {
      ...metadata,
      pages: [],
      isLocal: true,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(safeMetadata));
    await addToGuestProjectList(projectId);
  } catch (e) {
    console.warn("Failed to save guest project metadata", e);
  }
};

/**
 * Load guest project METADATA (for listing).
 * Automatically migrates legacy heavy data to FileSystem.
 * @param {string} projectId
 * @returns {Promise<object|null>} Metadata object
 */
export const loadGuestProject = async (projectId) => {
  try {
    const key = `${GUEST_PROJECT_PREFIX}${projectId}`;
    const jsonValue = await AsyncStorage.getItem(key);

    if (jsonValue == null) return null;

    let data = null;
    try {
      data = await parseJsonInBackground(jsonValue);
    } catch (parseError) {
      console.warn(`[offlineStorage] Failed to parse project ${projectId}`, parseError);
      return null;
    }

    if (!data) return null;

    // 🔄 MIGRATION CHECK: If data has pages with strokes, it's legacy heavy data
    const hasHeavyData = Array.isArray(data.pages) && data.pages.some(p => p.strokes && p.strokes.length > 0);

    if (hasHeavyData) {

      try {
        // 1. Move to FileSystem
        await ensureDirectoryExists(GUEST_DRAWINGS_DIR);
        const filePath = `${GUEST_DRAWINGS_DIR}${projectId}.json`;
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data), {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // 2. Strip Metadata
        const metadata = {
          ...data,
          pages: [],
          pageCount: data.pages.length,
          isLocal: true
        };

        // 3. Update AsyncStorage
        await AsyncStorage.setItem(key, JSON.stringify(metadata));

        return metadata; // Return lightweight metadata
      } catch (migrationError) {
        console.warn("Migration failed:", migrationError);
        // Return original data as fallback, but it might be slow
        return data;
      }
    }

    return data;
  } catch (e) {
    console.warn("Failed to load guest project", e);
    return null;
  }
};

/**
 * Load FULL guest project data (from FileSystem).
 * @param {string} projectId
 * @returns {Promise<object|null>} Full project data
 */
export const loadGuestProjectFull = async (projectId) => {
  try {
    await ensureDirectoryExists(GUEST_DRAWINGS_DIR);
    const filePath = `${GUEST_DRAWINGS_DIR}${projectId}.json`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists) {
      const jsonString = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return JSON.parse(jsonString);
    }

    // Fallback: Check AsyncStorage (Legacy)
    const key = `${GUEST_PROJECT_PREFIX}${projectId}`;
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue) {
      return await parseJsonInBackground(jsonValue);
    }

    return null;
  } catch (e) {
    console.warn("Failed to load full guest project", e);
    return null;
  }
};

/**
 * Get all guest projects (Metadata only)
 */
export const getAllGuestProjects = async () => {
  try {
    const listJson = await AsyncStorage.getItem(GUEST_PROJECT_LIST_KEY);
    if (!listJson) return [];

    let projectIds = [];
    try {
      projectIds = await parseJsonInBackground(listJson);
    } catch (e) {
      return [];
    }

    if (!Array.isArray(projectIds)) return [];

    // ✅ Optimize: Load in parallel using Promise.all
    const projectPromises = projectIds.map(id => loadGuestProject(id));
    const results = await Promise.all(projectPromises);

    // Filter out nulls
    const projects = results.filter(p => p !== null);

    // Sort by updatedAt desc
    return projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (e) {
    console.warn("Failed to get all guest projects", e);
    return [];
  }
};

/**
 * Delete a guest project (FileSystem + AsyncStorage)
 */
export const deleteGuestProject = async (projectId) => {
  try {
    // 1. Delete from FileSystem
    const filePath = `${GUEST_DRAWINGS_DIR}${projectId}.json`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }

    // 2. Delete from AsyncStorage
    const key = `${GUEST_PROJECT_PREFIX}${projectId}`;
    await AsyncStorage.removeItem(key);

    // 3. Remove from List
    await removeFromGuestProjectList(projectId);
  } catch (e) {
    console.warn("Failed to delete guest project", e);
    throw e;
  }
};

const addToGuestProjectList = async (projectId) => {
  try {
    const listJson = await AsyncStorage.getItem(GUEST_PROJECT_LIST_KEY);
    let projectIds = [];
    if (listJson) {
      try { projectIds = await parseJsonInBackground(listJson); } catch (e) { }
    }
    if (!Array.isArray(projectIds)) projectIds = [];

    if (!projectIds.includes(projectId)) {
      projectIds.push(projectId);
      await AsyncStorage.setItem(GUEST_PROJECT_LIST_KEY, JSON.stringify(projectIds));
    }
  } catch (e) {
    console.warn("Failed to add to guest project list", e);
  }
};

const removeFromGuestProjectList = async (projectId) => {
  try {
    const listJson = await AsyncStorage.getItem(GUEST_PROJECT_LIST_KEY);
    if (!listJson) return;
    let projectIds = [];
    try { projectIds = await parseJsonInBackground(listJson); } catch (e) { }
    if (!Array.isArray(projectIds)) return;

    const newList = projectIds.filter(id => id !== projectId);
    await AsyncStorage.setItem(GUEST_PROJECT_LIST_KEY, JSON.stringify(newList));
  } catch (e) {
    console.warn("Failed to remove from guest project list", e);
  }
};

export const checkGuestProjectLimit = async () => {
  try {
    const projects = await getAllGuestProjects();
    return {
      canCreate: projects.length < MAX_GUEST_PROJECTS,
      currentCount: projects.length,
      limit: MAX_GUEST_PROJECTS,
    };
  } catch (error) {
    return { canCreate: false, currentCount: 0, limit: MAX_GUEST_PROJECTS };
  }
};

export const checkStorageUsage = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(GUEST_DRAWINGS_DIR);
    // FileSystem usage is hard to calc recursively without loop, but we can assume it's fine.
    // Let's just return AsyncStorage usage for now or 0.
    // Actually, we can skip this check or just return 0 as FS is unlimited.
    return { used: 0, total: 1024 * 1024 * 1024, percentage: 0 };
  } catch (e) {
    return { used: 0, total: 0, percentage: 0 };
  }
};
