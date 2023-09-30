const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser')
const app = express();
const BodyParser = require("body-parser");
require('dotenv').config()

const Faculty = require('./routes/Faculty');
const course = require('./routes/course');
const Module = require('./routes/Module');
const Enroll = require('./routes/Enroll');
const db = require("./db");
const isAuth = require("./Middleware/isAuth");
const { logger, logEvents } =  require("./Middleware/logger");
const errorHandler = require('./middleware/errorHandler')
const AdminRoutes = require("./routes/Admin");
const JobRoutes = require("./routes/Jobportal");
const Insights = require("./routes/insights");
const User = require("./routes/User");
const Attandance = require("./routes/Attandance");
const Event = require("./routes/Event");
const HelpDesk = require("./routes/HelpDesk");
const Announcement = require("./routes/Announcement");
const UserManagement = require("./routes/UserManagement");
const Library = require("./routes/Library");
const ForumManagement=require("./routes/ForumManagement");
const ExamRoutes=require("./routes/Exam");
const ExMarkRoutes=require("./routes/ExamMarks");
const ContactUs=require("./routes/ContactUs");
const StudentPortal=require("./routes/StudentPortal");
const TimeTable=require("./routes/Timetable");



// app.use(isAuth);
app.use((req, res, next) => {
  if (req.path === '/user/login' || req.path === '/user/refresh' || req.path === '/user/logout') {
    return next(); // Skip authentication for /login route
  }
  isAuth(req, res, next); // Apply authMiddleware for all other routes
});
app.use(logger);
app.use(errorHandler);
app.use(BodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(BodyParser.json());
app.use(cookieParser())

const allowedOrigins ='http://localhost:3000';
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/uploads", express.static("uploads"));
app.use("/TimeTable", express.static("TimeTable"));
app.use("/Reports", express.static("Reports"));
app.use("/Books", express.static("Books"));
app.use("/Dp", express.static("Dp"));
app.use("/files", express.static("files"));
app.use("/announcement", express.static("announcement"));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');;
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true")
  next();
});


app.use("/timetable" , TimeTable);
app.use('/admin', AdminRoutes);
app.use('/contact_us', ContactUs);
app.use('/Faculty', Faculty);
app.use('/course', course);
app.use('/portal', StudentPortal);
app.use('/Module', Module);
app.use('/Enroll', Enroll);
app.use("/admin", AdminRoutes);
app.use("/insight", Insights);
app.use("/user", User);
app.use("/attandance", Attandance);
app.use("/event", Event);
app.use("/helpDesk", HelpDesk);
app.use("/announcement", Announcement);
app.use("/library", Library);
app.use("/userManagement", UserManagement);
app.use("/", JobRoutes);
app.use("/ForumManagement" , ForumManagement);
app.use("/exams" , ExamRoutes);
app.use("/exMarks" , ExMarkRoutes);





db.initDb((err, db) => {
  if (err) {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
  } else {
    app.listen(5000);
  }
});
