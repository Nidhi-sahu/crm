const TEMPERATURES = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold',
};

const TEMPERATURE_VALUES = Object.values(TEMPERATURES);

const SCORE_THRESHOLDS = { HOT: 70, WARM: 40 };

const classifyByScore = (score) => {
  if (typeof score !== 'number' || Number.isNaN(score)) return TEMPERATURES.COLD;
  if (score >= SCORE_THRESHOLDS.HOT) return TEMPERATURES.HOT;
  if (score >= SCORE_THRESHOLDS.WARM) return TEMPERATURES.WARM;
  return TEMPERATURES.COLD;
};

module.exports = { TEMPERATURES, TEMPERATURE_VALUES, SCORE_THRESHOLDS, classifyByScore };
