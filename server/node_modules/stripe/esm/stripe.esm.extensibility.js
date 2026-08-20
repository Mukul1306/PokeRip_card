import { ExtensibilityPlatformFunctions } from './platform/ExtensibilityPlatformFunctions.js';
export { Decimal } from './Decimal.js';
import { Stripe as StripeCore } from './stripe.core.js';
// Initialize the Stripe class with Extensibility platform functions
StripeCore.initialize(new ExtensibilityPlatformFunctions());
const Stripe = StripeCore;
export { Stripe };
export default Stripe;
//# sourceMappingURL=stripe.esm.extensibility.js.map