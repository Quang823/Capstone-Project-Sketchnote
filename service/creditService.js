import { creditApiController } from "../api/creditApiController";

export const creditService = {
    getCreditBalance: async () => {
        try {
            const response = await creditApiController.getCreditBalance();
            return response.data.result;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Get credit balance failed.";
            throw new Error(message);
        }
    },
    
    getCreditTransactionHistory: async (page = 0, size = 100) => {
        try {
            const response = await creditApiController.getCreditTransactionHistory(page, size);
            return response.data.result;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Get credit transaction history failed.";
            throw new Error(message);
        }
    },
    
    checkCreditBalance: async (amount) => {
        try {
            const response = await creditApiController.checkcredit(amount);
            return response.data.result;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Check credit balance failed.";
            throw new Error(message);
        }
    },
    
    purchaseCredit: async (amount) => {
        try {
            const response = await creditApiController.purchaseCredit({ amount });
            return response.data.result;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Purchase credit failed.";
            throw new Error(message);
        }
    },
    
    getAllCreditPackages: async () => {
        try {
            const response = await creditApiController.getAllCreditPackages();
            return response.data.result;
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Get all credit packages failed.";
            throw new Error(message);
        }
    }
}