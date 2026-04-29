import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion } from 'framer-motion';
import { CheckCircle, Share2, Map, UploadCloud, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const Summary = () => {
  const navigate = useNavigate();
  const { state, stopCount, completeAudit, submitAuditData } = useAudit();
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error

  useEffect(() => {
    completeAudit();
    
    // Automatically submit data when hitting the summary page
    const doSubmit = async () => {
      setUploadState('uploading');
      const res = await submitAuditData();
      if (res.success) {
        setUploadState('success');
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
  }, [completeAudit, submitAuditData]);

  const scoreCounts = state.spots.reduce((acc, spot) => {
    const s = spot.heatScore;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="page">
      <div className="text-center py-8">
        <div style={{ display: 'inline-block', color: 'var(--primary)', marginBottom: '16px' }}>
          <CheckCircle size={64} />
        </div>
        <h1 style={{ fontSize: '2rem' }}>Amazing work, Solve Ninja! 🎉</h1>
        <p style={{ fontSize: '1.1rem', marginTop: '16px' }}>
          You've completed the Heat Exposure Audit with <strong>{stopCount} spots</strong> recorded in your neighbourhood.
        </p>
      </div>

      <div className="card mb-6" style={{ background: '#f8fafc' }}>
        <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Map size={20} /> Your Impact Summary
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Spots Mapped</span>
          <span style={{ fontWeight: 'bold' }}>{stopCount}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>"Very Hot" Spots Found</span>
          <span style={{ fontWeight: 'bold', color: '#FF5A5F' }}>{scoreCounts[4] || 0}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>"Hot" Spots Found</span>
          <span style={{ fontWeight: 'bold', color: '#F39C12' }}>{scoreCounts[3] || 0}</span>
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
          <div className="card mb-4" style={{ background: '#FEF2F2', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle />
            <div>Failed to save. Did you configure the Web App URL?</div>
          </div>
        )}

        {uploadState === 'success' && (
          <div className="card mb-4" style={{ background: '#ECFDF5', color: '#065F46', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle />
            <div>Data saved successfully!</div>
          </div>
        )}

        <div className="mt-auto">
          <button className="btn btn-primary mb-4" disabled={uploadState === 'uploading'}>
            <Share2 size={20} style={{ marginRight: '8px' }} /> Share My Impact
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  };
  
  export default Summary;
