import { axiosClient } from '../../../../shared/api/axiosClient';

const KEY = 'office.location';
const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const officeLocationService = {
  // Returns { latitude, longitude, radiusMeters } or null if not configured.
  async get() {
    try {
      const data = unwrap(await axiosClient.get(`/configurations/${KEY}`));
      const value = data?.value ?? data?.configuration?.value ?? null;
      return value && typeof value === 'object' ? value : null;
    } catch (_) {
      return null; // not configured yet (404) or no access
    }
  },

  async set({ latitude, longitude, radiusMeters = 100 }) {
    const data = unwrap(
      await axiosClient.put(`/configurations/${KEY}`, {
        value: { latitude, longitude, radiusMeters },
        category: 'geo',
        description: 'Office location for visit-form geo restriction',
      }),
    );
    return data;
  },
};
