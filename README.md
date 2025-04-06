
# Supreme - E-commerce Platform ![Supreme](https://img.shields.io/badge/Supreme-E--commerce-important)

![Node.js](https://img.shields.io/badge/Node.js-18.x-success?logo=node.js) ![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express) ![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb) ![Razorpay](https://img.shields.io/badge/Payment-Razorpay-blueviolet)

## 🚀 Key Features
![Authentication](https://img.shields.io/badge/Auth-User+Admin-blue) ![Products](https://img.shields.io/badge/Products-Management-orange) ![Cart](https://img.shields.io/badge/Cart+Wishlist-Integrated-success)

- 🔐 **User & Admin** authentication system
- 📦 **Product management** with categories
- 🛒 **Shopping cart** & wishlist functionality
- 💳 **Razorpay integration** for payments
- 🏠 **Address management** system
- 📊 **Sales reporting** & coupon system
- 🧾 **GST calculation** integrated
- 🔄 **Return/refund** processing

## 💻 Tech Stack
| Area | Technologies |
|------|--------------|
| **Frontend** | ![EJS](https://img.shields.io/badge/EJS-3.x-red) ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-purple?logo=bootstrap) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js) ![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express) |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb) |
| **Payment** | ![Razorpay](https://img.shields.io/badge/Razorpay-API-blueviolet) |
| **Security** | ![bcrypt](https://img.shields.io/badge/bcrypt-5.x-yellow) ![Sessions](https://img.shields.io/badge/express--session-1.x-lightgrey) |
| **Cloud** | ![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-blue?logo=cloudinary) |

## 🛠️ Installation
```bash
# Clone repository
git clone https://github.com/rishnudk/Supreme.git
cd Supreme

# Install dependencies
npm install

# Configure environment
echo "PORT=7000
MONGO_URI=mongodb://localhost:27017/supreme
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_URL=your_cloudinary_url" > .env

# Start development server
npm run dev
```

## 📂 Project Structure
```
Supreme/
├── controllers/     # Business logic
├── models/          # Database schemas
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/          # API endpoints
│   ├── adminRoutes.js
│   └── userRoutes.js
├── views/           # EJS templates
├── public/          # Static assets
├── middlewares/     # Authentication
└── server.js        # Application entry
```

## 🌟 Core Functionality
### User System
![Auth](https://img.shields.io/badge/Google_OAuth-Enabled-success) ![Password](https://img.shields.io/badge/Password_Reset-Supported-blue)
- Registration with email verification
- Google OAuth login
- Password reset flow

### Admin Panel
![Admin](https://img.shields.io/badge/Admin-Dashboard-red)
- Product/category CRUD operations
- Order management system
- Sales analytics

### Shopping Flow
![Cart](https://img.shields.io/badge/Cart-Processing-yellowgreen) ![Payment](https://img.shields.io/badge/Razorpay-Integrated-blueviolet)
1. Cart management
2. Checkout process
3. Payment gateway
4. Order tracking

### Financial Features
![GST](https://img.shields.io/badge/GST-12%25-orange) ![Coupons](https://img.shields.io/badge/Coupons-Discounts-green)
- Automatic GST calculation
- Discount coupon system
- Referral program

## 👨‍💻 Author
**Rishnu Dk**  
📧 [rishnudev@gmail.com](mailto:rishnudev@gmail.com)  
🔗 [GitHub Profile](https://github.com/rishnudk)  

⭐ **Star the repo if you find it useful!**  
![GitHub Stars](https://img.shields.io/github/stars/rishnudk/Supreme?style=social)
```

