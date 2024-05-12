const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
const pdf = require('html-pdf');
const path = require('path');
app.use(express.json());

// Connect to MongoDB
const DB_URI = 'mongodb+srv://sumitpathakofficial914:qxVRDWGqYWFUJJie@cluster0.74nis0y.mongodb.net/';
mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Define user schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.send('Server Run Successfully!');
});
// Route for user registration
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ statuscode:400, message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    res.status(201).json({statuscode:201, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({statuscode:500 , message: 'Internal server error' });
  }
});

// Route for user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({statuscode:400, message: 'User not found' });
      }
  
      // Check if password is correct
      if (user.password !== password) {
        return res.status(401).json({ statuscode: 401, message: 'Invalid password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, 'chatgptlikechatboat');
  
      res.json({ statuscode: 201, message: 'Login successful', token, user: [{
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }]});
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({statuscode:500 , message: 'Internal server error' });
    }
  });

  app.post('/generate-pdf', (req, res) => {
    // Data received from frontend
    const { html } = req.body;
  
    // Options for PDF generation
    const options = {
      format: 'Letter'
    };
  
    // Generate PDF from HTML
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        return res.status(500).send(err);
      }
  
      // Send PDF as response
      res.contentType("application/pdf");
      res.send(buffer);
    });
  });

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
