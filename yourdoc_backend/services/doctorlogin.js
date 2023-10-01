const db = require('./db');
const helper = require('../helper');
const config = require('../dbconfig');
const bcrypt = require('bcryptjs');

async function getById(creds) {
  const { email, password } = creds;
  const result = await db.query(
    `SELECT name, type, email, is_approved, specialization, latlong
    FROM user inner join doctor on user.id = doctor.user_id where user.email='${email}' and user.password='${password}'`
  );

  let message = 'User not found!';

  if (result && result.length > 0) {
    message = 'User found successfully';
  }
  return { result, message }
}

async function doctorInfo(creds) {
  const { email, password } = creds;
  const rows = await db.query(
    `SELECT * FROM user, doctor where email='${email}' and user_id=id and is_approved=1`
  );
  const [data] = helper.emptyOrRows(rows);

  if (data) {
    const isPasswordCorrect = await bcrypt.compare(password, data.password);
    if (isPasswordCorrect) {
      return { data, message: 'success' };
    }
  }
  return { message: 'Wrong email or password!!' }

}

module.exports = {
  getById,
  doctorInfo
}