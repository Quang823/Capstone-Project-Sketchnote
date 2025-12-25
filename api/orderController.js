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
  getPurchasedTemplatesV2: async () => {
    return await privateApi.get(`api/orders/user_resources/user/me/templates/v2`);
  },
  createOrderRetry: async (orderId) => {
    return await privateApi.post(`api/orders/${orderId}/payment/retry`);
  },

  getTemplatesByType: async (type, page = 0, size = 10) => {
    return await privateApi.get(`api/orders/template/type/${type}`, {
      params: { page, size },
    });
  },

  getTemplatesByDesigner: async (designerId, page = 0, size = 10) => {
    return await privateApi.get(`api/orders/template/designer/${designerId}`, {
      params: { page, size },
    });
  },

  getAllTemplates: async (page = 0, size = 10, sortBy, sortDir) => {
    return await privateApi.get(`api/orders/template`, {
      params: { page, size, sortBy, sortDir },
    });
  },
  upgradeTemplateVersionLatest: async (resourceTemplateId) => {
    return await privateApi.post(`api/orders/user_resources/user/me/resource/${resourceTemplateId}/upgrade`);
  },
  getDesignerPublishedTemplates: async () => {
    return await privateApi.get(`api/orders/user_resources/user/me/published-templates`);
  },
};
