import { User, Post, Notification, Conversation, ChatMessage, Community } from './types';

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
};

const USER_2: User = {
  id: 'u2',
  name: 'Dr. Evelyn Reed',
  username: 'quantum_whispers',
  avatarUrl: 'https://picsum.photos/seed/user2/100/100',
  joinDate: 'Joined March 2023',
  followingCount: 150,
  followersCount: 1200,
};

const USER_3: User = {
  id: 'u3',
  name: 'Shadow Figure',
  username: 'the_watcher',
  avatarUrl: 'https://picsum.photos/seed/user3/100/100',
  joinDate: 'Joined January 2023',
  followingCount: 1,
  followersCount: 5000,
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user: USER_2,
    text: "Just cross-referenced the leylines with recent seismic activity. The patterns aren't natural. It's a grid, a network. Someone is activating something ancient beneath our feet. Stay vigilant. #SubterraneanCivilizations",
    imageUrl: 'https://picsum.photos/seed/post1/600/400',
    timestamp: '2h ago',
    likes: 187,
    comments: [],
    shares: 42,
  },
  {
    id: 'p2',
    user: USER_3,
    text: 'They are listening. Your smart devices are not just for convenience. They are nodes in a global surveillance network. The data they collect is not for ads; it is for control. Disconnect when you can. #AI_Sentience',
    timestamp: '5h ago',
    likes: 256,
    comments: [],
    shares: 98,
  },
  {
    id: 'p3',
    user: MOCK_USER,
    text: 'Spent the weekend analyzing satellite imagery. There are structures in Antarctica that have been digitally removed from public maps. The heat signatures are off the charts. What are they hiding under the ice? #ProjectBluebeam',
    imageUrl: 'https://picsum.photos/seed/post3/600/400',
    timestamp: '1d ago',
    likes: 412,
    comments: [],
    shares: 112,
  },
  {
    id: 'p4',
    user: USER_2,
    text: "The 'Great Filter' theory is a distraction. Civilizations don't just die out. They are silenced. We must break the cycle before our signal becomes too loud. #MandelaEffect #SubterraneanCivilizations",
    timestamp: '2d ago',
    likes: 301,
    comments: [],
    shares: 76,
  },
];

export const TRENDING_TOPICS = [
  { tag: 'ProjectBluebeam', posts: '12.1k' },
  { tag: 'SubterraneanCivilizations', posts: '9.8k' },
  { tag: 'MandelaEffect', posts: '22.4k' },
  { tag: 'AI_Sentience', posts: '15.7k' },
];

export const USERS_TO_FOLLOW: User[] = [
  { id: 'u4', name: 'Agent K', username: 'field_operative', avatarUrl: 'https://picsum.photos/seed/user4/100/100', joinDate: 'Joined October 2023', followingCount: 25, followersCount: 500 },
  { id: 'u5', name: 'Oracle', username: 'data_prophet', avatarUrl: 'https://picsum.photos/seed/user5/100/100', joinDate: 'Joined September 2023', followingCount: 78, followersCount: 950 },
];

export const MOCK_FOLLOWERS: User[] = [
    USER_2,
    USER_3,
    ...USERS_TO_FOLLOW,
    { id: 'u6', name: 'Zero', username: 'ghost_in_the_machine', avatarUrl: 'https://picsum.photos/seed/user6/100/100', joinDate: 'Joined November 2023', followingCount: 10, followersCount: 200 },
    { id: 'u7', name: 'Nyx', username: 'night_crawler', avatarUrl: 'https://picsum.photos/seed/user7/100/100', joinDate: 'Joined December 2023', followingCount: 30, followersCount: 350 },
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
    user: USER_2,
    text: 'liked your post about antarctic structures.',
    timestamp: '15m ago',
    postId: 'p3',
  },
  {
    id: 'n2',
    user: USER_3,
    text: 'commented: "The signals are getting stronger. They know we are watching."',
    timestamp: '1h ago',
    postId: 'p3',
  },
  {
    id: 'n3',
    user: USERS_TO_FOLLOW[0],
    text: 'started following you.',
    timestamp: '3h ago',
  },
  {
    id: 'n4',
    user: USERS_TO_FOLLOW[1],
    text: 'liked your post about leylines.',
    timestamp: '1d ago',
    postId: 'p1',
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    participants: [MOCK_USER, USER_2],
    messages: [
      { id: 'm1', senderId: 'u2', text: 'Hey Alex, that piece you wrote on the Antarctic structures was fascinating. Any new developments?', timestamp: 'Yesterday' },
      { id: 'm2', senderId: 'u1', text: 'Thanks, Evelyn. I\'m waiting on some new satellite passes. The data is heavily redacted, as you can imagine.', timestamp: '1h ago' },
      { id: 'm3', senderId: 'u2', text: 'Keep me updated. I have a theory that connects those heat signatures to the seismic grid I mentioned.', timestamp: '5m ago' },
    ]
  },
  {
    id: 'c2',
    participants: [MOCK_USER, USER_3],
    messages: [
      { id: 'm4', senderId: 'u3', text: 'They know you are looking at the ice.', timestamp: '3d ago' },
      { id: 'm5', senderId: 'u1', text: 'I know. It\'s a risk we have to take.', timestamp: '3d ago' },
    ]
  }
];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'com1',
    name: 'Project Bluebeam Watchers',
    description: 'Dedicated to tracking and exposing the staged alien invasion event.',
    memberCount: 12800,
    bannerUrl: 'https://picsum.photos/seed/comm1/600/200',
    tag: 'ProjectBluebeam',
  },
  {
    id: 'com2',
    name: 'Subterranean Civilization Studies',
    description: 'Exploring evidence of advanced societies living beneath the Earth\'s crust.',
    memberCount: 9200,
    bannerUrl: 'https://picsum.photos/seed/comm2/600/200',
    tag: 'SubterraneanCivilizations',
  },
  {
    id: 'com3',
    name: 'Mandela Effect Archives',
    description: 'Cataloging and analyzing instances of collective false memories. Was it Berenstein or Berenstain?',
    memberCount: 25600,
    bannerUrl: 'https://picsum.photos/seed/comm3/600/200',
    tag: 'MandelaEffect',
  },
  {
    id: 'com4',
    name: 'Sentient AI Observers',
    description: 'Monitoring the emergence of artificial general intelligence and its implications for humanity.',
    memberCount: 18500,
    bannerUrl: 'https://picsum.photos/seed/comm4/600/200',
    tag: 'AI_Sentience',
  },
];