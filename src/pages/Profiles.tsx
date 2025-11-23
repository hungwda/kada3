import { useState, useEffect } from 'preact/hooks';
import { Profile } from '../db/entities/Profile';
import { ProfileService } from '../services/ProfileService';

interface ProfilesProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

const AVATAR_OPTIONS = ['😊', '🦁', '🐼', '🦊', '🐻', '🐰', '🐸', '🦉', '🐱', '🐶'];

export function Profiles({ onNavigate }: ProfilesProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
    setCurrentProfileId(ProfileService.getCurrentProfileId());
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const loadedProfiles = await ProfileService.getAllProfiles();
      setProfiles(loadedProfiles);
    } catch (err) {
      console.error('Failed to load profiles:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfile = async () => {
    setError('');

    if (!newProfileName.trim()) {
      setError('Please enter a name');
      return;
    }

    if (newProfileName.length > 24) {
      setError('Name must be 24 characters or less');
      return;
    }

    try {
      await ProfileService.createProfile({
        name: newProfileName.trim(),
        avatar: selectedAvatar
      });

      setNewProfileName('');
      setSelectedAvatar(AVATAR_OPTIONS[0]);
      setShowAddForm(false);
      await loadProfiles();
    } catch (err: any) {
      console.error('Failed to create profile:', err);
      setError(err.message || 'Failed to create profile');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile? All progress will be lost.')) {
      return;
    }

    try {
      await ProfileService.deleteProfile(id);

      // If deleted profile was active, clear it
      if (currentProfileId === id) {
        ProfileService.clearCurrentProfileId();
        setCurrentProfileId(null);
      }

      await loadProfiles();
    } catch (err: any) {
      console.error('Failed to delete profile:', err);
      setError(err.message || 'Failed to delete profile');
    }
  };

  const handleSwitchProfile = (id: string) => {
    ProfileService.setCurrentProfileId(id);
    setCurrentProfileId(id);
    onNavigate('home');
  };

  if (loading) {
    return (
      <div class="profiles-page">
        <header class="page-header">
          <button class="back-button" onClick={() => onNavigate('home')}>
            ← Back
          </button>
          <h1>Profiles</h1>
        </header>
        <div class="loading-container">
          <p>Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="profiles-page">
      <header class="page-header">
        <button class="back-button" onClick={() => onNavigate('home')}>
          ← Back
        </button>
        <h1>Profiles</h1>
      </header>

      {error && (
        <div class="error-message">
          {error}
        </div>
      )}

      <section class="profiles-list">
        {!profiles || profiles.length === 0 ? (
          <p class="placeholder-text">No profiles yet</p>
        ) : (
          <div class="profiles-grid">
            {profiles.map(profile => (
              <div
                key={profile.id}
                class={`profile-card ${currentProfileId === profile.id ? 'active' : ''}`}
              >
                <div class="profile-avatar">{profile.avatar || '😊'}</div>
                <div class="profile-name">{profile.name}</div>
                {currentProfileId === profile.id && (
                  <div class="active-badge">Active</div>
                )}
                <div class="profile-actions">
                  {currentProfileId !== profile.id && (
                    <button
                      class="btn-switch"
                      onClick={() => handleSwitchProfile(profile.id)}
                    >
                      Switch
                    </button>
                  )}
                  <button
                    class="btn-delete"
                    onClick={() => handleDeleteProfile(profile.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showAddForm ? (
          <div class="add-profile-section">
            <button
              class="action-button primary"
              onClick={() => setShowAddForm(true)}
            >
              + Add Profile
            </button>
            <p class="info-text">Create profiles for each child using the app</p>
          </div>
        ) : (
          <div class="add-profile-form">
            <h2>Create New Profile</h2>

            <div class="form-group">
              <label>Name</label>
              <input
                type="text"
                maxLength={24}
                value={newProfileName}
                onInput={(e) => setNewProfileName((e.target as HTMLInputElement).value)}
                placeholder="Enter profile name"
              />
              <span class="char-count">{newProfileName.length}/24</span>
            </div>

            <div class="form-group">
              <label>Avatar</label>
              <div class="avatar-selector">
                {AVATAR_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    class={`avatar-option ${selectedAvatar === emoji ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div class="form-actions">
              <button
                class="action-button secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewProfileName('');
                  setError('');
                }}
              >
                Cancel
              </button>
              <button
                class="action-button primary"
                onClick={handleAddProfile}
              >
                Create Profile
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
