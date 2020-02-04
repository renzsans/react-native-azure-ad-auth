# React-Native-Azure-Ad-Auth-Example

This is an example created to demonstrate a basic integration of `React-Native-Azure-Ad-Auth`

To start you first have to install dependencies
```bash
$ npm install
```

Then open `App.tsx` file and update the credentials with your registered Microsoft application credentials.
```javascript
var credentials = {
    authority: 'https://login.microsoftonline.us/YOUR_TENANT_ID',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    redirect_uri: 'YOUR_REDIRECT_URI',
    scope: 'openid user.read offline_access'
};
```

Then you will only need to run
```bash
$ expo start
```
and follow the instruction in your terminal.