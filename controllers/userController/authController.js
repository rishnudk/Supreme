const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


require("dotenv").config();


const passport = require("passport");


exports.googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: "/user/dashboard",
    failureRedirect: "/user/login",
  })(req, res, next);
};

exports.renderUserLogin = (req, res) => {
  res.render("user/userLogin", { error_msg: req.flash("error_msg") });
};


exports.userLogin = (req, res, next) => {
  passport.authenticate("user-local", {
    successRedirect: "/user/home",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
};

exports.userLogout = (req, res) => {
  req.logout(() => {
    req.flash("success_msg", "User logged out");
    res.redirect("/user/login");
  });
};
exports.getSignupPage = (req, res) => {
    res.render("usersignup"); 
};


exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, referral } = req.body;

        if (password !== confirmPassword) {
            req.flash("error_msg", "Passwords do not match");
            return res.redirect("/signup"); 
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error_msg", "Email already registered");
            return res.redirect("/signup");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            referral,
        });

        await newUser.save();

        req.session.user = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        };

        return res.redirect("/user/home"); 

    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Error signing up. Please try again.");
        return res.redirect("/signup");
    }
};




exports.login = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("user/userLogin", { message: "User not found" });
        }

        if (user.status === "Inactive") {
            return res.render("user/userLogin", { message: "You are blocked" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("user/userLogin", { message: "Incorrect password" });
        }

        req.session.user = user;
        res.redirect("/user/home");

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};







exports.googleAuth = (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { failureRedirect: "/login" }, (err, user) => {
      if (err) return next(err);
      if (!user) return res.redirect("/login");

      req.logIn(user, (err) => {
          if (err) return next(err);
          req.session.user = { id: user._id, name: user.name, email: user.email };
          res.redirect("/home");
      });
  })(req, res, next);
};



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,  
        pass: process.env.EMAIL_PASSWORD,
    },
});

const otpStorage = new Map(); 

exports.requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email); 
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send("User not found");
        }

        const otp = crypto.randomInt(1000, 9999).toString();
        otpStorage.set(email, { otp, expiresAt: Date.now() + 300000 }); 

        await transporter.sendMail({
          from: process.env.EMAIL,
          to:email,
          subject: "Password Reset OTP",
          text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      })
     
      
    console.log(otp);
        req.session.email = email;
        req.session.OTP=otp;


    res.json({ success: true, message: "OTP Sent to your Email" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    } 
};


exports.verifyOtp = async (req, res) => {
  const { otp } = req.body; 

  if (req.session.otp && req.session.otp === otp) {
      res.json({
          success: true,
          message: 'OTP verified, proceed to set new password.'
      });
  } else {
      res.status(400).json({
          success: false,
          message: 'Invalid OTP'
      });
  }
}

exports.changeforgetpass = async (req, res) => {
  console.log(req.body);
  const { password, confirm } = req.body; 

  if (password !== confirm) {
      return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
      });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userEmail = req.session.email;

  try {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'User not found'
          });
      }

      user.password = hashedPassword;
      await user.save();

      req.session.otp = null;
      req.session.email = null;

      res.redirect("/login");

      console.log("Password updated successfully");
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          message: 'Server error, please try again later'
      });
  }
}


 exports.getVerifyOtp = (req, res) => {
    res.render("user/verifyOtp");
};






exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Could not log out. Try again.");
        }
        req.session = null;  
        res.redirect("/user/login");
    });
};




exports.isAuthenticated = (req, res, next) => {
    console.log("Checking Authentication...");
    console.log("User:", req.user);

    if (req.isAuthenticated()) {
        console.log("User is authenticated!");
        return next();
    }
    
    console.log("User is NOT authenticated! Redirecting to login...");
    req.session.returnTo = req.originalUrl; // Save last visited page
    res.redirect("/user/login");
};
