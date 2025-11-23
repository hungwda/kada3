/**
 * Progress Badge component for displaying earned rewards
 */

interface ProgressBadgeProps {
  icon?: string;
  title: string;
  description: string;
  earned: boolean;
}

export function ProgressBadge({ icon = '🏆', title, description, earned }: ProgressBadgeProps) {
  return (
    <div class={`progress-badge ${earned ? 'earned' : 'locked'}`}>
      <div class="badge-icon">{icon}</div>
      <div class="badge-content">
        <h3 class="badge-title">{title}</h3>
        <p class="badge-description">{description}</p>
        {earned && <span class="badge-status">✓ Earned</span>}
        {!earned && <span class="badge-status locked">🔒 Locked</span>}
      </div>
    </div>
  );
}
