import { privateApi } from "./axiosInstance";

export const paperController = {
    getCategoryPapers: async (paperType = "COVER", page = 0, size = 10, keyword = "") => {
        return await privateApi.get("/api/category-papers", {
            params: { paperType, page, size, keyword },
        });
    },

    getPaperTemplates: async (categoryId = null, paperSize = "", page = 0, size = 100, keyword = "") => {
        const params = { page, size, keyword };
        if (categoryId !== null) params.categoryId = categoryId;
        if (paperSize) params.paperSize = paperSize;

        return await privateApi.get("/api/paper-templates", { params });
    },
};
