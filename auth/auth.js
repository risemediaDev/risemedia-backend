const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('../models/User.model');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');


passport.use('signup', new localStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
      async (req, username, password, done) => {
        try {
          const user = await UserModel.create({ 
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

  passport.use(
    'login',
    new localStrategy(
      {
        usernameField: 'username',
        passwordField: 'password'
      },
      async (username, password, done) => {
        try {
          const user = await UserModel.findOne({ username });
  
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
      secretOrKey: "ZXRvbW95dmVsb3NpcGVk",
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
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