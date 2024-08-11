import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import playerCar from './assets/car.png';
import obstacleCar from './assets/second.png';
import fireball from './assets/fireball.png';
import Start from './Start';

function App() {
  const lanes = [0, 33.33, 66.66];
  const [carPosition, setCarPosition] = useState(1);
  const [carVerticalPosition, setCarVerticalPosition] = useState(80);
  const carPositionRef = useRef(carPosition);
  const carVerticalPositionRef = useRef(carVerticalPosition);
  const [obstacles, setObstacles] = useState([]);
  const [balls, setBalls] = useState(3);
  const [thrownBalls, setThrownBalls] = useState([]);
  const [passedObstacles, setPassedObstacles] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [gameStarted, setGameStarted] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [gameIntervalTime, setGameIntervalTime] = useState(100); // New state for interval time

  const handleKeyPress = (e) => {
    if (!gameStarted) return;

    if (e.key === 'ArrowLeft' && carPositionRef.current > 0) {
      setCarPosition((prevPos) => prevPos - 1);
      carPositionRef.current = carPositionRef.current - 1;
    }
    if (e.key === 'ArrowRight' && carPositionRef.current < lanes.length - 1) {
      setCarPosition((prevPos) => prevPos + 1);
      carPositionRef.current = carPositionRef.current + 1;
    }
    if (e.key === 'ArrowUp' && carVerticalPositionRef.current > 0) {
      setCarVerticalPosition((prevPos) => prevPos - 5);
      carVerticalPositionRef.current = carVerticalPositionRef.current - 5;
    }
    if (e.key === 'ArrowDown' && carVerticalPositionRef.current < 80) {
      setCarVerticalPosition((prevPos) => prevPos + 5);
      carVerticalPositionRef.current = carVerticalPositionRef.current + 5;
    }
    if (e.key === ' ') {
      if (balls > 0) {
        setBalls((prevBalls) => prevBalls - 1);
        setThrownBalls((prevBalls) => [
          ...prevBalls,
          { id: Math.random(), left: lanes[carPositionRef.current] + 15, top: carVerticalPositionRef.current },
        ]);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted]);

  useEffect(() => {
    if (countdown > 0 && !showStartScreen) {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(countdownInterval);
    } else if (countdown === 0) {
      setGameStarted(true);
    }
  }, [countdown, showStartScreen]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const obstacleInterval = setInterval(() => {
        setObstacles((prevObstacles) => [
          ...prevObstacles,
          { id: Math.random(), left: lanes[Math.floor(Math.random() * lanes.length)], top: 0 },
        ]);
      }, Math.random() * 2000 + 500);
      return () => clearInterval(obstacleInterval);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gameInterval = setInterval(() => {
        setObstacles((prevObstacles) => {
          const newObstacles = prevObstacles.map((obs) => ({
            ...obs,
            top: obs.top + 5,
          }));

          const newBalls = thrownBalls.map((ball) => ({
            ...ball,
            top: ball.top - 5,
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

            // Improved collision detection using refs
            if (
              obs.left === lanes[carPositionRef.current] &&
              Math.abs(obs.top - carVerticalPositionRef.current) < 10
            ) {
              setGameOver(true);
              setCarPosition(1);
              setCarVerticalPosition(80);
              return false;
            }

            return true;
          });

          return remainingObstacles;
        });

        setThrownBalls((prevBalls) => prevBalls.filter((ball) => ball.top > 0));
      }, gameIntervalTime); // Use dynamic interval time

      return () => clearInterval(gameInterval);
    }
  }, [gameStarted, gameOver, thrownBalls, gameIntervalTime]);

  useEffect(() => {
    if (passedObstacles > 0 && passedObstacles % 20 === 0 && gameIntervalTime > 20) {
      const newIntervalTime = 100 - Math.floor(passedObstacles / 20) * 10;
      setGameIntervalTime(newIntervalTime); // Decrease interval time by 5 for every 20 obstacles
    }
  }, [passedObstacles, gameIntervalTime]);
  

  const startGame = () => {
    setShowStartScreen(false);
    setCountdown(4);
  };

  const restartGame = () => {
    setCarPosition(1);
    setCarVerticalPosition(80);
    carPositionRef.current = 1;
    carVerticalPositionRef.current = 80;
    setObstacles([]);
    setThrownBalls([]);
    setBalls(3);
    setPassedObstacles(0);
    setGameOver(false);
    setCountdown(4);
    setGameStarted(false);
    setGameIntervalTime(100); // Reset interval time
  };

  return (
    <div className="game-container">
       {showStartScreen && <Start startGame={startGame} />}
      <div className="road">
        <div
          className="car"
          style={{
            left: `${lanes[carPosition] + 15}%`,
            top: `${carVerticalPosition}%`,
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
              borderRadius: 12,
            }}
          >
            <img src={fireball} width={50} height={50} alt="Fireball" />
          </div>
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
                backgroundColor:
                  countdown > 0
                    ? i < 4 - countdown
                      ? 'green'
                      : '#ff0404'
                    : balls > i
                    ? 'transparent'
                    : 'white',
                backgroundImage:
                  countdown === 0 && balls > i
                    ? `url(${fireball})`
                    : 'none',
                backgroundSize: 'cover',
                width: 20,
                height: 20,
                margin: '0 5px',
                borderRadius: '50%',
              }}
            ></div>
          ))}
        </div>
        <div className="score">
          <span>Score: {Math.floor(passedObstacles)}</span>
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h1>Game Over</h1>
          <p>Your Score: {Math.floor(passedObstacles)}</p>
          <div className="restart-button" onClick={restartGame}>
  Restart
</div>

        </div>
      )}
    </div>
  );
}

export default App;
