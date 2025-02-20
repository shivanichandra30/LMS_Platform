const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    access: {
      type: String,
      default: "true",
    },
    // Removed the class field
    userType: {
      type: String,
      default: "Student",
    },
    premium: {
      type: String,
      default: "false",
    },
    totalPoints: { type: Number, default: 0 },
    totalQuiz: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    quizIds: [{ type: String }],
    quizDetails: [{ type: Object }],
  },
  { versionKey: false, timestamps: true }
);

// Create the StudentModel based on the schema
const StudentModel = mongoose.model("student", studentSchema);

// Export the model
module.exports = { StudentModel };
