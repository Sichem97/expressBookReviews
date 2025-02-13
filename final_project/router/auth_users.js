const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const reservedUsernames = ['admin', 'root', 'superuser'];
const isValid = (username) => {
    // Check if username is provided
    if (!username) {
        return false;
    }

    // Trim whitespace
    username = username.trim();

    // Check username length
    if (username.length < 3 || username.length > 20) {
        return false; // Username doesn't meet length requirements
    }

    // Check for allowed characters
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
        return false; // Username contains invalid characters
    }

    // Check for reserved usernames
    if (reservedUsernames.includes(username.toLowerCase())) {
        return false; // Username is reserved
    }

    // Check if the username already exists
    const existingUser = users.find((user) => user.username === username);
    return !existingUser;
};


const authenticatedUser = (username, password) => {
    // Find the user in the 'users' array
    const user = users.find((user) => user.username === username);

    // If user exists and passwords match, return true
    if (user && user.password === password) {
        return true;
    }

    // If user doesn't exist or passwords don't match, return false
    return false;
};


// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Authenticate the user
    if (authenticatedUser(username, password)) {
        // Generate an access token
        const accessToken = jwt.sign({ username }, 'fingerprint_customer', { expiresIn: '1h' });

        // Save the token in the session
        req.session.authorization = { accessToken };

        return res.status(200).json({ message: "User successfully logged in." });
    } else {
        return res.status(401).json({ message: "Invalid username or password." });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from URL parameters
    const review = req.query.review || req.body.review; // Get review from request query or body
    const username = req.user.username; // Get username from the authenticated user
  
    // Validate that the review text is provided
    if (!review) {
      return res.status(400).json({ message: "Review text is required." });
    }
  
    // Check if the book exists
    if (books[isbn]) {
      // Initialize the reviews object if it doesn't exist
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }
  
      // Add or update the review for the user
      books[isbn].reviews[username] = review;
  
      return res.status(200).json({
        message: "Review successfully added/updated.",
        book: {
          isbn: isbn,
          title: books[isbn].title,
          author: books[isbn].author,
          reviews: books[isbn].reviews,
        },
      });
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  });

  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;
  
    if (books[isbn]) {
      if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Your review has been deleted." });
      } else {
        return res.status(404).json({ message: "You have not reviewed this book." });
      }
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  });
  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
