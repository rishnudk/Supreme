const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();

const passport = require("passport");

exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

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

// exports.signup
//  = async (req, res) => {
//     try {
//         const { name, email, password, confirmPassword, phone, referral } = req.body;

//         if (password !== confirmPassword) {
//             req.flash("error_msg", "Passwords do not match");
//             return res.redirect("/signup");
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             req.flash("error_msg", "Email already registered");
//             return res.redirect("/signup");
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         req.session.user = {
//             name: name,
//             email: email,
//             password:password,
//             phone:phone,
//         };

//         return res.redirect("/user/home");

//     } catch (error) {
//         console.error(error);
//         req.flash("error_msg", "Error signing up. Please try again.");
//         return res.redirect("/signup");
//     }
// };






exports.renderLogin = (req, res) => {
  if (req.session.user) {
      return res.redirect("/user/shop"); // Redirect if logged in
  }
  const message = req.query.message || ""; // Get message from query parameter
  console.log("🔍 Rendering login with message:", message);
  res.render("user/userLogin", { message });
};

exports.renderSignup = (req, res) => {
    if (req.session.user) {
        return res.redirect("/user/shop"); // Redirect if logged in
    }
    res.render("user/signup", { title: "User Signup", });
};






exports.signup = async (req, res) => {
  console.log("oooooooooooooooooooo",req.body);
  try {
      const { name, email, password, confirmPassword, phone, referral } = req.body;

      if (password !== confirmPassword) {
          req.flash('error_msg', 'Passwords do not match');
          return res.redirect('/auth/signup');
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          req.flash('error_msg', 'Email already exists');
          return res.redirect('/auth/signup');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ 
          name, 
          email, 
          password: hashedPassword, 
          phone 
      });

      // Handle referral
      if (referral) {
        console.log('Referral code entered:', referral);
        const referrer = await User.findOne({ referralCode: referral });
        console.log('Referrer found:', referrer);
        if (referrer) {
            newUser.referredBy = referral;
            newUser.wallet = 50;
            referrer.wallet += 50;
            await referrer.save();
            console.log('Referral applied, new user:', newUser);
        }
    } else {
          req.flash('success_msg', 'Signup successful! Welcome to our platform!');
      }

      await newUser.save();
      req.session.user = { 
          id: newUser._id, 
          name: newUser.name, 
          email: newUser.email,
          referralCode: newUser.referralCode,
          wallet: newUser.wallet 
      };

      res.render('user/success', {
          name: newUser.name,
          referralCode: newUser.referralCode,
          wallet: newUser.wallet,
          message: req.flash('success_msg').length ? req.flash('success_msg')[0] : 'Signup successful!'
      });
  } catch (error) {
      req.flash('error_msg', 'Signup error: ' + error.message);
      res.redirect('/auth/signup');
  }
};





//og 
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
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

exports.googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    (err, user) => {
      if (err) return next(err);
      if (!user) return res.redirect("/login");

      req.logIn(user, (err) => {
        if (err) return next(err);
        req.session.user = { id: user._id, name: user.name, email: user.email };
        res.redirect("/home");
      });
    }
  )(req, res, next);
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
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log(otp);
    req.session.email = email;
    req.session.OTP = otp;

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
      message: "OTP verified, proceed to set new password.",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }
};

exports.changeforgetpass = async (req, res) => {
  console.log(req.body);
  const { password, confirm } = req.body;

  if (password !== confirm) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userEmail = req.session.email;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
      message: "Server error, please try again later",
    });
  }
};

