
const Category = require("../../models/Category");
const Product = require("../../models/Product");

exports.getShopPage = async (req, res) => {
  try {
    const user = req.session.user || null;
    let {
      search = "",
      category = "",
      price = "1000000",
      sort = "latest",
      page = "1",
    } = req.query;
    page = parseInt(page) || 1;

    const limit = 9;
    const skip = (page - 1) * limit;
    let filterQuery = {};

    if (category && category.trim() !== "") {
      const categories = category.split(",").map((cat) => cat.trim());

      const categoryDocs = await Category.find(
        { name: { $in: categories } },
        "_id"
      );
      const categoryIds = categoryDocs.map((cat) => cat._id);

      if (categoryIds.length > 0) {
        filterQuery.category = { $in: categoryIds };
      }
    }

    if (!isNaN(price) && parseInt(price) > 0) {
      filterQuery.price = { $lte: parseInt(price) };
    }

    if (search && search.trim() !== "") {
      filterQuery.name = { $regex: search, $options: "i" };
    }

    let sortQuery = {};
    if (sort === "low-to-high") {
      sortQuery.price = 1;
    } else if (sort === "high-to-low") {
      sortQuery.price = -1;
    } else if (sort === "name-asc") {
      sortQuery.name = 1;
    } else if (sort === "name-desc") {
      sortQuery.name = -1;
    } else {
      sortQuery.createdAt = -1;
    }

    console.log("Sorting by:", sort);
    console.log("Sort Query:", sortQuery);

    const products = await Product.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    res.render("user/shop", {
      products,
      user,
      totalPages,
      currentPage: page,
      sort,
      search,
      category,
      price,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server Error");
  }
};




// controllers/userController.js

exports.getProfile = async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect("/user/login");
      }
  
      res.render("user/profile", { user: req.session.user });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).send("Server Error");
    }
  };
  
  exports.updateProfile = async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect("/user/login");
      }
  
      // Extract updated user details from request body
      const { name, email } = req.body;
  
      // Update user session details (assuming database update happens elsewhere)
      req.session.user.name = name;
      req.session.user.email = email;
  
      // Redirect back to profile page
      res.redirect("/user/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).send("Server Error");
    }
  };
  

