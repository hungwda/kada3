/**
 * Unit tests for ProfileService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfileService } from './ProfileService';
import { getRepository } from './storage/orm';
import { Profile } from '../db/entities/Profile';

vi.mock('./storage/orm');
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123'
}));

describe('ProfileService', () => {
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn()
    };

    (getRepository as any).mockResolvedValue(mockRepository);

    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create a profile with valid data', async () => {
      const mockProfile = {
        id: 'test-uuid-123',
        name: 'Test Child',
        avatar: '😊',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date()
      };

      mockRepository.save.mockResolvedValue(mockProfile);

      const result = await ProfileService.createProfile({
        name: 'Test Child',
        avatar: '😊'
      });

      expect(result).toEqual(mockProfile);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should trim profile name', async () => {
      const mockProfile = {
        id: 'test-uuid-123',
        name: 'Test Child',
        avatar: '😊',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date()
      };

      mockRepository.save.mockResolvedValue(mockProfile);

      await ProfileService.createProfile({
        name: '  Test Child  ',
        avatar: '😊'
      });

      const savedProfile = mockRepository.save.mock.calls[0][0];
      expect(savedProfile.name).toBe('Test Child');
    });

    it('should throw error for empty name', async () => {
      await expect(
        ProfileService.createProfile({ name: '' })
      ).rejects.toThrow('Profile name is required');

      await expect(
        ProfileService.createProfile({ name: '   ' })
      ).rejects.toThrow('Profile name is required');
    });

    it('should throw error for name longer than 24 characters', async () => {
      await expect(
        ProfileService.createProfile({ name: 'A'.repeat(25) })
      ).rejects.toThrow('Profile name must be 24 characters or less');
    });

    it('should create profile without avatar', async () => {
      const mockProfile = {
        id: 'test-uuid-123',
        name: 'Test Child',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date()
      };

      mockRepository.save.mockResolvedValue(mockProfile);

      const result = await ProfileService.createProfile({
        name: 'Test Child'
      });

      expect(result.avatar).toBeUndefined();
    });
  });

  describe('getAllProfiles', () => {
    it('should return all profiles ordered by lastActiveAt', async () => {
      const mockProfiles = [
        { id: '1', name: 'Profile 1', lastActiveAt: new Date('2024-01-02') },
        { id: '2', name: 'Profile 2', lastActiveAt: new Date('2024-01-01') }
      ];

      mockRepository.find.mockResolvedValue(mockProfiles);

      const result = await ProfileService.getAllProfiles();

      expect(result).toEqual(mockProfiles);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: {
          lastActiveAt: 'DESC',
          createdAt: 'DESC'
        }
      });
    });

    it('should return empty array when no profiles exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await ProfileService.getAllProfiles();

      expect(result).toEqual([]);
    });
  });

  describe('getProfileById', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'test-id',
        name: 'Test Profile'
      };

      mockRepository.findOne.mockResolvedValue(mockProfile);

      const result = await ProfileService.getProfileById('test-id');

      expect(result).toEqual(mockProfile);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      });
    });

    it('should return null when profile not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await ProfileService.getProfileById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateLastActive', () => {
    it('should update lastActiveAt timestamp', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await ProfileService.updateLastActive('test-id');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: 'test-id' },
        { lastActiveAt: expect.any(Date) }
      );
    });
  });

  describe('updateProfile', () => {
    it('should update profile name', async () => {
      const mockProfile = {
        id: 'test-id',
        name: 'Old Name',
        avatar: '😊'
      };

      const updatedProfile = {
        ...mockProfile,
        name: 'New Name'
      };

      mockRepository.findOne.mockResolvedValue(mockProfile);
      mockRepository.save.mockResolvedValue(updatedProfile);

      const result = await ProfileService.updateProfile('test-id', {
        name: 'New Name'
      });

      expect(result.name).toBe('New Name');
    });

    it('should update profile avatar', async () => {
      const mockProfile = {
        id: 'test-id',
        name: 'Test',
        avatar: '😊'
      };

      const updatedProfile = {
        ...mockProfile,
        avatar: '🦁'
      };

      mockRepository.findOne.mockResolvedValue(mockProfile);
      mockRepository.save.mockResolvedValue(updatedProfile);

      const result = await ProfileService.updateProfile('test-id', {
        avatar: '🦁'
      });

      expect(result.avatar).toBe('🦁');
    });

    it('should throw error when profile not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        ProfileService.updateProfile('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow('Profile not found');
    });

    it('should validate name length on update', async () => {
      const mockProfile = {
        id: 'test-id',
        name: 'Old Name'
      };

      mockRepository.findOne.mockResolvedValue(mockProfile);

      await expect(
        ProfileService.updateProfile('test-id', { name: 'A'.repeat(25) })
      ).rejects.toThrow('Profile name must be 24 characters or less');
    });

    it('should validate empty name on update', async () => {
      const mockProfile = {
        id: 'test-id',
        name: 'Old Name'
      };

      mockRepository.findOne.mockResolvedValue(mockProfile);

      await expect(
        ProfileService.updateProfile('test-id', { name: '  ' })
      ).rejects.toThrow('Profile name is required');
    });
  });

  describe('deleteProfile', () => {
    it('should delete existing profile', async () => {
      const mockProfile = {
        id: 'test-id',
        name: 'Test Profile'
      };

      mockRepository.findOne.mockResolvedValue(mockProfile);
      mockRepository.remove.mockResolvedValue(mockProfile);

      await ProfileService.deleteProfile('test-id');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockProfile);
    });

    it('should throw error when profile not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        ProfileService.deleteProfile('non-existent-id')
      ).rejects.toThrow('Profile not found');
    });
  });

  describe('localStorage operations', () => {
    it('should get current profile ID from localStorage', () => {
      localStorage.setItem('currentProfileId', 'test-id');

      const result = ProfileService.getCurrentProfileId();

      expect(result).toBe('test-id');
    });

    it('should return null when no profile ID in localStorage', () => {
      const result = ProfileService.getCurrentProfileId();

      expect(result).toBeNull();
    });

    it('should set current profile ID in localStorage', () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      ProfileService.setCurrentProfileId('test-id');

      expect(localStorage.getItem('currentProfileId')).toBe('test-id');
    });

    it('should clear current profile ID from localStorage', () => {
      localStorage.setItem('currentProfileId', 'test-id');

      ProfileService.clearCurrentProfileId();

      expect(localStorage.getItem('currentProfileId')).toBeNull();
    });
  });

  describe('ensureDefaultProfile', () => {
    it('should create default profile when none exists', async () => {
      mockRepository.find.mockResolvedValue([]);

      const mockProfile = {
        id: 'test-uuid-123',
        name: 'My Profile',
        avatar: '😊',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date()
      };

      mockRepository.save.mockResolvedValue(mockProfile);

      const result = await ProfileService.ensureDefaultProfile();

      expect(result.name).toBe('My Profile');
      expect(result.avatar).toBe('😊');
    });

    it('should return first profile when profiles exist', async () => {
      const mockProfiles = [
        { id: '1', name: 'Profile 1' },
        { id: '2', name: 'Profile 2' }
      ];

      mockRepository.find.mockResolvedValue(mockProfiles);

      const result = await ProfileService.ensureDefaultProfile();

      expect(result).toEqual(mockProfiles[0]);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
