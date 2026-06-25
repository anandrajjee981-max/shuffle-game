import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getscore } from './utils/score.js';
import '../style/history.scss';

const History = () => {
  const navigate = useNavigate();
  const SCORE_STORAGE_KEY = "shuffle_game_scores";
  const [scoreData, setScoreData] = useState([]);

  useEffect(() => {
    const rawScores = getscore(SCORE_STORAGE_KEY) || [];
    const formattedData = rawScores.map((score, index) => ({
      game: `G-${index + 1}`,
      score: score
    }));
    setScoreData(formattedData);
  }, []);

  const totalGames = scoreData.length;
  const highestScore = totalGames > 0 ? Math.max(...scoreData.map(d => d.score)) : 0;
  const averageScore = totalGames > 0 ? Math.round(scoreData.reduce((acc, curr) => acc + curr.score, 0) / totalGames) : 0;

 
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-graph-tooltip">
          <p className="label">{payload[0].payload.game}</p>
          <p className="val">{payload[0].value} <span className="unit">pts</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="history-wrapper-modern">
      <div className="inner-layout-container">
        
     
        <div className="top-nav-row">
          <button className="modern-back-action" onClick={() => navigate('/')}>
            <span className="arrow">←</span> Back
          </button>
          <div className="brand-badge">SHUFFLE RUNS</div>
        </div>

        <header className="page-intro">
          <h1>Analytics Node</h1>
          <p>Real-time cognitive memory tracking analytics</p>
        </header>

        {totalGames === 0 ? (
          <div className="empty-panel">
            <div className="radar-icon">📡</div>
            <p>No active analytics packets recorded yet.</p>
          </div>
        ) : (
          <>
          
            <div className="counters-grid">
              <div className="counter-card">
                <span className="meta">SESSIONS</span>
                <span className="num-val">{totalGames}</span>
              </div>
              <div className="counter-card peak-accent">
                <span className="meta">HIGH MARKS</span>
                <span className="num-val">{highestScore}</span>
              </div>
              <div className="counter-card">
                <span className="meta">AVG INDEX</span>
                <span className="num-val">{averageScore}</span>
              </div>
            </div>

      
            <div className="modern-chart-panel">
              <div className="panel-meta-title">
                <span>METRIC WAVEFORMS</span>
                <div className="live-dot-indicator"></div>
              </div>
              <div className="chart-holder">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={scoreData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25}/>
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                    <XAxis dataKey="game" stroke="#475569" axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: '500' }} />
                    <YAxis stroke="#475569" axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: '500' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(79, 70, 229, 0.15)', strokeWidth: 1.5 }} />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: '#0a0f1d' }} activeDot={{ r: 5, strokeWidth: 0, fill: '#6366f1' }} fillOpacity={1} fill="url(#neonGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

         
            <div className="log-history-panel">
              <div className="panel-meta-title">PACKET DATA LOGS</div>
              <div className="scrollable-log-stack">
                {[...scoreData].reverse().map((data, idx) => (
                  <div className="log-row" key={idx}>
                    <div className="left-meta">
                      <span className="dot-bullet"></span>
                      <span className="session-tag">{data.game}</span>
                    </div>
                    <div className="right-score">{data.score} <span className="pts-label">PTS</span></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;