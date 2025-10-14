import { privateApi } from "./axiosInstance";

export const paymentApiController = {
    getWallet: async () => {
       return await privateApi.get("/api/wallet/my-wallet", {
        baseURL: "http://146.190.90.222:8084"
       });
    },
    depositWallet: async (amount,walletId) => {
        return await privateApi.post(`/api/payment/deposit/${walletId}?amount=${amount}`, {
           
        }, {
            baseURL: "http://146.190.90.222:8084"
        });
    },
}   