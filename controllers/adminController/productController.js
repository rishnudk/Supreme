const Product = require("../../models/Product");
const Variant = require("../../models/Variant");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const Category = require("../../models/Category");


// exports.addProduct = async (req, res) => {
//   console.log("🚀 API HIT: /add Product Route"); // Log when API is hit
//   console.log("📥 Received form data:", req.body); // Log form data
//   console.log("📂 Uploaded Files:", req.files); // Log uploaded images



//   try {
//     let {
//       name,
//       brand,
//       price,
//       description,
//       category,
//       status = "Active",
//     } = req.body;

//     let variants = req.body.variants ? JSON.parse(req.body.variants) : [];

//     console.log("📦 Variants:", variants);

//     // Cloudinary image URLs
//     const imageUrls = req.files.map((file) => file.path);
//     if (
//       !name ||
//       !brand ||
//       !price ||
//       !description ||
//       !category ||
//       !imageUrls ||
//       !variants 
//     ) {
//       console.log("❌ Validation failed: Missing required fields.");
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     console.log("🛠 Creating Product Object...");
//     const newProduct = new Product({
//       name: name.trim(),
//       brand: brand.trim(),
//       price: parseFloat(price),
//       description: description.trim(),
//       category: category.trim(),
//       images: imageUrls,
//       variants: variants.map((v) => ({
//         color: v.color.trim(),
//         stock: parseInt(v.stock),
//       })),
//       status,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     console.log("🛠 Saving product to MongoDB...");
//     const savedProduct = await newProduct.save();
//     console.log("✅ Product saved successfully:", savedProduct);

//   res.status(201).json({
//     success: true,
//     message: "Product added successfully",
//     product: savedProduct,
// });

//   } catch (error) {
//     res.status(500).json({
//       error: "Internal Server Error",
//       details: error.message,
//   });
// }  
// };



// exports.addProduct = async (req, res) => {
//   console.log("🔍 Route Hit: Add Product");
//   console.log("📥 Received Form Data:", req.body);
//   console.log("📂 Uploaded Files:", req.files);

//   try {
//       const { Name, Brand, Price, Description, Category, Status } = req.body;
//       const newImages = req.files
//           .filter(file => file.fieldname === "images")
//           .map(file => file.path);

//       if (!Name || !Brand || !Price || !Description || !Category || !Status || newImages.length < 3) {
//           return res.status(400).json({ error: "All fields and minimum 3 images are required", received: req.body });
//       }

//       const variants = [];
//       const variantColors = req.body['variants[][color]'] || [];
//       const variantStocks = req.body['variants[][stock]'] || [];
//       for (let i = 0; i < variantColors.length; i++) {
//           if (variantColors[i] && variantStocks[i]) {
//               const variantImages = req.files
//                   .filter(file => file.fieldname === `variantImages-${i}[]`)
//                   .map(file => file.path);
//               if (variantImages.length < 3) {
//                   return res.status(400).json({ error: `Variant ${i + 1}: Minimum 3 images required` });
//               }
//               variants.push({
//                   color: variantColors[i],
//                   stock: Number(variantStocks[i]),
//                   images: variantImages
//               });
//           }
//       }

//       const product = new Product({
//           name: Name,
//           brand: Brand,
//           price: Number(Price),
//           description: Description,
//           category: Category,
//           status: Status,
//           images: newImages,
//           variants
//       });

//       const savedProduct = await product.save();
//       console.log("✅ Product Added:", savedProduct);
//       res.status(201).json({ success: true, message: "Product added successfully", product: savedProduct });
//   } catch (error) {
//       console.error("❌ Error in addProduct:", error.stack);
//       res.status(500).json({ error: "Internal Server Error", details: error.message });
//   }
// };



// exports.addProduct = async (req, res) => {
//   console.log("🔍 Route Hit: Add Product");
//   console.log("📥 Received Form Data:", req.body);
//   console.log("📂 Uploaded Files:", req.files);

//   try {
//       const { name, brand, price, description, category, status, variants } = req.body;
//       const parsedVariants = JSON.parse(variants || '[]');

//       const allImages = req.files.filter(file => file.fieldname === "images").map(file => file.path);
//       const productImages = allImages.slice(0, Math.min(allImages.length, 4)); // First 4 for product

//       if (!name || !brand || !price || !description || !category || !status || productImages.length < 3) {
//           return res.status(400).json({ error: "All fields and minimum 3 product images are required", received: req.body });
//       }

//       const variantData = parsedVariants.map((v, index) => {
//           const startIdx = 4 + index * 3; // Start after product images
//           const images = allImages.slice(startIdx, startIdx + 3);
//           console.log(`Variant ${index} Images:`, images);
//           if (images.length < 3) throw new Error(`Variant ${index + 1}: Minimum 3 images required`);
//           return { color: v.color, stock: Number(v.stock), images };
//       });

//       const product = new Product({
//           name,
//           brand,
//           price: Number(price),
//           description,
//           category,
//           status,
//           images: productImages,
//           variants: variantData
//       });

