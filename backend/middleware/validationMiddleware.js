const validateEmployee = (req, res, next) => {
  const { name, email, role, department, salary, phone, experience, primarySkill, domain, city, state, country, timezone } = req.body;

  if (!name || !email || !role || !department || !salary || !primarySkill || !domain || !city || !state || !country || !timezone) {
    return res.status(400).json({ message: 'Missing required employee fields' });
  }

  // Validate email format (allowing placeholders <EMAIL> for easy beginner testing)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) && !(email.startsWith('<') && email.endsWith('>'))) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate experience (must be positive number)
  if (experience !== undefined && (typeof experience !== 'number' || experience < 0)) {
    return res.status(400).json({ message: 'Experience must be a positive number' });
  }

  // Validate phone format if provided
  if (phone) {
    const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
    if (!phoneRegex.test(phone) && !(phone.startsWith('<') && phone.endsWith('>'))) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
  }

  next();
};

const validateRegister = (req, res, next) => {
  const { name, email, password, role, department, salary, primarySkill, domain, city, state, country, timezone } = req.body;
  if (!name || !email || !password || !role || !department || !salary || !primarySkill || !domain || !city || !state || !country || !timezone) {
    return res.status(400).json({ message: 'Please provide all registration fields including password' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) && !(email.startsWith('<') && email.endsWith('>'))) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  next();
};

module.exports = {
  validateEmployee,
  validateRegister,
  validateLogin
};
