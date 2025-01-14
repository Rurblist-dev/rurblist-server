const express = require('express');
const path = require('path');
const app = express();
const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/auth");

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Specify the views directory

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Show reset password form
router.get('/reset-password/:token', (req, res) => {
    res.render('resetPassword', { token: req.params.token });
});

module.exports = router;