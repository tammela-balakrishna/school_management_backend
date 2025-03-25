const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

let students = [];
let teachers = [];
let classes = [];

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Set up storage for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
// Add new a new student
app.post("/api/students", upload.single("image"), (req, res) => {
    try {
        let newStudent = {
            id: Date.now(),
            name: req.body.name,
            age: req.body.age,
            className: req.body.className,
            image: req.file ? `/uploads/${req.file.filename}` : null // Store image path
        };
        students.push(newStudent);
        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// POST: Add a new teacher
app.post("/api/teachers", upload.single("image"), (req, res) => {
    const { name, subject } = req.body;
    if (!name || !subject || !req.file) {
        return res.status(400).json({ error: "Missing fields" });
    }
    
    const newTeacher = {
        id: teachers.length + 1,
        name,
        subject,
        image: `/uploads/${req.file.filename}`
    };
    teachers.push(newTeacher);
    res.status(201).json(newTeacher);
});
// POST: Add a new class
app.post("/api/classes", (req, res) => {
    const { className, students } = req.body;

    if (!className || students === undefined) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const newClass = {
        id: classes.length + 1,
        className,
        students: Number(students) || 0 // Ensure it's a number
    };

    classes.push(newClass);
    res.status(201).json(newClass);
});
// Get all data
app.get("/api/:type", (req, res) => {
    const { type } = req.params;
    let data;

    if (type === "students") data = students;
    else if (type === "teachers") data = teachers;
    else if (type === "classes") data = classes;
    else return res.status(400).json({ error: "Invalid type" });

    res.json(data);
});
// Get specific entry
app.get("/api/:type/:id", (req, res) => {
    const { type, id } = req.params;
    const parsedId = parseInt(id);

    let item;
    if (type === "students") {
        item = students.find(student => student.id === parsedId);
    } else if (type === "teachers") {
        item = teachers.find(teacher => teacher.id === parsedId);
    } else if (type === "classes") {
        item = classes.find(cls => cls.id === parsedId);
    } else {
        return res.status(400).json({ error: "Invalid type" });
    }

    if (!item) return res.status(404).json({ error: `${type.slice(0, -1)} not found` });

    res.json(item);
});
// Edit entry
app.put("/api/:type/:id", (req, res) => {
    const { type, id } = req.params;
    const parsedId = parseInt(id);
    let updatedItem;

    if (type === "students") {
        updatedItem = students.find(student => student.id === parsedId);
        if (updatedItem) {
            updatedItem.name = req.body.name;
            updatedItem.age = req.body.age;
            updatedItem.className = req.body.className;
        }
    } 
    else if (type === "teachers") {
        updatedItem = teachers.find(teacher => teacher.id === parsedId);
        if (updatedItem) {
            updatedItem.name = req.body.name;
            updatedItem.subject = req.body.subject;
        }
    } 
    else if (type === "classes") {  
        updatedItem = classes.find(cls => cls.id === parsedId);
        if (updatedItem) {
            updatedItem.className = req.body.className;
            
            // ✅ FIX: Update only if students field is provided
            if (req.body.students !== undefined) {
                updatedItem.students = parseInt(req.body.students);
            }
        }
    } 
    else {
        return res.status(400).json({ error: "Invalid type" });
    }

    if (!updatedItem) return res.status(404).json({ error: `${type.slice(0, -1)} not found` });

    res.json(updatedItem);
});
// Delete entry
app.delete("/api/:type/:id", (req, res) => {
    const { type, id } = req.params;
    const parsedId = parseInt(id);

    if (type === "students") {
        students = students.filter(student => student.id !== parsedId);
    } else if (type === "teachers") {
        teachers = teachers.filter(teacher => teacher.id !== parsedId);
    } else if (type === "classes") {
        classes = classes.filter(cls => cls.id !== parsedId);
    } else {
        return res.status(400).json({ error: "Invalid type" });
    }

    res.status(204).send(); // Success, no content
});


app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
