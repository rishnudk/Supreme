const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const admin = require('../models/Admin')

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("MongoDB Connected");

    const email = "admin@gmail.com"; 
    const existingAdmin = await admin.findOne({ email }); 

    if (existingAdmin) {
        console.log("Admin user already exists.");
        mongoose.connection.close();
        return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const newAdmin = new admin({
        name: "Admin",
        email: email,
        password: hashedPassword,   
        role: "admin"
    });

    await newAdmin.save();
    console.log("Admin user created successfully!");

    mongoose.connection.close();
}).catch(err => console.error(err));
