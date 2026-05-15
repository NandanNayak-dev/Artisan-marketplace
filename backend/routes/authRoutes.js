const express = require('express');
const { signUp, signIn, firebaseGoogleAuth, firebaseGoogleSignIn, logout, getMe, forgotPassword, verifyResetOtp, resetPassword} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', logout);
router.post("/google", firebaseGoogleAuth);
router.post('/google/signin', firebaseGoogleSignIn);
router.get('/me', getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);



module.exports = router;
