const Product = require("../../models/Product");
const Variant = require("../../models/Variant");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const Category = require("../../models/Category");
const bcrypt = require('bcryptjs'); 










exports.addProduct = async (req, res) => {

  try {
      const { name, brand, price, description, category, status, color, stock } = req.body;

      const productImages = req.files
          .filter(file => file.fieldname === "images")
          .map(file => file.path);

      if (!name || !brand || !price || !description || !category || !status || !color || !stock || productImages.length !== 4) {
          return res.status(400).json({ error: "All fields, exactly 4 product images, color, and stock are required", received: req.body });
      }

      // Validate category
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
          return res.status(400).json({ error: "Category not found" });
      }
      if (categoryDoc.isDeleted) {
          return res.status(400).json({ error: "Cannot use a deleted category" });
      }

      const product = new Product({
          name,
          brand,
          price: Number(price),
          description,
          category, // Validated category ID
          status,
          images: productImages,
          variant: { color, stock: Number(stock) }
      });

      const savedProduct = await product.save();
      console.log("✅ Product Added:", savedProduct);
      res.status(201).json({ success: true, message: "Product added successfully", product: savedProduct });
  } catch (error) {
      console.error("❌ Error in addProduct:", error.stack);
      res.status(400).json({ error: error.message, received: req.body });
  }
};



exports.GetaddProduct = async (req, res) => {
  try {
    const categories = await Category.find();
    console.log("Fetched Categories for Add Product:", categories); // Debug log
    res.render("admin/productAdd", { categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
};










exports.updateProduct = async (req, res) => {
  console.log("🔍 Route Hit:", req.params.id);
  console.log("📥 Received Form Data:", req.body);
  console.log("📂 Uploaded Files:", req.files);

  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product ID is required" });

    const { name, brand, price, description, category, status, color, stock } = req.body;
    const existingImagesFromForm = Array.isArray(req.body['existingImages[]']) 
      ? req.body['existingImages[]'] 
      : (req.body['existingImages[]'] ? [req.body['existingImages[]']] : []);
    const newImages = req.files ? req.files.map(file => file.path) : [];

    console.log("Existing Images from Form:", existingImagesFromForm);
    console.log("New Images from Upload:", newImages);

    if (!name || !brand || !price || !description || !category || !status || !color || !stock) {
      return res.status(400).json({ error: "All fields are required", received: req.body });
    }

    // Validate category
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ error: "Category not found" });
    }
    if (categoryDoc.isDeleted) {
      return res.status(400).json({ error: "Cannot use a deleted category" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Get old images from the database
    const oldImages = product.images || [];
    console.log("Old Images from Database:", oldImages);

    // Combine images: prioritize new images, then existing from form, then old images
    const updatedImages = [];
    
    // Add new images first (from uploaded files)
    updatedImages.push(...newImages);
    
    // Add existing images from form (if any)
    updatedImages.push(...existingImagesFromForm);
    
    // Fill remaining slots with old images from database, up to 4
    const remainingSlots = 4 - updatedImages.length;
    if (remainingSlots > 0 && oldImages.length > 0) {
      updatedImages.push(...oldImages.slice(0, remainingSlots));
    }

    // Ensure exactly 4 images
    if (updatedImages.length < 4) {
      return res.status(400).json({ error: "Exactly 4 images are required; not enough images provided" });
    }
    // Cap at 4 images
    const finalImages = updatedImages.slice(0, 4);

    console.log("Final Images for Update:", finalImages);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        brand,
        price: Number(price),
        description,
        category, // Validated category ID
        status,
        images: finalImages,
        variant: { color, stock: Number(stock) },
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("category");

    console.log("✅ Product Updated:", updatedProduct);
    res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error in updateProduct:", error.stack);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};


exports.getProductById = async (req, res) => {
  try {

    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    const categories = await Category.find();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    console.log("Fetched Product:", product);

    res.render('admin/productUpdate', {product,categories});
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};












exports.getProducts = async (req, res) => {
  try {
    let { page = 1, limit = 5, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = search
      ? { name: { $regex: search, $options: "i" } } 
      : {};

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render("admin/productManagement", {
      products,
      page,
      limit, 
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};







exports.getInventory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; 
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const products = await Product.find()
            .populate('category')
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);

        res.render('admin/inventory', {  
            products,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;  
        const { stock } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.variant.stock = stock;
        product.updatedAt = Date.now();
        await product.save();

        res.status(200).json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};





