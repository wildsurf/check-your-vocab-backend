'use strict';

var Token = require('../models/token').Token;

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {

        return next();

    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/users/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs');
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        session: false
    }), function(req, res) {

        Token.find({userId: req.user._id}, function(err, docs) {

            docs.forEach(function(doc) {
                doc.remove();
            });

            var token = new Token({
                userId: req.user._id
            });

            token.save(function() {
                res.status(200).json({
                    session: {
                        id: req.user._id,
                        username: req.user.local.email
                    }
                });
            });

        });
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope : 'email',
        session: false
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect : '/',
            session: false
        }), function(req, res) {
            res.status(200).json({
                session: {
                    id: req.user._id,
                    username: req.user.facebook.name,
                    imageURL: 'http://graph.facebook.com/' + req.user.facebook.id + '/picture?type=square'
                }
            });
        });

    // =====================================
    // TWITTER ROUTES =====================
    // =====================================
    // route for twitter authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            failureRedirect : '/',
            session: false
        }), function(req, res) {
            res.status(200).json({
                session: {
                    id: req.user._id,
                    username: req.user.twitter.displayName,
                    imageURL: 'https://twitter.com/' + req.user.twitter.username + '/profile_image'
                }
            });
        });


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        session: false
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};
