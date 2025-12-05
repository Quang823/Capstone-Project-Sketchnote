import { paperController } from "../api/paperController";

export const paperService = {
    getCategoryPapers: async (paperType = "COVER", page = 0, size = 10, keyword = "") => {
        try {
            const response = await paperController.getCategoryPapers(paperType, page, size, keyword);
            return response.data.result;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Get category papers failed.";
            throw new Error(message);
        }
    },

    getPaperTemplates: async (categoryId = null, paperSize = "", page = 0, size = 100, keyword = "") => {
        try {
            const response = await paperController.getPaperTemplates(categoryId, paperSize, page, size, keyword);
            return response.data.result;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Get paper templates failed.";
            throw new Error(message);
        }
    },

    getCoverTemplates: async (orientation = "portrait") => {
        try {
            const categoriesData = await paperService.getCategoryPapers("COVER", 0, 100);
            const categories = categoriesData.content;

            const paperSize = orientation.toUpperCase() === "PORTRAIT" ? "PORTRAIT" : "LANDSCAPE";
            const templatesData = await paperService.getPaperTemplates(null, paperSize, 0, 500);
            const allTemplates = templatesData.content;

            const result = {};
            categories.forEach(category => {
                const categoryTemplates = allTemplates.filter(t => t.categoryPaperId === category.categoryPaperId);
                if (categoryTemplates.length > 0) {
                    const key = category.name.toLowerCase().replace(/\s+/g, "").replace(/&/g, "and");
                    result[key] = categoryTemplates.map(t => ({
                        id: `template_${t.paperTemplateId}`,
                        name: t.name,
                        color: "#E3F2FD",
                        imageUrl: { [orientation]: t.imageUrl },
                        templateId: t.paperTemplateId,
                        categoryId: t.categoryPaperId,
                    }));
                }
            });
            return result;
        } catch (error) {
            console.error("Error fetching cover templates:", error);
            throw error;
        }
    },

    getPaperTemplatesGrouped: async (orientation = "portrait") => {
        try {
            const categoriesData = await paperService.getCategoryPapers("PAPER", 0, 100);
            const categories = categoriesData.content;

            const paperSize = orientation.toUpperCase() === "PORTRAIT" ? "PORTRAIT" : "LANDSCAPE";
            const templatesData = await paperService.getPaperTemplates(null, paperSize, 0, 500);
            const allTemplates = templatesData.content;

            const result = {};
            categories.forEach(category => {
                const categoryTemplates = allTemplates.filter(t => t.categoryPaperId === category.categoryPaperId);
                if (categoryTemplates.length > 0) {
                    const key = category.name.toLowerCase().replace(/\s+/g, "").replace(/&/g, "and");
                    result[key] = categoryTemplates.map(t => ({
                        id: `template_${t.paperTemplateId}`,
                        name: t.name,
                        icon: "file-outline",
                        imageUrl: { [orientation]: t.imageUrl },
                        templateId: t.paperTemplateId,
                        categoryId: t.categoryPaperId,
                    }));
                }
            });
            return result;
        } catch (error) {
            console.error("Error fetching paper templates:", error);
            throw error;
        }
    },
};
