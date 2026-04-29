import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion } from 'framer-motion';

const SCORES = [
  { val: 1, label: 'Cool', desc: 'Full shade, cool to touch, no sweating', color: '#4A90E2', icon: '❄️' },
  { val: 2, label: 'Warm', desc: 'Partial shade, surfaces warm, mild sweat', color: '#F5A623', icon: '🌤' },
  { val: 3, label: 'Hot', desc: 'Direct sun, surfaces hot, visible sweating', color: '#F39C12', icon: '🔥' },
  { val: 4, label: 'Very Hot', desc: 'No shade anywhere, surfaces extremely hot', color: '#FF5A5F', icon: '🌋' },
];

const HeatScore = () => {
  const navigate = useNavigate();
  const { updateCurrentSpot, completeCurrentSpot } = useAudit();
  const [selected, setSelected] = useState(null);

  const handleFinish = () => {
    if (selected) {
      updateCurrentSpot({ heatScore: selected });
      completeCurrentSpot();
      navigate('/'); // Go back to home to log more spots or finish
    }
  };

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="page">
      <div className="text-center mb-6 mt-4">
        <h2>Final step — Heat Score 🌡</h2>
        <p>Based on everything you can observe right now, what is the heat score for this spot?</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {SCORES.map(s => (
          <div key={s.val} className={`card interactive ${selected === s.val ? 'selected' : ''}`} 
               onClick={() => setSelected(s.val)}
               style={{ 
                 borderColor: selected === s.val ? s.color : 'transparent',
                 boxShadow: selected === s.val ? `0 0 0 2px ${s.color}` : 'var(--shadow-sm)',
                 display: 'flex', alignItems: 'center', gap: '16px', padding: '16px'
               }}>
            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
            <div>
              <h3 style={{ margin: 0, color: s.color }}>{s.val} - {s.label}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          </div>
        ))}
        
        <button className={`btn ${selected === '?' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelected('?')}>
          Can't score (Fewer than 2 visible indicators)
        </button>
      </div>

      <button className="btn btn-primary mt-auto" disabled={!selected} onClick={handleFinish}>
        Submit Spot
      </button>
    </motion.div>
  );
};

export default HeatScore;
