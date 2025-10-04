import React, { useState } from "react";
import { startGame, guessWord } from "../utils/api";
import Tile from "../components/Tile";
import { useNavigate } from "react-router-dom";
// import HintChatbot from "./HintChatbot.jsx";

function Game() {
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showHintChatbot, setShowHintChatbot] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const res = await startGame(token);
      setGuesses([]);
      setMsg(res.data.message || "🎮 Game started! Guess a 5-letter word.");
      setGameStarted(true);
      setGameCompleted(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Failed to start game. Please try again.";
      setMsg(errorMsg);
      if (err.response?.status === 403) {
        // Daily limit reached
        setGameStarted(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuess = async () => {
    if (input.length !== 5) {
      setMsg("⚠️ Please enter exactly 5 letters!");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Sending guess:", input); // Debug log
      const res = await guessWord(input);
      console.log("Guess response:", res.data); // Debug log
      
      // Add the guess with colors to the display
      const newGuess = { word: input, colors: res.data.colors };
      setGuesses(prev => [...prev, newGuess]);
      setMsg(res.data.message);
      setInput("");
      
      // Check if game is completed
      if (res.data.win || res.data.remaining_attempts === 0) {
        setGameCompleted(true);
      }
    } catch (err) {
      console.error("Guess error:", err); // Debug log
      console.error("Error response:", err.response); // Debug log
      
      const errorMsg = err.response?.data?.message || "❌ Invalid guess. Try again!";
      setMsg(errorMsg);
      
      // If no active game, reset game state
      if (err.response?.status === 400) {
        setGameStarted(false);
        setGuesses([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.length === 5 && gameStarted && !gameCompleted) {
      handleGuess();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Wordle Game
              </h1>
              <p className="text-gray-500 text-sm">Guess the 5-letter word!</p>
            </div>
          </div>
          
          {/* Action Buttons - Fixed Structure */}
          <div className="flex items-center gap-3">
            {/* Get Hint Button */}
            <button
              onClick={() => setShowHintChatbot(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Get Hint
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      {/* Main Game Area */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          {/* Start Game Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleStart}
              disabled={isLoading || (gameStarted && !gameCompleted)}
              className="relative bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {gameStarted && !gameCompleted ? "Game in Progress" : "Start Game"}
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </div>

          {/* Message Display */}
          {msg && (
            <div className={`mb-6 p-4 rounded-2xl text-center font-semibold text-lg shadow-lg transform transition-all duration-300 ${
              msg.includes('✅') || msg.includes('🎉') || msg.includes('🎮') || msg.includes('Congratulations')
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300'
                : msg.includes('❌') || msg.includes('Failed') || msg.includes('Game over')
                ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300'
                : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-300'
            }`}>
              {msg}
            </div>
          )}

          {/* Input Area */}
          {gameStarted && !gameCompleted && (
            <div className="mb-8 space-y-4">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength="5"
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="TYPE HERE"
                  className="w-80 px-6 py-4 text-center text-3xl font-bold uppercase border-4 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 tracking-widest bg-gray-50"
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleGuess}
                  disabled={isLoading || input.length !== 5}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit Guess
                    </>
                  )}
                </button>
              </div>
              <p className="text-center text-gray-500 text-sm">
                Press <kbd className="px-2 py-1 bg-gray-200 rounded font-mono text-xs">Enter</kbd> to submit
              </p>
            </div>
          )}

          {/* Guesses Display */}
          {guesses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Your Guesses ({guesses.length})
                </h3>
                {gameCompleted && (
                  <button
                    onClick={handleStart}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    Play Again
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {guesses.map((g, i) => (
                  <div key={i} className="flex justify-center gap-2">
                    {g.word.split("").map((ch, j) => (
                      <Tile key={j} letter={ch} color={g.colors[j]} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!gameStarted && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-green-200 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Ready to Play?</h3>
              <p className="text-gray-500">Click "Start Game" to begin your word guessing adventure!</p>
            </div>
          )}
        </div>

        {/* <HintChatbot 
          isOpen={showHintChatbot} 
          onClose={() => setShowHintChatbot(false)} 
        /> */}

        {/* Game Instructions */}
        <div className="mt-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Play
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">🟢</span>
              <span><strong>Green:</strong> Letter is correct and in the right position</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">🟡</span>
              <span><strong>Orange:</strong> Letter is in the word but wrong position</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-500 font-bold">⚫</span>
              <span><strong>Gray:</strong> Letter is not in the word</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Game;