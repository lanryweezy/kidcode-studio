import { vi } from 'vitest';
import { describe, it } from 'vitest';

describe('check vi', () => {
  it('should print vi keys', () => {
    console.log('vi keys:', Object.keys(vi || {}));
    console.log('vi.stubEnv:', typeof vi?.stubEnv);
  });
});
