/**
 * Profile management service
 */

import { v4 as uuidv4 } from 'uuid';
import { getRepository } from './storage/orm';
import { Profile } from '../db/entities/Profile';

export interface CreateProfileData {
  name: string;
  avatar?: string;
}

export class ProfileService {
  /**
   * Create a new profile
   */
  static async createProfile(data: CreateProfileData): Promise<Profile> {
    const { name, avatar } = data;

    // Validate name
    if (!name || name.trim().length === 0) {
      throw new Error('Profile name is required');
    }
    if (name.length > 24) {
      throw new Error('Profile name must be 24 characters or less');
    }

    const repo = await getRepository(Profile);

    const profile = new Profile();
    profile.id = uuidv4();
    profile.name = name.trim();
    profile.avatar = avatar;
    profile.lastActiveAt = new Date();

    return await repo.save(profile);
  }

  /**
   * Get all profiles
   */
  static async getAllProfiles(): Promise<Profile[]> {
    const repo = await getRepository(Profile);
    return await repo.find({
      order: {
        lastActiveAt: 'DESC',
        createdAt: 'DESC'
      }
    });
  }

  /**
   * Get a profile by ID
   */
  static async getProfileById(id: string): Promise<Profile | null> {
    const repo = await getRepository(Profile);
    return await repo.findOne({ where: { id } });
  }

  /**
   * Update profile's last active time
   */
  static async updateLastActive(id: string): Promise<void> {
    const repo = await getRepository(Profile);
    await repo.update({ id }, { lastActiveAt: new Date() });
  }

  /**
   * Update profile name and/or avatar
   */
  static async updateProfile(id: string, data: Partial<CreateProfileData>): Promise<Profile> {
    const repo = await getRepository(Profile);

    const profile = await repo.findOne({ where: { id } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Profile name is required');
      }
      if (data.name.length > 24) {
        throw new Error('Profile name must be 24 characters or less');
      }
      profile.name = data.name.trim();
    }

    if (data.avatar !== undefined) {
      profile.avatar = data.avatar;
    }

    return await repo.save(profile);
  }

  /**
   * Delete a profile (cascade deletes Progress, Streak, EarnedBadge via database)
   */
  static async deleteProfile(id: string): Promise<void> {
    const repo = await getRepository(Profile);

    const profile = await repo.findOne({ where: { id } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    await repo.remove(profile);
  }

  /**
   * Get current active profile ID from localStorage
   */
  static getCurrentProfileId(): string | null {
    return localStorage.getItem('currentProfileId');
  }

  /**
   * Set current active profile ID in localStorage
   */
  static setCurrentProfileId(id: string): void {
    localStorage.setItem('currentProfileId', id);
    // Update last active timestamp
    this.updateLastActive(id).catch(console.error);
  }

  /**
   * Clear current profile ID from localStorage
   */
  static clearCurrentProfileId(): void {
    localStorage.removeItem('currentProfileId');
  }

  /**
   * Get or create default profile if none exists
   */
  static async ensureDefaultProfile(): Promise<Profile> {
    const profiles = await this.getAllProfiles();

    if (profiles.length === 0) {
      // Create a default profile
      return await this.createProfile({
        name: 'My Profile',
        avatar: '😊'
      });
    }

    return profiles[0];
  }
}
