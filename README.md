# DN-Ecommerce Backend API

A robust and scalable e-commerce backend API built with Node.js, Express, and MongoDB. This API provides comprehensive features for managing products, orders, payments, users, and more.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Multi-language Support**: Built-in i18n support (English & Vietnamese)
- **Payment Integration**: Integrated with PayOS payment gateway
- **User Management**: Complete user profile and authentication system
- **Product Management**: CRUD operations for products with reviews
- **Order Management**: Full order lifecycle management
- **Wallet System**: Digital wallet for users with transaction history
- **Coupon System**: Discount coupons with expiration and usage limits
- **Email Notifications**: Automated email sending via Nodemailer
- **File Upload**: Image upload and processing with Multer and Sharp
- **Security**: Rate limiting, CORS, Helmet, and other security features
- **Error Handling**: Centralized error handling with detailed logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/devnguyen0111/Digital-Ecommerce-BE.git
cd Digital-Ecommerce-BE
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/dn-ecommerce

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# PayOS Configuration
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
PAYOS_RETURN_URL=http://localhost:3000/payment/success
PAYOS_CANCEL_URL=http://localhost:3000/payment/cancel

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=DN-Ecommerce <noreply@dn-ecommerce.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Wallet Configuration
DEFAULT_CURRENCY=VND

# i18n Configuration
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,vi
```

4. **Start the server**

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## 📁 Project Structure

```
Digital-Ecommerce-BE/
├── locales/                    # Internationalization files
│   ├── en.json                # English translations
│   └── vi.json                # Vietnamese translations
├── src/
│   ├── config/                # Configuration files
│   │   ├── database.js        # MongoDB connection
│   │   ├── env.js             # Environment variables
│   │   └── i18n.js            # i18n configuration
│   ├── middleware/            # Custom middleware
│   │   ├── errorHandler.js   # Global error handler
│   │   └── language.js        # Language detection middleware
│   └── routes/                # API routes
│       └── index.js           # Main router
├── .env                       # Environment variables (gitignored)
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Project dependencies
├── server.js                  # Application entry point
└── README.md                  # Project documentation
```

## 🔌 API Endpoints

### Health Check

```
GET /health - Check server status
```

### API Base

```
GET /api - API information and version
```

## 🌍 Internationalization

The API supports multiple languages. Set the preferred language using:

- **Query parameter**: `?lang=vi` or `?lang=en`
- **Header**: `Accept-Language: vi` or `Accept-Language: en`
- **User preference**: Stored in user profile

Supported languages:

- English (en) - Default
- Vietnamese (vi)

## 🔒 Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Configured cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Express validator for request validation
- **Environment Variables**: Sensitive data stored in .env files

## 🐛 Error Handling

The API uses a centralized error handling system that provides:

- Consistent error response format
- Detailed error messages in development mode
- Localized error messages based on user language
- Specific error handling for:
  - Mongoose validation errors
  - JWT errors
  - Duplicate key errors
  - Cast errors (invalid MongoDB ObjectId)

## 📧 Email Configuration

For Gmail, you need to:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASSWORD`

## 💾 Database

This project uses MongoDB. Ensure MongoDB is running locally or provide a MongoDB Atlas connection string.

The database connection includes automatic reconnection handling and event logging.

## 🚦 Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Environment Modes

- `development`: Detailed logging and error messages
- `production`: Optimized performance and minimal logging

## 📦 Dependencies

### Main Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **i18n**: Internationalization
- **cors**: CORS middleware
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **morgan**: HTTP request logger
- **nodemailer**: Email sending
- **multer**: File upload handling
- **sharp**: Image processing
- **dotenv**: Environment variable management

### Dev Dependencies

- **nodemon**: Development server with auto-restart

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**devnguyen0111**

- GitHub: [@devnguyen0111](https://github.com/devnguyen0111)
- Repository: [Digital-Ecommerce-BE](https://github.com/devnguyen0111/Digital-Ecommerce-BE)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the robust database
- All open-source contributors whose packages are used in this project

## 📞 Support

If you have any questions or issues, please open an issue in the GitHub repository.

---

**Version**: 0.0.1  
**Last Updated**: 2026

```

```
