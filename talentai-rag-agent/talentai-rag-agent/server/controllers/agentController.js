const ChatSession = require('../models/ChatSession');
const { runAgent } = require('../services/agentService');

const MAX_HISTORY_TURNS = 10; // last N messages sent as context, keeps prompt size bounded

// POST /api/agent/chat
// body: { message: string, sessionId?: string }
exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
    }
    if (!session) {
      session = await ChatSession.create({ user: req.user._id, messages: [] });
    }

    const history = session.messages.slice(-MAX_HISTORY_TURNS);

    const { reply, toolTrace } = await runAgent({
      user: req.user,
      history,
      message,
    });

    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: reply });
    await session.save();

    // toolTrace is returned so the frontend can optionally show
    // "used: search_jobs" badges - nice transparency touch, and useful
    // for demoing the agent's reasoning in an interview.
    res.json({
      sessionId: session._id,
      reply,
      toolTrace: toolTrace.map((t) => ({ tool: t.tool, args: t.args })),
    });
  } catch (err) {
    console.error('Agent chat error:', err.message);
    res.status(500).json({ message: 'Agent failed to respond. Try again.' });
  }
};

// GET /api/agent/sessions - list current user's chat sessions (most recent first)
exports.listSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .select('messages updatedAt')
      .sort('-updatedAt')
      .limit(20)
      .lean();

    res.json(
      sessions.map((s) => ({
        id: s._id,
        preview: s.messages[0]?.content?.slice(0, 60) || 'New conversation',
        updatedAt: s.updatedAt,
        messageCount: s.messages.length,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/agent/sessions/:id - full transcript of one session
exports.getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
