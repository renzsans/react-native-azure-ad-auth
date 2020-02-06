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

        this.handleTokenRequest = this.handleTokenRequest.bind(this);
        this.renderLoadingView = this.renderLoadingView.bind(this);
    }

    handleTokenRequest(e: { url: string }): any {

        const { needLogout, azureAdInstance } = this.props;

        if (needLogout && e.url.includes('/logoutsession')) {
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

    renderLoadingView(): JSX.Element {
        const { loadingView, loadingStyle, loadingMessage } = this.props;
        return (loadingView === undefined)
            ? (
                <View
                    style={[loadingStyle, styles.loadingView, styles.centered]}>
                    <Text>{loadingMessage}</Text>
                </View>
            ) : (
                loadingView
            );
    }

    render() {
        const source = (this.props.needLogout)
            ? this.auth.getAuthLogoutUrl()
            : this.auth.getAuthLoginUrl();

        return (
            (this.state.visible)
                ? (
                    <WebView
                        automaticallyAdjustContentInsets={true}
                        style={[this.props.loadingStyle, styles.webView, styles.centered]}
                        source={{ uri: source }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        decelerationRate="normal"
                        onNavigationStateChange={this.handleTokenRequest}
                        onShouldStartLoadWithRequest={(e) => { return true }}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                        incognito={false}
                    />
                ) : this.renderLoadingView()
        );
    }
}

const styles = StyleSheet.create({
    webView: {
        marginTop: 50
    },
    centered: {
        flex: 1,
        alignSelf: 'stretch',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    loadingView: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});