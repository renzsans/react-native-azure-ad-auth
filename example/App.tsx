import React, { Component } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { AzureAdInstance, AzureAdView } from 'react-native-azure-ad-auth';

// Create an AzureAdInstance object with your Microsoft Azure credentials
var credentials = {
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    redirect_uri: 'YOUR_REDIRECT_URI',
    scope: 'openid user.read offline_access'
};

type Props = {};
interface State {
    azureLoginObject: any,
    loginSuccess: boolean,
    needLogin: boolean;
    needLogout: boolean;
};

export default class App extends Component<Props, State> {

    azureAdInstance: AzureAdInstance;

    constructor(props: Props, state: State) {
        super(props);

        this.state = {
            azureLoginObject: {},
            loginSuccess: false,
            needLogin: true,
            needLogout: false
        };

        // instantiate azure objects with your azure credentials
        this.azureAdInstance = new AzureAdInstance(credentials);

        // bind the functions
        this.onLoginSuccess = this.onLoginSuccess.bind(this);
        this.onLoginCancel = this.onLoginCancel.bind(this);
        this.willLogin = this.willLogin.bind(this);
        this.willLogout = this.willLogout.bind(this);
    }

    onLoginSuccess() {
        if (this.state.loginSuccess && this.state.needLogout) {
            this.setState({
                loginSuccess: false,
                needLogin: false,
                needLogout: false
            });
            return;
        }

        this.azureAdInstance.getUserInfo().then((result: any) => {
            this.setState({
                azureLoginObject: result,
                loginSuccess: true,
                needLogin: false
            });
        }).catch((err: any) => {
            console.log(err);
        })
    }

    onLoginCancel() {
        // Show cancel message
    }

    willLogin() {
        this.setState({ needLogin: true });
    }

    willLogout() {
        this.setState({ needLogout: true });
    }

    // pass the azureAdInstance and Login Success function to the AzureLoginView that will display
    // the authentication screen
    render() {
        if (this.state.needLogin || this.state.needLogout) {
            return (
                <AzureAdView
                    azureAdInstance={this.azureAdInstance}
                    loadingMessage="Requesting access token"
                    onSuccess={this.onLoginSuccess}
                    onCancel={this.onLoginCancel}
                    needLogout={this.state.needLogout}
                />
            );
        }

        const { userPrincipalName, givenName } = this.state.azureLoginObject;

        if (this.state.loginSuccess) {
            return (
                <View style={styles.container}>
                    <Text style={styles.text}>Welcome {givenName}.</Text>
                    <Text style={styles.text}>You logged into Azure with {userPrincipalName}.</Text>
                    <Button onPress={this.willLogout} title="Logout"></Button>
                </View>
            )
        } else {
            return (
                <View
                    style={styles.container}>
                    <Text style={styles.text}>You are log out from azure.</Text>
                    <Button onPress={this.willLogin} title="Login"></Button>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
        color: '#333333',
        fontSize: 22,
        marginBottom: 10
    }
});