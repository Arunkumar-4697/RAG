import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatArea = () => {
  const messagesEndRef = useRef(null);
  const { messages, loading } = useSelector(state => state.chat);

  const formatTime = (ts) => {
    if (!ts) return '';
    const safeTs = ts.endsWith('Z') || ts.includes('+') ? ts : ts + 'Z';
    return new Date(safeTs).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const groupSources = (sources) => {
    if (!sources || sources.length === 0) return [];
    const grouped = {};
    sources.forEach(src => {
      const name = src.file_name;
      const page = src.page !== undefined ? src.page : src.page_number;
      if (!grouped[name]) {
        grouped[name] = new Set();
      }
      if (page !== undefined && page !== null && page !== '') {
        const pagesArray = String(page).split(',').map(p => p.trim());
        pagesArray.forEach(p => grouped[name].add(p));
      }
    });
    
    return Object.keys(grouped).map(name => {
      const pages = Array.from(grouped[name]).sort((a, b) => parseInt(a) - parseInt(b));
      return {
        file_name: name,
        page: pages.length > 0 ? pages.join(', ') : null
      };
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-0 scroll-smooth">
        <div className="flex flex-col items-center justify-center h-full max-w-5xl mx-auto text-center px-4 animate-in fade-in duration-500">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-5 shadow-sm border border-blue-100 dark:border-blue-800/30">
            <MessageSquare size={28} />
          </div>
          <h2 className="text-[28px] font-semibold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">How can I help you today?</h2>
          <p className="text-gray-500 dark:text-gray-400 text-[15px] max-w-md mx-auto">
            Select your documents and start asking questions to extract insights, summarize data, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-0 scroll-smooth">
      <div className="max-w-5xl mx-auto w-full space-y-8 px-4 pb-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex w-full animate-in slide-in-from-bottom-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[80%] px-5 py-3.5 bg-blue-600 text-white rounded-[24px] rounded-br-[4px] shadow-sm text-[15px] font-normal leading-relaxed flex flex-col">
                <span>{msg.content}</span>
                {msg.timestamp && (
                  <span className="text-[10px] text-blue-200 mt-1 self-end">
                    {formatTime(msg.timestamp)}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full bg-white dark:bg-[#212127] border border-gray-200 dark:border-gray-800 rounded-[24px] shadow-sm overflow-hidden flex flex-col">
                <div className="p-6">
                  <div className="text-[15px] leading-7 text-gray-800 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-0.5 prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0 prose-strong:text-blue-600 dark:prose-strong:text-blue-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.timestamp && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                      {formatTime(msg.timestamp)}
                    </div>
                  )}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50/80 dark:bg-[#1a1b1e]/50 border-t border-gray-200 dark:border-gray-800/60 mt-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {groupSources(msg.sources).map((src, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-[#2a2b32] border border-gray-200 dark:border-gray-700/80 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all max-w-full shadow-sm group">
                          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors shrink-0">
                            <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 break-words group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {src.file_name} {src.page ? `(Pg ${src.page})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start w-full animate-in fade-in">
            <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#212127] border border-gray-200 dark:border-gray-800 rounded-[20px] shadow-sm w-fit text-gray-500 dark:text-gray-400">
              <Loader2 className="animate-spin text-blue-500" size={18}/>
              <span className="text-sm font-medium">Analyzing documents...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;
