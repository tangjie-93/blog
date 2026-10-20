import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import type { ApiResult } from '@/types';

const API_SUCCESS_CODE = 200;

const httpClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

async function getAuthStore() {
    const authModule = await import('@/store/modules/auth');
    return authModule.useAuthStore();
}

httpClient.interceptors.request.use(async (config) => {
    const authStore = await getAuthStore();
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
});

httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResult<null>>) => {
        if (error.response?.status === 401) {
            const authStore = await getAuthStore();
            authStore.logout();
        }
        const message = error.response?.data?.message || error.message || '请求失败';
        return Promise.reject(new Error(message));
    }
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.request<ApiResult<T>>(config);
    const result = response.data;

    if (result.code !== API_SUCCESS_CODE) {
        if (result.code === 401) {
            const authStore = await getAuthStore();
            authStore.logout();
        }
        throw new Error(result.message || '业务处理失败');
    }

    return result.data;
}

export const http = {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'GET', url });
    },
    post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'POST', url, data });
    },
    put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'PUT', url, data });
    },
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'DELETE', url });
    }
};
