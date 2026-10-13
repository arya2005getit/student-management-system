const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters."]
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."]
    },
    course: {
      type: String,
      required: [true, "Course is required."],
      trim: true,
      maxlength: [100, "Course cannot exceed 100 characters."]
    },
    year: {
      type: Number,
      required: [true, "Year is required."],
      min: [1, "Year must be between 1 and 8."],
      max: [8, "Year must be between 1 and 8."],
      validate: {
        validator: Number.isInteger,
        message: "Year must be a whole number."
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
