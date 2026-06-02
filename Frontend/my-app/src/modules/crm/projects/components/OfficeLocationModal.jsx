import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Alert } from '../../../../shared/components/Alert';
import { MapPicker } from '../../../../shared/components/MapPicker';
import { officeLocationService } from '../services/officeLocationService';

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

export function OfficeLocationModal({ open, onClose, onSaved }) {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [radius, setRadius] = useState('100');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(true);
    officeLocationService
      .get()
      .then((v) => {
        if (v && isNum(v.latitude) && isNum(v.longitude)) {
          setLat(v.latitude);
          setLng(v.longitude);
          setRadius(String(v.radiusMeters || 100));
        } else {
          setLat(null);
          setLng(null);
          setRadius('100');
        }
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handleSave = async () => {
    if (!isNum(lat) || !isNum(lng)) {
      setError('Drop a pin on the map to set the office location.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const r = Number(radius);
      await officeLocationService.set({
        latitude: lat,
        longitude: lng,
        radiusMeters: Number.isFinite(r) && r > 0 ? r : 100,
      });
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save office location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Office Location"
      subtitle="Visit forms can be submitted near this office or a project site"
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving || loading}>
            Save Office Location
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error && <Alert tone="error" title="Couldn't save">{error}</Alert>}
        {loading ? (
          <p className="py-6 text-center text-xs text-slate-500">Loading current location…</p>
        ) : (
          <>
            <MapPicker
              lat={lat}
              lng={lng}
              onChange={(la, ln) => {
                setLat(la);
                setLng(ln);
              }}
              height={300}
            />
            <Input
              type="number"
              min="10"
              label="Allowed radius (meters)"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="100"
            />
            <p className="text-[11px] text-slate-400">
              Default is 100m. The system also adds the device’s GPS accuracy margin so
              laptops with weaker location aren’t wrongly blocked.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
