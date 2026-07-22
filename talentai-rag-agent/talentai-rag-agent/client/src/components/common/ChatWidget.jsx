import { useState, useRef, useEffect } from 'react';
import { sendAgentMessageAPI } from '../../api/agentAPI';

const TOOL_LABELS = {
  search_jobs: '🔍 Searched jobs',
  get_company_info: '🏢 Looked up company',
  rag_search: '📚 Searched knowledge base',
  get_my_application_status: '📋 Checked your applications',
};

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! I'm the TalentAI assistant. Ask me about jobs, companies, your applications, or how any of the AI tools work.",
  toolTrace: [],
};

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-sm'
            : 'bg-gray-800 text-gray-100 rounded-bl-sm'
        }`}
      >
        {msg.content}
        {msg.toolTrace?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.toolTrace.map((t, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900/60 text-gray-400 border border-gray-700"
              >
                {TOOL_LABELS[t.tool] || t.tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const { reply, toolTrace, sessionId: newSessionId } = await sendAgentMessageAPI(
        text,
        sessionId
      );
      setSessionId(newSessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, toolTrace }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-transform duration-150"
      >
        {open ? '✕' : '⚡'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-8rem)] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 bg-gray-950">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TalentAI Assistant
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-800 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about jobs, companies, your applications..."
              className="flex-1 bg-gray-800 text-gray-100 text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
