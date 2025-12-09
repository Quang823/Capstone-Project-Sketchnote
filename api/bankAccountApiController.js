import { publicApi, privateApi } from "./axiosInstance";
import axios from "axios";

export const bankAccountApiController = {
    // Get list of Vietnamese banks from VietQR API
    getBanks: async () => {
        const response = await axios.get("https://api.vietqr.io/v2/banks");
        return response;
    },

    // Create a new bank account for current user
    createBankAccount: async (data) => {
        return await privateApi.post(`/api/bank-accounts`, data);
    },

    // Get all bank accounts of current user
    getBankAccounts: async () => {
        return await privateApi.get(`/api/bank-accounts/me`);
    },

    // Update a bank account
    updateBankAccount: async (id, data) => {
        return await privateApi.put(`/api/bank-accounts/${id}`, data);
    },

    // Delete a bank account
    deleteBankAccount: async (id) => {
        return await privateApi.delete(`/api/bank-accounts/${id}`);
    },
};