//       const savedProduct = await product.save();
//       console.log("✅ Product Added:", savedProduct);
//       res.status(201).json({ success: true, message: "Product added successfully", product: savedProduct });
//   } catch (error) {
//       console.error("❌ Error in addProduct:", error.stack);
//       res.status(400).json({ error: error.message, received: req.body });
//   }
// };



exports.addProduct = async (req, res) => {
  console.log("🔍 Route Hit: Add Product");
  console.log("📥 Received Form Data:", req.body);
  console.log("📂 Uploaded Files:", req.files);

  try {
      const { name, brand, price, description, category, status, color, stock } = req.body;

      const productImages = req.files
          .filter(file => file.fieldname === "images")
          .map(file => file.path);

      if (!name || !brand || !price || !description || !category || !status || !color || !stock || productImages.length !== 4) {
          return res.status(400).json({ error: "All fields, exactly 4 product images, color, and stock are required", received: req.body });
      }

      const product = new Product({
          name,
          brand,
          price: Number(price),
          description,
          category,
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




// exports.GetaddProduct = async (req, res) => {
//   try {
//     const categories = await Category.find();

//     res.render("admin/productAdd", { categories });
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

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

// Edit product (allows updating images)

// exports.updateProduct = async (req, res) => {
//   console.log("🔍 Route Hit:", req.params.id);
//   console.log("📥 Received Form Data:", req.body);
//   console.log("📂 Uploaded Files:", req.files);

//   try {
//       const { id } = req.params;
//       if (!id) return res.status(400).json({ error: "Product ID is required" });

//       const { name, brand, price, description, category, status } = req.body;
//       const existingImages = Array.isArray(req.body['existingImages[]']) 
//           ? req.body['existingImages[]'] 
//           : (req.body['existingImages[]'] ? [req.body['existingImages[]']] : []);
//       const newImages = req.files ? req.files.map(file => file.path) : [];

//       console.log("Existing Images from Form:", existingImages);
//       console.log("New Images from Upload:", newImages);

//       if (!name || !brand || !price || !description || !category || !status) {
//           return res.status(400).json({ error: "All fields are required", received: req.body });
//       }

//       const variants = [];
//       if (req.body['variants[][color]'] && req.body['variants[][stock]']) {
//           const colors = Array.isArray(req.body['variants[][color]']) ? req.body['variants[][color]'] : [req.body['variants[][color]']];
//           const stocks = Array.isArray(req.body['variants[][stock]']) ? req.body['variants[][stock]'] : [req.body['variants[][stock]']];
//           for (let i = 0; i < colors.length; i++) {
//               if (colors[i] && stocks[i]) {
//                   variants.push({ color: colors[i], stock: Number(stocks[i]) });
//               }
//           }
//       }

//       const product = await Product.findById(id);
//       if (!product) return res.status(404).json({ error: "Product not found" });

//       const updatedImages = [...existingImages, ...newImages];
//       console.log("Updated Images to Save:", updatedImages);

//       const updatedProduct = await Product.findByIdAndUpdate(
//           id,
//           {
//               name,
//               brand,
//               price: Number(price),
//               description,
//               category,
//               status,
//               images: updatedImages,
//               variants,
//               updatedAt: new Date(),
//           },
//           { new: true }
//       ).populate("category");

//       console.log("✅ Product Updated:", updatedProduct);
//       res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
//   } catch (error) {
//       console.error("❌ Error in updateProduct:", error.stack);
//       res.status(500).json({ error: "Internal Server Error", details: error.message });
//   }
// };

exports.updateProduct = async (req, res) => {
  console.log("🔍 Route Hit:", req.params.id);
  console.log("📥 Received Form Data:", req.body);
  console.log("📂 Uploaded Files:", req.files);

  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product ID is required" });

    const { name, brand, price, description, category, status, color, stock } = req.body;
    const existingImages = Array.isArray(req.body['existingImages[]']) 
      ? req.body['existingImages[]'] 
      : (req.body['existingImages[]'] ? [req.body['existingImages[]']] : []);
    const newImages = req.files ? req.files.map(file => file.path) : [];

    console.log("Existing Images from Form:", existingImages);
    console.log("New Images from Upload:", newImages);

    if (!name || !brand || !price || !description || !category || !status || !color || !stock) {
      return res.status(400).json({ error: "All fields are required", received: req.body });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const updatedImages = [...existingImages, ...newImages].slice(0, 4);
    if (updatedImages.length !== 4) {
      return res.status(400).json({ error: "Exactly 4 images are required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        brand,
        price: Number(price),
        description,
        category,
        status,
        images: updatedImages,
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



//working one
// exports.getProducts = async (req, res) => {
//   try {
//     let { page = 1, limit =10, search = "" } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     const query = search
//       ? { name: { $regex: search, $options: "i" } } // Case-insensitive search
//       : {};

//     const total = await Product.countDocuments(query);
//     const products = await Product.find(query)
//       .populate("category")
//       .skip((page - 1) * limit)
//       .limit(limit);

//     res.render('admin/productManagement',{
//       products,
//       page,
//       totalPages: Math.ceil(total / limit),
//       total,
//     });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



exports.getProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = search
      ? { name: { $regex: search, $options: "i" } } // Case-insensitive search
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
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





