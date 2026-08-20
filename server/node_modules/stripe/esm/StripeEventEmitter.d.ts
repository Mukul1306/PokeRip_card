import { RequestEvent, ResponseEvent } from './Types.js';
type Listener = (...args: any[]) => any;
/**
 * @private
 * (For internal use in stripe-node.)
 * Minimal EventEmitter for runtimes without Event or EventTarget.
 */
export declare class StripeEventEmitter {
    private _listeners;
    constructor();
    on(eventName: string, listener: Listener): void;
    once(eventName: string, listener: Listener): void;
    removeListener(eventName: string, listener: Listener): void;
    emit(eventName: string, data?: RequestEvent | ResponseEvent): boolean;
    private _getListeners;
    private _removeAt;
}
export {};
