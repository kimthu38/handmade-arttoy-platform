import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatOrderStatus, formatPaymentMethod } from './format';

describe('formatCurrency', () => {
  it('formats a numeric string as USD', () => {
    expect(formatCurrency('150000')).toContain('150,000');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toContain('0');
  });
});

describe('formatDate', () => {
  it('returns a localised date string', () => {
    const result = formatDate('2026-01-15T00:00:00.000Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('formatOrderStatus', () => {
  it('returns English label for known statuses', () => {
    expect(formatOrderStatus('awaiting_confirmation')).toBe('Awaiting Confirmation');
    expect(formatOrderStatus('delivered')).toBe('Delivered');
    expect(formatOrderStatus('cancelled')).toBe('Cancelled');
  });

  it('falls back to raw value for unknown status', () => {
    expect(formatOrderStatus('unknown_status')).toBe('unknown_status');
  });
});

describe('formatPaymentMethod', () => {
  it('returns English label for known methods', () => {
    expect(formatPaymentMethod('cod')).toBe('Cash on Delivery');
    expect(formatPaymentMethod('vnpay')).toBe('VNPay');
    expect(formatPaymentMethod('momo')).toBe('MoMo');
  });
});
