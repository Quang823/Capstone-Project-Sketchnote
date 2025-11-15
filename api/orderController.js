import { privateApi } from "./axiosInstance";

export const orderController = {
  createOrder: async (order) => {
    return await privateApi.post("api/orders", order);
  },

  getOrderByUserId: async () => {
    return await privateApi.get(`api/orders/me`);
  },

  getOrderById: async (orderId) => {
    return await privateApi.get(`api/orders/${orderId}`);
  },

  getPurchasedTemplates: async () => {
    return await privateApi.get(`api/orders/user_resources/user/me/templates`);
  },
  createOrderRetry: async (orderId) => {
    return await privateApi.post(`api/orders/${orderId}/payment/retry`);
  },
};
