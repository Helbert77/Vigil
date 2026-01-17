import React, { useEffect, useState, useRef } from 'react';
import { formatDistance } from '@/src/utils/geoCalculations';

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
  distance?: number; // em km
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
  const [radarSize, setRadarSize] = useState<number>(500);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Calculate positions based on similarity score (from distance calculation)
    const mappedUsers = users.slice(0, 20).map((user, index) => {
      // Get similarity score from user data (calculated from distance)
      const similarity = (user as any).similarity_score || (user as any).similarityScore || 0.5;
      const distance = (user as any).distance;

      // Calculate angle: distribute users around the circle
      // Add some randomness to angle to avoid perfect lines
      const angle = (index / Math.min(users.length, 20)) * 2 * Math.PI + (Math.random() * 0.5 - 0.25);

      // Radius is inverse to similarity (more similar/closer = closer to center)
      // Max radius is 45% (leaving 5% padding)
      const radius = (1 - similarity) * 45;

      // Convert polar to cartesian (center is 50, 50)
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);

      return {
        ...user,
        similarity_score: similarity,
        distance: distance,
        position: { x, y }
      };
    });
    setRadarUsers(mappedUsers);
  }, [users]);

  useEffect(() => {
    // Calcular tamanho do radar garantindo formato circular - 95% do container pai
    const calculateRadarSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Considerar padding do container
        const paddingVertical = 32; // 2rem top + 2rem bottom
        const paddingHorizontal = 32; // 2rem left + 2rem right

        const availableWidth = containerWidth - paddingHorizontal;
        const availableHeight = containerHeight - paddingVertical;

        // Usar o menor valor para manter formato circular
        const size = Math.min(availableWidth, availableHeight);
        const radarSize95Percent = size * 0.95; // 95% do container pai

        setRadarSize(Math.max(200, radarSize95Percent)); // Mínimo reduzido para 200px
      }
    };

    calculateRadarSize();

    // Usar ResizeObserver para monitorar mudanças no container
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(calculateRadarSize);
      resizeObserver.observe(containerRef.current);
    }

    // Fallback para window resize
    window.addEventListener('resize', calculateRadarSize);

    return () => {
      window.removeEventListener('resize', calculateRadarSize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`w-full h-full flex flex-col items-center justify-center p-2 md:p-4 overflow-y-auto overflow-x-hidden min-h-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="relative flex-shrink-0" style={{
        width: `${radarSize}px`,
        height: `${radarSize}px`
      }}>
        
        {/* Mensagem quando não há usuários - OVERLAY sobre o radar */}
        {users.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl text-center max-w-xs">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Escaneando...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aguardando usuários próximos entrarem online
              </p>
            </div>
          </div>
        )}
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
            className="absolute -ml-4 md:-ml-5 -mt-4 md:-mt-5 cursor-pointer group z-20"
            style={{
              left: `${user.position?.x}%`,
              top: `${user.position?.y}%`,
              transition: 'all 0.5s ease-out'
            }}
            onClick={() => onUserClick(user)}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
              }
              setHoveredUser(user.id);
            }}
            onMouseLeave={() => {
              // Delay para permitir mover o mouse para o card
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredUser(null);
              }, 300);
            }}
          >
            {/* User Avatar/Dot */}
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg transition-transform duration-300 ${hoveredUser === user.id ? 'scale-125 ring-2 ring-white z-30' : 'scale-100'
              } ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              }`}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Hover Card */}
            <div 
              className={`absolute left-full md:left-full right-auto md:right-auto ml-2 md:ml-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-2 md:p-4 w-48 md:w-64 max-w-[calc(100vw-3rem)] md:max-w-[calc(100vw-8rem)] transition-all duration-300 origin-left z-40 ${hoveredUser === user.id ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
              }`}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                }
                setHoveredUser(user.id);
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredUser(null);
                }, 200);
              }}
            >
              <div className="flex items-center justify-between mb-1 md:mb-2 gap-1">
                <h3 className="font-bold text-[10px] md:text-sm text-gray-900 dark:text-white truncate">{user.name}</h3>
                <span className="text-[9px] md:text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 md:px-2 py-0.5 rounded-full whitespace-nowrap">
                  {Math.round((user.similarity_score || 0) * 100)}% Match
                </span>
              </div>

              {user.distance !== undefined && (
                <p className="text-[9px] md:text-xs text-gray-600 dark:text-gray-400 mb-0.5 md:mb-1 flex items-center gap-1">
                  📍 {formatDistance(user.distance)} de distância
                </p>
              )}

              {user.location && (
                <p className="text-[9px] md:text-xs text-gray-600 dark:text-gray-400 mb-0.5 md:mb-1 flex items-center gap-1">
                  🌍 {user.location}
                </p>
              )}

              {user.age && (
                <p className="text-[9px] md:text-xs text-gray-600 dark:text-gray-400 mb-0.5 md:mb-1 flex items-center gap-1">
                  🎂 {user.age} anos
                </p>
              )}

              {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1 md:mt-2">
                  {user.interests.slice(0, 3).map((interest, i) => (
                    <span key={i} className="text-[8px] md:text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 md:px-2 py-0.5 rounded-full">
                      {interest}
                    </span>
                  ))}
                  {user.interests.length > 3 && (
                    <span className="text-[8px] md:text-[10px] text-gray-500 dark:text-gray-500 px-1">
                      +{user.interests.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-1.5 md:mt-3 text-[9px] md:text-xs text-center text-blue-500 font-semibold">
                Click to chat
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarView;