# React-Native-Azure-Ad-Auth

A React Native module for Azure AD authentication endpoint. This module implements Azure AD authentication using pure React-Native using typescript.

This is an inspired copy of [shedaltd/react-native-azure-ad-2](https://github.com/shedaltd/react-native-azure-ad-2) with some issue fixes and a logout feature.

This module is developed to help developers to integrated Microsoft V2 endpoint into their React-native app in a painless way.

* Components:
    * AzureAdInstance
    * AzureAdView
    * AuthAdAuth
___

## Table of contents
* [Installation](#installation)
* [Usage](#usage)
* [Example](#example)

## Installation
Install package from `npm`
```sh
$ npm install react-native-azure-ad-auth
```

## Usage
First, import the component

```javascript
import { AzureAdInstance, AzureAdView } from 'react-native-azure-ad-auth';
```
Then create an AzureAdInstance by using Microsoft application credentials that was registered.  Also, adding application scope in order to ask users to consent when they login. For more information about scope see [Microsoft blog](https://azure.microsoft.com/en-us/documentation/articles/active-directory-v2-scopes/).

```javascript
var credentials = {
    authority: 'https://login.microsoftonline.us/YOUR_TENANT_ID',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    redirect_uri: 'YOUR_REDIRECT_URI',
    scope: 'openid user.read offline_access'
};

const azureAdInstance: AzureAdInstance; = new AzureAdInstance(credentials);
```
For accessing scopes, see [permissions and consent](http://bit.ly/2gtQe9W) for more info.


After that, create an AzureAdView where the login WebView will be rendered and pass the `azureAdInstance` that was created from the last step.

```javascript
render() {
    return (
        <AzureAdView
            azureAdInstance={this.azureAdInstance}
            loadingMessage="Requesting access token"
            onSuccess={this.onLoginSuccess}
            onCancel={this.onLoginCancel}
        />
    );
}
```
When combine all parts together, it will look like this.

```javascript
import React, { Component } from 'react';
import { View } from 'react-native';
import { AzureAdInstance, AzureAdView } from 'react-native-azure-ad-auth';

// Constant credentials from Azure AD registration
var credentials = {
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    redirect_uri: 'YOUR_REDIRECT_URI',
    scope: 'openid user.read offline_access'
};

export default class App extends React.Component {

    azureAdInstance: AzureAdInstance;

    constructor(props){
        super(props);        
        this.azureInstance = new AzureInstance(credentials);
    }
    
    _onLoginSuccess(){
        this.azureInstance.getUserInfo().then(result => {
            console.log(result);
        }).catch(err => {
            console.log(err);
        })
    }
    
    _onLoginCancel(){
        // Show cancel message
    }

    render() {
        return (
            <AzureAdView
                azureAdInstance={this.azureAdInstance}
                loadingMessage="Requesting access token"
                onSuccess={this.onLoginSuccess}
                onCancel={this.onLoginCancel}
            />
        );
    }
}

AppRegistry.registerComponent('App', () => App);
```

## Example

To see see an example app using the library have a look at  the [Example Project](example/README.md)