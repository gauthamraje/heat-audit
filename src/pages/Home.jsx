import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { PlayCircle, MapPin, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

const Home = () => {
  const navigate = useNavigate();
  const { state, stopCount, hasPathStop, hasEntryStop, resetAudit, setLanguage, setHasSeenSafety } = useAudit();
  const [showSafety, setShowSafety] = useState(false);
  const t = useTranslation('home');

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

  const handleLogSpot = () => {
    if (stopCount === 0 && !state.hasSeenSafety) {
      setShowSafety(true);
    } else {
      navigate('/location-type');
    }
  };

  const handleDone = () => {
    const isEligible = stopCount >= 4 && hasPathStop && hasEntryStop;
    if (!isEligible) {
      const missing = [];
      if (stopCount < 4) missing.push(state.language === 'EN' ? "At least 4 spots" : "कम से कम 4 स्थान");
      if (!hasPathStop) missing.push(state.language === 'EN' ? "One street or transit stop" : "एक सड़क या पारगमन स्टॉप");
      if (!hasEntryStop) missing.push(state.language === 'EN' ? "One building entry or work space" : "एक इमारत प्रवेश या कार्य स्थान");
      
      const msg = state.language === 'EN' 
        ? "To complete the audit, you still need:" 
        : "ऑडिट पूरा करने के लिए, आपको अभी भी चाहिए:";
      const finishMsg = state.language === 'EN' 
        ? "Finish anyway?" 
        : "फिर भी समाप्त करें?";

      if (window.confirm(`${msg}\n\n${missing.map(m => `❌ ${m}`).join('\n')}\n\n${finishMsg}`)) {
        navigate('/summary');
      }
    } else {
      navigate('/summary');
    }
  };

  const confirmSafety = () => {
    setHasSeenSafety(true);
    setShowSafety(false);
    navigate('/location-type');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="page"
    >
      {/* Language Selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
        {['EN', 'HI', 'KN'].map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid var(--primary)',
              background: state.language === lang ? 'var(--primary)' : 'transparent',
              color: state.language === lang ? 'white' : 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {lang === 'EN' ? 'English' : lang === 'HI' ? 'हिंदी' : 'ಕನ್ನಡ'}
          </button>
        ))}
      </div>

      <div className="text-center mb-6 mt-4">
        <h1 style={{ color: 'var(--primary)' }}>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      <div className="video-wrapper mb-6">
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column' }}>
           <PlayCircle size={48} style={{ opacity: 0.8, marginBottom: '10px' }} />
           <span>Intro Video Placeholder</span>
        </div>
      </div>

      <div className="card mb-6" style={{ background: 'var(--primary)', color: 'white' }}>
        <h2 className="mb-2" style={{ fontSize: '1.1rem' }}>{t.progress}</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stopCount}</div>
            <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>{t.spotsLogged}</div>
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
        <button className="btn btn-primary mb-4" onClick={handleLogSpot}>
          <MapPin size={20} style={{ marginRight: '8px' }} /> {t.logSpot}
        </button>
        
        {stopCount > 0 && (
          <button className="btn btn-outline mb-4" onClick={handleDone}>
            <CheckCircle size={20} style={{ marginRight: '8px' }} /> {t.done}
          </button>
        )}

        <button className="btn btn-secondary mb-4">
          <Info size={20} style={{ marginRight: '8px' }} /> {t.howItWorks}
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
            {t.clearProgress}
          </button>
        )}
      </div>

      {/* Safety Modal */}
      <AnimatePresence>
        {showSafety && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="card"
              style={{ maxWidth: '400px', background: 'white' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#E53E3E' }}>
                <ShieldAlert size={32} />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t.safetyTitle}</h2>
              </div>
              <ul style={{ paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.6' }}>
                <li>{t.safety1}</li>
                <li>{t.safety2}</li>
                <li>{t.safety3}</li>
                <li>{t.safety4}</li>
                <li>{t.safety5}</li>
                <li>{t.safety6}</li>
              </ul>
              <button className="btn btn-primary" onClick={confirmSafety}>
                {t.safetyReady}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
