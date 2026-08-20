import { Stripe } from './stripe.core.js';
import { StripeConfig } from './lib.js';
type StripeCallableConstructor = typeof Stripe & {
    (key?: string, config?: StripeConfig): Stripe;
    new (key?: string, config?: StripeConfig): Stripe;
};
declare const StripeConstructor: StripeCallableConstructor;
export = StripeConstructor;
