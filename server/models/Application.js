const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },
  resumeURL: { type: String, required: true },
  coverNote: { type: String },
  atsScore:  { type: Number, min: 0, max: 100 },
  atsFeedback: [{
    type:    { type: String, enum: ['critical','warning','success'] },
    title:   String,
    message: String,
  }],
  status: {
    type: String,
    enum: ['applied','under_review','shortlisted','interview','rejected','hired'],
    default: 'applied',
  },
}, { timestamps: true });

applicationSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);