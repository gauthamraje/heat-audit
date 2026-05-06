import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

const HeatScore = () => {
  const navigate = useNavigate();
  const { state, updateCurrentSpot, completeCurrentSpot, submitSingleSpot } = useAudit();
  const [selected, setSelected] = useState(null);
  const t = useTranslation('score');

  const SCORES = [
    { val: 1, label: t.score1, desc: t.score1Desc, color: '#4A90E2', icon: '❄️' },
    { val: 2, label: t.score2, desc: t.score2Desc, color: '#F5A623', icon: '🌤' },
    { val: 3, label: t.score3, desc: t.score3Desc, color: '#F39C12', icon: '🔥' },
    { val: 4, label: t.score4, desc: t.score4Desc, color: '#FF5A5F', icon: '🌋' },
  ];

  const handleFinish = async () => {
    if (selected) {
      const finalSpot = { ...state.currentSpot, heatScore: selected };
      updateCurrentSpot({ heatScore: selected });
      completeCurrentSpot();
      
      // Submit immediately
      submitSingleSpot(finalSpot);
      
      navigate('/'); // Go back to home to log more spots or finish
    }
  };

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="page">
      <div className="text-center mb-6 mt-4">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
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
              <h3 style={{ margin: 0, color: s.color }}>{s.label}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          </div>
        ))}
        
        <button 
          className={`btn ${selected === '?' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setSelected('?')}
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <div style={{ fontWeight: 'bold' }}>{t.scoreNone}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.scoreNoneDesc}</div>
        </button>
      </div>

      <button className="btn btn-primary mt-auto" disabled={!selected} onClick={handleFinish}>
        Submit Spot
      </button>
    </motion.div>
  );
};

export default HeatScore;
