import { getThemeSettings, updateThemeSettings } from '@/actions/theme';

// Mock the auth functions
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-user-id' }))
}));

jest.mock('@/actions/auth', () => ({
  getCurrentUserProfile: jest.fn(() => Promise.resolve({
    isSuccess: true,
    data: {
      user: {
        stationId: 'test-station-id',
        role: 'manager'
      },
      station: {
        id: 'test-station-id'
      }
    }
  }))
}));

// Mock the database
jest.mock('@/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([
            { settings: { mode: 'light', primaryColor: '#3B82F6' } }
          ]))
        }))
      }))
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => Promise.resolve())
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve())
      }))
    }))
  }
}));

describe('Theme API Contract', () => {
  it('GET /api/theme should return theme settings', async () => {
    const themeSettings = await getThemeSettings();
    expect(themeSettings).toEqual({ mode: 'light', primaryColor: '#3B82F6' });
  });

  it('POST /api/theme should return the updated theme settings', async () => {
    const newSettings = { mode: 'dark' as const, primaryColor: '#60A5FA' };
    const themeSettings = await updateThemeSettings(newSettings);
    expect(themeSettings).toEqual(newSettings);
  });
});