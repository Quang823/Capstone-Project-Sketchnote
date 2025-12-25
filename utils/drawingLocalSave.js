// drawingLocalSave.js - Helper functions for saving drawings locally in guest mode
import * as offlineStorage from './offlineStorage';
import * as FileSystem from 'expo-file-system/legacy';

// Directory for guest drawings
const GUEST_DRAWINGS_DIR = `${FileSystem.documentDirectory}guest_drawings/`;

// Ensure directory exists
const ensureDirectoryExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(GUEST_DRAWINGS_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(GUEST_DRAWINGS_DIR, { intermediates: true });
    }
};

/**
 * Save complete drawing data locally (for guest/offline mode)
 * Uses FileSystem instead of AsyncStorage for better performance and no size limit
 * 
 * @param {string} projectId - The project ID (e.g., "local_123...")
 * @param {object} canvasRef - Reference to MultiPageCanvas
 * @param {object} noteConfig - The note configuration
 * @returns {Promise<boolean>} Success status
 */
export const saveDrawingLocally = async (projectId, canvasRef, noteConfig) => {
    try {
        if (!projectId || !canvasRef?.current) {
            console.warn('Missing projectId or canvasRef');
            return false;
        }

        await ensureDirectoryExists();

        // Get all pages data from canvas
        const allPagesData = canvasRef.current?.getAllPagesData?.() || [];

        if (allPagesData.length === 0) {

            return false;
        }

        // Load existing project metadata or create new
        let projectData = await offlineStorage.loadGuestProject(projectId) || {};

        // Update project with current drawing data
        const updatedProject = {
            ...projectData,
            projectId,
            name: noteConfig?.title || projectData.name || "Untitled",
            description: noteConfig?.description || projectData.description || "",
            imageUrl: noteConfig?.cover?.imageUrl || projectData.imageUrl || null,
            orientation: noteConfig?.orientation || projectData.orientation || "portrait",
            paperSize: noteConfig?.paperSize || projectData.paperSize || "A4",
            pages: allPagesData.map((page) => ({
                pageNumber: page.pageNumber,
                pageId: page.pageId,
                dataObject: page.dataObject, // All strokes and drawing data
                snapshotUrl: page.snapshotUrl, // Preview image if available
            })),
            updatedAt: new Date().toISOString(),
            isLocal: true,
        };

        // 🔥 Save to FileSystem instead of AsyncStorage (no size limit!)
        const filePath = `${GUEST_DRAWINGS_DIR}${projectId}.json`;
        const jsonString = JSON.stringify(updatedProject);

        await FileSystem.writeAsStringAsync(filePath, jsonString, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Also save metadata to AsyncStorage for quick listing
        await offlineStorage.saveGuestProjectMetadata(projectId, {
            projectId,
            name: updatedProject.name,
            description: updatedProject.description,
            imageUrl: updatedProject.imageUrl,
            orientation: updatedProject.orientation,
            paperSize: updatedProject.paperSize,
            createdAt: projectData.createdAt || new Date().toISOString(),
            updatedAt: updatedProject.updatedAt,
            isLocal: true,
            pageCount: allPagesData.length,
        });



        return true;
    } catch (error) {
        console.warn('❌ Failed to save drawing locally:', error);
        throw error;
    }
};

/**
 * Load drawing data from FileSystem
 * 
 * @param {string} projectId - The project ID
 * @returns {Promise<object|null>} Project data with all strokes
 */
export const loadDrawingLocally = async (projectId) => {
    try {
        await ensureDirectoryExists();

        const filePath = `${GUEST_DRAWINGS_DIR}${projectId}.json`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (!fileInfo.exists) {
            return null;
        }

        const jsonString = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const projectData = JSON.parse(jsonString);



        return projectData;
    } catch (error) {
        console.warn('❌ Failed to load drawing from FileSystem:', error);
        return null;
    }
};

/**
 * Auto-save wrapper with debouncing
 * Call this from useEffect or stroke change handlers
 * 
 * @param {string} projectId - The project ID
 * @param {object} canvasRef - Reference to MultiPageCanvas
 * @param {object} noteConfig - The note configuration
 * @param {number} delay - Debounce delay in ms (default: 2000)
 */
export const setupAutoSave = (projectId, canvasRef, noteConfig, delay = 2000) => {
    let timeout;

    const debouncedSave = () => {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(async () => {
            try {
                await saveDrawingLocally(projectId, canvasRef, noteConfig);
            } catch (error) {
                console.warn('Auto-save failed:', error);
            }
        }, delay);
    };

    return {
        trigger: debouncedSave,
        cleanup: () => {
            if (timeout) clearTimeout(timeout);
        },
    };
};
