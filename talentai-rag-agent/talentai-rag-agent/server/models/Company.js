const mongoose = require('mongoose');
const { embedText } = require('../utils/embeddings');

const companySchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  logo:        { type: String },
  website:     { type: String },
  location:    { type: String },
  size:        { type: String, enum: ['1-10','11-50','51-200','201-500','500+'] },
  industry:    { type: String },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jobsPosted:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  isVerified:  { type: Boolean, default: false },

  // RAG: semantic vector, regenerated whenever name/description/industry changes.
  embedding:   { type: [Number], default: [], select: true },
}, { timestamps: true });

companySchema.pre('save', async function () {
  const relevantFieldsChanged =
    this.isModified('name') || this.isModified('description') || this.isModified('industry');
  if (!relevantFieldsChanged) return;

  try {
    const text = `${this.name}. Industry: ${this.industry || ''}. ${this.description || ''}`;
    this.embedding = await embedText(text);
  } catch (err) {
    console.error('Company embedding failed:', err.message);
  }
});

module.exports = mongoose.model('Company', companySchema);