const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./jwtConfig');
const { findOrCreateOAuthUser } = require('../utils/oauthUser');

module.exports = function configureGoogleJwt(app, passport) {
  const configured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

  if (!configured) {
    app.get('/auth/google', function (req, res) {
      res.status(503).json({
        message: 'Google OAuth is not configured.',
        requiredEnvironmentVariables: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
      });
    });
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL ||
      'https://localhost:3443/auth/google/callback'
  }, function (accessToken, refreshToken, profile, done) {
    done(null, profile);
  }));

  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  }));

  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/auth/google',
      session: false
    }),
    async function (req, res, next) {
      try {
        const email = req.user.emails?.[0]?.value;
        const username = req.user.displayName ||
          email ||
          `google_${req.user.id}`;

        const user = await findOrCreateOAuthUser({
          provider: 'google',
          providerId: req.user.id,
          email,
          username
        });

        const token = jwt.sign({
          _id: user._id,
          username: user.username,
          email: user.email,
          googleId: user.googleId,
          facebookId: user.facebookId,
          providers: user.providers,
          provider: user.provider
        }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({
          message: 'Google login successful',
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            googleId: user.googleId,
            facebookId: user.facebookId,
            providers: user.providers,
            provider: user.provider
          },
          token
        });
      } catch (err) {
        next(err);
      }
    }
  );
};
