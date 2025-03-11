const User = require("../models/User");

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









module.exports = authMiddleware;
