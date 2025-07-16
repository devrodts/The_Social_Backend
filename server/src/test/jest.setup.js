// Polyfill crypto for Jest tests
if (!global.crypto) {
  global.crypto = require('crypto');
}

// Polyfill TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
} 