import { privateApi } from "./axiosInstance"

export const creditApiController = {
    getCreditBalance : async () =>{
     return await privateApi.get(`api/credits/balance`)
    },
    getCreditTransactionHistory : async (page,size) =>{
        return await privateApi.get(`api/credits/history?page=${page}&size=${size}`)
    },
    checkcredit : async (amount) =>{
        return await privateApi.get(`i/credits/check?amount=${amount}`)
    },
    purchaseCredit : async (data) =>{
        return await privateApi.post(`api/credits/purchase`, data)
    },
    getAllCreditPackages : async () =>{
        return await privateApi.get(`api/credit-packages`)
    },
    purchaseCreditPackage : async (creditPackageId) =>{
        return await privateApi.post(`api/credit-packages/${creditPackageId}/purchase`)
    }
}