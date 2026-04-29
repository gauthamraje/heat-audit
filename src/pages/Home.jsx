import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { PlayCircle, MapPin, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const { state, stopCount, hasPathStop, hasEntryStop, resetAudit } = useAudit();

  React.useEffect(() => {
    if (state.isComplete) {
      navigate('/summary');
    }
  }, [state.isComplete, navigate]);

  if (state.isComplete) return null;

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all logged spots and start over?")) {
      resetAudit();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="page"
    >
      <div className="text-center mb-6 mt-4">
        <h1 style={{ color: 'var(--primary)' }}>Heat Exposure Audit</h1>
        <p>Map the hardest hit spaces in your neighborhood.</p>
      </div>

      <div className="video-wrapper mb-6">
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column' }}>
           <PlayCircle size={48} style={{ opacity: 0.8, marginBottom: '10px' }} />
           <span>Intro Video Placeholder</span>
        </div>
      </div>

      <div className="card mb-6" style={{ background: 'var(--primary)', color: 'white' }}>
        <h2 className="mb-2" style={{ fontSize: '1.1rem' }}>Your Progress</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stopCount}</div>
            <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>Spots Logged</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '4px', opacity: hasPathStop ? 1 : 0.7 }}>
              {hasPathStop ? '✅' : '⚪'} Path/Transit
            </div>
            <div style={{ fontSize: '0.85rem', opacity: hasEntryStop ? 1 : 0.7 }}>
              {hasEntryStop ? '✅' : '⚪'} Entry/Work
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <button className="btn btn-primary mb-4" onClick={() => navigate('/location-type')}>
          <MapPin size={20} style={{ marginRight: '8px' }} /> Log a Spot
        </button>
        
        {stopCount > 0 && (
          <button className="btn btn-outline mb-4" onClick={() => navigate('/summary')}>
            <CheckCircle size={20} style={{ marginRight: '8px' }} /> I'm Done
          </button>
        )}

        <button className="btn btn-secondary mb-4">
          <Info size={20} style={{ marginRight: '8px' }} /> How it Works
        </button>

        {stopCount > 0 && (
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              fontSize: '0.8rem', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              width: '100%',
              marginTop: '8px'
            }} 
            onClick={handleClearAll}
          >
            Clear All progress
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Home;
