const mongoose = require('mongoose');
const { embedText } = require('../utils/embeddings');

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

  // RAG: semantic vector for this job, regenerated whenever the
  // title/description/skills change. Used by ragService for
  // similarity search alongside Mongo's text index.
  embedding:  { type: [Number], default: [], select: true },
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

jobSchema.pre('save', async function () {
  const relevantFieldsChanged =
    this.isModified('title') || this.isModified('description') || this.isModified('skills');
  if (!relevantFieldsChanged) return;

  try {
    const text = `${this.title}. ${this.description}. Skills: ${(this.skills || []).join(', ')}`;
    this.embedding = await embedText(text);
  } catch (err) {
    // Never let an embedding failure block a job post - RAG is a value-add,
    // not a critical path. Log and move on; a backfill script can retry later.
    console.error('Job embedding failed:', err.message);
  }
});

module.exports = mongoose.model('Job', jobSchema);