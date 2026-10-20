export interface ApiResult<T> {
    code: number;
    message: string;
    data: T;
}
