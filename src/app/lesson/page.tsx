"use client";
import React, { useState, useEffect, useRef } from "react";
import "../globals.css";

const LESSON_SENTENCES = [
  "save our planet one key at a time",
  "green keys help us type and learn",
  "plant a tree and help earth breathe",
  "clean the ocean protect sea life",
];

const FINGER_MAP: Record<string, string> = {
  // Left pinky
  "q": "lpinky", "a": "lpinky", "z": "lpinky", "1": "lpinky", "!": "lpinky", "2": "lpinky", "@": "lpinky",
  // Left ring
  "w": "lring", "s": "lring", "x": "lring", "3": "lring", "#": "lring",
  // Left middle
  "e": "lmiddle", "d": "lmiddle", "c": "lmiddle", "4": "lmiddle", "$": "lmiddle",
  // Left index
  "r": "lindex", "f": "lindex", "v": "lindex", "t": "lindex", "y": "lindex", "5": "lindex", "%": "lindex", "6": "lindex", "^": "lindex",
  // Right index
  "u": "rindex", "j": "rindex", "m": "rindex", "7": "rindex", "&": "rindex", "8": "rindex", "*": "rindex",
  // Right middle
  "i": "rmiddle", "k": "rmiddle", ",": "rmiddle", "9": "rmiddle", "(": "rmiddle",
  // Right ring
  "o": "rring", "l": "rring", ".": "rring", "0": "rring", ")": "rring",
  // Right pinky
  "p": "rpinky", ";": "rpinky", "/": "rpinky", "-": "rpinky", "_": "rpinky", "=": "rpinky", "+": "rpinky", "[": "rpinky", "{": "rpinky", "]": "rpinky", "}": "rpinky", "'": "rpinky", "\"": "rpinky",
  " ": "space",
};

const FINGER_COLORS: Record<string, string> = {
  lpinky: "#FFCDD2",
  lring: "#FFE0B2",
  lmiddle: "#FFF9C4",
  lindex: "#C8E6C9",
  rindex: "#C8E6C9",
  rmiddle: "#BBDEFB",
  rring: "#E1BEE7",
  rpinky: "#F8BBD0",
  space: "#E0E0E0",
};

const FINGER_NAMES: Record<string, string> = {
  lpinky: "Left Pinky",
  lring: "Left Ring",
  lmiddle: "Left Middle",
  lindex: "Left Index",
  rindex: "Right Index",
  rmiddle: "Right Middle",
  rring: "Right Ring",
  rpinky: "Right Pinky",
  space: "Spacebar",
};

