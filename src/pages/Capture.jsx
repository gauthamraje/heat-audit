import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Clock, ArrowLeft, CloudRain } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Capture = () => {
  const navigate = useNavigate();
  const { state, stopCount, updateCurrentSpot, setRainfallContext } = useAudit();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ photo: null, location: '', timeBand: '' });
  const [loadingLoc, setLoadingLoc] = useState(false);
  const t = useTranslation('capture');

  const handleNext = (latestData = data) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateCurrentSpot(latestData);
      // If it's the first spot and we don't have rainfall context yet, go to rainfall step
      if (stopCount === 0 && !state.rainfallContext) {
        setStep(4);
      } else {
        navigate('/checklist');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/location-type');
    }
  };

  const compressImage = (base64Str) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 quality JPEG
      };
    });
  };

  const handlePhotoUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        const newData = {...data, photo: compressed};
        setData(newData);
        setTimeout(() => handleNext(newData), 500);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const timeBands = [
    { label: t.morning, value: 'Morning' },
    { label: t.midday, value: 'Midday' },
    { label: t.afternoon, value: 'Afternoon' },
    { label: t.evening, value: 'Evening' },
  ];

  const rainOptions = [
    { label: t.rainToday, value: 'today_yesterday' },
    { label: t.rain23, value: '2-3_days' },
    { label: t.rain47, value: '4-7_days' },
    { label: t.rainWeek, value: 'more_than_week' },
    { label: t.rainNotSure, value: 'not_sure' },
  ];

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
          <ArrowLeft />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '600' }}>
          {step <= 3 ? `Step ${step} of 3` : 'Context'}
        </div>
        <div style={{ width: '40px' }} />
      </div>

      <div className="progress-container mb-8">
        <div className="progress-bar" style={{ width: `${Math.min(step, 3) / 3 * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2>{t.photoStep}</h2>
            <p>{t.photoDesc}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.photoHint}</p>
            
            <div className="card text-center interactive mt-4" style={{ padding: '48px 24px', border: '2px dashed #ccc' }}>
              <Camera size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <div style={{ fontWeight: '600' }}>Tap to Open Camera</div>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                onChange={handlePhotoUpload} 
              />
            </div>

            {data.photo && (
              <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', height: '200px', backgroundImage: `url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}

            <button className="btn btn-secondary mt-auto" onClick={() => handleNext()}>
              Skip Photo
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2>{t.locStep}</h2>
            <p>{t.locDesc}</p>
            
            <button className="btn btn-primary mt-4 mb-4" disabled={loadingLoc} onClick={() => {
              if (navigator.geolocation) {
                setLoadingLoc(true);
                navigator.geolocation.getCurrentPosition((pos) => {
                  setLoadingLoc(false);
                  const newData = {...data, location: `${pos.coords.latitude}, ${pos.coords.longitude}`};
                  setData(newData);
                  handleNext(newData);
                }, () => {
                  setLoadingLoc(false);
                  alert("Could not get location. Please type it below.");
                });
              }
            }}>
              {loadingLoc ? "Locating..." : <><MapPin size={20} style={{ marginRight: '8px' }} /> Get GPS Location</>}
            </button>
            
            <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)', fontWeight: '600' }}>OR</div>
            
            <div className="input-group">
              <label className="input-label">Type area name manually</label>
              <input type="text" className="input-field" placeholder="e.g. Near Rajiv Nagar bus stop, Block C" value={data.location} onChange={(e) => setData({...data, location: e.target.value})} />
            </div>

            <button className="btn btn-secondary mt-auto" onClick={handleNext} disabled={!data.location}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2>{t.timeStep}</h2>
            <p>What time of day is it roughly right now?</p>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {timeBands.map(tb => (
                <button key={tb.value} className={`btn ${data.timeBand === tb.value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => {
                  const newData = {...data, timeBand: tb.value};
                  setData(newData);
                  setTimeout(() => handleNext(newData), 300);
                }}>
                  {tb.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="text-center mb-6">
              <div style={{ display: 'inline-block', background: 'rgba(255, 90, 95, 0.1)', color: 'var(--primary)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                <CloudRain size={32} />
              </div>
              <h2>{t.rainfallTitle}</h2>
              <p>Rain can cool surfaces significantly — this helps us read your heat data in context.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rainOptions.map(opt => (
                <button key={opt.value} className="btn btn-secondary" style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => {
                  setRainfallContext(opt.value);
                  navigate('/checklist');
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Capture;
