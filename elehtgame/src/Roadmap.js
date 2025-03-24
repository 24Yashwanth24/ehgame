import React, { useState } from "react";
import "./App";

const Roadmap = ({ levels }) => {
  const [completedLevels, setCompletedLevels] = useState([]);

  const handleLevelClick = (level) => {
    if (level === 1 || completedLevels.includes(level - 1)) {
      if (!completedLevels.includes(level)) {
        setCompletedLevels([...completedLevels, level]);
      }
    }
  };

  return (
    <div className="roadmap">
      {levels.map((level) => (
        <div
          key={level}
          className={`level ${completedLevels.includes(level) ? "completed" : ""} ${
            level === 1 || completedLevels.includes(level - 1) ? "unlocked" : "locked"
          }`}
          onClick={() => handleLevelClick(level)}
        >
          {level}
        </div>
      ))}
    </div>
  );
};

export default Roadmap;