exports.getVerifyOtp = (req, res) => {
  res.render("user/verifyOtp");
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
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

// exports.sendSignupOTP = async (req, res) => {
//     try {
//         const { email } = req.body;

//         // Generate 6-digit OTP
//         const otp = Math.floor(100000 + Math.random() * 900000);
//         otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // Store for 5 mins
//         console.log(otp)

//         // Send OTP via email
//         await transporter.sendMail({
//             from: process.env.EMAIL,
//             to: email,
//             subject: "Your OTP for Signup",
//             text: `Your OTP is ${otp}. It is valid for 5 minutes.`
//         });

//         res.status(200).json({ message: "OTP sent successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Error sending OTP" });
//     }
// };

// exports.verifySignupOTP = async (req, res) => {
//     try {
//         const { email, otp, name, password, phone } = req.body;

//         // Check if OTP exists and is valid
//         if (!otpStorage[email] || otpStorage[email].expiresAt < Date.now()) {
//             return res.status(400).json({ error: "OTP expired. Please request a new one." });
//         }

//         if (otpStorage[email].otp !== otp) {
//             return res.status(400).json({ error: "Invalid OTP. Try again." });
//         }
//         console.log("Email:", email);
//         console.log("Stored OTP Data:", otpStore[email]); // Check what is stored
// console.log("Received OTP:", otp);
// console.log("Expiration Time:", otpStorage[email] ? otpStorage[email].expiresAt : "No OTP found");
// console.log("Current Time:", Date.now());

//         // OTP is valid, create user
//         const newUser = new User({ name, email, password, phone });
//         await newUser.save();

//         // Clear OTP after successful verification
//         delete otpStorage[email];

//         res.status(200).json({ message: "Account created successfully", redirect: "/user/home" });
//     } catch (error) {
//         res.status(500).json({ error: "Error verifying OTP" });
//     }
// };





//og


// exports.sendSignupOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const otp = Math.floor(100000 + Math.random() * 900000);

//     req.session.storedOtpData = {
//       otp: String(otp),
//       expiresAt: Date.now() + 5 * 60 * 1000,
//     };

//     console.log(`Generated OTP for ${email}:`, otp);

//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Your OTP for Signup",
//       text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
//     });

//     res.status(200).json({ message: "OTP sent successfully" });
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     res.status(500).json({ error: "Error sending OTP" });
//   }
// };



// exports.verifySignupOTP = async (req, res) => {
//   try {
//     const { email, otp, name, password, phone } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     console.log("Received Request Body:", req.body);
//     console.log("otppppppp");

//     const storedOtpData = req.session.storedOtpData;

//     if (!storedOtpData || storedOtpData.expiresAt < Date.now()) {
//       return res
//         .status(400)
//         .json({ error: "OTP expired. Please request a new one." });
//     }

//     if (storedOtpData.otp !== String(otp)) {
//       return res.status(400).json({ error: "Invalid OTP. Try again." });
//     }

//     const newUser = new User({ name, email, password, phone });
//     await newUser.save();

//     req.session.user = newUser;
//     req.session.userId = newUser._id;

//     res.status(200).json({
//       message: "Account created successfully!",
//       redirect: "/user/home",
//     });


//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ error: "Error verifying OTP" });
//   }
// };


exports.sendSignupOTP = async (req, res) => {
  try {
      const { email } = req.body;
      const otp = Math.floor(100000 + Math.random() * 900000);
      req.session.storedOtpData = {
          otp: String(otp),
          expiresAt: Date.now() + 5 * 60 * 1000,
      };
      console.log(`Generated OTP for ${email}:`, otp);
      await transporter.sendMail({
          from: process.env.EMAIL,
          to: email,
          subject: "Your OTP for Signup",
          text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      });
      res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Error sending OTP" });
  }
};

exports.verifySignupOTP = async (req, res) => {
  try {
      const { email, otp, name, password, phone, referral } = req.body;
      console.log("Received Request Body:", req.body);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ error: "Email already registered" });
      }

      const storedOtpData = req.session.storedOtpData;
      if (!storedOtpData || storedOtpData.expiresAt < Date.now()) {
          return res.status(400).json({ error: "OTP expired. Please request a new one." });
      }

      if (storedOtpData.otp !== String(otp)) {
          return res.status(400).json({ error: "Invalid OTP. Try again." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword, phone });

      if (referral) {
          const trimmedReferral = referral.trim();
          console.log('Referral code entered:', trimmedReferral);
          const referrer = await User.findOne({ referralCode: trimmedReferral });
          if (referrer) {
              newUser.referredBy = trimmedReferral;
              newUser.wallet = 50;
              referrer.wallet += 50;
              await referrer.save();
          }
      }

      await newUser.save();
      // req.session.user = {
      //     id: newUser._id,
      //     name: newUser.name,
      //     email: newUser.email,
      //     referralCode: newUser.referralCode,
      //     wallet: newUser.wallet,
      // };
      req.session.user=newUser

      res.status(200).json({
          message: referral && newUser.referredBy 
              ? "Account created successfully! You received ₹50 for using a valid referral code!" 
              : "Account created successfully!",
          redirect: "/user/home",
      });
  } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Error verifying OTP" });
  }
};







