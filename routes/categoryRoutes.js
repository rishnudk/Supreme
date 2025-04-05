const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/adminController/categoryController");
const { adminAuth } = require("../middlewares/authMiddleware");
const bcrypt = require('bcryptjs'); 



router.get("/", adminAuth, categoryController.getCategories); 
router.post("/add",adminAuth, categoryController.addCategory);
router.get("/:id", adminAuth, categoryController.getCategory);
router.put("/:id", adminAuth, categoryController.updateCategory);



module.exports = router;
