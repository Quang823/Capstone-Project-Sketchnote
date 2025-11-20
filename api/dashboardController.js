import { privateApi } from "./axiosInstance"

export const dashboardController = {
    getDashboardSummaryDesigner: async () => {
         return await  privateApi.get("/api/orders/designer/dashboard/summary")
    },
    getTopTemplates: async () => {
        return await privateApi.get("/api/orders/designer/dashboard/top-templates?limit=10")
    },
}
