export { Decimal } from './Decimal.js';
import { Stripe as StripeCore } from './stripe.core.js';
import { StripeConfig } from './lib.js';
type ExtensibilityStripeConstructor = typeof StripeCore & {
    new (key?: string, config?: StripeConfig): StripeCore;
};
declare const Stripe: ExtensibilityStripeConstructor;
export { Stripe };
export default Stripe;
