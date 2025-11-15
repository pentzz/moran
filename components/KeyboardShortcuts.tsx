import React, { useEffect, useState } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ shortcuts }) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle help with ?
      if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Check for matching shortcut
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          // Don't prevent default if user is typing in an input
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            continue;
          }

          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  if (!showHelp) {
    return (
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-200 z-50"
        title="קיצורי מקלדת (?)"
        aria-label="הצג קיצורי מקלדת"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">קיצורי מקלדת</h2>
          <button
            onClick={() => setShowHelp(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="סגור"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.ctrl && (
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                    Ctrl
                  </kbd>
                )}
                {shortcut.shift && (
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                    Shift
                  </kbd>
                )}
                {shortcut.alt && (
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                    Alt
                  </kbd>
                )}
                {(shortcut.ctrl || shortcut.shift || shortcut.alt) && (
                  <span className="text-gray-400">+</span>
                )}
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-sm font-mono">
                  {shortcut.key.toUpperCase()}
                </kbd>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-blue-700 font-medium">הצג/הסתר עזרה זו</span>
            <kbd className="px-2 py-1 bg-white border border-blue-300 rounded shadow-sm text-sm font-mono">
              ?
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
