import { privateApi } from "./axiosInstance"

export const dashboardController = {
    getDashboardSummaryDesigner: async () => {
         return await  privateApi.get("/api/orders/designer/dashboard/summary")
    },
    getTopTemplates: async () => {
        return await privateApi.get("/api/orders/designer/dashboard/top-templates?limit=10")
    },
     getSalesReport: async (start, end, groupBy) => {
  return await privateApi.get(
    `/api/orders/designer/dashboard/sales`,
    {
      // baseURL: "http://34.126.98.83:8083",
      params: {
        start,
        end,
        groupBy,
      },
    }
  );
},
}
