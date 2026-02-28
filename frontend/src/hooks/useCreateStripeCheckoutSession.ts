import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ShoppingItem } from '../backend';
import type { CoinPurchasePlan } from '../backend';

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateStripeCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (plan: CoinPurchasePlan): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/#payment-success?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan.id}`;
      const cancelUrl = `${baseUrl}/#payment-failure`;

      // Convert INR price string like "₹99" to paise (cents equivalent)
      // Parse numeric value from price string
      const priceNumeric = parseFloat(plan.price.replace(/[^0-9.]/g, ''));
      const priceInPaise = Math.round(priceNumeric * 100);

      const shoppingItem: ShoppingItem = {
        productName: plan.name,
        productDescription: `${Number(plan.coinAmount)} coins for your Wrapper AI account`,
        quantity: BigInt(1),
        priceInCents: BigInt(priceInPaise),
        currency: plan.currencyCode.toLowerCase(),
      };

      const result = await actor.createCheckoutSession([shoppingItem], successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      return session;
    },
  });
}
