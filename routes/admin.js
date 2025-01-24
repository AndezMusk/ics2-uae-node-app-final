import express from "express";
import Event from "../models/Event.js";
import { upload } from "../config/multer.js";

const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/admin/login");
};

// admin dashboard route
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { title: "Admin Dashboard" });
});
router.get("/create-event", ensureAuthenticated, (req, res) => {
  res.render("create-event", { title: "Create Event" });
});

router.post(
  "/create-event",
  ensureAuthenticated,
  upload.single("eventImage"),
  async (req, res) => {
    try {
      const { eventName, eventDescription, eventVenue, eventDateTime } =
        req.body;
      if (!eventName || !eventDescription || !eventVenue || !eventDateTime) {
        res.status(400).send("All Fields are Required!");
      }
      const newEvent = new Event({
        eventName,
        eventDescription,
        eventVenue,
        eventDateTime,
        eventImage: req.file.path,
      });
      await newEvent.save();
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error Creating new event");
    }
  }
);

export default router;
