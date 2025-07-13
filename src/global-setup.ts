const nodeCrypto = require('crypto');

// Define crypto globalmente para compatibilidade com TypeORM e outras libs
(globalThis as any).crypto = nodeCrypto;

// Polyfill para crypto.randomUUID se não estiver disponível
if (!nodeCrypto.randomUUID) {
  (nodeCrypto as any).randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

console.log('Global crypto setup completed'); 