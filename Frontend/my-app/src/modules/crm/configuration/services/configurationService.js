import { configurationAPI } from './configurationAPI';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const configurationService = {
  async listStages() {
    const data = unwrap(await configurationAPI.listStages());
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  // steps: [{ id?, name }]
  async bulkSave(steps) {
    const payload = steps
      .map((s) => ({
        ...(s.id ? { id: s.id } : {}),
        name: (s.name || '').trim(),
      }))
      .filter((s) => s.name.length >= 2);
    const data = unwrap(await configurationAPI.bulkSave(payload));
    return {
      stages: Array.isArray(data?.stages) ? data.stages : [],
      skipped: Array.isArray(data?.skipped) ? data.skipped : [],
    };
  },
};
