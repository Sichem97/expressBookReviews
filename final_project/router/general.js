const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Validate that both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if the username is already taken
    if (!isValid(username)) {
      return res.status(409).json({ message: "Username already exists. Please choose another one." });
    }
  
    // Add the new user to the users array
    users.push({ username: username, password: password });
  
    return res.status(201).json({ message: "User successfully registered. You can now log in." });
  });

  public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      const reviews = book.reviews;
      res.status(200).json(reviews);
    } else {
      res.status(404).json({ message: "Book not found." });
    }
  });
  


// Get the book list available in the shop
public_users.get('/',function (req, res) {
    let getBooks = new Promise((resolve, reject) => {
        // Simulate an asynchronous operation using setTimeout
        setTimeout(() => {
            resolve(books);
        }, 200); // Simulating a 200ms delay
    });

    getBooks.then((bookList) => {
        res.status(200).json(bookList);
    }).catch((error) => {
        res.status(500).json({ message: "Error retrieving books." });
    });
  return res.status(300).json(books);
});


// Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const getBookByISBN = function(isbn) {
        return new Promise((resolve, reject) => {
            // Simulate an asynchronous operation
            setTimeout(() => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject("Book not found");
                }
            }, 200); // Simulating a 200ms delay
        });
    };

    const isbn = req.params.isbn;

    getBookByISBN(isbn)
        .then((book) => {
            res.status(200).json(book);
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});

  


// Get book details based on author

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

// Get book details based on author using Promises
public_users.get('/author/:author', function (req, res) {
    const getBooksByAuthor = function(author) {
        return new Promise((resolve, reject) => {
            // Simulate an asynchronous operation
            setTimeout(() => {
                const authorName = author.toLowerCase();
                const booksByAuthor = Object.keys(books)
                    .map((isbn) => ({ isbn: isbn, ...books[isbn] }))
                    .filter((book) => book.author.toLowerCase() === authorName);
                
                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject("No books found by this author.");
                }
            }, 200); // Simulating a 200ms delay
        });
    };

    const author = req.params.author;

    getBooksByAuthor(author)
        .then((booksByAuthor) => {
            res.status(200).json(booksByAuthor);
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});


// Get all books based on title
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  
  // Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
    const getBooksByTitle = function(title) {
        return new Promise((resolve, reject) => {
            // Simulate an asynchronous operation
            setTimeout(() => {
                const searchTitle = title.toLowerCase();
                const booksByTitle = Object.keys(books)
                    .map((isbn) => ({ isbn: isbn, ...books[isbn] }))
                    .filter((book) => book.title.toLowerCase() === searchTitle);

                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject("No books found with this title.");
                }
            }, 200); // Simulating a 200ms delay
        });
    };

    const title = req.params.title;

    getBooksByTitle(title)
        .then((booksByTitle) => {
            res.status(200).json(booksByTitle);
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      const reviews = book.reviews;
  
      // Check if there are any reviews
      if (reviews && Object.keys(reviews).length > 0) {
        res.status(200).json(reviews);
      } else {
        res.status(200).json({ message: "No reviews available for this book." });
      }
    } else {
      res.status(404).json({ message: "Book not found." });
    }
});

module.exports.general = public_users;
