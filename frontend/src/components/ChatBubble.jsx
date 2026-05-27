import React from 'react';
import { Bot, User, FileText } from 'lucide-react';

export const ChatBubble = ({ message, sender, sources }) => {
  const isUser = sender === 'user';

  return (
    <div className={`chat-bubble-row ${isUser ? 'user' : 'bot'}`}>
      {/* Avatar */}
      <div className={`chat-avatar ${isUser ? 'user' : 'bot'}`}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>

      {/* Bubble Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }}>
        <div className="chat-bubble">
          <p style={{ margin: 0, color: isUser ? '#FFFFFF' : 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {message}
          </p>

          {/* Sources for Bot */}
          {!isUser && sources && sources.length > 0 && (
            <div className="chat-sources">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <FileText size={12} style={{ color: 'var(--primary)' }} />
                <span>Reference Sources:</span>
              </div>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.75rem' }}>
                {sources.map((src, idx) => (
                  <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                    {typeof src === 'string' ? src : src.metadata?.source || src}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
