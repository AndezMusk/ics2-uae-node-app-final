import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
import session from "express-session";
import passport from "passport";
import multer from "multer";
import path from "path";
import "./config/passport.js"; // Passport configuration
import adminRoutes from "./routes/admin.js"; // Admin-related routes
import authRoutes from "./routes/auth.js"; // Auth-related routes

configDotenv();
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB:", conn.connection.host);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

connectDB();

// Middleware Setup
app.use(express.static("public"));
app.use("/uploads", express.static(path.join("uploads"))); // Static folder for uploaded files
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Configure Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
app.use("/admin", adminRoutes);
app.use("/admin", authRoutes);

// Public Routes
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app
  .route("/contact")
  .get((req, res) => {
    res.render("contact", { title: "Contact" });
  })
  .post(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).send("All fields are required.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.RECEIVER_EMAIL || "admin@example.com",
      subject: `Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Message sent successfully.");
    } catch (error) {
      console.error("Error sending email:", error.message);
      res.status(500).send("Failed to send the message.");
    }
  });

// Membership Form Submission
app
  .route("/membership")
  .get((req, res) => {
    res.render("membership", { title: "Membership Form" });
  })
  .post(upload.single("profilePicture"), async (req, res) => {
    const {
      first_name,
      last_name,
      address_line1,
      address_line2,
      city,
      country,
      state,
      zip_code,
      is_member,
      member_id,
      title,
      employer,
      primary_phone,
      primary_email,
      secondary_email,
      professional_associations,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !address_line1 ||
      !city ||
      !country ||
      !state ||
      !zip_code ||
      !title ||
      !employer ||
      !primary_phone ||
      !primary_email
    ) {
      return res.status(400).send("All required fields must be filled!");
    }

    try {
      // Create a new member document
      const Member = mongoose.model(
        "Member",
        new mongoose.Schema({
          /* Member Schema */
        })
      );
      const newMember = new Member({
        firstName: first_name,
        lastName: last_name,
        address1: address_line1,
        address2: address_line2,
        city,
        country,
        state,
        zipCode: zip_code,
        isMember: is_member,
        memberId: member_id,
        title,
        employer,
        primaryPhone: primary_phone,
        primaryEmail: primary_email,
        secondaryEmail: secondary_email,
        professionalAssociations: professional_associations,
        profilePicture: req.file ? req.file.path : null,
      });

      await newMember.save();
      res.status(201).send("Membership form submitted successfully!");
    } catch (err) {
      console.error("Error saving membership form:", err.message);
      res.status(500).send("Failed to submit the form.");
    }
  });

// Server Listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
