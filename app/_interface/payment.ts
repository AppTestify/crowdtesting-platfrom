export interface IPaymentPayload {
    // id?: string;
    receiverId: string;
    projectId?: string;
    status?: string;
    description?: string;
    amount: number;
}

export interface IPayment {
    id?: string;
    senderId: string;
    projectId?: string;
    status?: string;
    description?: string;
    amount: number;
}