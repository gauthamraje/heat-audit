import React, { createContext, useContext, useState, useEffect } from 'react';

const AuditContext = createContext(undefined);

const LOCAL_STORAGE_KEY = 'heat_audit_state_v1';

export const AuditProvider = ({ children }) => {
  // Try to load state from localStorage
  const loadState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return {
      spots: [], // Completed spots
      currentSpot: null, // Draft of current spot
      isComplete: false,
    };
  };

  const [state, setState] = useState(loadState);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const startNewSpot = (locType, locGroup, label) => {
    setState(prev => ({
      ...prev,
      currentSpot: {
        id: Date.now().toString(),
        type: locType, // A, B, C, D
        group: locGroup, // STREET or ENTRY
        label: label, // "Open Path", etc.
        photo: null,
        location: null,
        timeBand: null,
        answers: {}, // Q1-Q8
        heatScore: null
      }
    }));
  };

  const updateCurrentSpot = (updates) => {
    setState(prev => ({
      ...prev,
      currentSpot: {
        ...prev.currentSpot,
        ...updates
      }
    }));
  };

  const answerQuestion = (questionId, answer) => {
    setState(prev => ({
      ...prev,
      currentSpot: {
        ...prev.currentSpot,
        answers: {
          ...prev.currentSpot.answers,
          [questionId]: answer
        }
      }
    }));
  };

  const completeCurrentSpot = () => {
    setState(prev => {
      const newSpots = [...prev.spots, prev.currentSpot];
      return {
        ...prev,
        spots: newSpots,
        currentSpot: null
      };
    });
  };

  const completeAudit = () => {
    setState(prev => ({ ...prev, isComplete: true }));
  };

  const resetAudit = () => {
    setState({ spots: [], currentSpot: null, isComplete: false });
  };

  const submitAuditData = async () => {
    const url = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!url) {
      console.warn("VITE_GOOGLE_SCRIPT_URL is not set. Data will not be submitted.");
      return { success: false, error: "No URL" };
    }

    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(state.spots),
      });

      // With no-cors we get an opaque response, so we assume success if no network error
      return { success: true };
    } catch (e) {
      console.error("Submission failed", e);
      return { success: false, error: e.toString() };
    }
  };

  // Helper stats
  const stopCount = state.spots.length;
  const hasPathStop = state.spots.some(s => s.group === 'STREET');
  const hasEntryStop = state.spots.some(s => s.group === 'ENTRY');

  return (
    <AuditContext.Provider value={{
      state,
      startNewSpot,
      updateCurrentSpot,
      answerQuestion,
      completeCurrentSpot,
      completeAudit,
      resetAudit,
      submitAuditData,
      stopCount,
      hasPathStop,
      hasEntryStop
    }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
