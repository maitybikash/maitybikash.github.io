const test = require('node:test');
const assert = require('node:assert');

// Mock document globally before requiring the script
global.document = {
  getElementById: (id) => {
    // Default implementation or will be overridden in tests
    return null;
  },
  addEventListener: (event, callback) => {
    // No-op for DOMContentLoaded in tests
  }
};

const { initYear } = require('../script.js');

test('initYear sets the current year when element exists', (t) => {
  const mockElement = { textContent: '' };
  const originalGetElementById = global.document.getElementById;

  global.document.getElementById = (id) => {
    if (id === 'current-year') {
      return mockElement;
    }
    return null;
  };

  try {
    initYear();
    const currentYear = new Date().getFullYear().toString();
    assert.strictEqual(mockElement.textContent.toString(), currentYear);
  } finally {
    global.document.getElementById = originalGetElementById;
  }
});

test('initYear does not throw when element does not exist', (t) => {
  const originalGetElementById = global.document.getElementById;
  global.document.getElementById = (id) => null;

  try {
    assert.doesNotThrow(() => {
      initYear();
    });
  } finally {
    global.document.getElementById = originalGetElementById;
  }
});
