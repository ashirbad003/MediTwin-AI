import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { 
  Bot, Send, User, Sparkles, BookOpen, ShieldCheck, 
  HelpCircle, RefreshCw, MessageSquare, AlertCircle
} from 'lucide-react';

export default function PatientHealthAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am MediTwin's clinical knowledge assistant. You can ask me questions about your health conditions, lab report values, medications, or general evidence-based wellness guidelines. How can I help you today?",
      sources: [
        { title: "MediTwin Clinical Knowledge Engine", section: "Patient Guidance Protocol" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What are normal fasting blood glucose ranges?",
    "Can I take Ibuprofen with Metformin?",
    "How can I lower my cardiovascular risk naturally?",
    "What does a high triglyceride level mean on a blood test?",
    "What are early signs of hypertensive crisis?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (queryToSend = null) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await api.post('/rag/query', {
        query: query,
        mode: 'patient'
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.data.answer || res.data.response || "I could not retrieve an answer at this time.",
        sources: res.data.grounded_citations || res.data.sources || [],
        confidence: res.data.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('RAG Query Failed', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I apologize, but I encountered an error searching clinical guidelines. Please check your connection and try again.",
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
            RAG Grounded Intelligence
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          MediTwin Health Companion
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
          Ask clinical questions answered through verified medical guidelines (ACC/AHA, ADA, KDIGO) in plain, patient-friendly terms.
        </p>
      </div>

      {/* Chat Container */}
      <div style={{ 
        flex: 1, 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-lg)', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div 
                key={m.id}
                style={{ 
                  display: 'flex', 
                  flexDirection: isUser ? 'row-reverse' : 'row', 
                  gap: '12px',
                  alignItems: 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Avatar */}
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: isUser ? 'var(--primary)' : 'var(--accent-subtle)', 
                  color: isUser ? '#fff' : 'var(--accent)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 700
                }}>
                  {isUser ? <User size={18} /> : <Bot size={20} />}
                </div>

                {/* Message Bubble */}
                <div>
                  <div style={{ 
                    padding: '14px 18px', 
                    borderRadius: 'var(--radius-lg)', 
                    background: isUser ? 'var(--primary)' : 'var(--bg-subtle)', 
                    color: isUser ? '#fff' : 'var(--text-main)', 
                    border: isUser ? 'none' : '1px solid var(--border)',
                    fontSize: '0.94rem',
                    lineHeight: '1.6',
                    borderTopRightRadius: isUser ? '4px' : 'var(--radius-lg)',
                    borderTopLeftRadius: !isUser ? '4px' : 'var(--radius-lg)'
                  }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.text}</p>

                    {/* Grounded Sources Viewer */}
                    {m.sources && m.sources.length > 0 && (
                      <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '10px', 
                        borderTop: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px', opacity: 0.9 }}>
                          <BookOpen size={14} /> Grounded Clinical Sources:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {m.sources.map((s, idx) => (
                            <span 
                              key={idx}
                              style={{ 
                                background: isUser ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)', 
                                border: isUser ? 'none' : '1px solid var(--border)',
                                padding: '2px 8px', 
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              {s.document_title || s.title || s.source || 'Medical Guideline'} {s.section ? `• ${s.section}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: isUser ? 'right' : 'left' }}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', alignSelf: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                <RefreshCw size={16} className="spin-animation" />
                <span>Searching clinical guidelines and formulating verified answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div style={{ padding: '10px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a medical question (e.g., 'What are good foods for reducing blood pressure?')..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                fontSize: '0.94rem'
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              style={{
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: loading || !inputQuery.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading || !inputQuery.trim() ? 0.6 : 1
              }}
            >
              <Send size={16} /> Send
            </button>
          </form>

          <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>MediTwin AI provides educational health insights grounded in peer-reviewed clinical knowledge. Not a substitute for emergency medical care.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
