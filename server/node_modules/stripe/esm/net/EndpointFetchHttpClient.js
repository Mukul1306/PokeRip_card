import { parseHttpHeaderAsString } from '../utils.js';
import { HttpClient, HttpClientResponse, HttpClientRuntimeError, } from './HttpClient.js';
const STRIPE_API_HOST = 'api.stripe.com';
export class EndpointFetchHttpClient extends HttpClient {
    /** @override */
    getClientName() {
        return 'endpointFetch';
    }
    async makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
        if (!path.startsWith('/')) {
            throw new Error(`Only relative paths are supported, got: "${path}"`);
        }
        if (host !== STRIPE_API_HOST) {
            throw new HttpClientRuntimeError(`Stripe: This entrypoint only supports Stripe API requests to ${STRIPE_API_HOST}. Received request for ${host}.`);
        }
        if (typeof endpointFetch !== 'function') {
            throw new HttpClientRuntimeError('Stripe: EndpointFetchHttpClient requires `endpointFetch()` from a Stripe Script runtime or a test mock.');
        }
        const methodHasPayload = method == 'POST' || method == 'PUT' || method == 'PATCH';
        const body = requestData || (methodHasPayload ? '' : undefined);
        const endpointFetchRequest = {
            endpoint: 'stripe_api',
            path,
            method,
            headers: this._getHeaders(headers),
        };
        if (body !== undefined) {
            endpointFetchRequest.body = body;
        }
        try {
            const response = await endpointFetch(endpointFetchRequest);
            return new EndpointFetchHttpClientResponse(response);
        }
        catch (e) {
            const response = EndpointFetchHttpClient._responseFromError(e);
            if (response) {
                return new EndpointFetchHttpClientResponse(response);
            }
            throw e;
        }
    }
    _getHeaders(headers) {
        return Object.fromEntries(Object.entries(headers).map(([key, value]) => [
            key,
            parseHttpHeaderAsString(value),
        ]));
    }
    static _responseFromError(error) {
        if (!error || typeof error !== 'object') {
            return null;
        }
        const endpointFetchError = error;
        if (typeof endpointFetchError.status !== 'number') {
            return null;
        }
        return {
            status: endpointFetchError.status,
            body: endpointFetchError.body ?? '',
        };
    }
}
export class EndpointFetchHttpClientResponse extends HttpClientResponse {
    constructor(res) {
        super(res.status, {});
        this._res = res;
    }
    getRawResponse() {
        return this._res;
    }
    toStream(streamCompleteCallback) {
        throw new HttpClientRuntimeError('Stripe: EndpointFetchHttpClient does not support streaming responses.');
    }
    toJSON() {
        const body = this._res.body || '';
        return Promise.resolve().then(() => this._parseResponseBody(body));
    }
}
//# sourceMappingURL=EndpointFetchHttpClient.js.map