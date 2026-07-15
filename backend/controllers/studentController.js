import { json } from "express";
import User from "../models/User.js";

export async function searchStudentByRoll(req, res) {
  try {
    const roll = String(req.query.roll || " ").trim();
    if (!roll) {
      return res.status(200).json({ success: true, students: [] });
    }
    const rollRegex = new RegExp(roll, "i");
    const students = await User.find({
      role: "user",
      isProfileCompleted: true,
      rollNo: { $regex: rollRegex },
    })
      .select("name email depertment stream semester year rollNo")
      .limit(12);

    const mappedStudents = students.map((student) => ({
      name: student.name,
      email: student.email,
      department: student.department || "",
      stream: student.stream || "",
      academicYear: student.year || "",
      semester: student.semester || "",
      rollNumber: student.rollNo || "",
    }));

    res.status(200).json({success: true, students: mappedStudents});
  } catch (error) {

    console.error("Error searching  students by roll number ",error);
    res.status(500).json({
        succes: false,
        message:"Error searching  students by roll number",
        error: error.message
    });
  }
}