import { privateApi } from "./axiosInstance";

export const paymentApiController = {
    getWallet: async () => {
       return await privateApi.get("/api/wallet/my-wallet", {
        baseURL: "http://146.190.90.222:8084"
       });
    },
    depositWallet: async (amount) => {
        return await privateApi.post(`/api/payment/deposit?amount=${amount}`, {
           
        }, {
            baseURL: "http://146.190.90.222:8084"
        });
    },
}   