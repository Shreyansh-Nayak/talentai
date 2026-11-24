const { v4: uuid } = require('uuid'); // npm install uuid
const { PDFParse } = require('pdf-parse');   // was: const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const User = require('../models/User');
const Application = require('../models/Application');
const { uploadResume, getResumeDownloadUrl, deleteResume } = require('../config/s3');
const { embedText } = require('../utils/embeddings'); // port this file from talentai-rag-agent/server/utils

exports.uploadMyResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF resumes are accepted' });
    }

    const key = `resumes/${req.user._id}/${uuid()}.pdf`;
    await uploadResume(req.file.buffer, key, req.file.mimetype);

    let text = '';
    try {
      const parser = new PDFParse({ data: req.file.buffer });
      const result = await parser.getText();
      text = result.text?.slice(0, 20000) || '';
      await parser.destroy(); // release resources
    } catch (e) {
      console.error('PDF parse failed:', e.message);
    }

    const embedding = text ? await embedText(text) : null;

    // Replace any previous resume for this user (delete old S3 object too)
    const previous = await Resume.findOne({ user: req.user._id });
    if (previous) {
      await deleteResume(previous.s3Key).catch(() => { });
      await Resume.deleteOne({ _id: previous._id });
    }

    const resume = await Resume.create({
      user: req.user._id,
      s3Key: key,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      text,
      embedding: embedding || [],
    });

    // Keep User.profile.resumeURL as a pointer (store the resume doc id or s3Key, not a fake URL)
    await User.findByIdAndUpdate(req.user._id, {
      'profile.resumeURL': key, // treat as an s3Key now, resolved to a real URL on demand
    });

    res.status(201).json({ id: resume._id, fileName: resume.fileName, uploadedAt: resume.createdAt });
  } catch (err) {
    console.error('Resume upload error:', err.message);
    res.status(500).json({ message: 'Resume upload failed' });
  }
};

// Seeker fetching their own resume's download link
exports.getMyResumeUrl = async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id });
  if (!resume) return res.status(404).json({ message: 'No resume uploaded' });
  const url = await getResumeDownloadUrl(resume.s3Key);
  res.json({ url, fileName: resume.fileName, expiresIn: 300 });
};

// Recruiter fetching an applicant's resume, scoped to applications on their own jobs
exports.getApplicantResumeUrl = async (req, res) => {
  const application = await Application.findById(req.params.applicationId).populate('job');
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (application.job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const resume = await Resume.findOne({ user: application.user });
  if (!resume) return res.status(404).json({ message: 'Applicant has no resume on file' });

  const url = await getResumeDownloadUrl(resume.s3Key);
  res.json({ url, fileName: resume.fileName, expiresIn: 300 });
};

exports.deleteMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'No resume to delete' });

    await deleteResume(resume.s3Key); // remove the actual file from S3
    await Resume.deleteOne({ _id: resume._id });

    await User.findByIdAndUpdate(req.user._id, {
      'profile.resumeURL': '',
    });

    res.json({ message: 'Resume deleted' });
  } catch (err) {
    console.error('Resume delete error:', err);
    res.status(500).json({ message: 'Failed to delete resume' });
  }
};
exports.getMyResumeText = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'No resume uploaded' });
    res.json({ text: resume.text || '', fileName: resume.fileName });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resume text' });
  }
};