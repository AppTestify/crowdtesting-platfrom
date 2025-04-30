export const enum PaymentStatus {
  COMPLETED = "Completed",
  FAILED = "Failed",
  CANCELLED = "Cancelled",
  REFUNDED = "Refunded",
  PROCESSING = "Processing",
  DECLINED = "Declined",
  PENDING = "Pending",
}

export const PaymentStatusList = [
  PaymentStatus.COMPLETED,
  PaymentStatus.FAILED,
  PaymentStatus.CANCELLED,
  PaymentStatus.REFUNDED,
  PaymentStatus.PROCESSING,
  PaymentStatus.DECLINED,
  PaymentStatus.PENDING,
];

export const enum PaymentCurrency {
  USD = "$",
  INR = "₹",
  EURO = "€",
}

export const PaymentCurrencyList = [
  PaymentCurrency.USD,
  PaymentCurrency.INR,
  PaymentCurrency.EURO,
];


export const enum AmountType {
  FLAT = "flat",
  PERCENTAGE = "percentage"
}

export const AmountTypeList = [
  AmountType.FLAT,
  AmountType.PERCENTAGE
];
