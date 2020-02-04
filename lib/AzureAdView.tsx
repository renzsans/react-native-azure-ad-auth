import React, { Component } from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
    Text,
    ViewStyle
} from 'react-native';
import { WebView } from 'react-native-webview';
import AzureAdInstance from './AzureAdInstance';
import AzureAdAuth from './AzureAdAuth';

interface AzureAdViewProps {
    azureAdInstance: AzureAdInstance;
    onSuccess: () => void;
    onCancel: () => void;
    loadingMessage: string;
    needLogout?: boolean;
    loadingView?: any;
    loadingStyle?: ViewStyle;
}

interface AzureAdViewState {
    visible: boolean;
    cancelled: boolean;
}

export default class AzureAdView extends Component<AzureAdViewProps, AzureAdViewState> {

    auth: AzureAdAuth;

    constructor(props: AzureAdViewProps, state: AzureAdViewState) {
        super(props);

        this.auth = new AzureAdAuth(this.props.azureAdInstance);
        this.state = {
            visible: true,
            cancelled: false
        }

        this._handleTokenRequest = this._handleTokenRequest.bind(this);
        this._renderLoadingView = this._renderLoadingView.bind(this);
    }

    _handleTokenRequest(e: { url: string }): any {

        const { needLogout, azureAdInstance } = this.props;

        if (needLogout && e.url == azureAdInstance.credentials.redirect_uri) {
            this.setState({ visible: false });
            azureAdInstance.clearToken();

            // call success handler
            this.props.onSuccess();

        } else {
            // not logging out, check code when url changes
            let code: any = /((\?|\&)code\=)[^\&]+/.exec(e.url);

            if (code !== null) {
                code = String(code[0]).replace(/(\?|\&)?code\=/, '');

                this.setState({ visible: false });

                // request for a token
                this.auth.getTokenFromCode(code).then(token => {
                    // set token to instance
                    azureAdInstance.setToken(token);

                    // call success handler
                    this.props.onSuccess();
                }).catch((err) => {
                    throw new Error(err);
                })
            }
        }

        // if user cancels the process before finishing
        if (!this.state.cancelled && this.props.onCancel && e.url.indexOf('error=access_denied') > -1) {
            this.setState({ cancelled: true, visible: false });

            // call cancel handler
            this.props.onCancel();
        }
    }

    _renderLoadingView(): JSX.Element {
        const { loadingView, loadingStyle, loadingMessage } = this.props;
        return (loadingView === undefined)
            ? (
                <View
                    style={[loadingStyle, styles.loadingView,
                        {
                            flex: 1,
                            alignSelf: 'stretch',
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height
                        }]}>
                    <Text>{loadingMessage}</Text>
                </View>
            ) : (
                loadingView
            );
    }

    render() {
        let js = `document.getElementsByTagName('body')[0].style.height = '${Dimensions.get('window').height}px';`;

        const source = (this.props.needLogout)
            ? this.auth.getAuthLogoutUrl()
            : this.auth.getAuthLoginUrl();

        return (
            (this.state.visible)
                ? (
                    <WebView
                        automaticallyAdjustContentInsets={true}
                        style={[this.props.loadingStyle, styles.webView, {
                            flex: 1,
                            alignSelf: 'stretch',
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height
                        }]}
                        source={{ uri: source }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        decelerationRate="normal"
                        onNavigationStateChange={this._handleTokenRequest}
                        onShouldStartLoadWithRequest={(e) => { return true }}
                        startInLoadingState={true}
                        injectedJavaScript={js}
                        scalesPageToFit={true}
                    />
                ) : this._renderLoadingView()
        );
    }
}

const styles = StyleSheet.create({
    webView: {
        marginTop: 50
    },
    loadingView: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});