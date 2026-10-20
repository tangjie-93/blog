import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import type { ApiResult } from '@/types';

const API_SUCCESS_CODE = 0;

const httpClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResult<null>>) => {
        const message = error.response?.data?.message || error.message || '请求失败';
        return Promise.reject(new Error(message));
    }
);

/**
 * 发送统一后端响应格式的 HTTP 请求。
 * @param config Axios 请求配置。
 * @returns 后端 data 字段。
 */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.request<ApiResult<T>>(config);
    const result = response.data;

    if (result.code !== API_SUCCESS_CODE) {
        throw new Error(result.message || '业务处理失败');
    }

    return result.data;
}

export const http = {
    /**
     * 发送 GET 请求。
     * @param url 请求地址。
     * @param config Axios 请求配置。
     * @returns 后端 data 字段。
     */
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'GET', url });
    },
    /**
     * 发送 POST 请求。
     * @param url 请求地址。
     * @param data 请求体数据。
     * @param config Axios 请求配置。
     * @returns 后端 data 字段。
     */
    post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'POST', url, data });
    }
};
