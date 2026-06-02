const Visit = require('../models/Visit');
const { startOfDay, daysAgo } = require('../utils/dateFilters');

async function getSummary(req, res, next) {
  try {
    const todayStart = startOfDay();
    const weekStart = daysAgo(7);
    const monthStart = daysAgo(30);

    const [
      totalVisitors,
      totalToday,
      totalWeek,
      totalMonth,
      byStatus,
      completed,
      onPremise,
    ] = await Promise.all([
      Visit.countDocuments(),
      Visit.countDocuments({ createdAt: { $gte: todayStart } }),
      Visit.countDocuments({ createdAt: { $gte: weekStart } }),
      Visit.countDocuments({ createdAt: { $gte: monthStart } }),
      Visit.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Visit.find({
        status: { $in: ['exited', 'checked_out'] },
        entryAt: { $exists: true },
        exitAt: { $exists: true },
      }).select('entryAt exitAt'),
      Visit.countDocuments({ status: { $in: ['entered', 'checked_in'] } }),
    ]);

    const statusCounts = {};
    for (const row of byStatus) {
      let key = row._id;
      if (key === 'checked_in') key = 'entered';
      if (key === 'checked_out') key = 'exited';
      statusCounts[key] = (statusCounts[key] || 0) + row.count;
    }

    const approvedVisitors = statusCounts.approved || 0;
    const rejectedVisitors = statusCounts.rejected || 0;
    const enteredVisitors =
      (statusCounts.entered || 0) + (statusCounts.exited || 0);
    const pending = statusCounts.pending || 0;

    const decided = approvedVisitors + rejectedVisitors + enteredVisitors;
    const approvalRate =
      decided > 0
        ? Math.round(
            ((approvedVisitors + enteredVisitors) / decided) * 100
          )
        : 0;
    const rejectionRate =
      decided > 0 ? Math.round((rejectedVisitors / decided) * 100) : 0;

    let avgDurationMinutes = 0;
    if (completed.length > 0) {
      const totalMs = completed.reduce(
        (sum, v) => sum + (new Date(v.exitAt) - new Date(v.entryAt)),
        0
      );
      avgDurationMinutes = Math.round(totalMs / completed.length / 60000);
    }

    const visitsByDay = await Visit.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const visitsByWeek = await Visit.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: { $isoWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 8 },
    ]);

    const frequentVisitors = await Visit.aggregate([
      {
        $group: {
          _id: { name: '$visitorName', phone: '$visitorPhone' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const peakHours = await Visit.aggregate([
      { $match: { entryAt: { $exists: true } } },
      { $group: { _id: { $hour: '$entryAt' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    res.json({
      totalVisitors,
      totalToday,
      totalWeek,
      totalMonth,
      visitorsToday: totalToday,
      approvedVisitors,
      rejectedVisitors,
      pending,
      onPremise,
      approvalRate,
      rejectionRate,
      statusCounts,
      avgDurationMinutes,
      visitsByDay: visitsByDay.map((d) => ({ date: d._id, count: d.count })),
      visitsByWeek: visitsByWeek.map((w) => ({
        week: `Week ${w._id}`,
        count: w.count,
      })),
      frequentVisitors: frequentVisitors.map((f) => ({
        visitorName: f._id.name,
        visitorPhone: f._id.phone,
        visitCount: f.count,
      })),
      peakHours: peakHours.map((h) => ({ hour: h._id, count: h.count })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
