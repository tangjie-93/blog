export interface UserVO {
    id: string;
    username: string;
    nickname?: string;
    email?: string;
    createdAt: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    tokenType: 'Bearer';
}

export interface UserCreateRequest {
    username: string;
    password: string;
    nickname?: string;
    email?: string;
}

export interface UserUpdateRequest {
    password?: string;
    nickname?: string;
    email?: string;
}
