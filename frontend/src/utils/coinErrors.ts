import { INSUFFICIENT_COINS_MESSAGE } from '../constants/coins';

export function isInsufficientCoinsError(error: any): boolean {
  if (!error) return false;
  const message = error.message || error.toString();
  return message.toLowerCase().includes('insufficient coins');
}

export function getCoinErrorMessage(error: any): string {
  if (isInsufficientCoinsError(error)) {
    return INSUFFICIENT_COINS_MESSAGE;
  }
  return error?.message || 'An error occurred. Please try again.';
}
