import { SystemVersionInfo, UpdateHistoryItem } from '../types';

const STORAGE_KEY = 'dbmastery_system_version';

export function getInitialSystemVersionInfo(): SystemVersionInfo {
  const now = new Date();
  const defaultLastChecked = formatFullDateTime(now);

  const defaultInfo: SystemVersionInfo = {
    currentVersion: 'v2.4.2',
    releaseDate: '08 Septembre 2026',
    buildNumber: '20260908.102',
    channel: 'stable',
    lastCheckedDate: defaultLastChecked,
    autoUpdateEnabled: true,
    autoUpdateIntervalMinutes: 1, // vérifie toutes les minutes en arrière-plan
    isChecking: false,
    isUpdating: false,
    updateProgress: 0,
    statusMessage: 'Système à jour et opérationnel.',
    availableUpdate: null,
    updateHistory: [
      {
        id: 'hist-1',
        timestamp: '08/09/2026 à 15:42',
        version: 'v2.4.2',
        type: 'manual',
        notes: 'Ajout des 100 Flashcards DP-300 / DP-800 DOM-02 (Sécurité, TDE, Always Encrypted & RLS).',
      },
      {
        id: 'hist-2',
        timestamp: '08/09/2026 à 13:15',
        version: 'v2.4.1',
        type: 'auto',
        notes: 'Ajout des 100 Flashcards DP-300 / DP-800 DOM-01 (Architecture, SKU vCore & Migration).',
      },
      {
        id: 'hist-3',
        timestamp: '07/09/2026 à 18:30',
        version: 'v2.4.0',
        type: 'auto',
        notes: 'Mise à niveau majeure du moteur de simulation SQL et support multi-plateformes.',
      },
    ],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultInfo,
        ...parsed,
        isChecking: false,
        isUpdating: false,
        updateProgress: 0,
      };
    }
  } catch (err) {
    console.error('Erreur lecture system version info:', err);
  }

  return defaultInfo;
}

export function saveSystemVersionInfo(info: SystemVersionInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch (err) {
    console.error('Erreur sauvegarde system version info:', err);
  }
}

export function formatFullDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${d}/${m}/${y} à ${h}:${min}:${s}`;
}

export function formatRelativeTime(dateString: string): string {
  try {
    // Try to parse if it contains timestamp or ISO
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})\s*à\s*(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
      const [, d, m, y, h, min, s] = parts;
      const targetDate = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s));
      const diffMs = Date.now() - targetDate.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 15) return "À l'instant";
      if (diffSec < 60) return `Il y a ${diffSec} secondes`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
      const diffHours = Math.floor(diffMin / 60);
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
  } catch {
    // fallback
  }
  return dateString;
}

/**
 * Prochaines versions simulées pour les mises à jour automatiques ou forcées
 */
const UPCOMING_VERSIONS = [
  {
    version: 'v2.4.3',
    releaseDate: '08 Septembre 2026',
    notes: 'Optimisation de la latence du bac à sable SQL et actualisation du cache des questions d\'examen.',
  },
  {
    version: 'v2.4.4',
    releaseDate: '08 Septembre 2026',
    notes: 'Amélioration de la synchronisation hors-ligne et ajout de nouveaux diagnostics de performances.',
  },
  {
    version: 'v2.5.0',
    releaseDate: '08 Septembre 2026',
    notes: 'Nouvelle suite de tests pratiques pour PostgreSQL EDB et MySQL 8.0 DBA.',
  },
];

let upcomingVersionIndex = 0;

export function getNextSimulatedVersion(currentVersion: string) {
  // If version has already advanced, generate dynamic patch
  const match = currentVersion.match(/v(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    const patch = parseInt(match[3], 10) + 1;
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')} Septembre ${today.getFullYear()}`;
    return {
      version: `v${major}.${minor}.${patch}`,
      releaseDate: formattedDate,
      notes: `Mise à jour incrémentale v${major}.${minor}.${patch} : renforcement de la sécurité mémoire et synchronisation des modules.`,
    };
  }
  const next = UPCOMING_VERSIONS[upcomingVersionIndex % UPCOMING_VERSIONS.length];
  upcomingVersionIndex++;
  return next;
}
