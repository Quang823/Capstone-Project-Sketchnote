import { orderController } from "../api/orderController"

export const orderService = {
    createOrder : async (order) =>{
        try {
            const res = await orderController.createOrder(order)
            return res.data
        } catch (error) {
             const message = error.response?.data?.message || error.message || "Create order failed.";
      throw new Error(message);
        }
    },
    getOrderByUserId : async () =>{
        try {
            const res = await orderController.getOrderByUserId()
            return res.data.result;
        } catch (error) {
             const message = error.response?.data?.message || error.message || "Get order by user id failed.";
      throw new Error(message);
        }
    },
    getOrderById : async (orderId) =>{
        try {
            const res = await orderController.getOrderById(orderId)
            return res.data.result;
        } catch (error) {
             const message = error.response?.data?.message || error.message || "Get order by id failed.";
      throw new Error(message);
        }
    },
}