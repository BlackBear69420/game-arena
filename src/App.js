import React, { useState, useEffect } from 'react';
import './App.css';
import playerCar from './assets/car.png';
import obstacleCar from './assets/second.png';

function App() {
  const lanes = [0, 33.33, 66.66];
  const [carPosition, setCarPosition] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [balls, setBalls] = useState(3);
  const [thrownBalls, setThrownBalls] = useState([]);
  const [passedObstacles, setPassedObstacles] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowLeft' && carPosition > 0) {
      setCarPosition((prevPos) => prevPos - 1);
    }
    if (e.key === 'ArrowRight' && carPosition < lanes.length - 1) {
      setCarPosition((prevPos) => prevPos + 1);
    }
    if (e.key === ' ') { // Spacebar to throw ball
      if (balls > 0) {
        setBalls((prevBalls) => prevBalls - 1);
        setThrownBalls((prevBalls) => [
          ...prevBalls,
          { id: Math.random(), left: lanes[carPosition] + 15, top: 80 }
        ]);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [carPosition, balls]);

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(() => {
        setObstacles((prevObstacles) => [
          ...prevObstacles,
          { id: Math.random(), left: lanes[Math.floor(Math.random() * lanes.length)], top: 0 }
        ]);
      }, Math.random() * 2000 + 500);
      return () => clearInterval(interval);
    }
  }, [gameOver]);

  useEffect(() => {
    const gameInterval = setInterval(() => {
      setObstacles((prevObstacles) => {
        const newObstacles = prevObstacles.map((obs) => ({
          ...obs,
          top: obs.top + 5
        }));

        const newBalls = thrownBalls.map((ball) => ({
          ...ball,
          top: ball.top - 5
        }));

        const remainingObstacles = newObstacles.filter((obs) => {
          let hit = false;

          const updatedBalls = newBalls.filter((ball) => {
            if (
              Math.abs(ball.left - (obs.left + 15)) < 5 &&
              Math.abs(ball.top - obs.top) < 10
            ) {
              hit = true;
              return false;
            }
            return true;
          });

          setThrownBalls(updatedBalls);

          if (hit) {
            return false;
          }

          if (obs.top >= 100) {
            setPassedObstacles((prevCount) => prevCount + 1);
            return false;
          }

          if (obs.left === lanes[carPosition] && obs.top > 75) {
            setGameOver(true);
            setCarPosition(1);
            return false;
          }

          return true;
        });

        return remainingObstacles;
      });

      setThrownBalls((prevBalls) => prevBalls.filter((ball) => ball.top > 0));
    }, 100);

    if (gameOver) {
      clearInterval(gameInterval);
    }

    return () => clearInterval(gameInterval);
  }, [carPosition, thrownBalls, gameOver]);

  const restartGame = () => {
    setCarPosition(1);
    setObstacles([]);
    setThrownBalls([]);
    setBalls(3);
    setPassedObstacles(0);
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <div className="road">
        <div
          className="car"
          style={{
            left: `${lanes[carPosition] + 15}%`,
            top: '80%',
            position: 'absolute',
            width: 50,
            height: 50,
          }}
        >
          <img
            src={playerCar}
            alt="Player Car"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {thrownBalls.map((ball) => (
          <div
            key={ball.id}
            className="ball"
            style={{
              left: `${ball.left}%`,
              top: `${ball.top}%`,
              position: 'absolute',
              width: 20,
              height: 20,
              backgroundColor: 'red',
              borderRadius: 12,
            }}
          ></div>
        ))}

        {obstacles.map((obs, index) => (
          <div
            key={obs.id}
            className="car obstacle"
            style={{
              left: `${obs.left + 15}%`,
              top: `${obs.top}%`,
              position: 'absolute',
              width: 50,
              height: 50,
            }}
          >
            <img
              src={obstacleCar}
              alt={`Obstacle Car ${index}`}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        ))}
      </div>

      <div className="game-info">
        <div className="balls">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="ball-status"
              style={{
                backgroundColor: i < balls ? 'red' : 'white',
                width: 20,
                height: 20,
                margin: '0 5px',
                borderRadius: '50%',
              }}
            ></div>
          ))}
        </div>
        <div className="score">
          <span>Passed: {Math.floor(passedObstacles / 2)}</span>
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h1>Game Over</h1>
          <p> Your Score: {Math.floor(passedObstacles / 2)}</p>
          <button
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              paddingLeft: 30,
              paddingRight: 30,
              paddingBottom: 10,
              paddingTop: 10,
            }}
            onClick={restartGame}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
