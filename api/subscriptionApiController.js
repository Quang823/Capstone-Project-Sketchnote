import { privateApi } from "./axiosInstance";

export const subscriptionApiController = {
  getSubscriptionPlans: async () => {
    return await privateApi.get("/api/subscription-plans");
  },
  createUserSubscription: async (payload) => {
    return await privateApi.post("/api/users/me/subscriptions", payload);
  },
  getUserSubscriptions: async () => {
    return await privateApi.get("/api/users/me/subscriptions");
  },
};
