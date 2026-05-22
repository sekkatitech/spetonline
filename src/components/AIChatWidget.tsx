import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: 'Hi! I am your AI Shopping Assistant. Looking for a new laptop or TV? I can help you find exactly what you need based on your requirements.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Response based on e-commerce context
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'That sounds like a great choice! Based on our catalog, I would recommend checking out the "Apple MacBook Pro 16" M3 Max" or the "Razer Blade 15" for those specifications. Would you like me to compare them for you?' 
      }]);
    }, 1500);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-lago-600 text-white rounded-full shadow-[0_0_20px_rgba(5,125,205,0.4)] flex items-center justify-center hover:bg-lago-500 transition-transform hover:scale-105 z-40 ${isOpen ? 'hidden' : 'flex'}`}
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
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-lago-900 border border-lago-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0a141d] p-4 border-b border-lago-800 flex justify-between items-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-lago-600/10 to-transparent"></div>
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 bg-lago-800 border border-lago-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent-cyan" />
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-sm">Sale AI Assistant</h3>
                   <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
                     <span className="text-[10px] text-lago-300 uppercase tracking-wider font-bold">Online</span>
                   </div>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-lago-400 hover:text-white relative z-10">
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#050a0f]">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                     msg.role === 'user' 
                       ? 'bg-lago-600 text-white rounded-br-sm' 
                       : 'bg-lago-800 text-white border border-lago-700 rounded-bl-sm'
                   }`}>
                     {msg.text}
                   </div>
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
                 placeholder="Ask about a product..."
                 className="flex-grow bg-lago-900 border border-lago-700 rounded-full px-4 text-sm text-white focus:outline-none focus:border-lago-500 placeholder:text-lago-500"
               />
               <button 
                 type="submit"
                 disabled={!input.trim()}
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
