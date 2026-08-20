import { RequestHeaders } from '../Types.js';
import { HttpClient, HttpClientResponse, HttpClientResponseInterface } from './HttpClient.js';
type EndpointFetchResponse = {
    status: number;
    body?: string | null;
};
export declare class EndpointFetchHttpClient extends HttpClient {
    /** @override */
    getClientName(): string;
    makeRequest(host: string, port: string, path: string, method: string, headers: RequestHeaders, requestData: string, protocol: string, timeout: number): Promise<HttpClientResponseInterface>;
    private _getHeaders;
    private static _responseFromError;
}
export declare class EndpointFetchHttpClientResponse extends HttpClientResponse {
    private _res;
    constructor(res: EndpointFetchResponse);
    getRawResponse(): EndpointFetchResponse;
    toStream(streamCompleteCallback: () => void): never;
    toJSON(): Promise<any>;
}
export {};
