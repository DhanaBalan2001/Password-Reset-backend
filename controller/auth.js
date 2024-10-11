import User from '../model/User.js';
import crypto from 'crypto';
import sendEmail from '../util/email.js';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error in user registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error in login process' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate Gmail address
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid Gmail address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds

    const resetIdentifier = uuidv4();
    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetIdentifier}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordIdentifier = resetIdentifier;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    console.log('Reset token:', resetToken);

    const message = `
      Please click on the following link to reset your password:
      ${resetUrl}
      If you did not request this, please ignore this email.
      This link will expire in 1 hour.
    `;

    await sendEmail(
      user.email,
      'Password Reset Request',
      message,
    );

    res.status(200).json({
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error in forgot password process' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with the given reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Set the new password
    user.password = password;
    
    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error in reset password process' });
  }
};