const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const user = require('../services/patient_login');
const authenticate = require('../authenticateUser');

router.get('/', authenticate, async function (req, res, next) {
  try {
    res.json(await user.getById(req.body));
  } catch (err) {
    console.error(`Error while getting patient `, err.message);
    next(err);
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { data, message } = await user.patientInfo(req.body);
    if (!data) {
      return res.status(401).json({ message });
    }
    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
    res.cookie('session', accessToken);
    res.json({ data: accessToken, message });
  } catch (err) {
    console.error('Error while authenticating patient', err.message);
    next(err);
  }
});

module.exports = router;