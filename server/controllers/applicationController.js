const Application = require('../models/Application');
const Job         = require('../models/Job');

exports.applyToJob = async (req, res) => {
  try {
    const { jobId, coverNote } = req.body;

    // Check job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check already applied
    const existing = await Application.findOne({
      user: req.user._id,
      job:  jobId,
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Get resume URL from user profile
    const resumeURL = req.user.profile?.resumeURL || 'https://example.com/default-resume.pdf';

    // Create application
    const application = await Application.create({
      user:      req.user._id,
      job:       jobId,
      resumeURL,
      coverNote: coverNote || '',
    });

    // Add applicant to job
    await Job.findByIdAndUpdate(jobId, {
      $addToSet: { applicants: req.user._id },
    });

    // Populate for response
    const populated = await Application.findById(application._id)
      .populate('job',  'title location salary type employer')
      .populate('user', 'name email profile');

    res.status(201).json(populated);
  } catch (err) {
    console.error('Apply error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate({
        path:   'job',
        select: 'title location salary type status employer createdAt',
        populate: {
          path:   'employer',
          select: 'name email',
        },
      })
      .sort('-createdAt');

    res.json(applications);
  } catch (err) {
    console.error('Get applications error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    // Verify employer owns this job
    const job = await Job.findOne({
      _id:      req.params.jobId,
      employer: req.user._id,
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('user', 'name email profile')
      .sort('-createdAt');

    res.json(applications);
  } catch (err) {
    console.error('Get job applications error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEmployerApplications = async (req, res) => {
  try {
    // Get all jobs by this employer
    const jobs = await Job.find({ employer: req.user._id }).select('_id');
    const jobIds = jobs.map((j) => j._id);

    // Get all applications for those jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('user', 'name email profile')
      .populate('job',  'title location salary type')
      .sort('-createdAt');

    res.json(applications);
  } catch (err) {
    console.error('Get employer applications error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify employer owns the job
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    const updated = await Application.findById(application._id)
      .populate('user', 'name email profile')
      .populate('job',  'title location salary');

    res.json(updated);
  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).json({ message: err.message });
  }
};