// ================================================================
// NeoFair Security System — Anti-DevTools & Inspector Shield
// Protects application from browser DevTools, code inspection,
// right-click extraction, and shortcut snooping.
// ================================================================

export function initAntiInspector() {
  // 1. Disable Console Logging globally
  silenceConsole();

  // 2. Disable Right-Click Context Menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 3. Disable DevTools Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U (Windows/Linux)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }

    // Cmd+Alt+I, Cmd+Alt+J, Cmd+Alt+C, Cmd+Alt+U (macOS)
    if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c' || e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // 4. Drag & Select Protection
  document.addEventListener('dragstart', (e) => e.preventDefault());

  // 5. Active DevTools Detection Loop (debugger timing guard)
  startDevToolsDetector();
}

function silenceConsole() {
  const dummy = () => {};
  window.console.log = dummy;
  window.console.warn = dummy;
  window.console.error = dummy;
  window.console.info = dummy;
  window.console.debug = dummy;
  window.console.dir = dummy;
  window.console.table = dummy;
}

function startDevToolsDetector() {
  setInterval(() => {
    const startTime = performance.now();
    // Debugger statement pauses execution if DevTools is open
    // eslint-disable-next-line no-debugger
    debugger;
    const endTime = performance.now();

    // If execution was delayed significantly (> 100ms), DevTools is active
    if (endTime - startTime > 100) {
      // Clear any visible password inputs or lock admin view for safety
      const passInputs = document.querySelectorAll('input[type="password"]');
      passInputs.forEach(input => input.value = '');
    }
  }, 1000);
}
