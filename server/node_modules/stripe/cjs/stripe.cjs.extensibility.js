"use strict";
const ExtensibilityPlatformFunctions_js_1 = require("./platform/ExtensibilityPlatformFunctions.js");
const stripe_core_js_1 = require("./stripe.core.js");
// Initialize the Stripe class with Extensibility platform functions
stripe_core_js_1.Stripe.initialize(new ExtensibilityPlatformFunctions_js_1.ExtensibilityPlatformFunctions());
// Callable constructor: supports both `new Stripe()` and `Stripe()` for CJS consumers.
// typeof Stripe provides the construct signature and static members; the intersection
// adds a call signature for backward compatibility.
const StripeConstructor = function (key, config) {
    // Support calling without `new`
    if (!(this instanceof StripeConstructor)) {
        return new stripe_core_js_1.Stripe(key || '', config);
    }
    return new stripe_core_js_1.Stripe(key || '', config);
};
// Copy all static properties from Stripe to the wrapper
Object.setPrototypeOf(StripeConstructor, stripe_core_js_1.Stripe);
Object.setPrototypeOf(StripeConstructor.prototype, stripe_core_js_1.Stripe.prototype);
// Copy static properties explicitly
for (const key of Object.getOwnPropertyNames(stripe_core_js_1.Stripe)) {
    if (key !== 'length' && key !== 'prototype' && key !== 'name') {
        Object.defineProperty(StripeConstructor, key, {
            value: stripe_core_js_1.Stripe[key],
            writable: true,
            enumerable: true,
            configurable: true,
        });
    }
}
module.exports = StripeConstructor;
//# sourceMappingURL=stripe.cjs.extensibility.js.map