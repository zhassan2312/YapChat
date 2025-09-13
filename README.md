# YapChat - Real-time Chat Application

A modern, real-time chat application built with React, Express.js, Socket.io, and MongoDB. Features include real-time messaging, user authentication, file sharing, message search, and more.

## 🚀 Features

- **Real-time Messaging** - Instant message delivery using Socket.io
- **User Authentication** - Secure signup/login with JWT tokens
- **Email Verification** - Account verification via email
- **File Sharing** - Upload and share images with Cloudinary integration
- **Message Management** - Edit, delete, and forward messages
- **Search Functionality** - Search messages within chats and across users
- **Online Status** - See who's online in real-time
- **Typing Indicators** - See when someone is typing
- **Read Receipts** - Know when your messages are read
- **Responsive Design** - Works on desktop and mobile devices
- **Dark/Light Theme** - Toggle between themes

## 🛠️ Tech Stack

### Frontend
- **React** - User interface library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS components
- **Zustand** - State management
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Express.js** - Web application framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image hosting and management
- **Nodemailer** - Email sending

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account (for image uploads)
- Gmail account (for email verification)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zhassan2312/YapChat.git
   cd yapchat
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   CLIENT_URL=http://localhost:5175
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Email Configuration
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5001) and frontend development server (port 5175).

## 🚀 Deployment

### Deploying to Vercel

This application is configured for deployment on Vercel:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   
   In your Vercel project dashboard, add the following environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `CLIENT_URL` (your Vercel app URL)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status
- `PUT /api/auth/update-profile` - Update user profile
- `GET /api/auth/verify-email/:token` - Verify email

### Messages
- `GET /api/messages/users` - Get users for sidebar
- `GET /api/messages/:id` - Get messages with a user
- `POST /api/messages/send/:id` - Send a message
- `DELETE /api/messages/:id` - Delete a message
- `PATCH /api/messages/edit/:id` - Edit a message
- `POST /api/messages/forward-message/:id` - Forward a message
- `POST /api/messages/search-message/:id` - Search messages within a chat
- `POST /api/messages/search/` - Search users in sidebar

## 🏗️ Project Structure

```
yapchat/
├── api/
│   └── index.js              # Vercel serverless function entry point
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── lib/             # Utility libraries
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── index.js         # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   └── App.jsx         # Main React component
│   ├── public/             # Static assets
│   └── package.json
├── vercel.json             # Vercel deployment configuration
└── package.json           # Root package.json
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- HTTP-only cookies for token storage
- CORS protection
- Input validation and sanitization
- Email verification for new accounts

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Zohaib Hassan**
- GitHub: [@zhassan2312](https://github.com/zhassan2312)

## 🙏 Acknowledgments

- Socket.io for real-time functionality
- Cloudinary for image hosting
- MongoDB Atlas for database hosting
- Vercel for deployment platform
