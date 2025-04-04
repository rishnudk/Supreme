const User = require("../../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");





const userManagement = async (req, res, next) => {
    try {

    
      const { search = "", page = 1, limit = 3 } = req.query;
  
      const query = {};
      if (search) {
        query.email = { $regex: search, $options: 'i' };  
      }
  
      const users = await User.find(query)
        .sort({ createdAt: -1 }) 
        .skip((page - 1) * limit) 
        .limit(parseInt(limit));   
  

      const totalUsers = await User.countDocuments(query);
  

      res.render("admin/userManagement", {
      users: JSON.stringify(users) ,
        totalUsers: totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        search: search,  
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  };
  

  const changeUserStatus = async (req, res, next) => {
    try {
      const { userId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid user ID' 
        });
      }
  

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
  
      user.status = user.status === 'Active' ? 'Inactive' : 'Active';
      await user.save();
  
      res.json({
        success: true,
        message: 'User status updated successfully',
        status: user.status
      });
  
    } catch (err) {
      console.error('Error in toggleUserStatus:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user status' 
      });
    }
  };






module.exports = {
    userManagement,
    changeUserStatus,
}