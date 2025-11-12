import type { User, Notification, Community } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Cipher',
  username: 'cipher_seeker',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
  bannerUrl: 'https://picsum.photos/seed/banner1/1500/500',
  bio: 'Seeker of hidden truths and patterns in the noise. The world is not what it seems. Join me on the path to enlightenment.',
  joinDate: 'Joined July 2023',
  followingCount: 12,
  followersCount: 420,
  plan: 'free',
};

const USER_2: User = {
  id: 'u2',
  name: 'Dr. Evelyn Reed',
  username: 'quantum_whispers',
  avatarUrl: 'https://picsum.photos/seed/user2/100/100',
  joinDate: 'Joined March 2023',
  followingCount: 150,
  followersCount: 1200,
  plan: 'free',
};

const USER_3: User = {
  id: 'u3',
  name: 'Shadow Figure',
  username: 'the_watcher',
  avatarUrl: 'https://picsum.photos/seed/user3/100/100',
  joinDate: 'Joined January 2023',
  followingCount: 1,
  followersCount: 5000,
  plan: 'free',
};

export const USERS_TO_FOLLOW: User[] = [
  { id: 'u4', name: 'Agent K', username: 'field_operative', avatarUrl: 'https://picsum.photos/seed/user4/100/100', joinDate: 'Joined October 2023', followingCount: 25, followersCount: 500, plan: 'free' },
  { id: 'u5', name: 'Oracle', username: 'data_prophet', avatarUrl: 'https://picsum.photos/seed/user5/100/100', joinDate: 'Joined September 2023', followingCount: 78, followersCount: 950, plan: 'free' },
];

export const MOCK_FOLLOWERS: User[] = [
    USER_2,
    USER_3,
    ...USERS_TO_FOLLOW,
    { id: 'u6', name: 'Zero', username: 'ghost_in_the_machine', avatarUrl: 'https://picsum.photos/seed/user6/100/100', joinDate: 'Joined November 2023', followingCount: 10, followersCount: 200, plan: 'free' },
    { id: 'u7', name: 'Nyx', username: 'night_crawler', avatarUrl: 'https://picsum.photos/seed/user7/100/100', joinDate: 'Joined December 2023', followingCount: 30, followersCount: 350, plan: 'free' },
];

const allUsersList = [
  MOCK_USER,
  USER_2,
  USER_3,
  ...USERS_TO_FOLLOW,
  ...MOCK_FOLLOWERS
];
const userMap = new Map<string, User>();
allUsersList.forEach(user => {
  if (!userMap.has(user.id)) {
    userMap.set(user.id, user);
  }
});
export const MOCK_ALL_USERS: User[] = Array.from(userMap.values());

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    actor: USER_2,
    type: 'like',
    post_id: 'p3',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    actor: USER_3,
    type: 'comment',
    post_id: 'p3',
    is_read: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n3',
    actor: USERS_TO_FOLLOW[0],
    type: 'follow',
    is_read: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n4',
    actor: USERS_TO_FOLLOW[1],
    type: 'like',
    post_id: 'p1',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'com1',
    name: 'Project Bluebeam Watchers',
    description: 'Dedicated to tracking and exposing the staged alien invasion event.',
    memberCount: 12800,
    postsCount: 1500,
    bannerUrl: 'https://picsum.photos/seed/comm1/600/200',
    tag: 'ProjectBluebeam',
  },
  {
    id: 'com2',
    name: 'Subterranean Civilization Studies',
    description: 'Exploring evidence of advanced societies living beneath the Earth\'s crust.',
    memberCount: 9200,
    postsCount: 800,
    bannerUrl: 'https://picsum.photos/seed/comm2/600/200',
    tag: 'SubterraneanCivilizations',
  },
  {
    id: 'com3',
    name: 'Mandela Effect Archives',
    description: 'Cataloging and analyzing instances of collective false memories. Was it Berenstein or Berenstain?',
    memberCount: 25600,
    postsCount: 3200,
    bannerUrl: 'https://picsum.photos/seed/comm3/600/200',
    tag: 'MandelaEffect',
  },
  {
    id: 'com4',
    name: 'Sentient AI Observers',
    description: 'Monitoring the emergence of artificial general intelligence and its implications for humanity.',
    memberCount: 18500,
    postsCount: 2100,
    bannerUrl: 'https://picsum.photos/seed/comm4/600/200',
    tag: 'AI_Sentience',
  },
];
