const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");

// Import Models
const Admin = require("../models/Admin");
const User = require("../models/User");

module.exports = (passport) => {
  // Local Strategy for User
  passport.use(
    "user-local",
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Incorrect password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Local Strategy for Admin
  passport.use(
    "admin-local",
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const admin = await Admin.findOne({ email });
        if (!admin) return done(null, false, { message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return done(null, false, { message: "Incorrect password" });

        return done(null, admin);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Google Strategy (for Users only)
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value
            });
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Serialize & Deserialize Users
  passport.serializeUser((user, done) => done(null, { id: user.id, role: user.role }));

  passport.deserializeUser(async (data, done) => {
    if (data.role === 'admin') {
      const admin = await Admin.findById(data.id);
      done(null, admin);
    } else {
      const user = await User.findById(data.id);
      done(null, user);
    }
  });
};
