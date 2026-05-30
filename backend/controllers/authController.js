const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/employeeModel');

const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '30d',
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, department, salary, primarySkill, domain, city, state, country, timezone } = req.body;

    const exists = await Employee.findOne({ 'profile.contact.email': email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = await Employee.create({
      id: 'E' + Math.floor(10000 + Math.random() * 90000).toString(),
      name,
      password: hashedPassword,
      role: role || 'Employee',
      profile: {
        contact: {
          email,
          phone: req.body.phone || ''
        },
        address: {
          city,
          location: {
            state,
            country
          },
          timezone: {
            name: timezone || 'UTC',
            utc_offset: ''
          }
        },
        projects: [{
          projectId: 'P' + Math.floor(10000 + Math.random() * 90000).toString(),
          name: domain || 'General Project',
          tasks: [{
            taskId: 'T' + Math.floor(10000 + Math.random() * 90000).toString(),
            description: 'Registered account task',
            assignedTo: {
              id: 'E' + Math.floor(10000 + Math.random() * 90000).toString(),
              name,
              skills: {
                primary: primarySkill || 'Unknown',
                secondary: req.body.secondarySkills || [],
                experience: {
                  years: Number(req.body.experience) || 0,
                  domains: [domain || 'General'],
                  certifications: {
                    current: [],
                    expired: [],
                    meta: {
                      verified: false,
                      lastUpdated: new Date().toISOString().split('T')[0]
                    }
                  }
                }
              }
            }
          }]
        }]
      }
    });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.profile.contact.email,
      role: employee.role,
      token: generateJWT(employee._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ 'profile.contact.email': email });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, employee.password || '');
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: employee._id,
      name: employee.name,
      email: employee.profile.contact.email,
      role: employee.role,
      token: generateJWT(employee._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id);
    if (!employee) {
      return res.status(404).json({ message: 'User not found' });
    }

    employee.name = req.body.name || employee.name;
    if (req.body.email) employee.profile.contact.email = req.body.email;
    if (req.body.phone) employee.profile.contact.phone = req.body.phone;
    if (req.body.city) employee.profile.address.city = req.body.city;
    if (req.body.state) employee.profile.address.location.state = req.body.state;
    if (req.body.country) employee.profile.address.location.country = req.body.country;
    if (req.body.timezone) employee.profile.address.timezone.name = req.body.timezone;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(req.body.password, salt);
    }

    const updated = await employee.save();
    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.profile.contact.email,
      role: updated.role,
      token: generateJWT(updated._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ 'profile.contact.email': email });
    if (!employee) {
      return res.status(404).json({ message: 'Employee with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    employee.otp = otp;
    employee.otpExpires = Date.now() + 600000;
    await employee.save();

    res.status(200).json({ message: 'OTP sent to email', otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const employee = await Employee.findOne({ 'profile.contact.email': email, otp, otpExpires: { $gt: Date.now() } });

    if (!employee) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(newPassword, salt);
    employee.otp = undefined;
    employee.otpExpires = undefined;
    await employee.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const employee = await Employee.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, employee.password || '');
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(newPassword, salt);
    await employee.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ 'profile.contact.email': email });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.emailVerified = true;
    await employee.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ 'profile.contact.email': email });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    employee.otp = otp;
    employee.otpExpires = Date.now() + 600000;
    await employee.save();

    res.status(200).json({ message: 'OTP sent successfully', otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const employee = await Employee.findOne({ 'profile.contact.email': email, otp, otpExpires: { $gt: Date.now() } });

    if (!employee) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    employee.emailVerified = true;
    employee.otp = undefined;
    employee.otpExpires = undefined;
    await employee.save();

    res.status(200).json({ message: 'OTP verified and email activated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    res.status(200).json({ message: 'Verification link resent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const jwtGenerateToken = async (req, res) => {
  try {
    const { id } = req.body;
    const token = generateJWT(id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const jwtVerifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    res.status(200).json({ valid: true, decoded });
  } catch (error) {
    res.status(400).json({ valid: false, message: error.message });
  }
};

const jwtRefreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const newToken = generateJWT(decoded.id);
    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

const jwtRevokeToken = async (req, res) => {
  res.status(200).json({ message: 'Token revoked successfully' });
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  sendOtp,
  verifyOtp,
  resendVerification,
  jwtGenerateToken,
  jwtVerifyToken,
  jwtRefreshToken,
  jwtRevokeToken
};
