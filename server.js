const express = require('express');
const passport = require('passport');
const { Strategy } = require('@superfaceai/passport-twitter-oauth2');
const session = require('express-session');
require('dotenv').config();

// <1> Serialization and deserialization
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

const callbackURL =  `${process.env.BASE_URL}/social/callback/twitter`
console.log(callbackURL)
// Use the Twitter OAuth2 strategy within Passport
const twitterStrategy =     // <2> Strategy initialization
    new Strategy(
        {
            clientID: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            clientType: 'confidential',
            callbackURL,
        },
        // <3> Verify callback
        (accessToken, refreshToken, profile, done) => {
            console.log('Success!', { accessToken, refreshToken });
            return done(null, profile);
        }
    )

console.dir(twitterStrategy)
passport.use(twitterStrategy);

const app = express();

// <4> Passport and session middleware initialization
app.use(passport.initialize());
app.use(
    session({ secret: 'keyboard cat', resave: false, saveUninitialized: true })
);

// <5> Start authentication flow
app.get(
    '/social/twitter',
    passport.authenticate('twitter', {
        // <6> Scopes
        scope: ['tweet.read', 'users.read', 'offline.access'],
    })
);

// <7> Callback handler
app.get(
    '/social/callback/twitter',
    passport.authenticate('twitter'),
    function (req, res) {
        const userData = JSON.stringify(req.user, undefined, 2);
        res.end(
            `<h1>Authentication succeeded</h1> User data: <pre>${userData}</pre>`
        );
    }
);

app.listen(3000, () => {
    console.log(`Listening on ${process.env.BASE_URL}`);
});
