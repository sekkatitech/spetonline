import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface ChatProduct {
  name: string;
  brand?: string | null;
  price?: number | null;
  url: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  products?: ChatProduct[];
}

const GREETING: ChatMessage = {
  role: 'assistant',
  text: "Hi! I'm the SPET Online shopping assistant. Looking for a laptop, a printer or something else? Tell me what you need and your budget, and I'll find options for you.",
};

const formatRand = (n: number) => `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AIChatWidget() {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hidden unless switched on in /admin → AI Features
  useEffect(() => {
    supabase
      .from('ai_features')
      .select('enabled')
      .eq('key', 'chat_assistant')
      .maybeSingle()
      .then(({ data }) => setEnabled(data?.enabled === true));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    const next = [...messages, { role: 'user' as const, text }];
    setMessages(next);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The greeting is UI-only; the conversation sent to Claude starts at the customer's first message.
        body: JSON.stringify({ messages: next.slice(1).map(({ role, text }) => ({ role, text })) }),
      });
      const data = await res.json().catch(() => ({}));
      setMessages(prev => [...prev, res.ok
        ? { role: 'assistant', text: data.reply, products: data.products }
        : { role: 'assistant', text: data.error || 'Sorry, something went wrong. Please try again.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't connect. Please check your internet and try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!enabled) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open shopping assistant"
        className={`fixed bottom-24 right-5 w-14 h-14 bg-lago-600 text-white rounded-full shadow-[0_0_20px_rgba(5,125,205,0.4)] flex items-center justify-center hover:bg-lago-500 transition-transform hover:scale-105 z-40 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Bot className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-orange rounded-full border-2 border-[#0a141d]"></span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:w-[400px] h-[500px] max-h-[80vh] bg-lago-900 border border-lago-700 rounded-2xl shadow-2xl flex flex-col z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0a141d] p-4 border-b border-lago-800 flex justify-between items-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-lago-600/10 to-transparent"></div>
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 bg-lago-800 border border-lago-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent-cyan" />
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-sm">SPET Shopping Assistant</h3>
                   <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
                     <span className="text-[10px] text-lago-300 uppercase tracking-wider font-bold">AI · Online</span>
                   </div>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} aria-label="Close" className="text-lago-400 hover:text-white relative z-10">
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#050a0f]">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                     msg.role === 'user'
                       ? 'bg-lago-600 text-white rounded-br-sm'
                       : 'bg-lago-800 text-white border border-lago-700 rounded-bl-sm'
                   }`}>
                     {msg.text}
                   </div>
                   {msg.products && msg.products.length > 0 && (
                     <div className="mt-2 flex flex-col gap-2 max-w-[85%] w-full">
                       {msg.products.map(p => (
                         <Link
                           key={p.url}
                           to={p.url}
                           onClick={() => setIsOpen(false)}
                           className="block rounded-xl border border-lago-700 bg-lago-900 px-3 py-2 hover:border-lago-500 transition-colors"
                         >
                           <span className="block text-xs font-semibold text-white line-clamp-2">{p.name}</span>
                           {typeof p.price === 'number' && (
                             <span className="block text-xs text-accent-cyan mt-0.5">{formatRand(p.price)}</span>
                           )}
                         </Link>
                       ))}
                     </div>
                   )}
                 </div>
               ))}
               {isTyping && (
                 <div className="flex justify-start">
                   <div className="bg-lago-800 border border-lago-700 rounded-2xl rounded-bl-sm px-4 py-4 flex gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-lago-500 animate-bounce"></span>
                     <span className="w-2 h-2 rounded-full bg-lago-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                     <span className="w-2 h-2 rounded-full bg-lago-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 bg-[#0a141d] border-t border-lago-800 flex gap-2">
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 maxLength={1000}
                 placeholder="Ask about a product..."
                 className="flex-grow bg-lago-900 border border-lago-700 rounded-full px-4 text-sm text-white focus:outline-none focus:border-lago-500 placeholder:text-lago-500"
               />
               <button
                 type="submit"
                 disabled={!input.trim() || isTyping}
                 aria-label="Send"
                 className="w-10 h-10 rounded-full bg-lago-600 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lago-500 transition-colors"
               >
                 <Send className="w-4 h-4 ml-0.5" />
               </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
