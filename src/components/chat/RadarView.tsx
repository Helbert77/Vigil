import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  mood?: string;
}

interface RadarUser {
  id: string;
  name: string;
  mood: string;
  color: string;
  position: { top: string; left: string };
}

interface RadarViewProps {
  users: User[];
  onUserClick: (user: User) => void;
  isDarkMode: boolean;
}

const RadarView: React.FC<RadarViewProps> = ({ users, onUserClick, isDarkMode }) => {
  const [radarUsers, setRadarUsers] = useState<RadarUser[]>([]);

  const colors = [
    '#0066cc', // odigo-blue
    '#ff6600', // odigo-orange  
    '#00cc66', // odigo-green
    '#ff3366', // odigo-red
    '#8338ec', // odigo-purple
    '#ffcc00', // odigo-yellow
    '#3399ff', // odigo-lightblue
  ];

  const positions = [
    { top: '10%', left: '60%' },
    { top: '25%', left: '80%' },
    { top: '50%', left: '85%' },
    { top: '75%', left: '70%' },
    { top: '85%', left: '40%' },
    { top: '70%', left: '15%' },
    { top: '40%', left: '10%' },
    { top: '15%', left: '25%' }
  ];

  useEffect(() => {
    const mappedUsers: RadarUser[] = users.slice(0, 8).map((user, index) => ({
      id: user.id,
      name: user.name,
      mood: user.mood || 'Online',
      color: colors[index % colors.length],
      position: positions[index % positions.length]
    }));
    setRadarUsers(mappedUsers);
  }, [users]);

  const handleUserClick = (radarUser: RadarUser) => {
    const originalUser = users.find(u => u.id === radarUser.id);
    if (originalUser) {
      onUserClick(originalUser);
    }
  };

  return (
    <div className={`radar-view ${isDarkMode ? 'dark' : ''}`}>
      <style>{`
        .radar-view {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-chat, #f8fafc);
          padding: 20px;
          overflow: auto;
        }

        .radar-view.dark {
          background: var(--bg-chat-dark, #1e293b);
        }

        .radar-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          aspect-ratio: 1;
          margin-bottom: 20px;
        }

        .radar-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid var(--odigo-blue, #0066cc);
          opacity: 0.5;
        }

        .radar-circle:nth-child(1) { width: 20%; height: 20%; }
        .radar-circle:nth-child(2) { width: 40%; height: 40%; }
        .radar-circle:nth-child(3) { width: 60%; height: 60%; }
        .radar-circle:nth-child(4) { width: 80%; height: 80%; }
        .radar-circle:nth-child(5) { width: 100%; height: 100%; }

        .radar-line {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, var(--odigo-orange, #ff6600), transparent);
          transform-origin: left center;
          animation: radarSweep 4s linear infinite;
        }

        @keyframes radarSweep {
          from { transform: translate(0, -50%) rotate(0deg); }
          to { transform: translate(0, -50%) rotate(360deg); }
        }

        .radar-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 5%;
          height: 5%;
          min-width: 20px;
          min-height: 20px;
          background: var(--odigo-orange, #ff6600);
          border-radius: 50%;
          box-shadow: 0 0 20px var(--odigo-orange, #ff6600);
        }

        .radar-user {
          position: absolute;
          width: 10%;
          height: 10%;
          min-width: 40px;
          min-height: 40px;
          border-radius: 50%;
          border: 3px solid var(--bg-secondary, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .radar-user:hover {
          transform: scale(1.3);
          z-index: 10;
        }

        .radar-info {
          background: var(--bg-secondary, #ffffff);
          padding: 20px 30px;
          border-radius: 16px;
          border: 3px solid var(--odigo-blue, #0066cc);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .radar-view.dark .radar-info {
          background: var(--bg-secondary-dark, #334155);
          border-color: var(--odigo-blue, #0066cc);
        }

        .radar-info h3 {
          font-family: 'Orbitron', sans-serif;
          color: var(--odigo-blue, #0066cc);
          font-size: 20px;
          margin-bottom: 8px;
        }

        .radar-info p {
          color: var(--text-secondary, #64748b);
          font-size: 14px;
        }

        .radar-view.dark .radar-info p {
          color: var(--text-secondary-dark, #94a3b8);
        }
      `}</style>

      <div className="radar-container">
        <div className="radar-circle"></div>
        <div className="radar-circle"></div>
        <div className="radar-circle"></div>
        <div className="radar-circle"></div>
        <div className="radar-circle"></div>
        <div className="radar-line"></div>
        <div className="radar-center"></div>
        
        <div id="radarUsers">
          {radarUsers.map((user) => (
            <div
              key={user.id}
              className="radar-user"
              style={{
                top: user.position.top,
                left: user.position.left,
                backgroundColor: user.color
              }}
              title={`${user.name} - ${user.mood}`}
              onClick={() => handleUserClick(user)}
            >
              {user.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>

      <div className="radar-info">
        <h3>🎯 Discovering People</h3>
        <p>Scanning for users with similar interests nearby...</p>
      </div>
    </div>
  );
};

export default RadarView;