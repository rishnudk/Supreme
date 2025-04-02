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
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/User"); 


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
app.use(bodyParser.json());

// Express Session Middleware
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false, 
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, 
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



const checkUserStatus = async (req, res, next) => {

  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user._id);
      console.log("🔍 User from DB:", user ? user : "No user found");

      if (!user) {
        delete req.session.user; 
        return res.status(404).json({ message: "User no longer exists" });
      }

      if (user.status === "Inactive") {
        delete req.session.user;
        return res.redirect("/user/login?message=You have been blocked by the admin");
      } else {
        next();
      }
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  } else {
    next();
  }
};

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes"); 
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
// ✅ Public Routes (Allow access without authentication)
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.redirect("user/home")
});
app.get("/login", (req, res) => {
  res.redirect("/user/login");
});

app.use("/admin", adminRoutes);
app.use("/user",checkUserStatus, userRoutes);



// 404 Handler
app.use((req, res, next) => {
  const error = new Error('Page Not Found');
  error.statusCode = 404;
  next(error);
});

// Global Error-Handling Middleware
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);



module.exports = app;
