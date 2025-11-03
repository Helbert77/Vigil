import { lazy } from 'react';

// Lazy loading das páginas principais
export const LazyHome = lazy(() => import('@/pages/Home'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazySettings = lazy(() => import('@/pages/Settings'));
export const LazyNotifications = lazy(() => import('@/pages/Notifications'));
export const LazyMessages = lazy(() => import('@/pages/Messages'));
export const LazySaved = lazy(() => import('@/pages/Saved'));
export const LazyCommunities = lazy(() => import('@/pages/Communities'));
export const LazyPostDetail = lazy(() => import('@/pages/PostDetail'));
export const LazySearch = lazy(() => import('@/pages/Search'));
export const LazyCommunityDetail = lazy(() => import('@/pages/CommunityDetail'));
export const LazyTopicDetail = lazy(() => import('@/pages/TopicDetail'));
export const LazyTimeline = lazy(() => import('@/pages/Timeline'));

// Lazy loading das páginas estáticas
export const LazyAbout = lazy(() => import('@/pages/About'));
export const LazyTermsOfService = lazy(() => import('@/pages/TermsOfService'));
export const LazyPrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
export const LazyCookiePolicy = lazy(() => import('@/pages/CookiePolicy'));
export const LazyDisclaimer = lazy(() => import('@/pages/Disclaimer'));
export const LazyAccessibility = lazy(() => import('@/pages/Accessibility'));

// Lazy loading das páginas admin
export const LazyModeration = lazy(() => import('@/pages/admin/Moderation'));
export const LazyDashboard = lazy(() => import('@/components/admin/Dashboard'));
export const LazyAppeals = lazy(() => import('@/pages/admin/Appeals'));

// Lazy loading das páginas premium e especiais
export const LazyPremiumPage = lazy(() => import('@/src/pages/PremiumPage'));
export const LazyTrendingTopicsPage = lazy(() => import('@/pages/TrendingTopics'));
export const LazyExploreUsers = lazy(() => import('@/components/ExploreUsers'));
// Biblioteca
export const LazyLibrary = lazy(() => import('@/pages/Library'));

// Teste de Analytics
export const LazyTestAnalytics = lazy(() => import('@/src/pages/TestAnalytics'));

// Lazy loading das páginas de autenticação
export const LazyLogin = lazy(() => import('@/pages/Login'));
export const LazyUpdatePassword = lazy(() => import('@/pages/UpdatePassword'));
export const LazySplashScreen = lazy(() => import('@/pages/SplashScreen'));