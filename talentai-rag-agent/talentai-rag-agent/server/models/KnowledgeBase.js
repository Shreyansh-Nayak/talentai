const mongoose = require('mongoose');
const { embedText } = require('../utils/embeddings');

/**
 * Static-ish knowledge the agent can retrieve for "how does X work"
 * style questions that aren't about a specific Job or Company record
 * (ATS scoring, verification, policies, etc). Seeded via
 * scripts/seedKnowledgeBase.js and editable like any other collection
 * if you want an admin UI for it later.
 */
const knowledgeBaseSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  category: {
    type: String,
    enum: ['platform', 'ats', 'employer', 'seeker', 'account', 'general'],
    default: 'general',
  },
  embedding: { type: [Number], default: [], select: true },
}, { timestamps: true });

knowledgeBaseSchema.pre('save', async function () {
  if (!this.isModified('content') && !this.isModified('title')) return;

  try {
    this.embedding = await embedText(`${this.title}. ${this.content}`);
  } catch (err) {
    console.error('KnowledgeBase embedding failed:', err.message);
  }
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
