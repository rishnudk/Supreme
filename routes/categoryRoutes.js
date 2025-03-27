const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/adminController/categoryController");
const { adminAuth } = require("../middlewares/authMiddleware");


router.get("/", adminAuth, categoryController.getCategories); 
router.post("/add",adminAuth, categoryController.addCategory);
router.get("/:id", adminAuth, categoryController.getCategory);
router.put("/:id", adminAuth, categoryController.updateCategory);
router.delete("/:id",adminAuth, categoryController.deleteCategory);
router.patch("/:id/restore", adminAuth,categoryController.restoreCategory);



module.exports = router;
