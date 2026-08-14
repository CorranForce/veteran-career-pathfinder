import { describe, it, expect } from 'vitest';
import { buildPurchaseConfirmationEmail, testResendConnection } from './resendEmail';

describe('Resend Email Service', () => {
  it('builds a purchase email with safe values and first-use resource links', () => {
    const email = buildPurchaseConfirmationEmail(
      'Allen <Veteran>',
      'Premium <Package>',
      29,
      'https://transition-pathfinder.manus.space/'
    );

    expect(email.subject).toBe('Your Pathfinder access is ready — Premium <Package>');
    expect(email.html).toContain('Allen &lt;Veteran&gt;');
    expect(email.html).toContain('Premium &lt;Package&gt;');
    expect(email.html).toContain('$29.00');
    expect(email.html).toContain('https://transition-pathfinder.manus.space/tools');
    expect(email.html).toContain('https://transition-pathfinder.manus.space/downloads');
    expect(email.html).toContain('https://transition-pathfinder.manus.space/mos-translator');
  });

  it('should successfully connect to Resend API', async () => {
    const result = await testResendConnection();
    
    // Resend should send test email successfully
    expect(result).toBe(true);
  }, 15000); // 15 second timeout for API call
});
