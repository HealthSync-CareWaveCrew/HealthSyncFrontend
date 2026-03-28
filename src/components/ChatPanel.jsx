// ChatPanel.jsx
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, sendChatMessageThunk } from '../Redux/Features/chatSlice';

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

    dispatch(addMessage({ role: 'user', parts: [{ text: input }] }));
    setInput('');

    const history = messages.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    await dispatch(sendChatMessageThunk({ message: input, history, systemInstruction }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[500px]">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
        <p className="text-sm text-gray-500 mt-1">Ask questions about your diagnosis</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Ask questions about the analysis results...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-1 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.parts[0].text}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-600">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-200 p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          disabled={loading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-primary-1 text-white rounded hover:bg-primary-2 disabled:opacity-50 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;