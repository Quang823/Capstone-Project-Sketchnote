import { dashboardController } from "../api/dashboardController";

export const dashboardService = {
    getDashboardSummaryDesigner: async () => {
        try {
            const res = await dashboardController.getDashboardSummaryDesigner();
            return res.data.result;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Get dashboard summary designer failed.";
            throw new Error(message);
        }
    },
    getTopTemplates: async () => {
        try {
            const res = await dashboardController.getTopTemplates();
            return res.data.result;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Get top templates failed.";
            throw new Error(message);
        }
    },
    getSalesReport: async (start, end, groupBy) => {
        try {
            const response = await dashboardController.getSalesReport(start, end, groupBy);
            return response.data.result;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Get sales report failed.";
            throw new Error(message);
        }
    },
}