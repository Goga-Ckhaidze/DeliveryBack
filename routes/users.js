const router = require('express').Router();
const { User, validate } = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // Validate role explicitly (optional, since Joi does it, but extra safety)
    const { role } = req.body;
    if (!['customer', 'delivery'].includes(role)) {
      return res.status(400).send({ message: 'Invalid role selected' });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(409).send({ message: 'User with given email already exists' });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({ 
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
    });

    await newUser.save();

    const token = newUser.generateAuthToken();
    res.status(201).send({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
