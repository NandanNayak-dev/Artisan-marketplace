const express = require('express');
const { signUp, signIn, firebaseGoogleAuth, firebaseGoogleSignIn} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post("/google", firebaseGoogleAuth);
router.post('/google/signin', firebaseGoogleSignIn);

module.exports = router;
