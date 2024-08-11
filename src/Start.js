// Start.js
import React from 'react';
import './Start.css';

const Start = ({ startGame }) => {
  return (
    <div className="start-container">
      <div className="start-instructions">
        <h1>Welcome to the Game!</h1>
        <p>Use the arrow keys to move your car. Press the spacebar to throw fireballs. Avoid obstacles and score as high as you can!</p>
        <div className="start-button" onClick={startGame}>
          Start Game
        </div>
      </div>
    </div>
  );
};

export default Start;
