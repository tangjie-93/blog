export interface UserInfo {
    id: number;
    username: string;
    email: string;
    age: number;
}

export interface ProductInfo {
    id: number;
    name: string;
    price: number;
    stock: number;
}

export interface OrderInfo {
    id: number;
    userId: number;
    username: string;
    productId: number;
    productName: string;
    quantity: number;
    amount: number;
    status: string;
    createdAt: string;
}

export interface UserCreatePayload {
    username: string;
    email: string;
    age: number;
}

export interface OrderCreatePayload {
    userId: number;
    productId: number;
    quantity: number;
}

export interface DashboardState {
    users: UserInfo[];
    products: ProductInfo[];
    orders: OrderInfo[];
    loading: boolean;
    submittingUser: boolean;
    submittingOrder: boolean;
    errorMessage: string;
}

export interface UserPanelProps {
    users: UserInfo[];
    loading: boolean;
    submitting: boolean;
}

export interface ProductPanelProps {
    products: ProductInfo[];
    loading: boolean;
}

export interface OrderPanelProps {
    users: UserInfo[];
    products: ProductInfo[];
    orders: OrderInfo[];
    loading: boolean;
    submitting: boolean;
}

export type UserPanelEmits = {
    refresh: [];
    createUser: [payload: UserCreatePayload];
};

export type ProductPanelEmits = {
    refresh: [];
};

export type OrderPanelEmits = {
    refresh: [];
    createOrder: [payload: OrderCreatePayload];
};
