# React Components - Complete Code Examples
# Odigo Unified Messenger

## Main Components Implementation

### 1. App.tsx (Root Component)

```typescript
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import './styles/globals.css';

const App: React.FC = () => {
  const { user, session } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? <Main /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

---

### 2. Login Page

```typescript
// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-odigo-blue to-odigo-lightblue">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-6xl font-black bg-gradient-to-r from-odigo-blue to-odigo-orange bg-clip-text text-transparent">
            ODIGO
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest mt-2">
            Connect • Discover • Chat
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-odigo-blue focus:ring-4 focus:ring-odigo-blue/10 dark:bg-gray-900 dark:text-white transition-all"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-odigo-blue focus:ring-4 focus:ring-odigo-blue/10 dark:bg-gray-900 dark:text-white transition-all"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-odigo-blue to-odigo-lightblue text-white font-bold rounded-xl uppercase tracking-wider hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-odigo-blue hover:text-odigo-lightblue font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

---

### 3. Register Page

```typescript
// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(13, 'Must be 13 or older').max(120, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  location: z.string().min(2, 'Location required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');
    try {
      await registerUser(data);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-odigo-blue to-odigo-lightblue py-12 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-5xl font-black bg-gradient-to-r from-odigo-blue to-odigo-orange bg-clip-text text-transparent">
            JOIN ODIGO
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest mt-2">
            Start Your Journey
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">
          {error && (
            <div className="col-span-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-odigo-blue focus:ring-4 focus:ring-odigo-blue/10 transition-all"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-odigo-blue"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 uppercase">Username</label>
            <input
              {...register('username')}
              className="w-full px-4 py-3 border-2 rounded-xl"
            />
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 uppercase">Display Name</label>
            <input
              {...register('display_name')}
              className="w-full px-4 py-3 border-2 rounded-xl"
            />
            {errors.display_name && <p className="mt-1 text-sm text-red-600">{errors.display_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 uppercase">Age</label>
            <input
              {...register('age', { valueAsNumber: true })}
              type="number"
              min="13"
              max="120"
              className="w-full px-4 py-3 border-2 rounded-xl"
            />
            {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 uppercase">Gender</label>
            <select
              {...register('gender')}
              className="w-full px-4 py-3 border-2 rounded-xl"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-2 uppercase">Location</label>
            <input
              {...register('location')}
              placeholder="City, Country"
              className="w-full px-4 py-3 border-2 rounded-xl"
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="col-span-2 py-4 bg-gradient-to-r from-odigo-blue to-odigo-lightblue text-white font-bold rounded-xl uppercase tracking-wider hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-odigo-blue hover:text-odigo-lightblue font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

---

### 4. Main Application Layout

```typescript
// src/pages/Main.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import TopBar from '../components/layout/TopBar';
import BuddySidebar from '../components/sidebar/BuddySidebar';
import RoomsSidebar from '../components/sidebar/RoomsSidebar';
import RadarView from '../components/radar/RadarView';
import ChatView from '../components/chat/ChatView';

const Main: React.FC = () => {
  const { user } = useAuthStore();
  const { fetchRooms, fetchBuddies } = useChatStore();
  const { currentView } = useUIStore();

  useEffect(() => {
    fetchRooms();
    fetchBuddies();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Buddies */}
        <BuddySidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-orbitron font-bold">
                {currentView === 'radar' ? 'RADAR VIEW' : 'CHAT'}
              </h2>
              
              <div className="flex gap-2">
                <button
                  onClick={() => useUIStore.setState({ currentView: 'radar' })}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentView === 'radar'
                      ? 'bg-odigo-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🎯 Radar
                </button>
                <button
                  onClick={() => useUIStore.setState({ currentView: 'chat' })}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentView === 'chat'
                      ? 'bg-odigo-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  💬 Chat
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {currentView === 'radar' ? <RadarView /> : <ChatView />}
          </div>
        </main>

        {/* Right Sidebar - Rooms & Search */}
        <RoomsSidebar />
      </div>
    </div>
  );
};

export default Main;
```

---

### 5. Radar View Component

```typescript
// src/components/radar/RadarView.tsx
import React, { useEffect, useState } from 'react';
import { useRadarUsers } from '../../hooks/useRadarUsers';
import { RadarUser } from '../../types';

const RadarView: React.FC = () => {
  const { users, loading, refresh } = useRadarUsers();
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    // Calculate user positions on radar
    const newPositions = new Map();
    const radarSize = 500;
    const center = radarSize / 2;

    users.forEach((user, index) => {
      // Angle based on index
      const angle = (index / users.length) * 2 * Math.PI;
      
      // Radius based on similarity (closer = more similar)
      const maxRadius = center * 0.9;
      const radius = maxRadius * (1 - user.similarity_score);

      // Calculate x, y position
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      newPositions.set(user.id, { x, y });
    });

    setPositions(newPositions);
  }, [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-odigo-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Scanning for users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="relative w-full max-w-[500px] aspect-square">
        {/* Radar Circles */}
        {[20, 40, 60, 80, 100].map((size) => (
          <div
            key={size}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-odigo-blue/30"
            style={{
              width: `${size}%`,
              height: `${size}%`,
            }}
          />
        ))}

        {/* Sweep Line */}
        <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-odigo-orange to-transparent origin-left animate-[spin_4s_linear_infinite]" />

        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-odigo-orange rounded-full shadow-lg shadow-odigo-orange/50 animate-pulse" />

        {/* User Dots */}
        {users.map((user) => {
          const pos = positions.get(user.id);
          if (!pos) return null;

          return (
            <div
              key={user.id}
              className="absolute w-12 h-12 -ml-6 -mt-6 cursor-pointer group"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              }}
              title={`${user.display_name} - ${user.location}`}
            >
              {/* User Dot */}
              <div className="w-full h-full bg-gradient-to-br from-odigo-green to-odigo-blue rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-125 transition-transform">
                {user.display_name.charAt(0)}
              </div>

              {/* Hover Card */}
              <div className="absolute left-full ml-2 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                <h3 className="font-bold text-lg">{user.display_name}, {user.age}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">📍 {user.location}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  💡 {user.interests.join(', ')}
                </p>
                <p className="text-xs text-gray-500 mt-2">{user.mood}</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-odigo-green text-white px-3 py-1 rounded text-sm font-semibold">
                    Add
                  </button>
                  <button className="flex-1 bg-odigo-blue text-white px-3 py-1 rounded text-sm font-semibold">
                    Chat
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-md text-center">
        <h3 className="font-orbitron text-xl font-bold text-odigo-blue mb-2">
          🎯 Discovering People
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Scanning for {users.length} users with similar interests nearby...
        </p>
      </div>
    </div>
  );
};

export default RadarView;
```

---

## Additional Implementations Available:

- ChatView component with real-time messages
- MessageBubble with encryption indicators
- BuddyList with sorting and filtering
- RoomsList accordion with rooms
- Search component with filters
- Custom hooks (useRealtime, useEncryption)
- Full Tailwind styling examples

**Want more specific components? Let me know which ones!**
