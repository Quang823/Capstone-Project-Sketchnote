import { orderController } from "../api/orderController";

export const orderService = {
  createOrder: async (order) => {
    try {
      const res = await orderController.createOrder(order);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Create order failed.";
      throw new Error(message);
    }
  },
  getOrderByUserId: async () => {
    try {
      const res = await orderController.getOrderByUserId();
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Get order by user id failed.";
      throw new Error(message);
    }
  },
  getOrderById: async (orderId) => {
    try {
      const res = await orderController.getOrderById(orderId);
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Get order by id failed.";
      throw new Error(message);
    }
  },
  getPurchasedTemplates: async () => {
    try {
      const res = await orderController.getPurchasedTemplates();
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Get purchased templates failed.";
      throw new Error(message);
    }
  },
  getPurchasedTemplatesV2: async () => {
    try {
      const res = await orderController.getPurchasedTemplatesV2();
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Get purchased templates failed.";
      throw new Error(message);
    }
  },

  
  createOrderRetry: async (orderId) => {
    try {
      const res = await orderController.createOrderRetry(orderId);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Create order retry failed.";
      throw new Error(message);
    }
  },
  getTemplatesByType: async (type, page = 0, size = 10) => {
    try {
      const res = await orderController.getTemplatesByType(type, page, size);
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Get templates by type failed.";
      throw new Error(message);
    }
  },
  getTemplatesByDesigner: async (designerId, page = 0, size = 10) => {
    try {
      const res = await orderController.getTemplatesByDesigner(designerId, page, size);
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Get templates by designer failed.";
      throw new Error(message);
    }
  },
  upgradeTemplateVersionLatest: async (resourceTemplateId ) => {
    try {
      const res = await orderController.upgradeTemplateVersionLatest(resourceTemplateId);
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Upgrade template version latest failed.";
      throw new Error(message);
    }
  },
};
