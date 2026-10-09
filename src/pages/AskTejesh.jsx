import React, { useState, useEffect, useRef } from 'react';

const SUGGESTED_QUESTIONS = [
  "What is Tejesh currently working on?",
  "Tell me about his AI projects.",
  "How does the Campus Maintenance Agent work?",
  "What is TalentStream AI?",
  "What are Tejesh's technical interests?",
  "What does he enjoy outside technology?",
  "What are his long-term goals?"
];

export default function AskTejesh() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi there. I'm an AI assistant built to share information about Tejesh's public profile, projects, and interests. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Check if the user is resending the same failed message vs a new message
    const isRetry = error && messages.length > 0 && messages[messages.length - 1].role === 'user' && messages[messages.length - 1].content === trimmed;
    
    let newMessages;
    if (isRetry) {
        newMessages = [...messages];
    } else {
        const userMsg = { role: 'user', content: trimmed };
        newMessages = [...messages, userMsg];
        setMessages(newMessages);
    }
    
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const payloadMessages = newMessages.slice(-8);
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setError(err.message || "Failed to connect to the assistant.");
      // The user message remains in the list, so they can retry.
    } finally {
      setIsLoading(false);
      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([{ role: 'assistant', content: "Hi there. I'm an AI assistant built to share information about Tejesh's public profile, projects, and interests. What would you like to know?" }]);
      setError(null);
    }
  };

  return (
    <main id="top" className="page-resume theme-light" style={{ backgroundColor: 'var(--color-canvas-primary)', color: 'var(--color-text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="container resume-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 'var(--space-8)' }}>
        
        <header className="resume-header" style={{ marginBottom: 'var(--space-4)' }}>
          <h1 className="font-display resume-title">ASK TEJESH</h1>
          <p className="resume-text" style={{ fontSize: '1.25rem', marginTop: 'var(--space-2)' }}>
            An AI assistant about my journey, projects, and interests.
          </p>
          <p className="resume-text" style={{ fontSize: 'var(--text-size-small)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)', fontStyle: 'italic' }}>
            AI-powered answers based on Tejesh's public profile and project information. Do not submit sensitive information.
          </p>
        </header>
        
        <div className="section-divider"></div>

        <div className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: 'var(--space-6)', maxWidth: '800px', width: '100%' }}>
          
          <div className="chat-history" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingBottom: 'var(--space-4)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--color-text-primary)' : 'var(--color-border-primary)',
                color: msg.role === 'user' ? 'var(--color-canvas-primary)' : 'var(--color-text-primary)',
                padding: '16px 20px',
                borderRadius: '16px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                maxWidth: '85%',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--color-border-primary)', padding: '16px 20px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                <span style={{ display: 'inline-flex', gap: '4px' }}>
                  <span className="dot-loading" style={{ animationDelay: '0s' }}>.</span>
                  <span className="dot-loading" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="dot-loading" style={{ animationDelay: '0.4s' }}>.</span>
                </span>
              </div>
            )}
            
            {error && (
              <div style={{ alignSelf: 'center', backgroundColor: '#FFF0F0', color: '#D32F2F', border: '1px solid #FFCDD2', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', marginTop: 'var(--space-2)' }}>
                {error} <button onClick={() => handleSend(messages[messages.length-1].content)} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="suggested-questions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = 'var(--color-text-primary)';
                      e.target.style.color = 'var(--color-canvas-primary)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-area" style={{ position: 'relative', marginTop: 'auto', borderTop: '1px solid var(--color-border-secondary)', paddingTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', backgroundColor: 'var(--color-canvas-primary)', border: '1px solid var(--color-text-primary)', borderRadius: '12px', padding: '8px' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 1500))}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Tejesh..."
                disabled={isLoading}
                rows={Math.min(5, Math.max(1, input.split('\\n').length))}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  resize: 'none',
                  padding: '8px 12px',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isLoading}
                style={{
                  backgroundColor: input.trim() && !isLoading ? 'var(--color-text-primary)' : 'var(--color-border-primary)',
                  color: input.trim() && !isLoading ? 'var(--color-canvas-primary)' : 'var(--color-text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 500,
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
              >
                Send
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {input.length} / 1500 characters • Shift+Enter for new line
              </span>
              <button 
                onClick={handleClear}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear Conversation
              </button>
            </div>
          </div>
          
        </div>

      </div>

      <style>{`
        @keyframes chatLoadingDot {
          0%, 20% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
          80%, 100% { opacity: 0; transform: translateY(0); }
        }
        .dot-loading {
          animation: chatLoadingDot 1.4s infinite ease-in-out both;
          font-weight: bold;
          font-size: 1.2rem;
        }
        textarea:disabled {
          opacity: 0.7;
        }
      `}</style>
    </main>
  );
}
