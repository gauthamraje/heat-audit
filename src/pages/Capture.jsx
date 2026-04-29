import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Clock, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const Capture = () => {
  const navigate = useNavigate();
  const { updateCurrentSpot } = useAudit();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ photo: null, location: '', timeBand: '' });
  const [loadingLoc, setLoadingLoc] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateCurrentSpot(data);
      navigate('/checklist');
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
        setData({...data, photo: compressed});
        setTimeout(handleNext, 500);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
          <ArrowLeft />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '600' }}>
          Step {step} of 3
        </div>
        <div style={{ width: '40px' }} />
      </div>

      <div className="progress-container mb-8">
        <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2>Take a Photo</h2>
            <p>Show the sky, shade, surfaces, and anyone present if you can. Hold your phone horizontal for wider shots.</p>
            
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
            <h2>Share Location</h2>
            <p>Share your location pin so we can map this spot. No GPS? Just type the area name.</p>
            
            <button className="btn btn-primary mt-4 mb-4" disabled={loadingLoc} onClick={() => {
              if (navigator.geolocation) {
                setLoadingLoc(true);
                navigator.geolocation.getCurrentPosition((pos) => {
                  setLoadingLoc(false);
                  setData({...data, location: `${pos.coords.latitude}, ${pos.coords.longitude}`});
                  handleNext();
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
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2>Time of Observation</h2>
            <p>What time of day is it roughly right now?</p>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['🌅 Morning (6–10 AM)', '☀️ Midday (10–2 PM)', '🌤 Afternoon (2–6 PM)'].map(t => (
                <button key={t} className={`btn ${data.timeBand === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => {
                  setData({...data, timeBand: t});
                  setTimeout(() => {
                    updateCurrentSpot({...data, timeBand: t});
                    navigate('/checklist');
                  }, 300);
                }}>
                  {t}
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
