const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/adminController/categoryController");

router.get("/", categoryController.getCategories); 
router.post("/add", categoryController.addCategory);
router.get("/:id", categoryController.getCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);
router.patch("/:id/restore", categoryController.restoreCategory);



module.exports = router;
