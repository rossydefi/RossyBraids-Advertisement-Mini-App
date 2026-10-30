import { describe, expect, it } from 'vitest';
import { LOCATION_TIERS, SERVICES_DATA } from '../data/flyerData';
import { computeBookingPrice } from './pricing';

describe('computeBookingPrice', () => {
  it('adds base, options, add-ons and the home-service fee', () => {
    const service = SERVICES_DATA.find((s) => s.typesList?.some((t) => (t.priceModifier ?? 0) > 0))!;
    const subtype = service.typesList!.find((t) => (t.priceModifier ?? 0) > 0)!;
    const tier = LOCATION_TIERS[0];

    const salon = computeBookingPrice({ serviceId: service.id, subtypeId: subtype.id })!;
    const home = computeBookingPrice({
      serviceId: service.id,
      subtypeId: subtype.id,
      addOnIds: ['addon-wash', 'addon-wash'], // duplicates must not double-charge
      locationType: 'home_service',
      locationTierId: tier.id,
    })!;

    expect(salon.subtype).toBe(subtype.priceModifier);
    expect(home.addOns).toBe(5000);
    expect(home.homeFee).toBe(tier.fee);
    expect(home.total).toBe(salon.total + 5000 + tier.fee);
  });

  it('rejects unknown services, options, add-ons and zones', () => {
    expect(computeBookingPrice({ serviceId: 'nope' })).toBeNull();
    expect(computeBookingPrice({ serviceId: 'dreadlocks', subtypeId: 'nope' })).toBeNull();
    expect(computeBookingPrice({ serviceId: 'dreadlocks', addOnIds: ['nope'] })).toBeNull();
    expect(computeBookingPrice({ serviceId: 'dreadlocks', locationType: 'home_service', locationTierId: 'nope' })).toBeNull();
  });
});
