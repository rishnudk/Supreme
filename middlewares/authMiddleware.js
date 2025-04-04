const User = require("../models/User");
const bcrypt = require('bcryptjs'); 


const authMiddleware = async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user._id);

            if (!user) {
                req.session.destroy(() => res.redirect("/user/login"));
                return;
            }

            if (user.status === "Blocked") {
                req.session.destroy(() => {
                    res.redirect("/user/login?error=blocked");
                });
                return;
            }
        }
        next();
    } catch (error) {
        console.error("Error in authentication middleware:", error);
        res.status(500).send("Server Error"); 
    }
};

const adminAuth = (req, res, next) => {
    console.log("Checking Admin Auth, Session:", req.session);
  
    if (req.session && req.session.admin) {
        console.log("Admin Authenticated:", req.session.admin);
        return next();
    }

    console.log("Admin Not Authenticated, Redirecting to Login");
    res.redirect("/admin/login");
};




module.exports = {
    authMiddleware,
    adminAuth,
}
