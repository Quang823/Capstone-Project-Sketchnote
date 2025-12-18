import { paymentApiController } from "../api/paymentApiController";

export const paymentService = {
    getWallet: async () => {
     try {
        const  res = await paymentApiController.getWallet();
        return res.data;
     } catch (error) {
        const message =
        error.response?.data?.message || error.message || "Get wallet failed.";
      throw new Error(message);
     }
    },
    depositWallet: async (amount) => {
        try {
            const res = await paymentApiController.depositWallet(amount);
            return res.data;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Deposit wallet failed.";
          throw new Error(message);
        }
    },
    withdrawRequest: async (data) => {
        try {
            const res = await paymentApiController.withdrawRequest(data);
            return res.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Withdraw request failed.";
          throw new Error(message);
        }
    },
    getWithdrawHistory: async (page,size,sortBy,sortDirection) => {
        try {
            const res = await paymentApiController.getWithdrawHistory(page,size,sortBy,sortDirection);
            return res.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get withdraw history failed.";
          throw new Error(message);
        }
    },
     getAllWalletTransaction: async (page,size,type,sortBy,sortDirection) => {
        try {
            const res = await paymentApiController.getAllWalletTransaction(page,size,type,sortBy,sortDirection);
            return res.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get all wallet transaction failed.";
          throw new Error(message);
        }
     },
     
    
}