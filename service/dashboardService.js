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
}