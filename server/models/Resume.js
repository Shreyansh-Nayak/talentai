const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  s3Key:      { type: String, required: true },   // e.g. resumes/<userId>/<uuid>.pdf
  fileName:   { type: String, required: true },    // original filename, for display
  mimeType:   { type: String, default: 'application/pdf' },
  size:       { type: Number },
  text:       { type: String },                    // extracted text, for RAG + fallback display
  embedding:  { type: [Number], default: [] },      // 384-dim vector from embedText()
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);