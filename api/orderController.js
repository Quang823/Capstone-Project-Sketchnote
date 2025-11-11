import { privateApi } from "./axiosInstance";

export const orderController = {
  createOrder: async (order) => {
    return await privateApi.post("api/orders", order, {
      baseURL: "http://146.190.90.222:8083",
    });
  },
  getOrderByUserId: async () => {
    return await privateApi.get(`api/orders/me`, {
      baseURL: "http://146.190.90.222:8083",
    });
  },
  getOrderById: async (orderId) => {
    return await privateApi.get(`api/orders/${orderId}`, {
      baseURL: "http://146.190.90.222:8083",
    });
  },
  getPurchasedTemplates: async () => {
    return await privateApi.get("api/orders/user_resources/user/me/templates", {
      baseURL: "http://146.190.90.222:8083",
    });
  },
};
