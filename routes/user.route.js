const express = require("express");
const passport = require("passport");
const Router = express.Router();
const User = require("../models/User.model");
const Token = require("../models/Token.model");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config/env-config');
const { verifyCallback } = require('../config/auth');
const sendEmail = require('../utils/sendEmail');
const {validate, validatePasswordReset } = require('../validators/userValidators');
const bcrypt = require('bcrypt');

const tokenGenerator = (user) => {
  const body = { _id: user._id, username: user.username, role: user.role };
  const token = jwt.sign({ user: body }, process.env.LOCAL_TOKEN_SECRET);
  console.log('token generated for user ' + body._id)
  return token ;
}

// GET /users/token
// ACCESSIBLE to all
// Generates token in exchange of userinfo
Router.get('/token', (req, res) => {
  if (!req.body.profile) {
    return res.status(400).json({ message: 'no profile received' });
  }
  verifyCallback(null, null, req.body.profile, (err, user) => {
    if (err) {
      console.log('error', err)
      return res.status(400).json({ message: 'something went wrong' })
    };
    if(!user){ console.log( `no user`)}
    res.json({token : tokenGenerator(user), user})
  })
})


// GET /users
// ACCESSIBLE ACCESSIBLE to authorized admins and superadmins
// Displays list of users working for company.
Router.get("/", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await User.findOne({ _id: req.user._id, isDeleted: false }, async (err, user) => {
    if (err) return res.status(401).json({ 'message': 'user not found' });
    if (user && ![0, 1].includes(user.role)) return res.status(401).json({ 'message': 'you are not authorized' });
    User.find({ isDeleted: false, role: [0,1,2] }).then((err, companyUsers) => {
      if (err) {
        res.json(err);
      } else {
        console.log('sent list of company members')
        res.json(companyUsers)
      }
    })
  })
});

// GET /users/profile
// ACCESSIBLE to authorized users
// Sends user info.
Router.get("/profile", passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (!req.query.userId) return res.status(400).json('userId missing');
  const userId = req.query.userId;
  await User.find({ isDeleted: false, _id: userId }).populate({path: 'location', select: 'name _id'}).then((user, error) => {
    if (error) {
      console.log('error while getting user info for userId ' + userId + 'Error: ' + error)
      return res.json(error)
    }
    delete user.password;
    res.json(user)
  })
});


// POST /user/profile/update
// ACCESSIBLE to all authorized users
// update profile parameters
Router.post("/profile/update", passport.authenticate('jwt', {session: false}), async (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'no details' });
    let updateDetails = req.body;
    if (req.body && (req.body.addSavedArticle || req.body.removeSavedArticle)) {
        const userData = await User.find({ _id: req.user._id })
        let savedArticles = [...userData[0].savedArticles];

        if (req.body.addSavedArticle) {
            savedArticles.push(req.body.addSavedArticle);
        } else if (req.body.removeSavedArticle) {
            let i = savedArticles.findIndex((articleId) => articleId == req.body.removeSavedArticle);
            i >= 0 && savedArticles.splice(i, 1)
        }
        updateDetails = {savedArticles}
    }
    User.findByIdAndUpdate({ _id: req.user._id },
        { $set: { ...updateDetails } },
        { upsert: true, new: true }
    ).then((err, data) => {
        console.log(`updated user profile for user ${req.user._id}`)
        res.status(200).json(data)
    }).catch(error => {
        console.log(`failed to update user profile ${req.user._id}`);
        return res.status(400).json({ error: error });
    })
  // return res.status(200).send('asdf')
}); 

// POST /user/signup
// ACCESSIBLE to all
// Creates a new user in the database
Router.post("/signup", passport.authenticate('signup', { session: false }), async (req, res, next) => {
  res.json({
    message: 'user created successfully',
    user: req.user
  })
})

// POST /user/createuser
// ACCESSIBLE to authorized admins and superadmins
// Creates a new user in the database
Router.post("/createuser", passport.authenticate('authAdmin', { session: false }), async (req, res) => {
      const newUser = new User({ 
        _id: new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email, 
        phoneNumber: req.body.phoneNumber,
        username: req.body.email,
        password: req.body.password,
        role: req.body.role,
        adharNumber: req.body.adharNumber
        });
      newUser.save().then((result) => {
          console.log(req.user + ' successfull created '+ newUser);
          res.status(200).json(result)
      }).catch(error => {
        if(error){
          console.log(`failed to create user -> ${newUser} because ${error}`);
          res.status(400).json({'message': 'Failed to create user'})
        }
      })
})

