const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseAdmin");

const User = require("../models/User");

const signUp = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Return the token and user info
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      httpOnly: true,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed" });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("User found:", user);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    // Return the token and user info
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

const firebaseGoogleAuth = async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { uid, email, name } = decodedToken;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Google account email is required" });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "You are already a user. Please sign in.",
      });
    }

    if (!role || !["buyer", "seller"].includes(role)) {
      return res.status(400).json({ message: "Role is required for signup" });
    }

    user = await User.create({
      fullName: name || email,
      email,
      role,
      authProvider: "firebase",
      firebaseUid: uid,
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Google authentication successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Google authentication failed" });
  }
};

const firebaseGoogleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { email } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: "Google account email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found. Please signup first.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Google signin successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Google signin failed" });
  }
};


module.exports = { signUp, signIn, firebaseGoogleAuth, firebaseGoogleSignIn };
