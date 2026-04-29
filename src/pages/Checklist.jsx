import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const COMMON_QUESTIONS = [
  { id: 'q1', text: 'Is this spot in direct sunlight right now?', options: ['☀️ Yes, full sun', '🌤 Partially', '⛅ No, shaded'] },
  { id: 'q2', text: 'Touch a surface nearby. Is it hot?', options: ['🔥 Yes, very hot', '🌡 Somewhat warm', '❄️ No, cool'] },
  { id: 'q3', text: 'Can you feel a breeze or ventilation?', options: ['💨 Yes, good airflow', '🌬 A little', '🚫 None at all'] },
  { id: 'q4', text: 'Is drinking water available nearby (2-min walk)?', options: ['💧 Yes, nearby', '❌ No, not that I can see'] },
  { id: 'q5', text: 'Is there a shaded place where someone could sit?', options: ['✅ Yes', '❌ No'] },
];

const STREET_QUESTIONS = [
  { id: 'q6', text: 'Is there overhead shade (trees, roof, canopy)?', options: ['🌳 Yes, good cover', '🌤 Only partial', '❌ None at all'] },
  { id: 'q7', text: 'Are there people visibly at or moving through this spot right now?', options: ['👥 Yes, several', '👤 Just 1–2', '❌ No one'] },
  { id: 'q8', text: 'Can you see signs of heat stress in the people here?', options: ['😓 Yes, clearly', '🤔 A little', '✅ No visible signs'], condition: (answers) => answers['q7'] !== '❌ No one' }
];

const ENTRY_QUESTIONS = [
  { id: 'q6', text: 'Could someone comfortably wait at this spot for 5 minutes or more?', options: ['✅ Yes, comfortably', '😰 Sort of', '❌ No, too hot/cramped'] },
  { id: 'q7', text: 'Are there workers or people waiting at this spot right now?', options: ['👥 Yes', '❌ No / Not sure'] },
  { id: 'q8', text: 'Do the people waiting here have a place to sit?', options: ['✅ Yes, seating exists', '❌ No, standing only'], condition: (answers) => answers['q7'] === '👥 Yes' }
];

const Checklist = () => {
  const navigate = useNavigate();
  const { state, answerQuestion } = useAudit();
  const [currentIdx, setCurrentIdx] = useState(0);

  const questions = useMemo(() => {
    if (!state.currentSpot) return [];
    const groupQ = state.currentSpot.group === 'STREET' ? STREET_QUESTIONS : ENTRY_QUESTIONS;
    return [...COMMON_QUESTIONS, ...groupQ];
  }, [state.currentSpot]);

  const visibleQuestions = useMemo(() => {
    const answers = state.currentSpot?.answers || {};
    return questions.filter(q => !q.condition || q.condition(answers));
  }, [questions, state.currentSpot?.answers]);

  if (!state.currentSpot) {
    navigate('/');
    return null;
  }

  const activeQuestion = visibleQuestions[currentIdx];

  const handleAnswer = (opt) => {
    answerQuestion(activeQuestion.id, opt);
    
    // Calculate what the visible questions WILL be after this answer
    const newAnswers = { ...state.currentSpot.answers, [activeQuestion.id]: opt };
    const newVisibleQuestions = questions.filter(q => !q.condition || q.condition(newAnswers));

    if (currentIdx < newVisibleQuestions.length - 1) {
      setTimeout(() => setCurrentIdx(prev => prev + 1), 200);
    } else {
      setTimeout(() => navigate('/heat-score'), 200);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    } else {
      navigate('/capture');
    }
  };

  if (!state.currentSpot || !activeQuestion) {
    if (!state.currentSpot) navigate('/');
    return null;
  }

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
          <ArrowLeft />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>
          Q{currentIdx + 1} of {visibleQuestions.length}
        </div>
        <div style={{ width: '40px' }} />
      </div>

      <div className="progress-container mb-8">
        <div className="progress-bar" style={{ width: `${((currentIdx + 1) / visibleQuestions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '32px' }}>{activeQuestion.text}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto', marginBottom: '24px' }}>
            {activeQuestion.options.map((opt, i) => {
              const isSelected = state.currentSpot.answers[activeQuestion.id] === opt;
              return (
                <button key={i} className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleAnswer(opt)} style={{ justifyContent: 'flex-start', padding: '20px 24px', fontSize: '1.1rem' }}>
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Checklist;
