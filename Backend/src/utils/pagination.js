const buildMeta = ({ page = 1, limit = 20, total = 0 } = {}) => {
  const p = Number(page);
  const l = Number(limit);
  const t = Number(total);
  return {
    pagination: {
      page: p,
      limit: l,
      total: t,
      totalPages: Math.max(1, Math.ceil(t / l)),
      hasNext: p * l < t,
      hasPrev: p > 1,
    },
  };
};

const buildSkip = ({ page = 1, limit = 20 }) => (Math.max(1, Number(page)) - 1) * Number(limit);

module.exports = { buildMeta, buildSkip };
