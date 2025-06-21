# 📚 Online Book Review Application - Backend API

A complete RESTful API backend for an online book review application built with **Node.js** and **Express.js**. Features JWT authentication, concurrent user support, and demonstrates multiple asynchronous programming patterns.

## 🎯 Features

### 👤 General Users (No Authentication Required)
- ✅ `GET /books` – Retrieve all books
- ✅ `GET /books/isbn/:isbn` – Search book by ISBN
- ✅ `GET /books/author/:author` – Search books by author
- ✅ `GET /books/title/:title` – Search books by title
- ✅ `GET /books/:isbn/reviews` – Get all reviews of a book
- ✅ `POST /users/register` – Register a new user
- ✅ `POST /users/login` – Login and return JWT token

### 🔐 Authenticated Users Only
- ✅ `PUT /books/:isbn/review` – Add/modify a review (only their own)
- ✅ `DELETE /books/:isbn/review` – Delete own review only

### 🧠 Async Programming Patterns
- ✅ **Callback Pattern** - Get all books
- ✅ **Promise Pattern** - Search by ISBN
- ✅ **Async/Await Pattern** - Search by author & title

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn package manager

### Installation

1. **Clone/Download the project files**

2. **Install dependencies:**
```bash
npm install
```

3. **Create the data directory and add books.json:**
```bash
mkdir data
# Copy the books.json file to the data/ directory
```

4. **Start the server:**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

5. **Test the client functions:**
```bash
npm test
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
BOOK-REVIEW/
├── book-review-api/
│   ├── data/
│   │   └── books.json            # Sample book data (static)
│   ├── client.js                 # Axios client (demonstrates callback, promise, async/await)
│   ├── server.js                 # Express API server
│
├── node_modules/                # Installed dependencies
├── package-lock.json            # Dependency lock file
├── package.json                 # Project config and dependencies
└── README.md                    # Project documentation

```

## 🔧 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
For protected routes, include JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📖 API Endpoints

### 1. Get All Books
```http
GET /books
```

**Response:**
```json
{
  "success": true,
  "data": {
    "9780061120084": {
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "publication_year": 1960,
      "isbn": "9780061120084",
      "genre": "Fiction"
    }
  },
  "message": "Books retrieved successfully"
}
```

### 2. Search Book by ISBN
```http
GET /books/isbn/9780061120084
```

**Response:**
```json
{
  "success": true,
  "data": {
    "9780061120084": {
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee"
    }
  },
  "message": "Book found successfully"
}
```

### 3. Search Books by Author
```http
GET /books/author/Harper Lee
```

**Response:**
```json
{
  "success": true,
  "data": {
    "9780061120084": {
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee"
    }
  },
  "count": 1,
  "message": "Books by author containing \"Harper Lee\" found"
}
```

### 4. Search Books by Title
```http
GET /books/title/mockingbird
```

**Response:**
```json
{
  "success": true,
  "data": {
    "9780061120084": {
      "title": "To Kill a Mockingbird"
    }
  },
  "count": 1,
  "message": "Books with title containing \"mockingbird\" found"
}
```

### 5. Get Book Reviews
```http
GET /books/9780061120084/reviews
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isbn": "9780061120084",
    "book_title": "To Kill a Mockingbird",
    "reviews": {
      "john_doe": {
        "rating": 5,
        "review": "Excellent book!",
        "reviewedAt": "2025-06-21T10:30:00.000Z",
        "username": "john_doe"
      }
