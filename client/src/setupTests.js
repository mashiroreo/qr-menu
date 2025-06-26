require('@testing-library/jest-dom');

// jsdom で TextEncoder/Decoder が未定義の場合 polyfill
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
} 