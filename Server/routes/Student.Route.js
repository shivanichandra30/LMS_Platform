const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const nodemailer = require("nodemailer");

//model import
const { StudentModel } = require("../models/student.model");

//middleware import
const { isAuthenticated } = require("../middlewares/authenticate");

//gel all students data
router.get("/all", async (req, res) => {
  try {
    const students = await StudentModel.find();
    res.send({ message: "All students data", students });
  } catch (error) {
    res.status(400).send({ message: "Something went wrong" });
  }
});

router.post(
  "/register",
  /* isAuthenticated, */ async (req, res) => {
    const { name, email, password /* , class: studentClass */ } =
      req.body; /* .data */

    try {
      // Check if user already exists
      let user = await StudentModel.findOne({ email });
      if (user) {
        return res.send({ msg: "User already registered" });
      }

      // Hashing the password
      const secure_password = await bcrypt.hash(
        password,
        parseInt(process.env.Salt_rounds)
      );

      // Create new student instance
      const student = new StudentModel({
        name,
        email,
        password: secure_password,
        class: studentClass, // class value
      });

      // Save student to MongoDB
      await student.save();

      // Send success response
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "agrawaljoy1@gmail.com",
          pass: "nsziioprjzwcodlm",
        },
      });

      const mailOptions = {
        from: "agrawaljoy1@gmail.com",
        to: email,
        subject: "Account ID and Password",
        text: `Welcome to LMS, Congratulations! Your account has been created successfully. This is your User type: Student and Password: ${password}`,
      };

      // Send email to the student
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.send({ msg: "Error sending email" });
        }
        res.send({
          msg: "Student Registered Successfully",
          student, // sending the saved student
        });
      });
    } catch (err) {
      console.error(err);
      res.status(404).send({ msg: "Student Registration failed" });
    }
  }
);

//student login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await StudentModel.find({ email });
    if (student.length > 0) {
      if (student[0].access == "false") {
        return res.send({ message: "Access Denied" });
      }
      bcrypt.compare(password, student[0].password, (err, results) => {
        if (results) {
          let token = jwt.sign(
            { email, name: student[0].name },
            process.env.secret_key,
            { expiresIn: "7d" }
          );
          res.send({
            message: "Login Successful",
            user: student[0],
            token,
          });
        } else {
          res.status(201).send({ message: "Wrong credentials" });
        }
      });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    res.status(404).send({ message: "Error" });
  }
});

//edit student
router.patch("/:studentId", isAuthenticated, async (req, res) => {
  const { studentId } = req.params;
  const payload = req.body.data;
  try {
    const student = await StudentModel.findByIdAndUpdate(
      { _id: studentId },
      payload
    );
    const updatedStudent = await StudentModel.find({ _id: studentId });
    res
      .status(200)
      .send({ msg: "Updated Student", student: updatedStudent[0] });
  } catch (error) {
    res.status(404).send({ msg: "Error" });
  }
});

//delete student
router.delete("/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await StudentModel.findByIdAndDelete({ _id: studentId });
    res.status(200).send({ msg: "Deleted Student" });
  } catch (error) {
    res.status(400).send({ msg: "Error" });
  }
});

module.exports = router;
