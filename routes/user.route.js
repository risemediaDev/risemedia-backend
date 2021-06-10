const express = require("express");
const passport = require("passport");
const Router = express.Router();
const User = require("../models/User.model");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// GET /users
// ACCESSIBLE to all
// Displays list of all users.
Router.get("/", (req,res)=>{
    User.find({},(err, Users)=>{
        if(err){
            res.json(err);
        }else{
            res.json(Users)
        }
    })
});


// POST /user/signup
// ACCESSIBLE to all
// Creates a new user in the database
Router.post("/signup", passport.authenticate('signup', {session: false}) , async (req, res, next) => {
    res.json({
        message: 'user created successfully',
        user: req.user
    })
})

// POST /user/login
// ACCESSIBLE to all
// Creates a new user in the database
Router.post(
    '/login',
    async (req, res, next) => {
      passport.authenticate(
        'login',
        async (err, user, info) => {
          try {
            if (err || !user) {
              const error = new Error('An error occurred.');
              return next(error);
            }
            req.login(
              user,
              { session: false },
              async (error) => {
                if (error) return next(error);
                const body = { _id: user._id, username: user.username };
                const token = jwt.sign({ user: body }, "ZXRvbW95dmVsb3NpcGVk");
                return res.json({ token });
              }
            );
          } catch (error) {
            return next(error);
          }
        }
      )(req, res, next);
    }
  );

module.exports = Router