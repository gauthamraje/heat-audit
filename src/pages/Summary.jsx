import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Share2, Map, UploadCloud, AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../hooks/useTranslation';

const Summary = () => {
  const navigate = useNavigate();
  const { state, stopCount, completeAudit, submitReflections, resetAudit, updateReflections } = useAudit();
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const [submitted, setSubmitted] = useState(false);
  const [reflectionStep, setReflectionStep] = useState(0); // 0, 1, 2, 3 (3 is final card)
  const t = useTranslation('summary');

  // Mark as complete once on mount
  useEffect(() => {
    if (!state.isComplete && stopCount > 0) {
      completeAudit();
    }
  }, [completeAudit, state.isComplete, stopCount]);

  // Handle submission when they reach the final card
  useEffect(() => {
    if (submitted || reflectionStep < 3) return;
    
    const doSubmit = async () => {
      setUploadState('uploading');
      const res = await submitReflections();
      if (res.success) {
        setUploadState('success');
        setSubmitted(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5A5F', '#4A90E2', '#F5A623']
        });
      } else {
        setUploadState('error');
      }
    };
    
    doSubmit();
  }, [submitReflections, submitted, reflectionStep]);

  const scoreCounts = state.spots.reduce((acc, spot) => {
    const s = spot.heatScore;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const handleStartNew = () => {
    resetAudit();
    navigate('/');
  };

  const reflections = [
    { key: 'r1', text: t.reflectionR1 },
    { key: 'r2', text: t.reflectionR2 },
    { key: 'r3', text: t.reflectionR3 },
  ];

  const handleReflectionNext = (val) => {
    const key = reflections[reflectionStep].key;
    updateReflections({ [key]: val });
    setReflectionStep(reflectionStep + 1);
  };

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="page">
      <AnimatePresence mode="wait">
        {reflectionStep < 3 ? (
          <motion.div 
            key={reflectionStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {reflectionStep === 0 && (
              <div className="text-center mb-8">
                <div style={{ display: 'inline-block', background: 'rgba(255, 90, 95, 0.1)', color: 'var(--primary)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                  <MessageCircle size={32} />
                </div>
                <h2>{t.reflectionTitle}</h2>
                <p>No right or wrong answers. Just share what you genuinely think.</p>
              </div>
            )}

            <div className="card mb-6">
              <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                {reflectionStep + 1} of 3
              </div>
              <h3 className="mb-4">{reflections[reflectionStep].text}</h3>
              <textarea 
                className="input-field" 
                style={{ minHeight: '120px', resize: 'none' }}
                placeholder="Type your thoughts here..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleReflectionNext(e.target.value);
                  }
                }}
                id={`reflection-${reflectionStep}`}
              />
            </div>

            <button 
              className="btn btn-primary mt-auto" 
              onClick={() => {
                const val = document.getElementById(`reflection-${reflectionStep}`).value;
                handleReflectionNext(val);
              }}
            >
              {reflectionStep === 2 ? t.finish : t.next}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="final"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div className="text-center py-8">
              <div style={{ display: 'inline-block', color: 'var(--primary)', marginBottom: '16px' }}>
                <CheckCircle size={64} />
              </div>
              <h1 style={{ fontSize: '2rem' }}>{t.completeTitle}</h1>
              <p style={{ fontSize: '1.1rem', marginTop: '16px' }}>
                You've recorded <strong>{stopCount} spots</strong> in your neighbourhood.
              </p>
            </div>

            <div className="card mb-6" style={{ background: '#f8fafc' }}>
              <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Map size={20} /> {t.impactTitle}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t.spotsLogged}</span>
                  <span style={{ fontWeight: 'bold' }}>{stopCount}</span>
                </div>
                
                <div style={{ height: '1px', background: '#eee', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>🌋 Very Hot</span>
                  <span style={{ fontWeight: 'bold', color: '#FF5A5F' }}>{scoreCounts[4] || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>🔥 Hot</span>
                  <span style={{ fontWeight: 'bold', color: '#F39C12' }}>{scoreCounts[3] || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>🌤 Warm</span>
                  <span style={{ fontWeight: 'bold', color: '#F5A623' }}>{scoreCounts[2] || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>❄️ Cool</span>
                  <span style={{ fontWeight: 'bold', color: '#4A90E2' }}>{scoreCounts[1] || 0}</span>
                </div>
              </div>
            </div>

            <p className="text-center" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Your observations are now part of the HeatWatch map — helping communities understand which spaces are hardest to be in.
            </p>

            {uploadState === 'uploading' && (
              <div className="card mb-4" style={{ background: '#EBF5FF', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UploadCloud className="animate-pulse" />
                <div>Saving your data to the cloud...</div>
              </div>
            )}

            {uploadState === 'error' && (
              <div className="card mb-4" style={{ background: '#FEF2F2', color: '#991B1B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <AlertCircle />
                  <div>Failed to save. Check your connection or console logs.</div>
                </div>
                <button className="btn btn-secondary" onClick={() => setSubmitted(false)} style={{ background: 'white', color: '#991B1B', border: '1px solid #991B1B', width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}>
                  Retry Submission
                </button>
              </div>
            )}

            {uploadState === 'success' && (
              <div className="card mb-4" style={{ background: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle />
                <div>Data saved successfully!</div>
              </div>
            )}

            <div className="mt-auto" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-primary" disabled={uploadState === 'uploading'}>
                <Share2 size={20} style={{ marginRight: '8px' }} /> {t.share}
              </button>
              <button className="btn btn-secondary" onClick={handleStartNew}>
                <RefreshCw size={20} style={{ marginRight: '8px' }} /> {t.startNew}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Summary;
