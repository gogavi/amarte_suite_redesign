import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMartinaInitialGreeting, getMartinaResponse, Message } from '../../services/martinaService';

interface MartinaWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserMessage?: string;
}

export default function MartinaWidget({ isOpen, onClose, initialUserMessage }: MartinaWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Cargar mensaje inicial de Martina al abrir
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: 'martina',
        text: getMartinaInitialGreeting(),
        timestamp: new Date()
      };

      if (initialUserMessage) {
        const userMessage: Message = {
          id: 'initial-user-msg',
          sender: 'user',
          text: initialUserMessage,
          timestamp: new Date()
        };

        setMessages([welcomeMessage, userMessage]);
        setIsTyping(true);

        timer = setTimeout(() => {
          const responseText = getMartinaResponse(initialUserMessage);
          const martinaMessage: Message = {
            id: Math.random().toString(),
            sender: 'martina',
            text: responseText,
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, martinaMessage]);
          setIsTyping(false);
        }, 1200);
      } else {
        setMessages([welcomeMessage]);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, initialUserMessage]);

  useEffect(() => {
    // Auto scroll al último mensaje
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsgText = inputValue;
    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular retraso de escritura de Martina
    setTimeout(() => {
      const responseText = getMartinaResponse(userMsgText);
      const martinaMessage: Message = {
        id: Math.random().toString(),
        sender: 'martina',
        text: responseText,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, martinaMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="fixed bottom-6 right-6 w-full max-w-md h-[550px] rounded-brand glass-panel overflow-hidden shadow-2xl flex flex-col z-martina border border-white/10"
        >
          {/* Cabecera del chat */}
          <div className="bg-gradient-to-r from-bg-dark to-surface-card p-4 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-orbital/20 border border-cyan-orbital flex items-center justify-center">
                <span className="text-xl">👩‍🚀</span>
              </div>
              <div>
                <h3 className="font-heading text-sm text-white tracking-wide">Martina</h3>
                <span className="text-xs text-cyan-orbital flex items-center gap-1 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Anfitriona Digital
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gris-medio hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo del chat con mensajes */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-bg-dark/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-brand px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-magenta-digital text-white rounded-tr-none'
                      : 'bg-surface-card border border-white/5 text-white rounded-tl-none'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-surface-card border border-white/5 rounded-brand rounded-tl-none px-4 py-3">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-orbital animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-orbital animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-orbital animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de envío */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-surface-card">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje o pregunta..."
                className="flex-grow bg-bg-dark border border-white/10 rounded-brand px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-orbital focus:ring-1 focus:ring-cyan-orbital transition-all"
              />
              <button
                type="submit"
                className="bg-magenta-digital hover:bg-magenta-digital/95 text-white font-heading text-sm px-4 py-2 rounded-brand transition-colors glow-magenta"
              >
                Enviar
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
