function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error',
  });
}

module.exports = errorHandler;
