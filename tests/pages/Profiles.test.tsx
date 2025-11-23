/**
 * Integration tests for Profiles page component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/preact';
import { Profiles } from '../../src/pages/Profiles';
import { ProfileService } from '../../src/services/ProfileService';

vi.mock('../../src/services/ProfileService');

describe('Profiles Page', () => {
  const mockOnNavigate = vi.fn();
  const mockProfiles = [
    {
      id: 'profile-1',
      name: 'Alice',
      avatar: '😊',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastActiveAt: new Date('2024-01-02')
    },
    {
      id: 'profile-2',
      name: 'Bob',
      avatar: '🦁',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastActiveAt: new Date('2024-01-01')
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state initially', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      expect(container.textContent).toContain('Loading profiles...');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no profiles exist', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        expect(container.textContent).toContain('No profiles yet');
      });

      expect(container.textContent).toContain('+ Add Profile');
      expect(container.textContent).toContain('Create profiles for each child using the app');
    });
  });

  describe('Profiles List', () => {
    it('should display all profiles', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue(mockProfiles);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue('profile-1');

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        expect(container.textContent).toContain('Alice');
        expect(container.textContent).toContain('Bob');
        expect(container.textContent).toContain('😊');
        expect(container.textContent).toContain('🦁');
      });
    });

    it('should mark active profile', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue(mockProfiles);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue('profile-1');

      render(<Profiles onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        const activeCards = document.querySelectorAll('.profile-card.active');
        expect(activeCards.length).toBe(1);
      });

      const activeBadge = document.querySelector('.active-badge');
      expect(activeBadge?.textContent).toBe('Active');
    });

    it('should show Switch button for non-active profiles', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue(mockProfiles);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue('profile-1');

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const switchButtons = container.querySelectorAll('.btn-switch');
        expect(switchButtons.length).toBe(1);
      });
    });
  });

  describe('Add Profile Form', () => {
    it('should show form when Add Profile button is clicked', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        expect(container.textContent).toContain('+ Add Profile');
      });

      const addButton = container.querySelector('.action-button.primary') as HTMLButtonElement;
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(container.textContent).toContain('Create New Profile');
        expect(container.querySelector('input[type="text"]')).toBeTruthy();
      });
    });

    it('should allow entering profile name', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const addButton = container.querySelector('.action-button.primary') as HTMLButtonElement;
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const input = container.querySelector('input[type="text"]') as HTMLInputElement;
        fireEvent.input(input, { target: { value: 'Charlie' } });
        expect(input.value).toBe('Charlie');
      });
    });

    it('should show character count', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const addButton = container.querySelector('.action-button.primary') as HTMLButtonElement;
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const charCount = container.querySelector('.char-count');
        expect(charCount?.textContent).toBe('0/24');
      });

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.input(input, { target: { value: 'Test' } });

      await waitFor(() => {
        const charCount = container.querySelector('.char-count');
        expect(charCount?.textContent).toBe('4/24');
      });
    });

    it('should allow selecting avatar', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const addButton = container.querySelector('.action-button.primary') as HTMLButtonElement;
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const avatarButtons = container.querySelectorAll('.avatar-option');
        expect(avatarButtons.length).toBeGreaterThan(0);

        fireEvent.click(avatarButtons[1]);
        expect(avatarButtons[1].classList.contains('selected')).toBe(true);
      });
    });

    it('should create profile when form is submitted', async () => {
      const createProfileSpy = vi.spyOn(ProfileService, 'createProfile').mockResolvedValue({
        id: 'new-profile',
        name: 'Charlie',
        avatar: '🐼',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date()
      } as any);

      vi.spyOn(ProfileService, 'getAllProfiles')
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'new-profile',
            name: 'Charlie',
            avatar: '🐼',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActiveAt: new Date()
          } as any
        ]);

      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const addButton = container.querySelector('.action-button.primary') as HTMLButtonElement;
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const input = container.querySelector('input[type="text"]') as HTMLInputElement;
        fireEvent.input(input, { target: { value: 'Charlie' } });
      });

      const createButton = Array.from(container.querySelectorAll('.action-button.primary'))
        .find(btn => btn.textContent === 'Create Profile') as HTMLButtonElement;

      fireEvent.click(createButton);

      await waitFor(() => {
        expect(createProfileSpy).toHaveBeenCalledWith({
          name: 'Charlie',
          avatar: '😊'
        });
      });
    });

    it('should show error for empty name', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const addButton = container.querySelector('.action-button.primary') as HTMLButtonElement;
        fireEvent.click(addButton);
      });

      const createButton = Array.from(container.querySelectorAll('.action-button.primary'))
        .find(btn => btn.textContent === 'Create Profile') as HTMLButtonElement;

      fireEvent.click(createButton);

      await waitFor(() => {
        expect(container.textContent).toContain('Please enter a name');
      });
    });

    it('should show error for name exceeding 24 characters', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const addButton = container.querySelector('.action-button.primary') as HTMLButtonElement;
        fireEvent.click(addButton);
      });

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.input(input, { target: { value: 'A'.repeat(25) } });

      const createButton = Array.from(container.querySelectorAll('.action-button.primary'))
        .find(btn => btn.textContent === 'Create Profile') as HTMLButtonElement;

      fireEvent.click(createButton);

      await waitFor(() => {
        expect(container.textContent).toContain('Name must be 24 characters or less');
      });
    });

    it('should cancel form and return to list', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const addButton = container.querySelector('.action-button.primary') as HTMLButtonElement;
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Create New Profile');
      });

      const cancelButton = container.querySelector('.action-button.secondary') as HTMLButtonElement;
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(container.textContent).toContain('+ Add Profile');
        expect(container.textContent).not.toContain('Create New Profile');
      });
    });
  });

  describe('Profile Actions', () => {
    it('should switch to another profile', async () => {
      const setCurrentProfileIdSpy = vi.spyOn(ProfileService, 'setCurrentProfileId');
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue(mockProfiles);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue('profile-1');

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const switchButton = container.querySelector('.btn-switch') as HTMLButtonElement;
        fireEvent.click(switchButton);

        expect(setCurrentProfileIdSpy).toHaveBeenCalledWith('profile-2');
        expect(mockOnNavigate).toHaveBeenCalledWith('home');
      });
    });

    it('should delete profile with confirmation', async () => {
      const deleteProfileSpy = vi.spyOn(ProfileService, 'deleteProfile').mockResolvedValue();
      vi.spyOn(ProfileService, 'getAllProfiles')
        .mockResolvedValueOnce(mockProfiles)
        .mockResolvedValueOnce([mockProfiles[0]]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue('profile-1');

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const deleteButtons = container.querySelectorAll('.btn-delete');
        fireEvent.click(deleteButtons[1]);

        expect(confirmSpy).toHaveBeenCalled();
        expect(deleteProfileSpy).toHaveBeenCalledWith('profile-2');
      });
    });

    it('should not delete profile if confirmation is cancelled', async () => {
      const deleteProfileSpy = vi.spyOn(ProfileService, 'deleteProfile');
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue(mockProfiles);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue('profile-1');

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const deleteButtons = container.querySelectorAll('.btn-delete');
        fireEvent.click(deleteButtons[1]);

        expect(confirmSpy).toHaveBeenCalled();
        expect(deleteProfileSpy).not.toHaveBeenCalled();
      });
    });

    it('should clear current profile ID when deleting active profile', async () => {
      const clearCurrentProfileIdSpy = vi.spyOn(ProfileService, 'clearCurrentProfileId');
      vi.spyOn(ProfileService, 'deleteProfile').mockResolvedValue();
      vi.spyOn(ProfileService, 'getAllProfiles')
        .mockResolvedValueOnce(mockProfiles)
        .mockResolvedValueOnce([mockProfiles[1]]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue('profile-1');

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const deleteButtons = container.querySelectorAll('.btn-delete');
        fireEvent.click(deleteButtons[0]);

        expect(clearCurrentProfileIdSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is clicked', async () => {
      vi.spyOn(ProfileService, 'getAllProfiles').mockResolvedValue([]);
      vi.spyOn(ProfileService, 'getCurrentProfileId').mockReturnValue(null);

      const { container } = render(
        <Profiles onNavigate={mockOnNavigate} />
      );

      await waitFor(() => {
        const backButton = container.querySelector('.back-button') as HTMLButtonElement;
        fireEvent.click(backButton);

        expect(mockOnNavigate).toHaveBeenCalledWith('home');
      });
    });
  });

});
