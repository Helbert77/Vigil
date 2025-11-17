// Simple history utilities to map between application navigation state and URL paths.
// These are browser-compatible across modern Chrome, Firefox, Safari, and Edge.

export type Page =
  | 'Home'
  | 'Profile'
  | 'Settings'
  | 'Notifications'
  | 'Messages'
  | 'Saved'
  | 'Communities'
  | 'Library'
  | 'Timeline'
  | 'PostDetail'
  | 'AdDetail'
  | 'AdsDashboard'
  | 'MyAds'
  | 'SelectAdPlan'
  | 'PaymentSuccess'
  | 'Search'
  | 'CommunityDetail'
  | 'TopicDetail'
  | 'About'
  | 'TermsOfService'
  | 'PrivacyPolicy'
  | 'CookiePolicy'
  | 'Disclaimer'
  | 'Accessibility'
  | 'Moderation'
  | 'Dashboard'
  | 'Appeals'
  | 'Premium'
  | 'TrendingTopics'
  | 'ExploreUsers'
  | 'UpdatePassword';

export interface NavigationSnapshot {
  page: Page;
  viewedUserId?: string | null;
  activeCommunityId?: string | null;
  activePostId?: string | null;
  activeCommentId?: string | null;
  activeTag?: string | null;
  activeAdId?: string | null;
  searchQuery?: string;
}

// Build a pathname string from snapshot
export function buildPathFromSnapshot(state: NavigationSnapshot): string {
  switch (state.page) {
    case 'Home':
      return '/';
    case 'Profile':
      return state.viewedUserId ? `/profile/${encodeURIComponent(state.viewedUserId)}` : '/profile';
    case 'Settings':
      return '/settings';
    case 'Notifications':
      return '/notifications';
    case 'Messages':
      return '/messages';
    case 'Saved':
      return '/saved';
    case 'Communities':
      return '/communities';
    case 'Library':
      return '/library';
    case 'CommunityDetail':
      return state.activeCommunityId ? `/community/${encodeURIComponent(state.activeCommunityId)}` : '/community';
    case 'Timeline':
      return '/timeline';
    case 'PostDetail':
      return state.activePostId ? `/post/${encodeURIComponent(state.activePostId)}` : '/post';
    case 'AdDetail':
      return state.activeAdId ? `/ad/${encodeURIComponent(state.activeAdId)}` : '/ad';
    case 'AdsDashboard':
      return '/ads-dashboard';
    case 'MyAds':
      return '/my-ads';
    case 'SelectAdPlan':
      return '/advertising/select-plan';
    case 'PaymentSuccess':
      return '/advertising/payment-success';
    case 'Search': {
      const q = state.searchQuery ? `?q=${encodeURIComponent(state.searchQuery)}` : '';
      return `/search${q}`;
    }
    case 'TopicDetail':
      return state.activeTag ? `/topic/${encodeURIComponent(state.activeTag)}` : '/topic';
    case 'About':
      return '/about';
    case 'TermsOfService':
      return '/terms';
    case 'PrivacyPolicy':
      return '/privacy';
    case 'CookiePolicy':
      return '/cookies';
    case 'Disclaimer':
      return '/disclaimer';
    case 'Accessibility':
      return '/accessibility';
    case 'Moderation':
      return '/moderation';
    case 'Dashboard':
      return '/dashboard';
    case 'Appeals':
      return '/appeals';
    case 'Premium':
      return '/premium';
    case 'TrendingTopics':
      return '/trending';
    case 'ExploreUsers':
      return '/explore';
    case 'UpdatePassword':
      return '/update-password';
    default:
      return '/';
  }
}

// Parse a URL location into navigation snapshot
export function parseLocationToSnapshot(pathname: string, search: string): NavigationSnapshot {
  const withDefault = (page: Page, extra?: Partial<NavigationSnapshot>): NavigationSnapshot => ({ page, ...extra });

  // Static routes mapping
  const staticMap: Record<string, Page> = {
    '/': 'Home',
    '/settings': 'Settings',
    '/notifications': 'Notifications',
    '/messages': 'Messages',
    '/saved': 'Saved',
    '/communities': 'Communities',
    '/library': 'Library',
    '/timeline': 'Timeline',
    '/ads-dashboard': 'AdsDashboard',
    '/my-ads': 'MyAds',
    '/advertising/select-plan': 'SelectAdPlan',
    '/advertising/payment-success': 'PaymentSuccess',
    '/about': 'About',
    '/terms': 'TermsOfService',
    '/privacy': 'PrivacyPolicy',
    '/cookies': 'CookiePolicy',
    '/disclaimer': 'Disclaimer',
    '/accessibility': 'Accessibility',
    '/moderation': 'Moderation',
    '/dashboard': 'Dashboard',
    '/appeals': 'Appeals',
    '/premium': 'Premium',
    '/trending': 'TrendingTopics',
    '/explore': 'ExploreUsers',
    '/update-password': 'UpdatePassword',
  };

  if (staticMap[pathname]) return withDefault(staticMap[pathname]);

  // Dynamic routes
  const profileMatch = pathname.match(/^\/profile\/(.+)$/);
  if (profileMatch) return withDefault('Profile', { viewedUserId: decodeURIComponent(profileMatch[1]) });

  const communityMatch = pathname.match(/^\/community\/(.+)$/);
  if (communityMatch) return withDefault('CommunityDetail', { activeCommunityId: decodeURIComponent(communityMatch[1]) });

  const postMatch = pathname.match(/^\/post\/(.+)$/);
  if (postMatch) {
    const params = new URLSearchParams(search);
    const commentId = params.get('comment');
    return withDefault('PostDetail', {
      activePostId: decodeURIComponent(postMatch[1]),
      activeCommentId: commentId || null,
    });
  }

  const adMatch = pathname.match(/^\/ad\/(.+)$/);
  if (adMatch) {
    return withDefault('AdDetail', {
      activeAdId: decodeURIComponent(adMatch[1]),
    });
  }

  const topicMatch = pathname.match(/^\/topic\/(.+)$/);
  if (topicMatch) return withDefault('TopicDetail', { activeTag: decodeURIComponent(topicMatch[1]) });

  if (pathname === '/search') {
    const params = new URLSearchParams(search);
    const q = params.get('q') || '';
    return withDefault('Search', { searchQuery: q });
  }

  // Fallback
  return withDefault('Home');
}

// Push or replace state and URL
export function pushHistoryState(state: NavigationSnapshot, replace = false) {
  const path = buildPathFromSnapshot(state);
  const safeState = {
    page: state.page,
    viewedUserId: state.viewedUserId || null,
    activeCommunityId: state.activeCommunityId || null,
    activePostId: state.activePostId || null,
    activeCommentId: state.activeCommentId || null,
    activeTag: state.activeTag || null,
    activeAdId: state.activeAdId || null,
    searchQuery: state.searchQuery || '',
  } as NavigationSnapshot;
  try {
    if (replace) {
      window.history.replaceState(safeState, '', path);
    } else {
      window.history.pushState(safeState, '', path);
    }
  } catch (err) {
    // In some environments (strict CSP), pushState may fail; ignore gracefully
  }
}

// Helper to compare paths without trailing slashes or differing encodings
export function samePath(a: string, b: string): boolean {
  const normalize = (p: string) => decodeURI(p).replace(/\/+$/, '');
  return normalize(a) === normalize(b);
}