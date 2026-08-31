export function assertMoneyInPaise(value: number, fieldName: string): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer paise value`);
  }
  return value;
}

export function assertNonNegativeMoney(value: number, fieldName: string): number {
  const paise = assertMoneyInPaise(value, fieldName);
  if (paise < 0) {
    throw new Error(`${fieldName} cannot be negative`);
  }
  return paise;
}

export function assertPositiveQuantity(quantity: number, fieldName = "quantity"): number {
  if (!Number.isInteger(quantity)) {
    throw new Error(`${fieldName} must be an integer`);
  }
  if (quantity <= 0) {
    throw new Error(`${fieldName} must be greater than zero`);
  }
  return quantity;
}

export function calculateTotalInPaise(lineItems: Array<{ unitPriceInPaise: number; quantity: number }>): number {
  return lineItems.reduce((sum, lineItem) => {
    const unitPrice = assertNonNegativeMoney(lineItem.unitPriceInPaise, "unitPriceInPaise");
    const quantity = assertPositiveQuantity(lineItem.quantity);
    return sum + unitPrice * quantity;
  }, 0);
}
