import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import English translations
import enCommon from '@/locales/en/common.json';
import enNavigation from '@/locales/en/navigation.json';
import enSettings from '@/locales/en/settings.json';
import enAds from '@/locales/en/ads.json';
import enProfile from '@/locales/en/profile.json';
import enPosts from '@/locales/en/posts.json';
import enCommunities from '@/locales/en/communities.json';
import enMessages from '@/locales/en/messages.json';
import enNotifications from '@/locales/en/notifications.json';
import enLibrary from '@/locales/en/library.json';
import enTimeline from '@/locales/en/timeline.json';
import enModeration from '@/locales/en/moderation.json';
import enGamification from '@/locales/en/gamification.json';
import enErrors from '@/locales/en/errors.json';
import enAuth from '@/locales/en/auth.json';
import enSearch from '@/locales/en/search.json';
import enHelp from '@/locales/en/help.json';
import enPremium from '@/locales/en/premium.json';
import enAdmin from '@/locales/en/admin.json';
import enAbout from '@/locales/en/about.json';
import enPassword from '@/locales/en/password.json';
import enChat from '@/locales/en/chat.json';

// Import Portuguese translations
import ptCommon from '@/locales/pt/common.json';
import ptNavigation from '@/locales/pt/navigation.json';
import ptSettings from '@/locales/pt/settings.json';
import ptAds from '@/locales/pt/ads.json';
import ptProfile from '@/locales/pt/profile.json';
import ptPosts from '@/locales/pt/posts.json';
import ptCommunities from '@/locales/pt/communities.json';
import ptMessages from '@/locales/pt/messages.json';
import ptNotifications from '@/locales/pt/notifications.json';
import ptLibrary from '@/locales/pt/library.json';
import ptTimeline from '@/locales/pt/timeline.json';
import ptModeration from '@/locales/pt/moderation.json';
import ptGamification from '@/locales/pt/gamification.json';
import ptErrors from '@/locales/pt/errors.json';
import ptAuth from '@/locales/pt/auth.json';
import ptSearch from '@/locales/pt/search.json';
import ptHelp from '@/locales/pt/help.json';
import ptPremium from '@/locales/pt/premium.json';
import ptAdmin from '@/locales/pt/admin.json';
import ptAbout from '@/locales/pt/about.json';
import ptPassword from '@/locales/pt/password.json';
import ptChat from '@/locales/pt/chat.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    settings: enSettings,
    ads: enAds,
    profile: enProfile,
    posts: enPosts,
    communities: enCommunities,
    messages: enMessages,
    notifications: enNotifications,
    library: enLibrary,
    timeline: enTimeline,
    moderation: enModeration,
    gamification: enGamification,
    errors: enErrors,
    auth: enAuth,
    search: enSearch,
    help: enHelp,
    premium: enPremium,
    admin: enAdmin,
    about: enAbout,
    password: enPassword,
    chat: enChat,
  },
  pt: {
    common: ptCommon,
    navigation: ptNavigation,
    settings: ptSettings,
    ads: ptAds,
    profile: ptProfile,
    posts: ptPosts,
    communities: ptCommunities,
    messages: ptMessages,
    notifications: ptNotifications,
    library: ptLibrary,
    timeline: ptTimeline,
    moderation: ptModeration,
    gamification: ptGamification,
    errors: ptErrors,
    auth: ptAuth,
    search: ptSearch,
    help: ptHelp,
    premium: ptPremium,
    admin: ptAdmin,
    about: ptAbout,
    password: ptPassword,
    chat: ptChat,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // Default language is English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    keySeparator: '.',
    nsSeparator: ':',
    ns: [
      'common',
      'navigation',
      'settings',
      'ads',
      'profile',
      'posts',
      'communities',
      'messages',
      'notifications',
      'library',
      'timeline',
      'moderation',
      'gamification',
      'errors',
      'auth',
      'search',
      'help',
      'premium',
      'admin',
      'about',
      'password',
      'chat',
    ],
    defaultNS: 'common',
  });

export default i18n;
