import { UserProfile } from '../types/auth';

/**
 * Derives a human-friendly display name with the safe fallback order:
 * 1. Profile full_name / name (if valid and not generic mock)
 * 2. Email local part (before '@', capitalized)
 * 3. Role-based label (e.g. 'Administratör') or custom fallback
 */
export function getCleanDisplayName(
  user?: Partial<UserProfile> | null,
  options?: { fallback?: string }
): string {
  const defaultFallback = options?.fallback !== undefined ? options.fallback : 'Elev';
  if (!user) return defaultFallback;

  // 1. Profile fullName (if non-empty and not mock placeholder)
  if (user.fullName && typeof user.fullName === 'string') {
    const trimmed = user.fullName.trim();
    if (trimmed && trimmed !== 'Sofia' && trimmed !== 'SFI Elev' && trimmed !== 'SFI-elev') {
      return trimmed;
    }
  }

  // 2. Email local part
  if (user.email && typeof user.email === 'string' && user.email.includes('@')) {
    const localPart = user.email.split('@')[0].trim();
    if (localPart) {
      // Capitalize first letter cleanly
      return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
  }

  // 3. Role-based fallback
  if (user.role === 'admin') {
    return 'Administratör';
  }

  // 4. Default fallback
  return defaultFallback;
}

/**
 * Returns the first name for greetings (e.g. "Abraham", "SwedishFlow")
 */
export function getGreetingFirstName(user?: Partial<UserProfile> | null): string {
  const full = getCleanDisplayName(user, { fallback: '' });
  if (!full) return '';
  return full.split(' ')[0];
}

/**
 * Generates the Swedish greeting line, e.g. "Hej, Abraham!" or "Hej!"
 */
export function getGreetingTitle(user?: Partial<UserProfile> | null): string {
  const firstName = getGreetingFirstName(user);
  if (firstName) {
    return `Hej, ${firstName}!`;
  }
  return 'Hej!';
}

/**
 * Returns Swedish time-of-day greeting (e.g. "God morgon", "God dag", "God kväll")
 */
export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'God morgon';
  if (hour >= 10 && hour < 17) return 'God dag';
  if (hour >= 17 && hour < 22) return 'God kväll';
  return 'God kväll';
}
