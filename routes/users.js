const router = require('express').Router();
const { User, validate } = require('../models/user');
const bcrypt = require('bcrypt');
const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // reCAPTCHA validation
    const { captchaToken } = req.body;
    if (!captchaToken) {
      return res.status(400).send({ message: 'Captcha token is required' });
    }

    const secretKey = "6LeWRIYrAAAAAC3ogykip64qUAi-lJ_oDNbKxbSn";
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    const { data: captchaRes } = await axios.post(verifyUrl);
    if (!captchaRes.success) {
      return res.status(400).send({ message: 'Captcha verification failed' });
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
