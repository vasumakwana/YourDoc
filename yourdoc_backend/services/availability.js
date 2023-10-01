const db = require('./db');
const helper = require('../helper');
const { v4: uuid } = require('uuid');

async function getByDoctorId(doctorId) {
  const rows = await db.query(
    `SELECT day, from_time, to_time FROM availability WHERE user_id='${doctorId}'`
  );
  const data = helper.emptyOrRows(rows);

  return { data }
}

async function createByPool(availabilities) {
  const queries = availabilities.map(av => {
    const { day, from_time, to_time, doctor_id } = av;
    const id = uuid();

    return `INSERT INTO availability (id, day, from_time, to_time, user_id) VALUES ('${id}', '${day}', '${from_time}', '${to_time}', '${doctor_id}');`
  });

  await db.poolExecute(queries);

}

async function create(availability) {

  const { day, from_time, to_time, doctor_id } = availability;
  const id = uuid();

  const result = await db.query(
    `INSERT INTO availability (id, day, from_time, to_time, user_id) VALUES ('${id}', '${day}', '${from_time}', '${to_time}', '${doctor_id}');`
  );

  let message = 'Error in creating availability';

  if (result.affectedRows) {
    message = 'Availability created successfully';
  }

  return { message, id };
}

async function updateOrCreateByPool(availabilities) {

  const queries = availabilities.map(av => {
    const { day, from_time, to_time, doctor_id } = av;
    return `UPDATE availability SET from_time='${from_time}',to_time='${to_time}' WHERE day='${day}' and user_id='${doctor_id}';`
  })

  const results = await db.poolExecute(queries);

  let message = 'Error in updating availability';

  if (results.length && results[0].affectedRows) {
    message = 'Availability updated successfully';
  } else {
    return createByPool(availabilities);
  }

  return { message };
}
async function updateOrCreate(availability) {
  const { day, from_time, to_time, doctor_id } = availability;

  const result = await db.query(
    `UPDATE availability SET from_time='${from_time}',to_time='${to_time}' WHERE day='${day}' and user_id='${doctor_id}';`
  );

  let message = 'Error in updating availability';

  if (result.affectedRows) {
    message = 'Availability updated successfully';
  } else if (result.affectedRows === 0) {
    return create(availability);
  }

  return { message };
}

module.exports = { getByDoctorId, create, updateOrCreate, createByPool, updateOrCreateByPool }