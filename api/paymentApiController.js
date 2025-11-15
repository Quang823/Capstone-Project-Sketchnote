import { privateApi } from "./axiosInstance";

export const paymentApiController = {
  getWallet: async () => {
    return await privateApi.get("/api/wallet/my-wallet");
  },
  depositWallet: async (amount) => {
    return await privateApi.post(
      `/api/payment/deposit?amount=${amount}`,
      null,
      {
        baseURL: "http://34.30.141.121:8089",
      }
    );
  },
};
