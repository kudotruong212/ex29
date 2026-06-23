const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./jwtConfig');
const { findOrCreateOAuthUser } = require('../utils/oauthUser');

module.exports = function configureFacebookJwt(app, passport) {
  const configured = process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET;
  const requestEmail = process.env.FACEBOOK_REQUEST_EMAIL === 'true';

  if (!configured) {
    app.get('/auth/facebook', function (req, res) {
      res.status(503).json({
        message: 'Facebook OAuth is not configured.',
        requiredEnvironmentVariables: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET']
      });
    });
    return;
  }

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL ||
      'https://localhost:3443/auth/facebook/callback',
    profileFields: requestEmail ? ['id', 'displayName', 'emails'] : ['id', 'displayName']
  }, function (accessToken, refreshToken, profile, done) {
    done(null, profile);
  }));

  const facebookAuthOptions = requestEmail
    ? { scope: ['email'], session: false }
    : { session: false };

  app.get('/auth/facebook', passport.authenticate('facebook', facebookAuthOptions));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/auth/facebook',
      session: false
    }),
    async function (req, res, next) {
      try {
        const email = req.user.emails?.[0]?.value;
        const user = await findOrCreateOAuthUser({
          provider: 'facebook',
          providerId: req.user.id,
          email,
          username: req.user.displayName || email || `facebook_${req.user.id}`
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
          message: 'Facebook login successful',
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
