const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  skills:      [String],
  salary: {
    min:      { type: Number },
    max:      { type: Number },
    currency: { type: String, default: 'USD' },
  },
  location:   { type: String, required: true },
  type:       { type: String, enum: ['Full-time','Part-time','Contract','Hybrid','Remote','Freelance'], default: 'Full-time' },
  experience: { type: Number, default: 0 },
  openings:   { type: Number, default: 1 },
  employer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:     { type: String, enum: ['active','closed','draft','flagged'], default: 'active' },
  tags:       [String],
  viewCount:  { type: Number, default: 0 },
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);