import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Bus, Building, Wrench, ArrowLeft, MapPin } from 'lucide-react';
import { translations } from '../translations';

const LocationType = () => {
  const navigate = useNavigate();
  const { state, startNewSpot } = useAudit();
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const t = translations[state.language].location;

  const TYPES = [
    { id: 'A', group: 'STREET', label: t.typeA, desc: t.typeADesc, icon: Navigation },
    { id: 'B', group: 'STREET', label: t.typeB, desc: t.typeBDesc, icon: Bus },
    { id: 'C', group: 'ENTRY', label: t.typeC, desc: t.typeCDesc, icon: Building },
    { id: 'D', group: 'ENTRY', label: t.typeD, desc: t.typeDDesc, icon: Wrench, isIndoor: true },
  ];

  const handleSelect = (typeObj) => {
    setSelected(typeObj);
    setConfirming(true);
  };

  const handleConfirm = () => {
    if (selected) {
      startNewSpot(selected.id, selected.group, selected.label, selected.isIndoor || false);
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
          {confirming ? t.confirmTitle : t.title}
        </div>
        <div style={{ width: '40px' }} />
      </div>

      <AnimatePresence mode="wait">
        {!confirming ? (
          <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
            
            <div style={{ marginTop: '24px' }}>
              {TYPES.map(typeObj => {
                const Icon = typeObj.icon;
                return (
                  <div key={typeObj.id} className="card interactive" onClick={() => handleSelect(typeObj)} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(255, 90, 95, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{typeObj.label}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{typeObj.desc}</div>
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
              <h2 className="mb-4">{t.confirmTitle}</h2>
              <p>You need to observe what you can physically see and feel. Don't answer from memory.</p>
            </div>
            
            <div className="mt-auto">
              <button className="btn btn-primary mb-4" onClick={handleConfirm}>
                {t.confirmYes}
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
