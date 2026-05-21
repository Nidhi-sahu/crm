import { temperatureLabel, temperatureTone } from '../constants/enquiryTemperatures';

export function TemperatureChip({ value }) {
  const tone = temperatureTone(value);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${tone.bg} ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {temperatureLabel(value)}
    </span>
  );
}
