const Category = require('../../models/Category')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs'); 

exports.addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = new Category({ name, description, isDeleted: false });
        await category.save();
        res.status(201).json({ message: 'Category added successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.getCategories = async (req, res) => {
  try {
    console.log("Received GET request at /admin/categories with query:", req.query);

    let { page = 1, limit = 15, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const total = await Category.countDocuments(query);

   

    const categories = await Category.find(query)
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit)
      .limit(limit);
      
    console.log("Categories fetched:", categories);

    res.render("admin/categoryManagement", {
      categories,   
      page,         
      totalPages: Math.ceil(total / limit), 
      total,
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).render("admin/errorPage", { error: "Internal Server Error" });
  }
};




module.exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Error fetching category", error: error.message });
  }
};









module.exports.updateCategory = async (req, res) => {
  
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;
    
         
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
  
    
      if (!name || !status) {
        return res.status(400).json({ message: "Name and status are required" });
      }
  
     
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { name, description, isDeleted: status === "active" ? false : true },
        { new: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      res.json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Error updating category", error: error.message });
    }
  };




