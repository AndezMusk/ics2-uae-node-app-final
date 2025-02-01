import passport from "passport";
import LocalStrategy from "passport-local";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      console.log("Looking for user:", username);
      const admin = await Admin.findOne({ username });
      if (!admin) {
        console.log("Admin not found.");
        return cb(null, false, { message: "Invalid Username" });
      }
      console.log("Admin found:", admin);
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        console.log("Password mismatch.");
        return cb(null, false, { message: "Invalid Password" });
      }
      console.log("Authentication successful.");
      return cb(null, admin);
    } catch (err) {
      console.error("Error in Passport Strategy:", err);
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  console.log("Serializing user:", user.id);
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  console.log("Deserializing user with ID:", id);
  const admin = await Admin.findById(id);
  console.log("Deserialized user:", admin);
  cb(null, admin);
});
