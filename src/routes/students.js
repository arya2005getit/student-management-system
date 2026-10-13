const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");

const router = express.Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function handleDatabaseError(error, res) {
  if (error.code === 11000) {
    return res.status(409).json({ message: "A student with this email already exists." });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      message: "Student data is invalid.",
      errors: Object.values(error.errors || {}).map((item) => item.message)
    });
  }

  console.error(error);
  return res.status(500).json({ message: "An unexpected server error occurred." });
}

router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Student ID is invalid." });
  }

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.json(student);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const student = await Student.create({
      name: req.body.name,
      email: req.body.email,
      course: req.body.course,
      year: req.body.year
    });
    res.status(201).json(student);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Student ID is invalid." });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        course: req.body.course,
        year: req.body.year
      },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.json(student);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.patch("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Student ID is invalid." });
  }

  const updates = {};
  for (const field of ["name", "email", "course", "year"]) {
    if (Object.hasOwn(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Provide at least one student field to update." });
  }

  try {
    const student = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.json(student);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Student ID is invalid." });
  }

  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.json({ message: "Student deleted successfully.", student });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

module.exports = router;
