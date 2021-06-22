const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/User.model');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const port = process.env.PORT;
const config = require('./env-config');


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: config.config.baseUrl + "/user/login/google/callback/",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},

function(accessToken, refreshToken, profile, done) {
  User.findOne({'authProviderId': profile.id, 'authProvider': "google"}, function(err, user) {
    if (err) {
        return done(err);
    }
    if (!user) {
        user = new User({
            _id: new mongoose.Types.ObjectId(),
            firstName: profile.displayName.split(' ').slice(0, -1).join(' '),
            lastName: profile.displayName.split(' ').slice(-1).join(' '),
            email: profile.emails[0].value,
            username: profile.username || profile.emails[0].value,
            authProvider: 'google',
            authProviderId: profile.id
        });
        user
          .save()
          .then(result => {
            return done(err, result)
          })
          .catch(err => done(err));
    } else {
        return done(err, user);
    }
  })
}
));

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: config.baseUrl + "/user/login/facebook/callback/",
        profileFields: ['id', 'displayName', 'emails', 'photos']
      },
    
      function (accessToken, refreshToken, profile, done) {
        User.findOne({'authProviderId': profile.id, 'authProvider': "facebook"}, function(err, user) {
          if (err) {
              return done(err);
          }
          if(!user){
            user = new User({
              _id: new mongoose.Types.ObjectId(),
              firstName: profile.displayName.split(' ').slice(0, -1).join(' '),
              lastName: profile.displayName.split(' ').slice(-1).join(' '),
              email: profile.emails[0].value,
              username: profile.username || profile.emails[0].value,
              authProvider: 'facebook',
              authProviderId: profile.id
            });
            user
              .save()
              .then(result => {
                return done(err, result)
              })
              .catch(err => done(err));
          }else{
            return done(err, user);
          }
        
        })
      }
    ));
    
passport.use('signup', new localStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
      async (req, username, password, done) => {
        try {
          const user = await User.create({ 
            username, 
            password,
            _id: new mongoose.Types.ObjectId(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            });
          return done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use('local', new localStrategy(
      {
        usernameField: 'username',
        passwordField: 'password'
      },
      async (username, password, done) => {
        try {
          const user = await User.findOne({ username }); 
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }
          const validate = await user.isValidPassword(password);
          if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
          }
          return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.LOCAL_TOKEN_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);