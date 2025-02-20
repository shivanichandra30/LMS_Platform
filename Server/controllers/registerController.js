const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { StudentModel } = require("../models/student.model.js");

exports.registerStudent = async (req, res) => {
  const { name, email, password, class: studentClass } = req.body;

  try {
    // Check if the student already exists
    const existingStudent = await StudentModel.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ msg: "User already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS)
    );

    // Create a new student
    const newStudent = new StudentModel({
      name,
      email,
      password: hashedPassword,
      class: studentClass,
    });

    // Save the student
    await newStudent.save();

    // Send welcome email (optional, but check if this fails)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to LMS",
      text: `Welcome to LMS, your account has been created successfully!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({ msg: "Error sending email" });
      }
      res.status(200).json({
        msg: "Student Registered Successfully",
        student: newStudent,
      });
    });
  } catch (error) {
    console.log("Error registering student:", error); // Log the error here
    res
      .status(500)
      .json({ msg: "Error registering student", error: error.message });
  }
};
