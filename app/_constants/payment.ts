export const enum PaymentStatus {
    COMPLETED = "Completed",
    FAILED = "Failed",
    CANCELLED = "Cancelled",
    REFUNDED = "Refunded",
    PROCESSING = "Processing",
    DECLINED = "Declined",
}

export const PaymentStatusList = [
    PaymentStatus.COMPLETED,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
    PaymentStatus.REFUNDED,
    PaymentStatus.PROCESSING,
    PaymentStatus.DECLINED
];