// Main Start point into the app
var webapp = require('fh-webapp');
var express = require('express');
$fh = require('fh-api');
var path = require('path');
var jwt = require('express-jwt');
var mainjs = require('./main.js');
var routes = require('./routes.js');
var creds = require('./config/credentials.js');

// JSON Wec Token implementation for Auth0
var authenticate = jwt({
  secret: new Buffer(creds.secret, 'base64'),
  audience: creds.audience
});

var app = express();

// CORS middleware
//
// This Allows `FHC Local` to work, as cloud is on port 8001
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://127.0.0.1:8000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
};

// Use Express to parse various params and allow CORS for FHC local
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'shhhhhhhhh' }));
    app.use(express.methodOverride());
    app.use(allowCrossDomain);
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '../client/default')));
    // intercept all /api calls and validate the token
    app.use('/api', authenticate);
});

// Set up default routes so app can work as before
//
// (with Exported functions in main.js used with `$fh.act`)
app.use('/sys', webapp.sys(mainjs));
app.use('/mbaas', webapp.mbaas);
app.use('/cloud', webapp.cloud(mainjs));

// Route definitions
app.get('/', routes.index);
app.get('/callback', routes.callback);
app.get('/api/login', routes.login);
app.get('/api/accounts', routes.listAccounts);
app.get('/api/cases', routes.listCases);
app.get('/api/opps', routes.listOpps);
app.get('/api/campaigns', routes.listCampaigns);
app.get('/api/accounts/:accountId', routes.accountDetails);
app.get('/api/cases/:caseId', routes.caseDetails);

module.exports = app.listen(process.env.FH_PORT || process.env.VCAP_APP_PORT || 8001);















