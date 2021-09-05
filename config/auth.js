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
const googleStrategy = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: config.config.baseUrl + "/user/login/google/callback/",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}
const verifyCallback = async (accessToken, refreshToken, profile, done) => {
  User.findOne({'authProviderId': profile.id, 'authProvider': profile.provider}, function(err, user) {
    if (err) {
        return done(err);
    }
    if (!user) {
        user = new User({
            _id: new mongoose.Types.ObjectId(),
            firstName: profile.displayName.split(' ').slice(0, -1).join(' '),
            lastName: profile.displayName.split(' ').slice(-1).join(' '),
            email: profile.emails && profile.emails[0].value,
            username: profile.username || profile.emails[0].value,
            authProvider: profile.provider,
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

passport.use(new GoogleStrategy(googleStrategy, verifyCallback));

passport.use('facebook', new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: config.config.baseUrl + "/user/login/facebook/callback/",
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      function (accessToken, refreshToken, profile, done) {
        User.findOne({'authProviderId': profile.id, 'authProvider': profile.provider}, function(err, user) {
          if (err) {
              return done(err);
          }  
          if(!user){
            user = new User({
              _id: new mongoose.Types.ObjectId(),
              firstName: profile.displayName.split(' ').slice(0, -1).join(' '),
              lastName: profile.displayName.split(' ').slice(-1).join(' '),
              username: profile.username || (profile.emails && profile.emails[0].value) || profile.id,
              email: profile.emails && profile.emails[0].value,
              authProvider: profile.provider,
              authProviderId: profile.id,
              avatarImg: profile.photos && profile.photos[0].value
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
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
      async (req, email, password, done) => {
        try {
          const user = await User.create({ 
            email, 
            password,
            _id: new mongoose.Types.ObjectId(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username || email
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
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }); 
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

passport.use('authAdmin',
  new JWTstrategy(
    {
      secretOrKey: process.env.LOCAL_TOKEN_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    async (token, done) => {
      try {
        await User.findOne({_id: token.user._id, isDeleted: false}, (err, user) => {
          if(err) return done(err);
          if(user && ![0,1].includes(user.role)) return done({'error':'you are not authorized'});
          return done(null, token.user);
        })
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use('companyUser',
  new JWTstrategy(
    {
      secretOrKey: process.env.LOCAL_TOKEN_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    async (token, done) => {
      try {
        await User.findOne({_id: token.user._id, isDeleted: false}, (err, user) => {
          if(err) return res.status(401).json({'message':'user not found'});
          if(user && user.role && ![0,1,2].includes(user.role)) return done({error: 'You are not authorized'});
          return done(null, token.user);
        })
      } catch (error) {
        done(error);
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

module.exports = { verifyCallback }