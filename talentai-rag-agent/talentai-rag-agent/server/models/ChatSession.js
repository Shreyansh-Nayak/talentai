const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true, _id: false });

/**
 * Note: we deliberately only persist the final user/assistant turns,
 * not the intermediate tool-call/tool-result messages the agent
 * exchanges with Groq mid-turn. Those are reconstructed fresh each
 * request from live data anyway, so persisting them would just be
 * stale state we'd have to invalidate. This keeps stored history
 * small and cheap to replay as conversational context.
 */
const chatSessionSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
}, { timestamps: true });

chatSessionSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
