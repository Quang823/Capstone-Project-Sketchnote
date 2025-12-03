import { imageApiController } from "../api/imageApiController";

export const imageService = {
    /**
     * Generate AI images from prompt
     * @param {string} prompt - The text prompt for image generation
     * @param {string} size - Image size (e.g., "1024x1024")
     * @param {boolean} isIcon - Whether to generate as icon
     * @returns {Promise<Object>} Generated image result
     */
    generateImage: async (prompt, size, isIcon) => {
        try {
            // Parse size string like "1024x1024" into width and height numbers
            const [width, height] = (size || "1024x1024")
                .split("x")
                .map(s => parseInt(s.trim(), 10));

            const response = await imageApiController.generateImage(
                prompt,
                width || 1024,
                height || 1024,
                isIcon
            );

            if (response?.data?.result) {
                return response.data.result;
            }
            throw new Error("Invalid response from server");
        } catch (error) {
            console.error("❌ Error generating image:", error);
            throw error;
        }
    },

    /**
     * Get AI image generation history with pagination
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Number of items per page
     * @returns {Promise<Object>} Image history result with pagination
     */
    getImageHistory: async (page = 0, size = 5) => {
        try {
            const response = await imageApiController.getImageHistory(page, size);

            if (response?.data?.result) {
                return response.data.result;
            }
            throw new Error("Invalid response from server");
        } catch (error) {
            console.error("❌ Error fetching image history:", error);
            throw error;
        }
    },
};
