describe('Node.js crypto', () => {
  it('should have createHash function', () => {
    const crypto = require('crypto');
    expect(typeof crypto.createHash).toBe('function');
  });
}); 