export interface ApiResult<T> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
}

export interface PageResult<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
