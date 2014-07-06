var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}, function(err, docs) {
    if (err) {
      throw err;
    }
    res.send(200, docs);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({
    link: uri
  }, function(err, docs) {
    if (docs) {
      res.send(200, docs);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          link: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save(function(err, newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({
    username: username
  }, function(err, users) {
    if (users.length === 0) {
      res.redirect('/login');
    } else {
      users[0].comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, users[0]);
        } else {
          res.redirect('/login');
        }
      })
    }
  });

};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({
    username: username
  }, function(err, docs) {
    if (!docs) {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save(function(err, user) {
        util.createSession(req, res, user);
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  Link.find({
    code: req.params[0]
  }, function(err, link) {
    if (link.length === 0) {
      res.redirect('/');
    } else {
      link[0].visits++;
      link[0].save(function(err, link) {
        res.redirect(link[0].link);
      });
    }
  })
};