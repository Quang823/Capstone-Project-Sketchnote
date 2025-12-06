import { subscriptionApiController } from "../api/subscriptionApiController";

export const subscriptionService = {
  getSubscriptionPlans: async () => {
    try {
      const res = await subscriptionApiController.getSubscriptionPlans();
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Get subscription plans failed.";
      throw new Error(message);
    }
  },
  createUserSubscription: async (payload) => {
    try {
      const res = await subscriptionApiController.createUserSubscription(payload);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Create subscription failed.";
      throw new Error(message);
    }
  },
  getUserSubscriptions: async () => {
    try {
      const res = await subscriptionApiController.getUserSubscriptions();
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Get user subscriptions failed.";
      throw new Error(message);
    }
  },
  checkUpgrade: async (planId) => {
    try {
      const res = await subscriptionApiController.checkUpgrade(planId);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Check upgrade failed.";
      throw new Error(message);
    }
  },
};
