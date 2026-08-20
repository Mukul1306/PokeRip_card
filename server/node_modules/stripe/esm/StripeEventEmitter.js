/**
 * @private
 * (For internal use in stripe-node.)
 * Minimal EventEmitter for runtimes without Event or EventTarget.
 */
export class StripeEventEmitter {
    constructor() {
        this._listeners = new Map();
    }
    on(eventName, listener) {
        this._getListeners(eventName).push({ listener, once: false });
    }
    once(eventName, listener) {
        this._getListeners(eventName).push({ listener, once: true });
    }
    removeListener(eventName, listener) {
        const listeners = this._listeners.get(eventName);
        if (!listeners) {
            return;
        }
        const index = listeners.findIndex((entry) => entry.listener === listener);
        if (index === -1) {
            return;
        }
        this._removeAt(eventName, index);
    }
    emit(eventName, data) {
        const listeners = this._listeners.get(eventName);
        if (!listeners || listeners.length === 0) {
            return false;
        }
        for (const entry of [...listeners]) {
            if (entry.once) {
                this._removeAt(eventName, listeners.indexOf(entry));
            }
            entry.listener(data);
        }
        return true;
    }
    _getListeners(eventName) {
        let listeners = this._listeners.get(eventName);
        if (!listeners) {
            listeners = [];
            this._listeners.set(eventName, listeners);
        }
        return listeners;
    }
    _removeAt(eventName, index) {
        const listeners = this._listeners.get(eventName);
        if (!listeners || index === -1) {
            return;
        }
        listeners.splice(index, 1);
        if (listeners.length === 0) {
            this._listeners.delete(eventName);
        }
    }
}
//# sourceMappingURL=StripeEventEmitter.js.map