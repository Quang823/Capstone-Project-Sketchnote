import { bankAccountApiController } from "../api/bankAccountApiController";

// Cache for bank list
let cachedBanks = null;

export const bankAccountService = {
    /**
     * Get list of Vietnamese banks from VietQR API
     * Uses caching to reduce API calls
     */
    getBanks: async () => {
        try {
            // Return cached data if available
            if (cachedBanks) {
                return cachedBanks;
            }

            const response = await bankAccountApiController.getBanks();

            if (response.data && response.data.code === "00") {
                cachedBanks = response.data.data;
                return cachedBanks;
            }

            throw new Error(response.data?.desc || "Failed to fetch banks");
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || "Failed to fetch bank list");
        }
    },

    /**
     * Create a new bank account
     * @param {Object} accountData - { bankName, accountNumber, accountHolderName, branch, isDefault }
     */
    createBankAccount: async (accountData) => {
        try {
            const response = await bankAccountApiController.createBankAccount(accountData);
            // API returns { code, message, result: {...} }
            return response.data?.result || response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || "Failed to create bank account");
        }
    },

    /**
     * Get all bank accounts of current user
     */
    getBankAccounts: async () => {
        try {
            const response = await bankAccountApiController.getBankAccounts();
            // API returns { code, message, result: [...] }
            return response.data?.result || response.data || [];
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || "Failed to fetch bank accounts");
        }
    },

    /**
     * Update a bank account
     */
    updateBankAccount: async (id, accountData) => {
        try {
            const response = await bankAccountApiController.updateBankAccount(id, accountData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || "Failed to update bank account");
        }
    },

    /**
     * Delete a bank account
     */
    deleteBankAccount: async (id) => {
        try {
            const response = await bankAccountApiController.deleteBankAccount(id);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || "Failed to delete bank account");
        }
    },

    /**
     * Clear cached banks (useful for force refresh)
     */
    clearBankCache: () => {
        cachedBanks = null;
    },
};
