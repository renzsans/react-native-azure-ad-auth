import uuid from 'uuid';
import querystring from 'query-string';
import URL, { UrlWithParsedQuery } from 'url';
import AzureAdInstance, { Credentials } from './AzureAdInstance';
import { Buffer } from 'buffer';

export default class AzureAdAuth {

    config: Credentials;

    constructor(instance: AzureAdInstance) {
        this.config = instance.getConfig();

        // function binding
        this.getAuthLoginUrl = this.getAuthLoginUrl.bind(this);
        this._request = this._request.bind(this);
    }

    getAuthLoginUrl() {
        const { authority, authorize_endpoint, client_id, redirect_uri, scope } = this.config;

        return authority + authorize_endpoint +
            '?client_id=' + client_id +
            '&response_type=code' +
            '&redirect_uri=' + redirect_uri +
            '&scope=' + scope +
            '&response_mode=query' +
            '&nonce=' + uuid.v4() +
            '&state=abcd';
    }

    getAuthLogoutUrl() {
        return this.config.authority + "/oauth2/v2.0/logout";
    }

    async _request(params: any): Promise<any> {
        const { authority, token_endpoint } = this.config;

        const post_data = querystring.stringify(params);

        // create request endpoint
        const endpoint = authority + token_endpoint;

        // set port based on http protocol
        var parsedUrl: UrlWithParsedQuery = URL.parse(endpoint, true);
        if (parsedUrl.protocol == "https:" && !parsedUrl.port) {
            parsedUrl.port = "443";
        }

        // set request header
        var realHeaders: any = {};
        realHeaders['Host'] = parsedUrl.host;

        var queryStr = querystring.stringify(parsedUrl.query);
        if (queryStr) queryStr = "?" + queryStr;

        if (post_data) {
            if (Buffer.isBuffer(post_data)) {
                realHeaders["Content-Length"] = post_data.length;
            } else {
                realHeaders["Content-Length"] = Buffer.byteLength(post_data);
            }
        } else {
            realHeaders["Content-length"] = 0;
        }

        realHeaders["Content-Type"] = 'application/x-www-form-urlencoded';

        // create request option object
        const options = {
            host: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + queryStr,
            method: "POST",
            headers: realHeaders
        };

        const payload = Object.assign({
            body: post_data
        }, options);

        // request token
        try {
            const response = await fetch(endpoint, payload);
            const responseJson = await response.json();
            // read blob object back to json
            return {
                expires_in: responseJson.expires_in + Math.round(+new Date() / 1000),
                accessToken: responseJson.access_token,
                refreshToken: responseJson.refresh_token
            };
        }
        catch (err) {
            // incase of error reject promise
            return new Error(err);
        }
    }

    getTokenFromCode(code: string): Promise<any> {
        const { client_id, client_secret, redirect_uri } = this.config;

        var params = {
            client_id: client_id,
            client_secret: client_secret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirect_uri,
            response_mode: 'form_post',
            nonce: uuid.v4(),
            state: 'abcd'
        }
        return this._request(params);
    }

    getTokenFromRefreshToken(refreshToken: string): Promise<any> {
        const { client_id, client_secret, redirect_uri } = this.config;

        var params = {
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            redirect_uri: redirect_uri,
            response_mode: 'form_post',
            nonce: uuid.v4(),
            state: 'abcd'
        }
        return this._request(params);
    }
}