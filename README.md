# Supreme - E-commerce Platform

![E-commerce Platform](https://img.shields.io/badge/Node.js-Express-MongoDB-green)

## 🚀 Features
- User & Admin authentication
- Product management with categories
- Shopping cart & wishlist
- Order processing with Razorpay integration
- Address management
- Sales reporting & coupons
- GST calculation
- Return/refund system

## 💻 Tech Stack
- **Frontend**: EJS + Bootstrap
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Payment**: Razorpay integration
- **Security**: bcrypt + express-session
- **Cloud**: Cloudinary for image storage

## 📦 Installation
```sh
git clone https://github.com/rishnudk/Supreme.git
cd Supreme
npm install
echo "PORT=7000\nMONGO_URI=mongodb://localhost:27017/supreme" > .env
npm run dev
🔧 Project Structure
Copy
Supreme/
├── controllers/    # Business logic
├── models/         # MongoDB schemas
├── routes/         # API endpoints
├── views/          # EJS templates
├── public/         # Static assets
├── middlewares/    # Auth middleware
└── server.js       # Entry point
🌟 Key Functionality
User System: Registration, login (with Google OAuth), password reset

Admin Panel: Product/category management, order processing

Shopping Flow: Cart → Checkout → Payment → Order tracking

Financials: GST calculation, discount coupons, referral system

📌 Environment Variables
Create .env with:

env
Copy
PORT=7000
MONGO_URI=your_mongodb_connection
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_URL=your_cloudinary_url
👨‍💻 Author
Rishnu Dk
📧 rishnudev@gmail.com

⭐ Star the repo if you find it useful!

Copy

Key highlights:
1. Matches your package.json dependencies
2. Reflects all routes from your userRoutes.js and adminRoutes.js
3. Includes your actual GitHub repo link
4. Structured for easy navigation
5. Contains all essential setup instructions