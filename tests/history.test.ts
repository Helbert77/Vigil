import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  buildPathFromSnapshot,
  parseLocationToSnapshot,
  pushHistoryState,
  samePath,
  type NavigationSnapshot,
} from '../src/utils/history';

describe('utils/history', () => {
  beforeEach(() => {
    // Reset to root for each test
    window.history.replaceState(null, '', '/');
  });

  describe('buildPathFromSnapshot', () => {
    test('Home → "/"', () => {
      const s: NavigationSnapshot = { page: 'Home' };
      expect(buildPathFromSnapshot(s)).toBe('/');
    });

    test('Profile with user id → encoded path', () => {
      const s: NavigationSnapshot = { page: 'Profile', viewedUserId: 'John Doe' };
      expect(buildPathFromSnapshot(s)).toBe('/profile/John%20Doe');
    });

    test('CommunityDetail → /community/:id', () => {
      const s: NavigationSnapshot = { page: 'CommunityDetail', activeCommunityId: 'abc123' };
      expect(buildPathFromSnapshot(s)).toBe('/community/abc123');
    });

    test('PostDetail without id → /post', () => {
      const s: NavigationSnapshot = { page: 'PostDetail' };
      expect(buildPathFromSnapshot(s)).toBe('/post');
    });

    test('Search with query → querystring', () => {
      const s: NavigationSnapshot = { page: 'Search', searchQuery: 'aliens & ufo' };
      expect(buildPathFromSnapshot(s)).toBe('/search?q=aliens%20%26%20ufo');
    });

    test('TopicDetail → /topic/:tag', () => {
      const s: NavigationSnapshot = { page: 'TopicDetail', activeTag: 'CIA' };
      expect(buildPathFromSnapshot(s)).toBe('/topic/CIA');
    });
  });

  describe('parseLocationToSnapshot', () => {
    test('"/" → Home snapshot', () => {
      const snap = parseLocationToSnapshot('/', '');
      expect(snap).toEqual({ page: 'Home' });
    });

    test('"/profile/jane" → Profile snapshot', () => {
      const snap = parseLocationToSnapshot('/profile/jane', '');
      expect(snap).toEqual({ page: 'Profile', viewedUserId: 'jane' });
    });

    test('"/community/xyz" → CommunityDetail snapshot', () => {
      const snap = parseLocationToSnapshot('/community/xyz', '');
      expect(snap).toEqual({ page: 'CommunityDetail', activeCommunityId: 'xyz' });
    });

    test('"/post/123?comment=456" → PostDetail snapshot', () => {
      const snap = parseLocationToSnapshot('/post/123', '?comment=456');
      expect(snap).toEqual({ page: 'PostDetail', activePostId: '123', activeCommentId: '456' });
    });

    test('"/search?q=test" → Search snapshot', () => {
      const snap = parseLocationToSnapshot('/search', '?q=test');
      expect(snap).toEqual({ page: 'Search', searchQuery: 'test' });
    });

    test('unknown path → Home snapshot fallback', () => {
      const snap = parseLocationToSnapshot('/unknown', '');
      expect(snap).toEqual({ page: 'Home' });
    });
  });

  describe('pushHistoryState', () => {
    test('push updates history.state and path', () => {
      const s: NavigationSnapshot = { page: 'Profile', viewedUserId: 'john' };
      pushHistoryState(s);
      expect(window.location.pathname).toBe('/profile/john');
      expect(window.history.state).toMatchObject({ page: 'Profile', viewedUserId: 'john' });
    });

    test('replace does not add a new entry', () => {
      const s1: NavigationSnapshot = { page: 'Home' };
      const s2: NavigationSnapshot = { page: 'Search', searchQuery: 'abc' };
      pushHistoryState(s1, true);
      const lenBefore = window.history.length;
      pushHistoryState(s2, true);
      const lenAfter = window.history.length;
      expect(window.location.pathname + window.location.search).toBe('/search?q=abc');
      expect(lenAfter).toBe(lenBefore); // replace should keep length
    });
  });

  describe('samePath', () => {
    test('normalizes trailing slashes', () => {
      expect(samePath('/community/abc/', '/community/abc')).toBe(true);
    });

    test('normalizes encoding differences', () => {
      expect(samePath('/community/%C3%A1', '/community/á')).toBe(true);
    });
  });
});

