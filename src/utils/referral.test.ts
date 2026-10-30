import { describe, expect, it } from 'vitest';
import { PRODUCTS_SHOP_DATA } from '../data/flyerData';
import { extractReferralCodeFromInput, getMostExpensiveWig } from './referral';

describe('referral helpers', () => {
  it('extracts a code from plain text or a shared link', () => {
    expect(extractReferralCodeFromInput(' ada-1f2e ')).toBe('ADA-1F2E');
    expect(extractReferralCodeFromInput('https://rossybraids.com/?ref=ada-1f2e&utm=x')).toBe('ADA-1F2E');
    expect(extractReferralCodeFromInput('')).toBe('');
  });

  it('targets the most expensive wig', () => {
    const wig = getMostExpensiveWig(PRODUCTS_SHOP_DATA);
    const wigs = PRODUCTS_SHOP_DATA.filter((p) => p.isWig);
    expect(wig.price).toBe(Math.max(...wigs.map((p) => p.price)));
  });
});
