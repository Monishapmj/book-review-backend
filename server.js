const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Load books from file
let books = {};
const booksFile = path.join(__dirname, 'data', 'books.json');
try {
    const booksData = fs.readFileSync(booksFile, 'utf8');
    books = JSON.parse(booksData);
} catch (error) {
    console.error('Error loading books data:', error);
    books = {};
}

// In-memory users and reviews
let users = {};
let reviews = {};

// JWT middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// --- BOOK ROUTES ---

app.get('/books', (req, res) => {
    res.json({ success: true, data: books, message: 'Books retrieved successfully' });
});

app.get('/books/isbn/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
    res.json({ success: true, data: { [req.params.isbn]: book } });
});

app.get('/books/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();
    const result = {};
    Object.entries(books).forEach(([isbn, book]) => {
        if (book.author.toLowerCase().includes(author)) result[isbn] = book;
    });
    res.json({ success: true, data: result });
});

app.get('/books/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();
    const result = {};
    Object.entries(books).forEach(([isbn, book]) => {
        if (book.title.toLowerCase().includes(title)) result[isbn] = book;
    });
    res.json({ success: true, data: result });
});

// Add a book
app.post('/books', (req, res) => {
    const book = req.body;
    if (!book || !book.isbn) return res.status(400).json({ success: false, error: 'ISBN is required' });
    if (books[book.isbn]) return res.status(409).json({ success: false, error: 'Book already exists' });

    books[book.isbn] = book;
    try {
        fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to save book' });
    }

    res.status(201).json({ success: true, message: 'Book added', data: { [book.isbn]: book } });
});

// Reviews
app.get('/books/:isbn/reviews', (req, res) => {
    const isbn = req.params.isbn;
    if (!books[isbn]) return res.status(404).json({ success: false, error: 'Book not found' });
    const bookReviews = reviews[isbn] || {};
    res.json({ success: true, data: { isbn, title: books[isbn].title, reviews: bookReviews } });
});

app.put('/books/:isbn/review', authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const { rating, review } = req.body;
    const username = req.user.username;

    if (!books[isbn]) return res.status(404).json({ success: false, error: 'Book not found' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5' });

    if (!reviews[isbn]) reviews[isbn] = {};
    reviews[isbn][username] = { rating, review, reviewedAt: new Date().toISOString() };

    res.json({ success: true, message: 'Review added/updated', data: reviews[isbn][username] });
});

app.delete('/books/:isbn/review', authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) return res.status(404).json({ error: 'Book not found' });
    if (!reviews[isbn] || !reviews[isbn][username]) {
        return res.status(404).json({ error: 'No review found for this user' });
    }

    delete reviews[isbn][username];
    if (Object.keys(reviews[isbn]).length === 0) delete reviews[isbn];

    res.json({ success: true, message: 'Review deleted' });
});

// --- USER ROUTES ---

app.post('/users/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (users[username]) return res.status(409).json({ error: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    users[username] = { username, password: hashed, email, registeredAt: new Date().toISOString() };

    res.status(201).json({ success: true, message: 'User registered', data: users[username] });
});

app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, expiresIn: '24h' });
});

// --- SYSTEM ---

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        total_books: Object.keys(books).length,
        total_users: Object.keys(users).length
    });
});

// 404 fallback
app.use('*', (req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`📚 Book Review API Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 Books loaded: ${Object.keys(books).length}`);
});
