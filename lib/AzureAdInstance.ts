export interface Credentials {
    authority: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    scope: string;
    authorize_endpoint?: string;
    token_endpoint?: string;
    token?: any;
}

export default class AzureAdInstance {

    credentials: Credentials;

    constructor(credentials: Credentials) {
        this.credentials = credentials;

        this.credentials.authorize_endpoint = credentials.authorize_endpoint || '/oauth2/v2.0/authorize';
        this.credentials.token_endpoint = credentials.token_endpoint || '/oauth2/v2.0/token';
        this.credentials.token = {};

        // function binding
        this.getConfig = this.getConfig.bind(this);
        this.setToken = this.setToken.bind(this);
        this.getToken = this.getToken.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
    }

    getConfig(): Credentials {
        return this.credentials;
    }

    setToken(token: any) {
        this.credentials.token = token;
    }

    getToken() {
        return this.credentials.token;
    }

    clearToken() {
        this.credentials.token = {};
    }

    async getUserInfo(): Promise<any> {
        if (this.credentials.token === undefined) {
            throw new Error("Access token is undefined, please authenticate using Auth first.")
        }

        try {
            const response = await fetch("https://graph.microsoft.com/v1.0/me", {
                headers: {
                    "Authorization": "Bearer " + this.credentials.token.accessToken
                }
            });
            return await response.json();
        }
        catch (err) {
            // incase of error reject promise
            throw new Error(err);
        }
    }
}