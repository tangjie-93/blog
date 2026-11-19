import { http } from '@/service/http/request';
import type { OrderCreatePayload, OrderInfo, ProductInfo, UserCreatePayload, UserInfo } from '@/types';

export const stage5Api = {
    /**
     * 获取用户服务中的用户列表。
     * @returns 用户列表。
     */
    getUsers(): Promise<UserInfo[]> {
        return http.get<UserInfo[]>('/users');
    },
    /**
     * 创建用户服务中的用户。
     * @param payload 用户表单数据。
     * @returns 创建后的用户。
     */
    createUser(payload: UserCreatePayload): Promise<UserInfo> {
        return http.post<UserInfo, UserCreatePayload>('/users', payload);
    },
    /**
     * 获取商品服务中的商品列表。
     * @returns 商品列表。
     */
    getProducts(): Promise<ProductInfo[]> {
        return http.get<ProductInfo[]>('/products');
    },
    /**
     * 获取订单服务中的订单列表。
     * @returns 订单列表。
     */
    getOrders(): Promise<OrderInfo[]> {
        return http.get<OrderInfo[]>('/orders');
    },
    /**
     * 通过订单服务创建订单。
     * @param payload 订单创建参数。
     * @returns 创建后的订单。
     */
    createOrder(payload: OrderCreatePayload): Promise<OrderInfo> {
        return http.post<OrderInfo, OrderCreatePayload>('/orders', payload);
    }
};
