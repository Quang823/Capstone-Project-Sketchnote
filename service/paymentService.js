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
}