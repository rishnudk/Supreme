const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const path = require("path");
const engine = require('ejs-mate');
const { v4: uuidv4 } = require('uuid');
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// Passport Configuration
require("./config/passport")(passport); 

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set EJS as the templating engine
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Express Session Middleware
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false, // ✅ Fix: Don't create sessions for unauthenticated users
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // Session valid for 1 day
  })
);


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages Middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes"); 
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");

// ✅ Public Routes (Allow access without authentication)
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("E-Commerce API is running...");
});
app.get("/login", (req, res) => {
  res.redirect("/user/login");
});

// ✅ Protected Routes (Require authentication)
app.use(authMiddleware);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);


module.exports = app;
