function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

function createdAtFilter(period) {
  if (!period) return null;
  const now = new Date();
  if (period === 'today') {
    return { $gte: startOfDay(now) };
  }
  if (period === 'week') {
    return { $gte: daysAgo(7) };
  }
  if (period === 'month') {
    return { $gte: daysAgo(30) };
  }
  return null;
}

module.exports = { startOfDay, daysAgo, createdAtFilter };
