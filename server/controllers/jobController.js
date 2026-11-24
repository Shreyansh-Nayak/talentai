const Job = require('../models/Job');

const getPagination = (page = 1, limit = 10) => ({
  skip:  (Number(page) - 1) * Number(limit),
  limit: Number(limit),
});

exports.getAllJobs = async (req, res) => {
  try {
    const {
      page, limit, search,
      location, type, skills, minSalary,
    } = req.query;

    const { skip, limit: lim } = getPagination(page, limit);
    const filter = { status: 'active' };

    if (search)    filter.$text     = { $search: search };
    if (location)  filter.location  = { $regex: location, $options: 'i' };
    if (type)      filter.type      = type;
    if (skills)    filter.skills    = { $in: skills.split(',') };
    if (minSalary) filter['salary.min'] = { $gte: Number(minSalary) };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .skip(skip)
        .limit(lim)
        .populate('employer', 'name email')
        .sort('-createdAt'),
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs,
      total,
      page:  Number(page) || 1,
      pages: Math.ceil(total / lim),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.viewCount += 1;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      employer: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      employer: req.user._id,
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort('-createdAt');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};