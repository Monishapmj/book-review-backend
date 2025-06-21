const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

axios.defaults.timeout = 5000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 1. Get all books using CALLBACK
function getAllBooksCallback(callback) {
    console.log('📚 Fetching all books using CALLBACK...');
    axios.get(`${BASE_URL}/books`)
        .then(response => callback(null, response.data))
        .catch(error => callback(error, null));
}

// 2. Search book by ISBN using PROMISE
function getBookByISBNPromise(isbn) {
    console.log(`🔍 Searching book with ISBN "${isbn}" using PROMISE...`);
    return axios.get(`${BASE_URL}/books/isbn/${isbn}`);
}

// 3. Search by author using ASYNC/AWAIT
async function getBooksByAuthorAsync(author) {
    console.log(`👤 Searching books by author "${author}" using ASYNC/AWAIT...`);
    return await axios.get(`${BASE_URL}/books/author/${author}`);
}

// 4. Search by title using ASYNC/AWAIT
async function getBooksByTitleAsync(title) {
    console.log(`📘 Searching books by title "${title}" using ASYNC/AWAIT...`);
    return await axios.get(`${BASE_URL}/books/title/${title}`);
}

// Helper: Run all the patterns in sequence
async function runDemo() {
    console.log('\n🚀 Running Book API Demo:\n');

    // 1. CALLBACK
    await new Promise((resolve, reject) => {
        getAllBooksCallback((err, data) => {
            if (err) {
                console.error('❌ Error:', err.message);
                reject(err);
            } else {
                const bookCount = Object.keys(data.data).length;
                const sample = Object.values(data.data)[0]?.title || 'N/A';
                console.log(`✅ Found ${bookCount} books`);
                console.log('   Sample:', sample);
                resolve();
            }
        });
    });

    try {
        // 2. PROMISE
        const isbnRes = await getBookByISBNPromise('9780061120084');
        const isbnTitle = Object.values(isbnRes?.data?.data || {})[0]?.title || 'N/A';
        console.log(`✅ Found book: ${isbnTitle}`);

        // 3. ASYNC/AWAIT (Author)
        const authorRes = await getBooksByAuthorAsync('Harper Lee');
        const authorCount = 'count' in authorRes.data ? authorRes.data.count : Object.keys(authorRes.data.data || {}).length;
        const authorSample = Object.values(authorRes?.data?.data || {})[0]?.title || 'N/A';
        console.log(`✅ Found ${authorCount} book(s) by author`);
        if (authorSample !== 'N/A') console.log('   Sample:', authorSample);

        // 4. ASYNC/AWAIT (Title)
        const titleRes = await getBooksByTitleAsync('1984');
        const titleCount = 'count' in titleRes.data ? titleRes.data.count : Object.keys(titleRes.data.data || {}).length;
        const titleSample = Object.values(titleRes?.data?.data || {})[0]?.title || 'N/A';
        console.log(`✅ Found ${titleCount} book(s) by title`);
        if (titleSample !== 'N/A') console.log('   Sample:', titleSample);

        console.log('\n🎉 All operations completed.\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Only run demo if file is executed directly
if (require.main === module) {
    runDemo();
}

// Exported for testing or future extension
module.exports = {
    getAllBooksCallback,
    getBookByISBNPromise,
    getBooksByAuthorAsync,
    getBooksByTitleAsync
};
