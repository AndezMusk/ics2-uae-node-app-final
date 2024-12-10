import express from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
configDotenv();

const app = express();
const PORT = 3000;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/isc2uaeDB");
    console.log("Connected to DB,", conn.connection.host);
  } catch (err) {
    console.log(err);
  }
};

connectDB();

const memberSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  country: String,
  stateProvince: String,
  zipPostalCode: String,
  schoolOrUniversity: String,
  major: String,
  primaryPhone: String,
  primaryEmail: String,
  professionalAssociations: String,
  certifications: String,
  feedback: String,
  date: Date,
  agreeToTerms: Boolean,
  email: String,
  password: String,
  confirmPassword: String,
});

const Member = mongoose.model("Member", memberSchema);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.route("/").get((req, res) => {
  res.render("home", {
    title: "Home",
  });
});
app
  .route("/contact")
  .get((req, res) => {
    res.render("contact", { title: "Contact" });
  })
  .post(async (req, res) => {
    console.log("sending email", req.body);
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).send("All Fields Are Required");
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const receipientEmail = "webigeeksofficial@gmail.com";

    const mailOptions = {
      from: process.env.EMAIL,
      to: receipientEmail,
      subject: "New Form Submission",
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
            <img src=${"https://isc2chapter-uae.org/test/logo.png"} alt="Logo" style="width: 120px; margin-bottom: 10px;">
            <h1 style="margin: 0; font-size: 24px;">New Form Submission</h1>
        </div>
        <div style="padding: 20px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin-top: 10px; border-radius: 4px;">
                ${message}
            </div>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">Thank you for reaching out to us. We'll get back to you soon!</p>
            <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ISC2</p>
        </div>
    </div>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Email Sent Successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to send email");
    }
  });

app.route("/student-membership").get((req, res) => {
  res.render("student_membership", { title: "Student Membership" });
});
app.post("/student-membership", async (req, res) => {
  const {
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    country,
    stateProvince,
    zipPostalCode,
    schoolOrUniversity,
    major,
    primaryPhone,
    primaryEmail,
    professionalAssociations,
    certifications,
    feedback,
    date,
    agreeToTerms,
    email,
    password,
    confirmPassword,
    securityQuestionAnswer,
  } = req.body;

  // Validate input
  if (
    !firstName ||
    !lastName ||
    !addressLine1 ||
    !city ||
    !country ||
    !email ||
    !password ||
    !confirmPassword ||
    !securityQuestionAnswer
  ) {
    return res.status(400).send("All fields with * are required!");
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  // Create a new member object
  const newMember = new Member({
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    country,
    stateProvince,
    zipPostalCode,
    schoolOrUniversity,
    major,
    primaryPhone,
    primaryEmail,
    professionalAssociations,
    certifications,
    feedback,
    date,
    agreeToTerms,
    email,
    password, // In a real-world scenario, hash this password using bcrypt
    confirmPassword,
    securityQuestionAnswer,
  });

  try {
    // Save the member to the database
    await newMember.save();

    // Send email notification to the admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: "webigeeksofficial@gmail.com",
      subject: "New Member Submission",
      html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">New Member Registration</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${primaryPhone}</p>
                        <p><strong>School/University:</strong> ${schoolOrUniversity}</p>
                        <p><strong>Feedback:</strong> ${feedback}</p>
                    </div>
                    <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                        <p style="margin: 0;">Thank you for your submission!</p>
                        <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} WebiGeeks</p>
                    </div>
                </div>
            `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).send("Member created and email sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating member or sending email");
  }
});

// Start

app.listen(PORT, () => {
  console.log("Server started on port :", PORT);
});