const KEYBOARD_LAYOUT = [
  { row: 1, keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"] },
  { row: 2, keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"] },
  { row: 3, keys: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"] },
];

interface LessonStats {
  wpm: number;
  accuracy: number;
  streak: number;
  ecoWords: number;
  startTime: number | null;
}

export default function LessonPage() {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [stats, setStats] = useState<LessonStats>({
    wpm: 0,
    accuracy: 100,
    streak: 0,
    ecoWords: 0,
    startTime: null,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const messageTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const currentSentence = LESSON_SENTENCES[currentSentenceIndex];

  // Initialize typing
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSentenceIndex]);

  // Calculate WPM and accuracy
  useEffect(() => {
    if (userInput.length === 0) return;

    const now = Date.now();
    const startTime = stats.startTime || now;
    const timeInMinutes = (now - startTime) / 1000 / 60;
    const words = userInput.split(" ").length;
    const wpm = Math.max(0, Math.round(words / Math.max(timeInMinutes, 0.016)));

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentSentence[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / userInput.length) * 100);

    setStats((prev) => ({
      ...prev,
      wpm,
      accuracy,
      startTime: prev.startTime || startTime,
    }));
  }, [userInput, stats.startTime, currentSentence]);

  // Calculate streak
  useEffect(() => {
    let streak = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentSentence[i]) {
        streak++;
      } else {
        break;
      }
    }
    setStats((prev) => ({ ...prev, streak }));
  }, [userInput, currentSentence]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];

    // Check if typed character matches
    if (value.length > userInput.length) {
      const expectedChar = currentSentence[userInput.length];
      if (lastChar !== expectedChar) {
        setShakeKey(lastChar);
        shakeTimeoutRef.current = setTimeout(() => setShakeKey(null), 300);
      } else {
        // Correct key pressed
        const newEcoWords = value.split(" ").length - 1;
        setStats((prev) => ({ ...prev, ecoWords: newEcoWords }));

        // Encouragement every 5 correct keys
        if (stats.streak > 0 && stats.streak % 5 === 0) {
          const encouragements = [
            "Great typing! 🌟",
            "You're doing amazing! 💚",
            "Keep it up! 🌱",
            "Fantastic! 🌍",
            "You're a pro! 🎯",
          ];
          const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
          setMessages([msg]);
          messageTimeoutRef.current = setTimeout(() => setMessages([]), 2000);
        }
      }
    }

    // Highlight next key
    if (value.length < currentSentence.length) {
      setHighlightKey(currentSentence[value.length]);
    } else {
      setHighlightKey(null);
    }

    setUserInput(value);

    // Check if lesson complete
    if (value === currentSentence) {
      setIsComplete(true);
      // Calculate stars
      let earnedStars = 1;
      if (stats.accuracy >= 90) earnedStars++;
      if (stats.wpm >= 20) earnedStars++;
      setStars(earnedStars);
    }
  };

  const handleNextLesson = () => {
    setCurrentSentenceIndex((prev) => (prev + 1) % LESSON_SENTENCES.length);
    setUserInput("");
    setIsComplete(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      streak: 0,
      ecoWords: 0,
      startTime: null,
    });
    setStars(0);
    setMessages([]);
  };

  const handleReset = () => {
    setUserInput("");
    setIsComplete(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      streak: 0,
      ecoWords: 0,
      startTime: null,
    });
    setStars(0);
    setMessages([]);
    if (inputRef.current) inputRef.current.focus();
  };

  const progressPercent = (userInput.length / currentSentence.length) * 100;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      {/* TOP NAV BAR */}
      <nav style={{
        background: "#2c3e50",
        color: "white",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <span style={{ fontSize: "16px", fontWeight: 600 }}>Lesson 3 - Home Row Keys</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ fontSize: "13px", textAlign: "center" }}>
            <div style={{ color: "#4CAF50", fontWeight: 700, fontSize: "18px" }}>{stats.wpm}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>WPM</div>
          </div>
          <div style={{ fontSize: "13px", textAlign: "center" }}>
            <div style={{ color: "#4CAF50", fontWeight: 700, fontSize: "18px" }}>{stats.accuracy}%</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Accuracy</div>
          </div>
          <div style={{ fontSize: "13px", textAlign: "center" }}>
            <div style={{ color: "#4CAF50", fontWeight: 700, fontSize: "18px" }}>{stats.streak}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Streak</div>
          </div>
          <div style={{ fontSize: "20px", letterSpacing: "4px" }}>★★★</div>
        </div>
      </nav>

      {/* PROGRESS BAR */}
      <div style={{
        height: "4px",
        background: "#e0e0e0",
        position: "relative",
      }}>
        <div
          style={{
            height: "100%",
            background: "#4CAF50",
            width: `${progressPercent}%`,
            transition: "width 0.1s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-8px",
            left: `${progressPercent}%`,
            transform: "translateX(-50%)",
            fontSize: "16px",
            transition: "left 0.1s ease",
          }}
        >
          🌿
        </div>
      </div>

      {/* LESSON INFO BAR */}
      <div style={{
        background: "white",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e0e0e0",
      }}>
        <span style={{
          background: "#E8F5E9",
          color: "#4CAF50",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 600,
        }}>
          Eco Typing · Planet Theme
        </span>
        <span style={{ color: "#666", fontSize: "14px" }}>Type the text below</span>
        <span style={{ fontSize: "18px" }}>👆</span>
      </div>

      {/* ECO SCENE STRIP */}
      <div style={{
        height: "60px",
        background: "linear-gradient(180deg, #B4E8B4 0%, #A5E0A5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "0 24px",
        borderBottom: "2px solid #4CAF50",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Animated trees */}
        <svg width="40" height="50" viewBox="0 0 40 50" style={{
          animation: "sway 2.5s ease-in-out infinite",
        }}>
          <rect x="17" y="32" width="6" height="18" fill="#6B3F1E" />
          <polygon points="20,8 32,28 8,28" fill="#2D6A4F" />
          <polygon points="20,18 28,32 12,32" fill="#40916C" />
          <polygon points="20,26 25,35 15,35" fill="#52B788" />
        </svg>

        {/* Eco counter */}
        <div style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#1B4D30",
        }}>
          {stats.ecoWords} eco words typed 🌍
        </div>

        {/* Floating leaves */}
        <div style={{
          position: "absolute",
          right: "5%",
          top: "10px",
          animation: "float 3s ease-in-out infinite",
          fontSize: "20px",
        }}>
          🍃
        </div>

        <style>{`
          @keyframes sway {
            0%, 100% { transform: rotate(-1deg); }
            50% { transform: rotate(1deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        {/* TEXT DISPLAY BOX */}
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "8px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          fontFamily: "Roboto Mono, monospace",
          fontSize: "22px",
          lineHeight: 1.8,
          minHeight: "100px",
        }}>
          {currentSentence.split("").map((char, index) => {
            let color = "#999"; // Grey - not yet typed
            if (index < userInput.length) {
              color = userInput[index] === char ? "#4CAF50" : "#f44336"; // Green correct, Red error
            }
            const isCurrentPos = index === userInput.length;
            const style: React.CSSProperties = {
              color,
              fontWeight: userInput[index] === char ? 600 : 400,
              display: "inline",
              position: "relative",
            };
            if (isCurrentPos) {
              style.borderBottom = "2px solid #2196F3";
              style.animation = "blink 1s infinite";
            }
            if (userInput[index] !== char && index < userInput.length) {
              style.background = "rgba(244, 67, 54, 0.2)";
            }
            return <span key={index} style={style}>{char}</span>;
          })}
        </div>

        {/* LESSON SELECTOR */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {LESSON_SENTENCES.map((sentence, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isComplete) {
                  setCurrentSentenceIndex(index);
                  setUserInput("");
                  setStats({
                    wpm: 0,
                    accuracy: 100,
                    streak: 0,
                    ecoWords: 0,
                    startTime: null,
                  });
                }
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: currentSentenceIndex === index ? "2px solid #4CAF50" : "1px solid #ddd",
                background: currentSentenceIndex === index ? "#E8F5E9" : "white",
                color: currentSentenceIndex === index ? "#4CAF50" : "#666",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {sentence}
            </button>
          ))}
        </div>

        {/* TYPING INPUT */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Click here and start typing..."
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            fontFamily: "Roboto Mono, monospace",
            border: "2px solid #4CAF50",
            borderRadius: "8px",
            marginBottom: "32px",
            boxSizing: "border-box",
          }}
          disabled={isComplete}
        />

        {/* VIRTUAL KEYBOARD */}
        <div style={{
          background: "white",
          padding: "24px",
          borderRadius: "8px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          {KEYBOARD_LAYOUT.map((row) => (
            <div
              key={row.row}
              style={{
                display: "flex",
                gap: "6px",
                marginBottom: "8px",
                justifyContent: "center",
              }}
            >
              {row.keys.map((key) => {
                const fingerType = FINGER_MAP[key] || "other";
                const isHighlighted = highlightKey === key;
                const isShaking = shakeKey === key;
                return (
                  <div key={key} style={{ textAlign: "center" }}>
                    <button
                      style={{
                        width: "40px",
                        height: "40px",
                        background: isHighlighted ? "#FFEB3B" : FINGER_COLORS[fingerType],
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "default",
                        textTransform: "uppercase",
                        transition: "all 0.1s ease",
                        boxShadow: isHighlighted ? "0 0 10px rgba(255, 235, 59, 0.8)" : "none",
                        animation: isShaking ? "shake 0.3s ease" : "none",
                        position: "relative",
                      }}
                    >
                      {key === ";" ? ";" : key.toUpperCase()}
                      {(key === "f" || key === "j") && (
                        <span style={{
                          position: "absolute",
                          width: "6px",
                          height: "6px",
                          background: "#666",
                          borderRadius: "50%",
                          bottom: "3px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }} />
                      )}
                    </button>
                    <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>
                      {FINGER_NAMES[fingerType]}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* SPACEBAR */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              style={{
                width: "300px",
                height: "40px",
                background: highlightKey === " " ? "#FFEB3B" : FINGER_COLORS["space"],
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "default",
                transition: "all 0.1s ease",
                boxShadow: highlightKey === " " ? "0 0 10px rgba(255, 235, 59, 0.8)" : "none",
              }}
            >
              SPACE
            </button>
          </div>
          <div style={{ fontSize: "10px", color: "#999", marginTop: "4px", textAlign: "center" }}>
            Spacebar
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0",
        }}>
          <div style={{
            fontSize: "14px",
            color: "#4CAF50",
            fontWeight: 600,
            minHeight: "20px",
          }}>
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
          <button
            onClick={handleReset}
            style={{
              padding: "8px 16px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#666",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* LESSON COMPLETE OVERLAY */}
      {isComplete && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "500px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "slideUp 0.4s ease",
          }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "16px",
              animation: "scaleIn 0.6s ease",
            }}>
              ✓
            </div>
            <h2 style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#4CAF50",
              marginBottom: "24px",
            }}>
              Lesson Complete!
            </h2>

            {/* STATS */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              marginBottom: "32px",
            }}>
              <div style={{
                background: "#F5F5F5",
                padding: "16px",
                borderRadius: "8px",
              }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#4CAF50" }}>
                  {stats.wpm}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>WPM</div>
              </div>
              <div style={{
                background: "#F5F5F5",
                padding: "16px",
                borderRadius: "8px",
              }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#4CAF50" }}>
                  {stats.accuracy}%
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>Accuracy</div>
              </div>
              <div style={{
                background: "#F5F5F5",
                padding: "16px",
                borderRadius: "8px",
              }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#4CAF50" }}>
                  {stats.streak}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>Best Streak</div>
              </div>
            </div>

            {/* STARS */}
            <div style={{
              fontSize: "48px",
              marginBottom: "16px",
              letterSpacing: "8px",
            }}>
              {Array(3)
                .fill(0)
                .map((_, i) => (i < stars ? "★" : "☆"))
                .join("")}
            </div>

            {/* ECO REWARD */}
            <div style={{
              background: "#E8F5E9",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#4CAF50",
            }}>
              🌱 {stats.ecoWords} eco words typed - 1 tree closer!
            </div>

            {/* BUTTONS */}
            <div style={{
              display: "flex",
              gap: "12px",
            }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "white",
                  border: "2px solid #4CAF50",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#4CAF50",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Try Again
              </button>
              <button
                onClick={handleNextLesson}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#4CAF50",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Next Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 49% { border-bottom: 2px solid #2196F3; }
          50%, 100% { border-bottom: 2px solid transparent; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
