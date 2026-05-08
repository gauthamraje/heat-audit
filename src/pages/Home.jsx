import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { PlayCircle, MapPin, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

const Home = () => {
  const navigate = useNavigate();
  const { state, stopCount, hasPathStop, hasEntryStop, resetAudit, setLanguage, setHasSeenSafety, updateUserProfile } = useAudit();
  const [showSafety, setShowSafety] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHow, setShowHow] = useState(false);
  
  const [profileDraft, setProfileDraft] = useState({ 
    name: state.userProfile?.name || '', 
    phone: state.userProfile?.phone || '' 
  });

  const t = useTranslation('home');

  const isUserProfileComplete = (profile) => {
    const name = (profile?.name || '').trim();
    const phone = (profile?.phone || '').trim();
    return Boolean(name && phone);
  };

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
    } else if (stopCount === 0 && !isUserProfileComplete(state.userProfile)) {
      setShowProfile(true);
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
    // After safety, show profile if missing
    if (!isUserProfileComplete(state.userProfile)) {
      setShowProfile(true);
    } else {
      navigate('/location-type');
    }
  };

  const saveProfile = () => {
    if (isUserProfileComplete(profileDraft)) {
      updateUserProfile({
        name: profileDraft.name.trim(),
        phone: profileDraft.phone.trim()
      });
      setShowProfile(false);
      navigate('/location-type');
    } else {
      alert(t.profileError);
    }
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

        <button className="btn btn-secondary mb-4" onClick={() => setShowHow(true)}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="card modal-content" style={{ maxWidth: '400px' }}>
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

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="card modal-content" style={{ maxWidth: '400px' }}>
              <h2 className="mb-2">{t.profileTitle}</h2>
              <p className="mb-4" style={{ fontSize: '0.95rem' }}>{t.profileDesc}</p>
              
              <div style={{ background: '#FFF5F5', color: '#C53030', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
                ℹ️ {t.profileNotice}
              </div>
              
              <div className="input-group">
                <label className="input-label">{t.nameLabel}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileDraft.name}
                  onChange={(e) => setProfileDraft({...profileDraft, name: e.target.value})}
                  placeholder={t.namePlaceholder}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">{t.phoneLabel}</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  value={profileDraft.phone}
                  onChange={(e) => setProfileDraft({...profileDraft, phone: e.target.value})}
                  placeholder={t.phonePlaceholder}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn btn-primary" onClick={saveProfile}>
                  {t.profileReady}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it Works Modal */}
      <AnimatePresence>
        {showHow && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="card modal-content" style={{ maxWidth: '450px' }}>
              <h2 className="mb-4">{t.howTitle}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span>{t.howStep1}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span>{t.howStep2}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span>{t.howStep3}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span>{t.howStep4}</span>
                </div>
              </div>
              <button className="btn btn-secondary mt-8" onClick={() => setShowHow(false)}>
                {t.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
