import React, { useState, useMemo, useEffect, useRef } from "react";
import "./App.css";

// Function to generate levels
function generateLevels(n) {
  const levelsArr = [];
  let x = 50;
  let y = Math.floor(Math.random() * 400) + 100; // Starting y coordinate

  for (let i = 0; i < n; i++) {
    levelsArr.push({
      id: i + 1,
      name: `Level ${i + 1}`,
      x,
      y,
    });
    x += 120 + Math.floor(Math.random() * 80);
    const deltaY = -150 + Math.floor(Math.random() * 300);
    y = Math.min(550, Math.max(50, y + deltaY));
  }
  return levelsArr;
}

// Function to get curved path
function getCurvedPath(points) {
  if (points.length < 2) return "";

  const curveFactor = 1 / 20;
  let d = `M ${points[0].x + 20} ${points[0].y + 20}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[i] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) * curveFactor;
    const cp1y = p1.y + (p2.y - p0.y) * curveFactor;
    const cp2x = p2.x - (p3.x - p1.x) * curveFactor;
    const cp2y = p2.y - (p3.y - p1.y) * curveFactor;

    d += ` C ${cp1x + 20} ${cp1y + 20}, ${cp2x + 20} ${cp2y + 20}, ${p2.x + 20} ${p2.y + 20}`;
  }
  return d;
}

// Function to format time
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
}

function App() {
  const levels = useMemo(() => generateLevels(10), []);
  const [currentLevel, setCurrentLevel] = useState(1);
  
  // Registration state
  const [username, setUsername] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  // Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [quizFeedback, setQuizFeedback] = useState("");
  const [quizSolved, setQuizSolved] = useState(false);
  
  // Game state
  const [gameOver, setGameOver] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Timer states
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // updated every second
  const [timeTaken, setTimeTaken] = useState(null);
  
  // Warning modal state
  const [showExitWarning, setShowExitWarning] = useState(false);
  
  // Hard-coded questions (one question per level)
  const questions = [
    { question: "Decode the following Resistor code Brown-Black-Black-Red-Gold (in kiloohms)", answer: "10" },
    { question: "Tell the ceramic capacitor value 104 (in nF) ", answer: "100" },
    { question: "What's 10110101 in decimal ?", answer: "181" },
    { question: "cut-in voltage for germanium diode ?", answer: "0.3" },
    { question: "which is a voltage controlled device bjt or fet?", answer: "fet" },
    { question: "The pwer rails in breadboard are connected: horizontal OR vertical  ?", answer: "horizontal" },
    { question: "Full form of VLSI ?", answer: "very large scale integration" },
    { question: "What is the current flowing through a 5k ohm resistor when it is connected to a 10V voltage source (in mA)?", answer: "2" },
    { question: "I have to buy an inductor of value 47 micro,but what are its units ?", answer: "henry" },
    { question: "what is the logic gate in the tick-tack pen?", answer: "xor" },
  ];
  
  // Reference to container for full-screen requests
  const containerRef = useRef(null);
  
  // Start the game by going full-screen and starting the timer.
  const startGame = () => {
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    } else if (containerRef.current.webkitRequestFullscreen) {
      containerRef.current.webkitRequestFullscreen();
    }
    setGameStarted(true);
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
  };
  
  // Handle registration form submission
  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    if (username && rollNo && department && year) {
      setRegistrationComplete(true);
    }
  };

  // Set up a ticking interval for the stopwatch (updates every second).
  useEffect(() => {
    let interval = null;
    if (gameStarted && !gameOver && !gameCompleted) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, gameCompleted, startTime]);
  
  // Anti-cheat measures (only active once gameStarted is true).
  useEffect(() => {
    if (!gameStarted) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("Game Over. You switched tabs!");
        setGameOver(true);
      }
    };
    
    const handleContextMenu = (e) => e.preventDefault();
    
    const handleKeyDown = (e) => {
      if (e.keyCode === 123) e.preventDefault(); // F12
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "J")) e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.key === "u") e.preventDefault();
      
      // Show warning modal if Esc is pressed while in full-screen
      if (e.key === "Escape" && document.fullscreenElement) {
        e.preventDefault(); // Prevent the default exit action
        setShowExitWarning(true);
      }
    };
    
    const handleFullscreenChange = () => {
      if (gameStarted && !document.fullscreenElement) {
        setShowExitWarning(true); // Show warning modal
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [gameStarted]);
  

  
  // When all levels are cleared, record the total time.
  const completeGame = () => {
    const elapsed = Date.now() - startTime; // in milliseconds
    setTimeTaken(elapsed);
    setGameCompleted(true);
  };

  // Show Game Over if triggered.
  if (gameOver) {
    return (
      <div className="game-over">
        <h1>Game Over</h1>
        <p>You have been disqualified for breaking the rules.</p>
      </div>
    );
  }
  
  // Final screen after game completion shows total time taken.
  if (gameCompleted) {
    const totalSeconds = Math.floor(timeTaken / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return (
      <div className="game-over">
        <h1>Congratulations!</h1>
        <p>You completed the game in {minutes} minute(s) and {seconds} second(s).</p>
      </div>
    );
  }
  
  // When clicking a level node (only the current unlocked level is clickable)
  const handleLevelClick = (levelId) => {
    if (levelId === currentLevel) {
      setQuizActive(true);
    }
  };
  
  // Validate the quiz answer.
  const checkAnswer = () => {
    const currentQuestion = questions[currentLevel - 1];
    if (
      userAnswer.trim().toLowerCase() ===
      currentQuestion.answer.trim().toLowerCase()
    ) {
      setQuizFeedback("Correct!");
      setQuizSolved(true);
    } else {
      setQuizFeedback("Incorrect, please try again.");
    }
  };
  
  // Advance to the next level.
  const nextLevel = () => {
    setQuizActive(false);
    setUserAnswer("");
    setQuizFeedback("");
    setQuizSolved(false);
    if (currentLevel < levels.length) {
      setCurrentLevel(currentLevel + 1);
    } else {
      completeGame();
    }
  };
  
  // Position the player icon based on the current level.
  const playerPosition = levels[currentLevel - 1] || levels[0];
  
  // Show Registration Form if not completed
  if (!registrationComplete) {
    return (
      <div className="registration-form">
        <h1>Registration</h1>
        <form onSubmit={handleRegistrationSubmit}>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter Your Roll No"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="">Select Department</option>
            <option value="Ece">ECE</option>
            <option value="Cse">CSE</option>
            <option value="Csm">CSM</option>
            <option value="Csd">CSD</option>
            <option value="Csc">CSC</option>
            <option value="Eee">EEE</option>
            <option value="Mec">Mech</option>
            <option value="Civ">Civil</option>
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          <button type="submit">Register</button>
        </form>
      </div>
    );
  }

  return (
    <div className="map-container" ref={containerRef}>
      {/* Show Stopwatch Box only after game has started */}
      {gameStarted && (
        <div className="stopwatch-box">
          Time: {formatTime(elapsedTime)}
        </div>
      )}
      
      {/* Start Game Overlay (visible only until game starts) */}
      {!gameStarted && (
        <div className="start-game-overlay">
          <div className="start-game-content">
            <h1>Welcome to the Quiz Game</h1>
            <p>Please click the button below to enter full screen and start.</p>
            <i style={{color:'red',fontSize:'20px',fontWeight:'bold'}}><u>Warning: Exiting full screen mode will prompt a warning and may lead to disqualification.</u></i>
            <br></br>
            <button onClick={startGame}>Enter Full Screen</button>
          </div>
        </div>
      )}
      
      {/* Main Game Area */}
      {gameStarted && (
        <>
          <h1>Super Snaky Treasure Hunt Quiz Map</h1>
          <div className="map">
            {levels.map((level) => {
              const isUnlocked = level.id <= currentLevel;
              return (
                <div
                  key={level.id}
                  className={
                    `level-node ${isUnlocked ? "unlocked" : "locked"} ` +
                    `${level.id === currentLevel ? "current" : ""}`
                  }
                  style={{ left: `${level.x}px`, top: `${level.y}px` }}
                  onClick={() => isUnlocked && handleLevelClick(level.id)}
                >
                  {level.id}
                </div>
              );
            })}
            {/* Draw the continuous snaky path beneath the level nodes */}
            <svg className="path-svg">
              <path
                d={getCurvedPath(levels)}
                fill="none"
                stroke="#FFA500"
                strokeWidth="4"
                strokeDasharray="10,10"
              />
            </svg>
            {/* Player Icon (inline SVG) positioned above the current level */}
            <div
              className="player-icon"
              style={{
                left: `${playerPosition.x + 5}px`,
                top: `${playerPosition.y - 40}px`,
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="#FFA500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
              </svg>
            </div>
          </div>
  
          {/* Quiz Modal */}
          {quizActive && (
            <div className="quiz-modal">
              <div className="quiz-content">
                <h2>Quiz for Level {currentLevel}</h2>
                <p>{questions[currentLevel - 1].question}</p>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Your answer"
                />
                <button onClick={checkAnswer}>Submit Answer</button>
                {quizFeedback && <p>{quizFeedback}</p>}
                {quizSolved && (
                  <button className="next-level-btn" onClick={nextLevel}>
                    Go To Next Level
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="exit-warning-modal">
          <div className="exit-warning-content">
            <h2>⚠️ Warning!</h2>
            <p>Exiting full screen will disqualify you. Are you sure you want to quit?</p>
            <button onClick={() => setGameOver(true)}>Yes, Quit</button>
            <button onClick={() => {
              if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
              }
              setShowExitWarning(false);
            }}>No, Resume Game</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;