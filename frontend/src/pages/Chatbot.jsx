import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Shield, AlertCircle } from 'lucide-react';
import medvisionApi from '../api/medvisionApi';
import ChatBubble from '../components/ChatBubble';

export const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      message: 'Hello! I am MedBot, your clinical assistant for pneumonia guidelines. I can answer questions regarding symptoms, diagnostic criteria (such as CURB-65), and treatment protocols. My knowledge is retrieved dynamically from clinical manuals published by the WHO, NIH, and CDC. How can I assist you today?',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chatHistoryRef = useRef(null);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message to history
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', message: userMessage }
    ]);

    setLoading(true);

    try {
      const response = await medvisionApi.ragChat(userMessage);
      
      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          message: response.answer,
          sources: response.sources || []
        }
      ]);
    } catch (err) {
      console.error(err);
      setError('MedBot was unable to process your question. Please verify the backend API is online.');
      
      // Add error card bubble to log
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          message: 'Error: Failed to fetch clinical data. Please check your connection to the server or try again later.',
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      boxSizing: 'border-box',
      paddingBottom: 'var(--space-32)' // slight adjustment to maximize chat height
    }}>
      {/* Page Title */}
      <div style={{ textAlign: 'left', marginBottom: 'var(--space-32)', flexShrink: 0 }}>
        <span className="badge-pill" style={{ marginBottom: '16px' }}>
          <Bot size={14} style={{ color: 'var(--primary)' }} />
          <span>Retrieval-Augmented Medical AI</span>
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', marginTop: '0' }}>
          MedBot Medical Chatbot
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0' }}>
          Consult clinical guidelines from WHO, CDC, and NIH. MedBot retrieves relevant document snippets and synthesizes answers using LLaMA 3.1.
        </p>
      </div>

      {/* Chat Box */}
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div style={{ position: 'relative' }}>
            <div className="chat-avatar bot" style={{ width: '36px', height: '36px' }}>
              <Bot size={18} />
            </div>
            <div 
              className="chat-status-dot" 
              style={{ position: 'absolute', right: '0', bottom: '0', border: '2px solid #FFFFFF' }}
            ></div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>MedBot Guidelines Engine</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={10} style={{ color: 'var(--success)' }} />
              Active Guidelines: WHO, CDC, NIH
            </span>
          </div>
        </div>

        {/* Chat Message History */}
        <div className="chat-history" ref={chatHistoryRef}>
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              sender={msg.sender}
              message={msg.message}
              sources={msg.sources}
            />
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="chat-bubble-row bot">
              <div className="chat-avatar bot">
                <Bot size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="chat-bubble" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderTopLeftRadius: 0 }}>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner inside Chat */}
          {error && (
            <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--danger)', fontSize: '0.8rem' }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="chat-input-bar">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about pediatric treatment, CURB-65 recommendations, or diagnostic tests..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            required
          />
          <button 
            type="submit" 
            className="btn btn-primary btn-icon-only" 
            disabled={loading || !input.trim()}
            title="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
