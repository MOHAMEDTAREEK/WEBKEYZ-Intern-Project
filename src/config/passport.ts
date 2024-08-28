import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../database/models/user.model";

/**
 * Initializes passport with Google OAuth 2.0 authentication strategy.
 * Uses GoogleStrategy from 'passport-google-oauth20' to handle Google OAuth authentication.
 * Retrieves or creates a user in the database based on the Google profile information.
 * Serializes and deserializes the user object for session management.
 * @returns {PassportStatic} The configured passport instance.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0].value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profilePicture: profile.photos?.[0].value,
            refreshToken: refreshToken,
          });
        }

        done(null, { user, accessToken });
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, (user as any).user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
