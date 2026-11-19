import { http } from './http/request';
import type {
    LoginRequest,
    LoginResponse,
    UserCreateRequest,
    UserUpdateRequest,
    UserVO
} from '@/types';

export const userApi = {
    listUsers(): Promise<UserVO[]> {
        return http.get<UserVO[]>('/api/users');
    },
    getUser(id: string): Promise<UserVO> {
        return http.get<UserVO>(`/api/users/${id}`);
    },
    register(data: UserCreateRequest): Promise<UserVO> {
        return http.post<UserVO, UserCreateRequest>('/api/users/register', data);
    },
    login(data: LoginRequest): Promise<LoginResponse> {
        return http.post<LoginResponse, LoginRequest>('/api/users/login', data);
    },
    updateUser(id: string, data: UserUpdateRequest): Promise<UserVO> {
        return http.put<UserVO, UserUpdateRequest>(`/api/users/${id}`, data);
    }
};
