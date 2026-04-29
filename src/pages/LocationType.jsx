import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Bus, Building, Wrench, ArrowLeft, MapPin } from 'lucide-react';

const TYPES = [
  { id: 'A', group: 'STREET', label: 'Open Path', desc: 'Street, lane, footpath, walkway', icon: Navigation },
  { id: 'B', group: 'STREET', label: 'Transit Stop', desc: 'Bus stop, auto stand, pickup point', icon: Bus },
  { id: 'C', group: 'ENTRY', label: 'Building Entry', desc: 'Apartment gate, entrance, compound', icon: Building },
  { id: 'D', group: 'ENTRY', label: 'Work Space', desc: 'Staircase, corridor, kitchen', icon: Wrench },
];

const LocationType = () => {
  const navigate = useNavigate();
  const { startNewSpot } = useAudit();
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const handleSelect = (t) => {
    setSelected(t);
    setConfirming(true);
  };

  const handleConfirm = () => {
    if (selected) {
      startNewSpot(selected.id, selected.group, selected.label);
      navigate('/capture');
    }
  };

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => setConfirming(false) || !confirming && navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
          <ArrowLeft />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '600' }}>
          {confirming ? 'Confirm Location' : 'Spot Type'}
        </div>
        <div style={{ width: '40px' }} />
      </div>

      <AnimatePresence mode="wait">
        {!confirming ? (
          <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
            <h2>What kind of spot are you at?</h2>
            <p>Choose the option that best matches where you're standing right now.</p>
            
            <div style={{ marginTop: '24px' }}>
              {TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.id} className="card interactive" onClick={() => handleSelect(t)} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(255, 90, 95, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{t.label}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="confirmation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card text-center py-8">
              <div style={{ display: 'inline-block', background: 'rgba(255, 90, 95, 0.1)', color: 'var(--primary)', padding: '24px', borderRadius: '50%', marginBottom: '16px' }}>
                <MapPin size={48} />
              </div>
              <h2 className="mb-4">Are you standing at your chosen spot right now?</h2>
              <p>You need to observe what you can physically see and feel. Don't answer from memory.</p>
            </div>
            
            <div className="mt-auto">
              <button className="btn btn-primary mb-4" onClick={handleConfirm}>
                Yes, I'm here
              </button>
              <button className="btn btn-secondary" onClick={() => setConfirming(false)}>
                Go back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LocationType;
