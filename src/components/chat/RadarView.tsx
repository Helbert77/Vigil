import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  mood?: string;
  location?: string;
  interests?: string[];
  age?: number;
}

interface RadarUser extends User {
  similarity_score?: number;
  position?: { x: number; y: number };
}

interface RadarViewProps {
  users: User[];
  onUserClick: (user: User) => void;
  isDarkMode: boolean;
}

const RadarView: React.FC<RadarViewProps> = ({ users, onUserClick, isDarkMode }) => {
  const [radarUsers, setRadarUsers] = useState<RadarUser[]>([]);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  useEffect(() => {
    // Calculate positions based on similarity (mocked if not present) or random distribution
    const mappedUsers = users.slice(0, 20).map((user, index) => {
      // Mock similarity score if not present (0.1 to 0.9)
      const similarity = (user as any).similarity_score || Math.random() * 0.8 + 0.1;

      // Calculate angle: distribute users around the circle
      // Add some randomness to angle to avoid perfect lines
      const angle = (index / Math.min(users.length, 20)) * 2 * Math.PI + (Math.random() * 0.5 - 0.25);

      // Radius is inverse to similarity (more similar = closer to center)
      // Max radius is 45% (leaving 5% padding)
      const radius = (1 - similarity) * 45;

      // Convert polar to cartesian (center is 50, 50)
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);

      return {
        ...user,
        similarity_score: similarity,
        position: { x, y }
      };
    });
    setRadarUsers(mappedUsers);
  }, [users]);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="relative w-full max-w-[500px] aspect-square">
        {/* Radar Circles */}
        {[20, 40, 60, 80, 100].map((size) => (
          <div
            key={size}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${isDarkMode ? 'border-blue-500/20' : 'border-blue-500/30'
              }`}
            style={{
              width: `${size}%`,
              height: `${size}%`,
            }}
          />
        ))}

        {/* Sweep Line */}
        <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-orange-500 to-transparent origin-left animate-[spin_4s_linear_infinite]" />

        {/* Center Dot (You) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50 animate-pulse z-10" />

        {/* User Dots */}
        {radarUsers.map((user) => (
          <div
            key={user.id}
            className="absolute -ml-5 -mt-5 cursor-pointer group z-20"
            style={{
              left: `${user.position?.x}%`,
              top: `${user.position?.y}%`,
              transition: 'all 0.5s ease-out'
            }}
            onClick={() => onUserClick(user)}
            onMouseEnter={() => setHoveredUser(user.id)}
            onMouseLeave={() => setHoveredUser(null)}
          >
            {/* User Avatar/Dot */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-transform duration-300 ${hoveredUser === user.id ? 'scale-125 ring-2 ring-white z-30' : 'scale-100'
              } ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              }`}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Hover Card */}
            <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 w-64 pointer-events-none transition-all duration-300 origin-left z-40 ${hoveredUser === user.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{user.name}</h3>
                <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {Math.round((user.similarity_score || 0) * 100)}% Match
                </span>
              </div>

              {user.location && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  📍 {user.location}
                </p>
              )}

              {user.age && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  🎂 {user.age} years old
                </p>
              )}

              {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.interests.slice(0, 3).map((interest, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                      {interest}
                    </span>
                  ))}
                  {user.interests.length > 3 && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-500 px-1">
                      +{user.interests.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 text-xs text-center text-blue-500 font-semibold">
                Click to chat
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-8 rounded-2xl shadow-lg p-6 max-w-md text-center border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
        <h3 className="font-orbitron text-xl font-bold text-blue-500 mb-2">
          🎯 Radar Discovery
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Scanning for people nearby with similar interests...
          <br />
          <span className="text-xs opacity-75 mt-1 block">
            {users.length} users found in your area
          </span>
        </p>
      </div>
    </div>
  );
};

export default RadarView;