// POST /user/updatebyadmin
// ACCESSIBLE to authorized admins and superadmins
// updates a user in the database
Router.post("/updatebyadmin", passport.authenticate('authAdmin', { session: false }), async (req, res, next) => {
    await User.findByIdAndUpdate({ _id: req.body.id },
      { $set: { 
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        username: req.body.username,
        adharNumber: req.body.adharNumber,
        role: req.body.role
      }},
      { upsert: true, new: true },
      (err, data) => {
        if (err) {
          console.log(`failed to update user ${req.body.id} requested by ${req.user._id} because of ${err}`)
          res.status(400).json({'message': err});
          return;
        }
        console.log(`${data._id} updated by ${req.user._id}`)
        res.json(data)
      })
})

// POST /user/login
// ACCESSIBLE to all
// Creates a new user in the database
Router.post('/login', async (req, res, next) => {
  passport.authenticate('local', { failureRedirect: config.config.baseUrl + '/user/login/failed' },
    async (err, user, info) => {
      try {
        if (err || !user) {
          const error = new Error('An error occurred.');
          res.send(info);
        }
        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);
          if (!user) return res.status(401)
          const body = { _id: user._id, email: user.email, role: user.role };
          const token = jwt.sign({ user: body }, process.env.LOCAL_TOKEN_SECRET);
          console.log('user logged in ', body)
          return res.json({ token, user });
        });
      } catch (error) {
        return next(error);
      }
    }
  )(req, res, next);
}
);

Router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /user/login/google/callback
// ACCESSIBLE to all
// Authentication using google
Router.get('/login/google/callback',
  passport.authenticate('google', { failureRedirect: config.config.baseUrl + '/user/login/failed', session: false }),
  function (req, res) {
    // Successful authentication, sendToken     
    req.login(req.user, { session: false }, async (error) => {
      if (error) return res.send(error);
      const body = { _id: req.user._id, username: req.user.username, role: req.user.role };
      const token = jwt.sign({ user: body }, process.env.LOCAL_TOKEN_SECRET);
      return res.json({ token });
    });

  });

// GET /user/login/facebook/callback
// ACCESSIBLE to all
// Authentication using facebook
Router.get('/login/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: config.config.baseUrl + '/user/login/failed', session: false }),
  function (req, res) {
    // Successful authentication, sendToken     
    req.login(req.user, { session: false }, async (error) => {
      if (error) return res.send(error);
      const body = { _id: req.user._id, username: req.user.username, role: req.user.role };
      const token = jwt.sign({ user: body }, process.env.LOCAL_TOKEN_SECRET);
      return res.json({ token });
    });
  });

Router.get('/login/failed', (req, res) => {
  res.send('failed')
})

Router.patch('/delete/:id', async (req, res) => {
  var userId = req.params.id;
  await User.findByIdAndUpdate({ _id: userId }, { $set: { isDeleted: true } }, { upsert: true, new: true }, (err, data) => {
    if (err) {
      res.json(err);
      return
    }
    res.json(data)
  })
})

Router.post('/update-password', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  if (!user)
    return res.status(400).send("user with given email doesn't exist");
  if(!req.body.oldPassword) return res.status(400).json({message: 'Enter Old Password'});
  const validate = await user.isValidPassword(req.body.oldPassword);
  if (!validate) {
    return res.status(400).json({ message: 'Incorrect Password' })
  }
  user.password = req.body.newPassword
  user.save().then((result) => {
    console.log(`Password changed successfully for user ${user._id}`)
    res.status(200).json({message: "Password Updated"});
  }).catch(err => {
    console.log(err)
    res.status(400)
  })
  
})


Router.post('/password-reset', validatePasswordReset(), validate, async (req, res) => {
  try{
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({message: "user with given email doesn't exist"});
    let generatedToken = await tokenGenerator(user);
    generatedToken = generatedToken.token
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: generatedToken,
      }).save();
    }
    const link = `${process.env.BASE_URL}/user/password-reset/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password reset", link);
    console.log(`Password reset link sent to ${user.email}`)
    res.status(200).json({message: "Password reset link sent to your email"});
  
  }catch(error){
    console.log(`couldn't process reset password request for ${req.body.user} because ${error}`)
    res.status(400).json({message: 'Something went wrong'})
  }

})

Router.post("/password-reset/:userId/:token", async (req, res) => {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(400).send("invalid link or expired");
      const token = await Token.findOne({
        userId: user._id,
        token: req.params.token,
      });
      if (!token) return res.status(400).send("Invalid link or expired");
      user.password = req.body.password
      await user.save();
      await token.delete();
      console.log(`password updated by user ${user._id}`)
      res.send("password reset sucessfully.");
});

module.exports = Router