import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, sendChatMessageThunk } from '../Redux/Features/chatSlice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatPanel() {
  const dispatch = useDispatch();
  const { messages, loading, systemInstruction } = useSelector((state) => state.chat);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      parts: [{ text: input }],
    };

    dispatch(addMessage(userMessage));
    setInput('');

    const history = messages.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    await dispatch(
      sendChatMessageThunk({
        message: input,
        history,
        systemInstruction,
      })
    );
  };

  return (
    <section className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
      <h2 className="text-2xl font-bold text-black mb-4">AI Assistant Chat</h2>

      {/* Chat History */}
      <div className="bg-primary-3/30 rounded-xl p-4 h-64 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-black/60 text-center">
            Ask questions about the analysis results...
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-primary-1 text-white'
                    : 'bg-primary-3 text-black'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.parts[0].text}</p>
                ) : (
                  <div className="prose prose-sm max-w-none markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Tables
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-2">
                            <table className="min-w-full border-collapse border border-gray-300" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-primary-2/30" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th className="border border-gray-300 px-3 py-2 text-left font-semibold" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="border border-gray-300 px-3 py-2" {...props} />
                        ),
                        // Lists
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside my-2 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside my-2 space-y-1" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="ml-2" {...props} />
                        ),
                        // Code blocks
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code className="bg-gray-200 text-red-600 px-1 py-0.5 rounded text-sm" {...props} />
                          ) : (
                            <code className="block bg-gray-100 p-3 rounded my-2 overflow-x-auto text-sm" {...props} />
                          ),
                        pre: ({ node, ...props }) => (
                          <pre className="bg-gray-100 p-3 rounded my-2 overflow-x-auto" {...props} />
                        ),
                        // Headers
                        h1: ({ node, ...props }) => (
                          <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-base font-bold mt-2 mb-1" {...props} />
                        ),
                        // Paragraphs
                        p: ({ node, ...props }) => (
                          <p className="my-2 leading-relaxed" {...props} />
                        ),
                        // Strong and emphasis
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic" {...props} />
                        ),
                        // Links
                        a: ({ node, ...props }) => (
                          <a className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" {...props} />
                        ),
                        // Blockquotes
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
                        ),
                        // Horizontal rule
                        hr: ({ node, ...props }) => (
                          <hr className="my-4 border-gray-300" {...props} />
                        ),
                      }}
                    >
                      {message.parts[0].text =='Undefined' ? 'Sorry, Something went wrong, Try again.' : message.parts[0].text }
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-primary-3 text-black p-3 rounded-xl">
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Thinking...
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-primary-3/50 border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-primary-2 to-primary-1 text-white font-semibold rounded-xl hover:from-primary-2/90 hover:to-primary-1/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </form>
    </section>
  );
}

export default ChatPanel;