import { describe, it, expect } from 'vitest';
import { testResendConnection } from './resendEmail';

describe('Resend Email Service', () => {
  it('should successfully connect to Resend API', async () => {
    const result = await testResendConnection();
    
    // Resend should send test email successfully
    expect(result).toBe(true);
  }, 15000); // 15 second timeout for API call
});
