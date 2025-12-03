import { privateApi } from "./axiosInstance";

export const imageApiController = {
    /**
     * Generate AI images from prompt
     * @param {string} prompt - The text prompt for image generation
     * @param {number} width - Image width in pixels
     * @param {number} height - Image height in pixels
     * @param {boolean} isIcon - Whether to generate as icon
     * @returns {Promise} API response
     */
    generateImage: async (prompt, width, height, isIcon) => {
        try {
            const res = await privateApi.post(`/api/images/generate`, {
                prompt,
                width: width || 1024,
                height: height || 1024,
                isIcon,
            });
            return res;
        } catch (err) {
            console.error("❌ Error generating image:", err);
            throw err;
        }
    },

    /**
     * Get AI image generation history with pagination
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Number of items per page
     * @returns {Promise} API response
     */
    getImageHistory: async (page = 0, size = 5) => {
        try {
            const res = await privateApi.get(`/api/images/history`, {
                params: { page, size },
            });
            return res;
        } catch (err) {
            console.error("❌ Error fetching image history:", err);
            throw err;
        }
    },
};
