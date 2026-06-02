const User = require('../models/User');

async function listResidents(req, res, next) {
  try {
    const filter = { role: 'resident' };
    const { apartment } = req.query;

    if (apartment) {
      filter.apartment = new RegExp(apartment.trim(), 'i');
    }

    const residents = await User.find(filter)
      .select('name email apartment phone')
      .sort({ apartment: 1 })
      .limit(50);

    res.json({ residents });
  } catch (err) {
    next(err);
  }
}

module.exports = { listResidents };
