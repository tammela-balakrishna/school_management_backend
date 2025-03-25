const express = require("express");
const {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
} = require("../controllers/teacherController");

const router = express.Router();

router.post("/teachers", createTeacher);
router.get("/teachers", getAllTeachers);
router.get("/teachers/:id", getTeacherById);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

module.exports = router;
