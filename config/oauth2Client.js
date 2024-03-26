// oauth2Client.js
const { google } = require('googleapis');

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REDIRECT_URI = 'http://localhost:9000/api/auth/oauth2callback';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
// this is not needed we can generate the refresh token via /authorize api as well.
oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

module.exports = oAuth2Client;
