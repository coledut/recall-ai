// Keyboard shortcuts for Recall AI

type ShortcutHandler = () => void;

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
  handler?: ShortcutHandler;
}

export const SHORTCUTS: Shortcut[] = [
  // Navigation
  {
    keys: ['Cmd/Ctrl', 'K'],
    description: 'Open search',
    category: 'Navigation',
  },
  {
    keys: ['Cmd/Ctrl', '1'],
    description: 'Go to Today',
    category: 'Navigation',
  },
  {
    keys: ['Cmd/Ctrl', '2'],
    description: 'Go to People',
    category: 'Navigation',
  },
  {
    keys: ['Cmd/Ctrl', '3'],
    description: 'Go to Analytics',
    category: 'Navigation',
  },
  {
    keys: ['Cmd/Ctrl', ','],
    description: 'Open Settings',
    category: 'Navigation',
  },

  // Actions
  {
    keys: ['Cmd/Ctrl', 'Enter'],
    description: 'Submit/Create',
    category: 'Actions',
  },
  {
    keys: ['Cmd/Ctrl', 'S'],
    description: 'Save',
    category: 'Actions',
  },
  {
    keys: ['Escape'],
    description: 'Close modal/cancel',
    category: 'Actions',
  },
  {
    keys: ['Cmd/Ctrl', 'B'],
    description: 'Toggle batch select',
    category: 'Actions',
  },
  {
    keys: ['Cmd/Ctrl', 'D'],
    description: 'Delete selected',
    category: 'Actions',
  },

  // Capture
  {
    keys: ['Cmd/Ctrl', 'Shift', 'V'],
    description: 'Quick voice capture',
    category: 'Capture',
  },
  {
    keys: ['Cmd/Ctrl', 'Shift', 'T'],
    description: 'Quick text capture',
    category: 'Capture',
  },

  // Misc
  {
    keys: ['?'],
    description: 'Show help',
    category: 'Help',
  },
];

export function groupShortcutsByCategory(): Record<string, Shortcut[]> {
  return SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);
}

export function registerShortcut(keys: string[], handler: ShortcutHandler) {
  if (typeof window === 'undefined') return;

  const handleKeyDown = (e: KeyboardEvent) => {
    const isMeta = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    // Check if this matches our shortcut
    let matches = false;

    if (keys.includes('Cmd/Ctrl') && keys.includes(e.key.toUpperCase())) {
      if (keys.includes('Shift') && !isShift) return;
      if (!keys.includes('Shift') && isShift) return;
      if (isMeta && (e.key.toUpperCase() === keys[1]?.toUpperCase() || e.code === keys[1])) {
        matches = true;
      }
    } else if (keys.length === 1 && e.key === keys[0]) {
      matches = true;
    }

    if (matches) {
      e.preventDefault();
      handler();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => window.removeEventListener('keydown', handleKeyDown);
}
