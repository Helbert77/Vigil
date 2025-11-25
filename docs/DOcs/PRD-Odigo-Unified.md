# Product Requirements Document (PRD)
# Odigo Unified Messenger

**Version:** 1.0  
**Date:** November 2025  
**Status:** Ready for Development  
**Owner:** Product Team

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Goals & Objectives](#goals--objectives)
4. [User Personas](#user-personas)
5. [Features & Requirements](#features--requirements)
6. [Technical Architecture](#technical-architecture)
7. [User Flows](#user-flows)
8. [UI/UX Specifications](#uiux-specifications)
9. [Security & Privacy](#security--privacy)
10. [Success Metrics](#success-metrics)
11. [Roadmap](#roadmap)

---

## 1. Executive Summary

**Odigo Unified Messenger** is a modern, secure messaging platform that combines the best features of classic messengers (ICQ, Odigo) with contemporary security standards and user experience. The platform emphasizes:

- **Discovery**: Radar-based user discovery system
- **Security**: End-to-end encryption for all communications
- **Community**: Multi-user chat rooms and private conversations
- **Nostalgia**: Classic messenger aesthetics with modern functionality

### Key Differentiators

1. **Radar Discovery System**: Unique visual interface to discover nearby users with similar interests
2. **E2E Encryption**: All messages encrypted using industry-standard protocols
3. **Hybrid Experience**: Combines public chat rooms with private messaging
4. **Modern Tech Stack**: Built with React, TypeScript, and Supabase for scalability

---

## 2. Product Overview

### 2.1 Vision Statement

> To create a messaging platform that brings back the joy of discovery and meaningful connections while maintaining modern security and privacy standards.

### 2.2 Problem Statement

Current messaging apps focus on connecting with people you already know. Users miss:
- **Serendipitous discovery** of new people with shared interests
- **Public chat rooms** for community building
- **Visual discovery interfaces** that make finding people fun
- **Privacy-first design** that doesn't sacrifice security for features

### 2.3 Solution

A unified messenger that provides:
- Visual radar system for discovering nearby users
- End-to-end encrypted private conversations
- Themed public chat rooms
- Intelligent people suggestions
- Advanced search and filtering

---

## 3. Goals & Objectives

### 3.1 Business Goals

1. **User Acquisition**: Reach 100K users in first 6 months
2. **Engagement**: Average session time of 15+ minutes
3. **Retention**: 40% 30-day retention rate
4. **Community**: 50+ active chat rooms

### 3.2 User Goals

1. **Discovery**: Find and connect with interesting people
2. **Privacy**: Communicate securely with end-to-end encryption
3. **Community**: Participate in topic-based discussions
4. **Simplicity**: Intuitive interface that requires no learning curve

---

## 4. User Personas

### 4.1 Primary Persona: "Social Explorer Sarah"

**Demographics:**
- Age: 22-35
- Tech-savvy
- Active on social media
- Values privacy

**Goals:**
- Meet people with similar interests
- Join niche communities
- Have meaningful conversations
- Maintain privacy

**Pain Points:**
- Tired of dating apps
- Wants more than superficial connections
- Concerned about data privacy

### 4.2 Secondary Persona: "Community Builder Carlos"

**Demographics:**
- Age: 25-40
- Community organizer
- Tech enthusiast
- Early adopter

**Goals:**
- Build online communities
- Moderate discussions
- Connect people
- Share knowledge

**Pain Points:**
- Existing platforms are too corporate
- Lack of discovery features
- Limited customization options

---

## 5. Features & Requirements

### 5.1 Authentication & User Management

#### 5.1.1 User Registration
**Priority:** P0 (Must Have)

**Requirements:**
- Email/password registration
- User profile creation with:
  - Name (required)
  - Age (required, 13+)
  - Gender (required)
  - Location (required)
  - Interests (optional)
  - Bio (optional)
  - Avatar (optional, defaults to initials)
- Email verification
- Terms of Service acceptance

**Acceptance Criteria:**
- [x] User can register with valid email
- [x] Password must be 8+ characters
- [x] Age validation (13+)
- [x] Duplicate email prevention
- [x] Email verification sent
- [x] Profile created in database

#### 5.1.2 User Authentication
**Priority:** P0 (Must Have)

**Requirements:**
- Secure login with email/password
- Session management with JWT tokens
- "Remember me" functionality
- Password reset via email
- Logout functionality

**Acceptance Criteria:**
- [x] Successful login redirects to main app
- [x] Failed login shows error message
- [x] Session persists across browser refresh
- [x] Password reset email sent
- [x] Logout clears session

### 5.2 Radar Discovery System

#### 5.2.1 Radar View
**Priority:** P0 (Must Have)

**Requirements:**
- Animated circular radar interface
- Display online users as dots on radar
- Position based on:
  - Geographic proximity (if location shared)
  - Interest similarity
  - Activity status
- Click on user dot to view profile
- Smooth animations (rotating sweep line, pulsing rings)
- Real-time updates every 30 seconds

**Acceptance Criteria:**
- [x] Radar displays with 5 concentric circles
- [x] Sweep line rotates continuously
- [x] User dots appear at calculated positions
- [x] Clicking dot shows user quick-view card
- [x] Radar updates with new users
- [x] Responsive design (scales on mobile)

#### 5.2.2 User Discovery Algorithm
**Priority:** P0 (Must Have)

**Requirements:**
- Match users based on:
  - Shared interests (40% weight)
  - Age similarity (20% weight)
  - Location proximity (20% weight)
  - Online status (20% weight)
- Exclude already-connected users
- Prioritize active users

**Acceptance Criteria:**
- [x] Algorithm returns relevant users
- [x] Results exclude blocked users
- [x] Results exclude current buddies
- [x] Maximum 20 users on radar at once

### 5.3 Chat Rooms (Multi-User Chat)

#### 5.3.1 Public Chat Rooms
**Priority:** P0 (Must Have)

**Requirements:**
- Pre-defined themed rooms:
  - 🌍 General
  - 💻 Technology
  - 🎮 Gaming
  - 🎵 Music
  - ⚽ Sports
  - 🎬 Cinema
  - 👨‍💻 Programming
  - ✈️ Travel
- Display user count per room
- Show active/hot rooms with badges
- Join/leave rooms instantly
- Persistent room history (last 100 messages)

**Acceptance Criteria:**
- [x] All 8 rooms are available
- [x] User count is accurate
- [x] Messages appear in real-time
- [x] Room history loads on join
- [x] Badges update based on activity

#### 5.3.2 Room Messaging
**Priority:** P0 (Must Have)

**Requirements:**
- Real-time message delivery (< 500ms)
- Message display shows:
  - Username
  - Avatar
  - Message content
  - Timestamp
- Support for:
  - Text messages (max 2000 chars)
  - Emoji/emoticons
  - @mentions
- Message encryption in transit
- System messages for join/leave events

**Acceptance Criteria:**
- [x] Messages appear instantly
- [x] All users in room receive messages
- [x] Message format is consistent
- [x] Long messages wrap properly
- [x] System messages are distinguishable

### 5.4 Private Messaging (Buddy Chat)

#### 5.4.1 Buddy List
**Priority:** P0 (Must Have)

**Requirements:**
- Display all added buddies
- Sort by most recent conversation
- Show online status (online/away/busy/offline)
- Show current mood/status message
- Avatar with status indicator
- Click to open private chat

**Acceptance Criteria:**
- [x] Buddies sorted by recent activity
- [x] Status indicators accurate
- [x] Mood messages display correctly
- [x] Online status updates in real-time
- [x] Avatar loads or shows initials

#### 5.4.2 Private Chat
**Priority:** P0 (Must Have)

**Requirements:**
- One-on-one encrypted messaging
- End-to-end encryption (E2EE)
- Message display similar to room chat
- Typing indicators
- Read receipts (optional)
- Message history (last 1000 messages)
- Offline message delivery

**Acceptance Criteria:**
- [x] Messages are encrypted
- [x] Only sender and recipient can read
- [x] Typing indicator shows when buddy is typing
- [x] Message history persists
- [x] Offline messages delivered on login

### 5.5 People Search & Discovery

#### 5.5.1 Advanced Search
**Priority:** P1 (Should Have)

**Requirements:**
- Filter by:
  - Age range (dropdown)
  - Gender (dropdown)
  - Location (text input with autocomplete)
  - Interests (text input with tags)
- Search results display:
  - Name, age
  - Location
  - Interests
  - Add button
- Real-time search (debounced)

**Acceptance Criteria:**
- [x] Filters work individually and combined
- [x] Results update on filter change
- [x] Empty state when no results
- [x] Add button adds to buddy list
- [x] Search is performant (< 1s)

#### 5.5.2 New User Suggestions
**Priority:** P1 (Should Have)

**Requirements:**
- Suggest 6-10 users based on:
  - Similar interests
  - Proximity
  - Popular users
- Update suggestions daily
- "Add Friend" button
- Remove from suggestions once added
- Show why suggested (common interests)

**Acceptance Criteria:**
- [x] Suggestions are relevant
- [x] Added users removed from list
- [x] Suggestions refresh daily
- [x] Reason for suggestion shown

### 5.6 User Profile & Settings

#### 5.6.1 User Profile
**Priority:** P1 (Should Have)

**Requirements:**
- View own profile
- View other users' profiles
- Edit profile fields:
  - Name
  - Bio
  - Location
  - Interests (tags)
  - Avatar upload
- Privacy settings:
  - Show location (yes/no)
  - Show age (yes/no)
  - Who can message me (everyone/buddies only)

**Acceptance Criteria:**
- [x] Profile displays all information
- [x] Edit mode saves changes
- [x] Avatar uploads successfully
- [x] Privacy settings enforced

#### 5.6.2 Mood/Status
**Priority:** P2 (Nice to Have)

**Requirements:**
- Predefined moods:
  - 😊 Happy
  - 💼 Working
  - 🎮 Gaming
  - 😴 Sleepy
  - 🎵 Listening to Music
- Custom status message (max 100 chars)
- Mood displays in buddy list
- Updates in real-time

**Acceptance Criteria:**
- [x] Mood selection saves
- [x] Mood displays to all buddies
- [x] Custom status works
- [x] Updates immediately

### 5.7 Theme & Appearance

#### 5.7.1 Dark/Light Mode
**Priority:** P1 (Should Have)

**Requirements:**
- Light mode (default)
- Dark mode
- Toggle button in top bar
- Preference saved to profile
- Smooth transition animations

**Acceptance Criteria:**
- [x] Both themes work correctly
- [x] Preference persists
- [x] All UI elements adapt
- [x] High contrast maintained

### 5.8 End-to-End Encryption

#### 5.8.1 Message Encryption
**Priority:** P0 (Must Have)

**Requirements:**
- Use Signal Protocol or similar
- Generate key pairs on registration
- Exchange keys on buddy add
- Encrypt all private messages
- Decrypt on recipient device only
- No server access to plaintext

**Technical Details:**
- **Algorithm**: AES-256-GCM
- **Key Exchange**: Diffie-Hellman
- **Libraries**: 
  - Frontend: `crypto-js` or `tweetnacl`
  - Backend: `libsodium` or native Supabase encryption

**Acceptance Criteria:**
- [x] Messages encrypted before send
- [x] Server stores encrypted blobs
- [x] Only recipient can decrypt
- [x] Key rotation supported
- [x] Forward secrecy maintained

### 5.9 Notifications

#### 5.9.1 In-App Notifications
**Priority:** P1 (Should Have)

**Requirements:**
- New message notifications
- Friend request notifications
- Mention notifications
- Visual badge counters
- Sound alerts (optional)
- Notification center/history

**Acceptance Criteria:**
- [x] Notifications appear instantly
- [x] Badge counts are accurate
- [x] Click notification navigates to content
- [x] Notifications can be cleared

### 5.10 Mobile Responsiveness

#### 5.10.1 Mobile Layout
**Priority:** P0 (Must Have)

**Requirements:**
- Responsive design for all screen sizes
- Mobile-optimized layouts:
  - Collapsible sidebars
  - Hamburger menu
  - Bottom navigation (optional)
- Touch-friendly buttons (min 44px)
- Swipe gestures (nice to have)

**Acceptance Criteria:**
- [x] Works on screens 320px+
- [x] All features accessible on mobile
- [x] No horizontal scroll
- [x] Touch targets are adequate

---

## 6. Technical Architecture

### 6.1 Frontend Stack

**Framework:** React 18+  
**Language:** TypeScript 5+  
**State Management:** Zustand or Redux Toolkit  
**Routing:** React Router v6  
**UI Components:** Custom + Headless UI  
**Styling:** Tailwind CSS + CSS Modules  
**Real-time:** Supabase Realtime  
**Forms:** React Hook Form + Zod  
**HTTP Client:** Axios  
**Encryption:** TweetNaCl.js or crypto-js

### 6.2 Backend Stack

**Platform:** Supabase  
**Database:** PostgreSQL (via Supabase)  
**Authentication:** Supabase Auth  
**Storage:** Supabase Storage (for avatars)  
**Real-time:** Supabase Realtime (WebSockets)  
**Functions:** Supabase Edge Functions (Deno)  
**Hosting:** Vercel or Netlify (frontend)

### 6.3 Database Schema

#### 6.3.1 Core Tables

**users**
```sql
- id (uuid, primary key)
- email (text, unique)
- username (text, unique)
- display_name (text)
- age (integer)
- gender (text)
- location (text)
- bio (text)
- interests (text[])
- avatar_url (text)
- mood (text)
- status_message (text)
- online_status (enum: online, away, busy, offline)
- last_seen (timestamp)
- public_key (text) -- for E2EE
- created_at (timestamp)
- updated_at (timestamp)
```

**buddies**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> users.id)
- buddy_id (uuid, foreign key -> users.id)
- status (enum: pending, accepted, blocked)
- created_at (timestamp)
- last_message_at (timestamp)
- UNIQUE(user_id, buddy_id)
```

**chat_rooms**
```sql
- id (uuid, primary key)
- name (text, unique)
- description (text)
- emoji (text)
- is_active (boolean)
- user_count (integer, default 0)
- created_at (timestamp)
```

**room_messages**
```sql
- id (uuid, primary key)
- room_id (uuid, foreign key -> chat_rooms.id)
- user_id (uuid, foreign key -> users.id)
- content (text)
- created_at (timestamp)
```

**private_messages**
```sql
- id (uuid, primary key)
- sender_id (uuid, foreign key -> users.id)
- recipient_id (uuid, foreign key -> users.id)
- encrypted_content (text) -- encrypted message
- iv (text) -- initialization vector
- created_at (timestamp)
- read_at (timestamp)
```

**user_presence**
```sql
- user_id (uuid, primary key, foreign key -> users.id)
- online_status (enum)
- last_activity (timestamp)
- current_room_id (uuid, foreign key -> chat_rooms.id)
```

#### 6.3.2 Indexes

```sql
CREATE INDEX idx_buddies_user_id ON buddies(user_id);
CREATE INDEX idx_buddies_buddy_id ON buddies(buddy_id);
CREATE INDEX idx_room_messages_room_id ON room_messages(room_id);
CREATE INDEX idx_room_messages_created_at ON room_messages(created_at DESC);
CREATE INDEX idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX idx_private_messages_recipient ON private_messages(recipient_id);
CREATE INDEX idx_users_location ON users USING GIN(to_tsvector('english', location));
CREATE INDEX idx_users_interests ON users USING GIN(interests);
```

### 6.4 API Endpoints (Supabase Functions)

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/reset-password` - Request password reset
- `POST /auth/verify-email` - Verify email

#### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `GET /users/:id` - Get user by ID
- `GET /users/search` - Search users
- `GET /users/suggestions` - Get suggested users

#### Buddies
- `GET /buddies` - Get user's buddy list
- `POST /buddies` - Add buddy
- `DELETE /buddies/:id` - Remove buddy
- `PUT /buddies/:id/block` - Block buddy

#### Chat Rooms
- `GET /rooms` - Get all chat rooms
- `GET /rooms/:id` - Get room details
- `GET /rooms/:id/messages` - Get room messages
- `POST /rooms/:id/messages` - Send message to room
- `POST /rooms/:id/join` - Join room
- `POST /rooms/:id/leave` - Leave room

#### Private Messages
- `GET /messages/:buddy_id` - Get conversation with buddy
- `POST /messages/:buddy_id` - Send private message
- `PUT /messages/:id/read` - Mark message as read

#### Radar
- `GET /radar/users` - Get users for radar display

### 6.5 Real-time Subscriptions

Using Supabase Realtime channels:

1. **Room Messages**: `room_messages:room_id=eq.{roomId}`
2. **Private Messages**: `private_messages:or(sender_id.eq.{userId},recipient_id.eq.{userId})`
3. **User Presence**: `user_presence:*`
4. **Buddy Requests**: `buddies:user_id=eq.{userId}`

### 6.6 Security Considerations

#### Authentication
- JWT tokens with 7-day expiry
- Refresh tokens for session extension
- Rate limiting on login attempts (5 per minute)
- Email verification required

#### Authorization
- Row Level Security (RLS) policies on all tables
- Users can only read their own private messages
- Users can read public room messages
- Buddy relationship required for private messaging

#### Data Protection
- All private messages E2E encrypted
- Passwords hashed with bcrypt
- HTTPS/TLS for all connections
- No logging of message content
- GDPR compliance (data export, deletion)

#### Input Validation
- Server-side validation with Zod schemas
- XSS prevention (sanitize HTML)
- SQL injection prevention (parameterized queries)
- File upload size limits (5MB for avatars)

---

## 7. User Flows

### 7.1 Registration Flow

1. User lands on login page
2. Clicks "Sign Up"
3. Fills registration form:
   - Email
   - Password
   - Name
   - Age
   - Gender
   - Location
4. Accepts Terms of Service
5. Submits form
6. System sends verification email
7. User clicks verification link
8. Redirected to login
9. Logs in successfully
10. Redirected to main app (Radar view)

### 7.2 Message Flow (Room)

1. User clicks on chat room from accordion
2. Room opens in main area
3. Room history loads (last 100 messages)
4. User types message in input field
5. Presses Enter or clicks Send
6. Message encrypted (if private) and sent to Supabase
7. Supabase broadcasts to all users in room
8. All users receive message via WebSocket
9. Message appears in chat with animation

### 7.3 Buddy Add Flow

1. User searches for person or sees suggestion
2. Clicks "Add" button on user card
3. System creates buddy relationship
4. Notification sent to other user (future feature)
5. User removed from suggestions
6. User added to buddy list (sorted by recent)
7. User can now send private messages

### 7.4 Radar Discovery Flow

1. User switches to Radar view
2. System fetches nearby/similar users (API call)
3. Radar renders with user dots
4. User clicks on dot
5. Quick-view card appears with:
   - Name, age
   - Location
   - Interests
   - Add/Message buttons
6. User clicks Add or Message
7. Action performed (buddy added or chat opened)

---

## 8. UI/UX Specifications

### 8.1 Color Palette

#### Light Theme
- **Primary Blue**: `#0066cc`
- **Light Blue**: `#3399ff`
- **Orange**: `#ff6600`
- **Yellow**: `#ffcc00`
- **Green**: `#00cc66`
- **Red**: `#ff3366`
- **Purple**: `#8338ec`

- **Background Primary**: `#e6f2ff`
- **Background Secondary**: `#ffffff`
- **Background Tertiary**: `#f0f8ff`

#### Dark Theme
- **Background Primary**: `#0a0e27`
- **Background Secondary**: `#141b3a`
- **Background Tertiary**: `#1e2749`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#3399ff`

### 8.2 Typography

- **Headings**: Orbitron (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Code/Monospace**: Space Mono

**Font Sizes:**
- Display: 64px
- H1: 32px
- H2: 24px
- H3: 20px
- Body: 14px
- Small: 12px
- Tiny: 11px

### 8.3 Layout Grid

- **Desktop**: 3-column layout (300px | 1fr | 340px)
- **Tablet**: 2-column layout (280px | 1fr)
- **Mobile**: 1-column layout (100%)

### 8.4 Component Specifications

#### Radar
- Size: 500x500px (max, responsive)
- Circles: 5 concentric, 20% increments
- Sweep line: 2s rotation
- User dots: 40-50px diameter
- Animations: CSS transitions (0.3s)

#### Message Bubble
- Max width: 70%
- Padding: 12px 16px
- Border radius: 16px
- Own messages: Gradient blue background
- Other messages: White/tertiary background

#### Avatar
- Size: 40px (standard), 48px (large), 36px (small)
- Border: 2px solid
- Status indicator: 12px circle, bottom-right

#### Buttons
- Primary: Gradient blue, white text
- Secondary: Tertiary background, primary text
- Small: 8px 16px padding
- Large: 14px 24px padding

---

## 9. Security & Privacy

### 9.1 End-to-End Encryption Implementation

**Key Generation:**
```typescript
// Generate key pair on registration
const keyPair = nacl.box.keyPair();
// Store public key in database
// Store private key in localStorage (encrypted with password)
```

**Message Encryption:**
```typescript
// Encrypt before sending
const nonce = nacl.randomBytes(24);
const encrypted = nacl.box(
  message,
  nonce,
  recipientPublicKey,
  myPrivateKey
);
// Send encrypted + nonce to server
```

**Message Decryption:**
```typescript
// Decrypt on receive
const decrypted = nacl.box.open(
  encrypted,
  nonce,
  senderPublicKey,
  myPrivateKey
);
```

### 9.2 Privacy Features

- **Location Privacy**: Option to hide exact location
- **Age Privacy**: Option to show age range instead of exact age
- **Blocking**: Users can block others (no contact, invisible on radar)
- **Report System**: Report inappropriate behavior
- **Data Export**: Users can export all their data
- **Data Deletion**: Users can delete account and all data

### 9.3 Content Moderation

- **Automated Filters**: Block offensive language in room messages
- **User Reports**: Flagging system for inappropriate content
- **Moderators**: Room moderators can mute/kick users
- **Rate Limiting**: Prevent spam (max 10 messages per minute)

---

## 10. Success Metrics

### 10.1 Key Performance Indicators (KPIs)

#### Acquisition
- **Sign-ups per day**: Target 500+
- **Activation rate**: 70% (complete profile after signup)
- **Referral rate**: 15% (users inviting friends)

#### Engagement
- **Daily Active Users (DAU)**: 40% of total users
- **Average session duration**: 15+ minutes
- **Messages per user per day**: 20+
- **Rooms joined per user**: 3+

#### Retention
- **Day 1 retention**: 60%
- **Day 7 retention**: 40%
- **Day 30 retention**: 25%

#### Technical
- **Page load time**: < 2 seconds
- **Message delivery time**: < 500ms
- **Uptime**: 99.9%
- **Crash-free rate**: 99%

### 10.2 Analytics Events

**User Actions:**
- `user_registered`
- `user_logged_in`
- `profile_completed`
- `buddy_added`
- `room_joined`
- `message_sent`
- `radar_viewed`
- `search_performed`
- `theme_changed`

**System Events:**
- `message_delivered`
- `message_encrypted`
- `key_exchange_completed`
- `presence_updated`

---

## 11. Roadmap

### Phase 1: MVP (Month 1-2)
- ✅ User authentication
- ✅ Basic profile management
- ✅ Chat rooms (8 predefined)
- ✅ Private messaging
- ✅ Buddy list
- ✅ Radar view (basic)
- ✅ Dark/light theme
- ✅ E2E encryption

### Phase 2: Enhanced Discovery (Month 3-4)
- Advanced search filters
- New user suggestions algorithm
- Radar improvements (better positioning)
- User reputation system
- Badges/achievements
- Custom avatars upload

### Phase 3: Community Features (Month 5-6)
- Custom chat rooms (user-created)
- Room moderation tools
- User groups/communities
- Event scheduling
- Voice messages
- File sharing (encrypted)

### Phase 4: Mobile Apps (Month 7-9)
- React Native iOS app
- React Native Android app
- Push notifications
- Offline mode
- Background sync

### Phase 5: Advanced Features (Month 10-12)
- Video/voice calls (WebRTC)
- Screen sharing
- Giphy integration
- Custom emoji/stickers
- Translation (i18n)
- AI chatbot assistant

---

## 12. Appendix

### 12.1 Glossary

- **Buddy**: A user you've added to your contact list
- **Radar**: Visual discovery interface showing nearby users
- **Room**: Public chat channel with multiple users
- **E2EE**: End-to-end encryption
- **Mood**: User-selected status indicator
- **Presence**: Online/offline status

### 12.2 References

- [Signal Protocol Documentation](https://signal.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Best Practices](https://react.dev/)
- [GDPR Compliance Guide](https://gdpr.eu/)

### 12.3 Change Log

- **v1.0 (Nov 2025)**: Initial PRD created

---

**End of PRD**
