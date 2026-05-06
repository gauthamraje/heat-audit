import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { translations } from '../translations';

const Checklist = () => {
  const navigate = useNavigate();
  const { state, answerQuestion } = useAudit();
  const [currentIdx, setCurrentIdx] = useState(0);
  const t = translations[state.language].checklist;

  const questions = useMemo(() => {
    if (!state.currentSpot) return [];
    const isIndoor = state.currentSpot.isIndoor;
    const group = state.currentSpot.group;

    const qs = [];

    // Q1 - Sunlight
    qs.push({
      id: 'q1',
      text: isIndoor ? t.q1Work : t.q1,
      options: isIndoor 
        ? [t.q1WorkYes, t.q1WorkSometimes, t.q1WorkNo]
        : [t.q1Yes, t.q1Partial, t.q1Shaded]
    });

    // Q2 - Surface Heat
    qs.push({
      id: 'q2',
      text: t.q2,
      options: [t.q2Hot, t.q2Warm, t.q2Cool]
    });

    // Q3 - Airflow
    qs.push({
      id: 'q3',
      text: t.q3,
      options: [t.q3Good, t.q3Little, t.q3None]
    });

    // Q4 - Water Access (Skipped for Indoor)
    if (!isIndoor) {
      qs.push({
        id: 'q4',
        text: t.q4,
        options: [t.q4Free, t.q4Paid, t.q4None]
      });
    }

    // Q5 - Seating
    qs.push({
      id: 'q5',
      text: isIndoor ? t.q5Work : t.q5,
      options: isIndoor
        ? [t.q5Bench, t.q5Floor, t.q5None]
        : [t.q5Bench, t.q5Ledge, t.q5None]
    });

    // Group Specific Q6-Q8
    if (group === 'STREET') {
      qs.push({ id: 'q6', text: t.q6Street, options: [t.q1Yes, t.q1Partial, t.q1Shaded] }); // Reusing sunlight labels for yes/no/partial if needed, but spec says trees/roof/etc.
      // Wait, let's use the specific labels from spec
      qs.find(q => q.id === 'q6').options = [t.checklist?.yes || "Yes", t.checklist?.partial || "Partial", t.checklist?.no || "No"];
      
      // Let's refine the street Q6-Q8 options based on translations
      const q6 = { id: 'q6', text: t.q6Street, options: ["🌳 Yes, good cover", "🌤 Only partial", "❌ None at all"] };
      const q7 = { id: 'q7', text: t.q7Street, options: ["👥 Yes, several", "👤 Just 1–2", "❌ No one"] };
      const q8 = { 
        id: 'q8', 
        text: t.q8Street, 
        options: ["😓 Yes, clearly", "🤔 Slightly", "✅ No signs"],
        condition: (ans) => ans['q7'] && ans['q7'] !== "❌ No one"
      };
      qs.push(q6, q7, q8);
    } else {
      const q6 = { id: 'q6', text: t.q6Entry, options: ["✅ Yes, comfortably", "😰 Sort of", "❌ No — too hot/cramped"] };
      const q7 = { id: 'q7', text: t.q7Entry, options: ["👥 Yes", "❌ No / Not sure"] };
      const q8 = { 
        id: 'q8', 
        text: t.q8Entry, 
        options: ["✅ Yes, seating exists", "❌ No — standing only"],
        condition: (ans) => ans['q7'] && ans['q7'] === "👥 Yes"
      };
      qs.push(q6, q7, q8);
    }

    return qs;
  }, [state.currentSpot, t, state.language]);

  const visibleQuestions = useMemo(() => {
    const answers = state.currentSpot?.answers || {};
    return questions.filter(q => !q.condition || q.condition(answers));
  }, [questions, state.currentSpot?.answers]);

  React.useEffect(() => {
    if (!state.currentSpot) {
      navigate('/');
    }
  }, [state.currentSpot, navigate]);

  if (!state.currentSpot) return null;

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
