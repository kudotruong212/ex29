const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user');

const jwtSecret = process.env.JWT_SECRET || 'exercise23-secret-key';

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
}, async function (jwtPayload, done) {
  try {
    const user = await User.findById(jwtPayload._id).select('-password');

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

const verifyUser = passport.authenticate('jwt', { session: false });

module.exports = {
  passport,
  verifyUser,
  jwtSecret
};
