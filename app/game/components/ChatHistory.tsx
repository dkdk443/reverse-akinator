'use client';

import { BrainCircuit, User } from 'lucide-react';

type ChatMessage = {
  type: 'ai' | 'user';
  text: string;
  highlight?: 'yes' | 'no' | 'neutral';
};

interface ChatHistoryProps {
  chatHistory: ChatMessage[];
  isAiThinking: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

function ChatBubble({ item }: { item: ChatMessage }) {
  const isAi = item.type === 'ai';
  return (
    <div className={`flex w-full mb-4 ${isAi ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-2 ml-2 ${isAi ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
          {isAi ? <BrainCircuit size={20} /> : <User size={20} />}
        </div>
        <div className={`p-3 md:p-4 rounded-2xl shadow-sm leading-relaxed ${isAi
          ? item.highlight === 'yes' ? 'bg-green-50 border border-green-200 text-gray-800'
            : item.highlight === 'no' ? 'bg-red-50 border border-red-200 text-gray-800'
              : 'bg-white border border-gray-100 text-gray-800'
          : 'bg-indigo-600 text-white'
          }`}>
          <p className="text-sm md:text-base whitespace-pre-wrap">{item.text}</p>
        </div>
      </div>
    </div>
  );
}

export function ChatHistory({ chatHistory, isAiThinking, chatEndRef }: ChatHistoryProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 scroll-smooth">
      <div className="max-w-3xl mx-auto pb-80 md:pb-72">
        {chatHistory.map((item, index) => (
          <ChatBubble key={index} item={item} />
        ))}
        {isAiThinking && (
          <div className="flex w-full mb-4 justify-start">
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
              <span className="text-xs text-gray-500">AIが思考中...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
