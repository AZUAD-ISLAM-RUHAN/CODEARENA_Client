import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Maximize2, Minimize2, Copy, Download, Sparkles, Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancedCodeEditor({ 
  code, 
  setCode, 
  language, 
  setLanguage,
  isFullScreen = false,
  onFullScreenToggle,
  problemTitle,
  description
}) {
  const editorRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'cpp', label: 'C++', icon: '🔵' },
    { value: 'java', label: 'Java', icon: '☕' }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `solution.${language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'py' : 'js'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAskAi = async () => {
    if (isAiLoading) return;

    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiResponse('Analyzing your code and problem...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const baseUrl = (process.env.REACT_APP_AI_SERVICE_URL || 'http://127.0.0.1:5002').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          code: code || '',
          language,
          problemTitle: problemTitle || 'Coding Problem',
          description: description || 'Give a problem-specific hint based on the current code.',
          mode: 'hint',
          askType: 'problem-specific-hint'
        })
      });

      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'AI service request failed.'
        );
      }

      const hint =
        data?.hint ||
        data?.response ||
        data?.analysis ||
        data?.message ||
        data?.result ||
        data?.data?.hint ||
        data?.data?.response;

      if (hint) {
        setAiResponse(hint);
      } else {
        setAiResponse('AI could not generate a useful hint for this problem right now.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setAiResponse('AI service took too long to respond. Please try again.');
      } else {
        setAiResponse(
          error.message || 'Error: Could not connect to AI Service. Make sure the AI backend is running correctly.'
        );
      }
    } finally {
      clearTimeout(timeoutId);
      setIsAiLoading(false);
    }
  };

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
  }

  const monacoLanguages = {
    javascript: 'javascript',
    python: 'python',
    cpp: 'cpp',
    java: 'java'
  };

  return (
    <motion.div
      layout
      className={`relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col shadow-xl transition-all duration-300 ${
        isFullScreen ? 'fixed inset-0 z-50 m-0 rounded-none w-screen h-screen' : 'relative h-full'
      }`}
    >
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Language
          </span>
          <div className="flex gap-2 ml-2">
            {languages.map(lang => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-1 ${
                  language === lang.value
                    ? 'bg-yellow-400 text-gray-950 shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span>{lang.icon}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAskAi}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Sparkles size={18} className={isAiLoading ? 'animate-pulse' : ''} />
            <span>{isAiLoading ? 'Analyzing...' : 'Ask AI'}</span>
          </motion.button>

          <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

          <button onClick={handleCopyCode} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition relative">
            <Copy size={18} />
            {isCopied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-1 rounded">Copied!</span>}
          </button>

          <button onClick={handleDownloadCode} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition">
            <Download size={18} />
          </button>

          <button onClick={onFullScreenToggle} className="p-2 rounded-lg bg-yellow-400 text-gray-950 hover:bg-yellow-500 transition">
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 h-full">
          <Editor
            height="100%"
            language={monacoLanguages[language]}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              automaticLayout: true,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-10 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-purple-600 text-white font-bold shrink-0">
                <div className="flex items-center gap-2">
                  <Bot size={20} />
                  <span>AI Assistant</span>
                </div>
                <button onClick={() => setShowAiPanel(false)} className="hover:bg-purple-700 p-1 rounded">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 dark:text-gray-200">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Analyzing code...</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-purple-200 dark:border-purple-900/30 text-sm whitespace-pre-wrap leading-6">
                    {aiResponse}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}