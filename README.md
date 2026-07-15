# 📚 Library Management System - Backend

A RESTful backend API for a Library Management System that enables authentication, book management, borrowing, and user management.

## 🚀 Features

- User Authentication (JWT)
- Admin Authentication
- Role-Based Authorization
- CRUD Operations for Books
- Borrow & Return Books
- Student Management
- Search Books
- Secure Password Hashing
- MongoDB Database
- REST API Architecture

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv
- CORS

## Folder Structure

```
project/
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── config/
├── utils/
├── app.js
├── package.json
└── README.md
```

## Installation

```bash
git clone https://github.com/yourusername/library-management-system-backend.git

cd library-management-system-backend

npm install

npm start
```

## Environment Variables

Create a `.env` file.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key
```

## API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login

### Books

- GET /api/books
- POST /api/books
- PUT /api/books/:id
- DELETE /api/books/:id

### Students

- GET /api/students
- POST /api/students

### Borrow

- POST /api/borrow
- PUT /api/return

## Future Improvements

- Frontend (React)
- Email Notifications
- Fine Management
- Dashboard Analytics
- Barcode Scanner
- Book Reservation

## Author

Hemant
