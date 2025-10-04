import React, { useState } from "react";
import { getHint, getContextualHint } from "../utils/api";

function HintChatbot({ isOpen, onClose }) {
  const [hints, setHints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHint = async (level) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await getHint(level);
      const newHint = {
        type: "ai",
        text: res.data.hint,
        level: level,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHints([...hints, newHint]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get hint");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContextualHint = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await getContextualHint();
      const newHint = {
        type: "ai",
        text: res.data.hint,
        level: "contextual",
        timestamp: new Date().toLocaleTimeString(),
      };
      setHints([...hints, newHint]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get contextual hint");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHints = () => {
    setHints([]);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[500px] flex flex-col">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-lg font-bold">AI Hints</h2>
          </div>
          <div className="flex items-center gap-2">
            {hints.length > 0 && (
              <button
                onClick={clearHints}
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-all"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Compact Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 max-h-[200px]">
          {hints.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-xs">Click a button to get hints!</p>
            </div>
          )}

          {hints.map((hint, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-gray-800 text-xs leading-relaxed">{hint.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{hint.timestamp}</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                      {hint.level === "contextual" ? "Smart" : `Lvl ${hint.level}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500 text-xs">Thinking...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}
        </div>

        {/* Compact Action Buttons */}
        <div className="p-3 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="grid grid-cols-4 gap-1 mb-1">
            <button
              onClick={() => fetchHint(1)}
              disabled={isLoading}
              className="px-2 py-1.5 bg-gradient-to-r from-green-400 to-green-500 text-white rounded text-xs font-semibold hover:from-green-500 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              title="Easy Hint"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Easy
            </button>
            <button
              onClick={() => fetchHint(2)}
              disabled={isLoading}
              className="px-2 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded text-xs font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              title="Medium Hint"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Medium
            </button>
            <button
              onClick={() => fetchHint(3)}
              disabled={isLoading}
              className="px-2 py-1.5 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded text-xs font-semibold hover:from-red-500 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              title="Hard Hint"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Hard
            </button>
            <button
              onClick={fetchContextualHint}
              disabled={isLoading}
              className="px-2 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded text-xs font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              title="Smart Hint"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Smart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HintChatbot;