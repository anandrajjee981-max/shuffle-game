import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { gsap } from 'gsap';
import { submitscore, getscore } from './utils/score.js'; 
import '../style/game.scss';

const Game = () => {
  const cardBackImage = "https://i.pinimg.com/736x/b0/c0/06/b0c0060772f050c432116834a58a18ba.jpg";
  const SCORE_STORAGE_KEY = "shuffle_game_scores";

  const navigate = useNavigate(); 

  const initialImages = [
    { id: 1, icon: '🗽' }, { id: 2, icon: '🚝' }, { id: 3, icon: '🚁' }, { id: 4, icon: '🗽' },
    { id: 5, icon: '😍' }, { id: 6, icon: '🤠' }, { id: 7, icon: '🤖' }, { id: 8, icon: '👻' },
    { id: 9, icon: '😎' }, { id: 10, icon: '🚝' }, { id: 11, icon: '😍' }, { id: 12, icon: '🤠' },
    { id: 13, icon: '🤖' }, { id: 14, icon: '👻' }, { id: 15, icon: '🚁' }, { id: 16, icon: '😎' }
  ];

  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(null); 
  const [isTimeOver, setIsTimeOver] = useState(false);

  const cardsRef = useRef([]);
  const timerIntervalRef = useRef(null); 

  const levelsList = [
    { name: 'Easy', points: 1, color: '#10b981', initialTime: 45 },
    { name: 'Medium', points: 2, color: '#f59e0b', initialTime: 30 },
    { name: 'Hard', points: 3, color: '#ef4444', initialTime: 15 }
  ];

  const generateDeck = () => {
    return [...initialImages]
      .sort(() => Math.random() - 0.5)
      .map((img, index) => ({
        ...img,
        uniqueId: `${img.id}-${index}-${Math.random()}` 
      }));
  };

  useEffect(() => {
    setCards(generateDeck());
    fetchHighScore();
    setTimeLeft(45); 

    return () => clearInterval(timerIntervalRef.current);
  }, []);

  const fetchHighScore = () => {
    const pastScores = getscore(SCORE_STORAGE_KEY);
    if (pastScores && pastScores.length > 0) {
      setHighScore(Math.max(...pastScores));
    } else {
      setHighScore(0);
    }
  };

  const startLevel = (levelObj) => {
    clearInterval(timerIntervalRef.current); 
    
    gsap.killTweensOf(cardsRef.current);
    gsap.set(cardsRef.current, { rotationY: 0, scale: 1 });
    
    setSelectedCards([]);
    setMatchedCards([]);
    setScore(0);
    setMultiplier(levelObj.points);
    setIsFlipping(false);
    setIsTimeOver(false); 
    setCards(generateDeck());
    
    setTimeLeft(levelObj.initialTime);
    startCountdown(levelObj.initialTime);
  };

  const startCountdown = (duration) => {
    let currentClockValue = duration;
    timerIntervalRef.current = setInterval(() => {
      currentClockValue--;
      setTimeLeft(currentClockValue);

      if (currentClockValue <= 0) {
        clearInterval(timerIntervalRef.current);
        setIsTimeOver(true); 
      }
    }, 1000);
  };

  
  const handleCloseOverlay = () => {
    setIsTimeOver(false); 
    
    gsap.killTweensOf(cardsRef.current);
    gsap.set(cardsRef.current, { rotationY: 0, scale: 1 });
    
    setSelectedCards([]);
    setMatchedCards([]);
    setScore(0);
    setIsFlipping(false);
    setCards(generateDeck());
    setTimeLeft(45); 
  };

  useEffect(() => {
    if (matchedCards.length === 16 && score > 0) {
      clearInterval(timerIntervalRef.current);
      handleGameOver();
    }
  }, [matchedCards]);

  const handleGameOver = async () => {
    const updatedHistory = await submitscore(SCORE_STORAGE_KEY, score);
    if (updatedHistory && updatedHistory.length > 0) {
      setHighScore(Math.max(...updatedHistory));
    }
    alert(`🎉 Game Over! Total Score: ${score}. Score saved to local history.`);
  };

  const handleCardClick = (index) => {
    if (isTimeOver || isFlipping || selectedCards.length === 2 || selectedCards.includes(index) || matchedCards.includes(index)) {
      return;
    }

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    gsap.to(cardsRef.current[index], {
      rotationY: 180,
      duration: 0.25,
      ease: "power1.out"
    });

    if (newSelected.length === 2) {
      const [firstIdx, secondIdx] = newSelected;
      
      if (cards[firstIdx].icon === cards[secondIdx].icon) {
        setMatchedCards((prev) => [...prev, firstIdx, secondIdx]);
        setScore((prevScore) => prevScore + multiplier);
        setSelectedCards([]);
      } else {
        setIsFlipping(true);

        setTimeout(() => {
          gsap.to([cardsRef.current[firstIdx], cardsRef.current[secondIdx]], {
            rotationY: 0,
            duration: 0.3,
            ease: "power1.inOut",
            onComplete: () => {
              setIsFlipping(false);
            }
          });
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  return (
    <div className='container'>
      <button className="history-floating-btn" onClick={() => navigate('/history')}>
        📊 View History
      </button>

      
      {isTimeOver && (
        <div className="time-over-overlay">
          <div className="overlay-content">
            <button className="close-overlay-btn" onClick={handleCloseOverlay}>
              ✕
            </button>
            <h2>⏰ Time Over!</h2>
            <p>Your session expired. Choose a difficulty level below to retry.</p>
          </div>
        </div>
      )}

      <header className="game-header">
        <h1>Shuffle Master</h1>
        
        <div className="scoreboard">
          <div className="stat-box">
            <span className="label">SCORE</span>
            <span className="value score-display">{score}</span>
          </div>
          <div className="stat-box highlight">
            <span className="label">TIMER</span>
            <span className={`value timer-display ${timeLeft <= 5 ? 'critical' : ''}`}>
              {timeLeft !== null ? `${timeLeft}s` : '--'}
            </span>
          </div>
          <div className="stat-box">
            <span className="label">MULTIPLIER</span>
            <span className="value multiplier-display">+{multiplier}x</span>
          </div>
        </div>
      </header>
      
      <div className="level-buttons">
        {levelsList.map((lvl) => (
          <button 
            key={lvl.name} 
            onClick={() => startLevel(lvl)}
            style={{ '--hover-color': lvl.color }}
            className="level-btn"
          >
            {lvl.name} ({lvl.initialTime}s)
          </button>
        ))}
      </div>

      <div className={`grid-container ${isTimeOver ? 'disabled-grid' : ''}`}>
        {cards.map((card, index) => (
          <div 
            key={card.uniqueId} 
            className="card-scene"
            onClick={() => handleCardClick(index)}
          >
            <div 
              className="card-inner"
              ref={(el) => (cardsRef.current[index] = el)}
            >
              <div className="card-face card-front">
                <img src={cardBackImage} alt="Card Back" />
              </div>
              <div className="card-face card-back">
                <span>{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;