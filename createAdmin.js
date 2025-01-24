import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unqiue: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", userSchema);

const createAdmin = async () => {
  const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/isc2uaeDB";
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to database");
    const username = "admin";
    const email = "admin@example.com";
    const password = "yourSecurePassword";

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin User Already Exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });
    await admin.save();
    console.log("Admin user created succesfully.");
  } catch (error) {
    console.error("Error Creating admin user :", error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
