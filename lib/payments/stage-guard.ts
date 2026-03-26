export function canCreatePaidOrder(totalAmount: number, paymentsEnabled: boolean) {
  if (totalAmount <= 0) {
    return true;
  }

  return paymentsEnabled;
}
