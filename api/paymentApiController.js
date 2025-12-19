import { privateApi } from "./axiosInstance";

export const paymentApiController = {
  getWallet: async () => {
    return await privateApi.get("/api/wallet/my-wallet");
  },
  depositWallet: async (amount) => {
    return await privateApi.post(`/api/payment/deposit?amount=${amount}`, null);
  },
  withdrawRequest: async (data) => {
    return await privateApi.post(`/api/withdraw/request`, data);
  },
  getWithdrawHistory: async (page,size,sortBy,sortDirection) => {
    return await privateApi.get(`/api/withdraw/my-history?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
  },
  getAllWalletTransaction: async (page,size,type,sortBy,sortDirection) => {
    let url = `/api/wallet/transactions/history?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDirection}`;
    if (type) {
      url += `&type=${type}`;
    }
    return await privateApi.get(url);
  },
};
