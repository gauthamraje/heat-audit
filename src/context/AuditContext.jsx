import React, { createContext, useContext, useState, useEffect } from 'react';

const AuditContext = createContext(undefined);

const LOCAL_STORAGE_KEY = 'heat_audit_state_v1';

export const AuditProvider = ({ children }) => {
  // Try to load state from localStorage
  const loadState = () => {
    const defaults = {
      spots: [], // Completed spots
      currentSpot: null, // Draft of current spot
      isComplete: false,
      language: 'EN',
      hasSeenSafety: false,
      rainfallContext: null,
      reflections: {
        r1: "",
        r2: "",
        r3: ""
      },
      userProfile: {
        name: "",
        phone: ""
      }
    };
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure language is valid
        if (parsed.language && !['EN', 'HI', 'KN'].includes(parsed.language)) {
          parsed.language = 'EN';
        }
        // Merge with defaults to ensure new fields (like language) exist
        return { ...defaults, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return defaults;
  };

  const [state, setState] = useState(loadState);

  // Persistence of Device ID
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('heat_audit_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('heat_audit_device_id', id);
    }
    return id;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setLanguage = (lang) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  const setHasSeenSafety = (val) => {
    setState(prev => ({ ...prev, hasSeenSafety: val }));
  };

  const setRainfallContext = (val) => {
    setState(prev => ({ ...prev, rainfallContext: val }));
  };

  const updateReflections = (updates) => {
    setState(prev => ({
      ...prev,
      reflections: { ...prev.reflections, ...updates }
    }));
  };

  const updateUserProfile = (updates) => {
    setState(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...updates }
    }));
  };

  const getUserProfileForSubmission = React.useCallback(() => {
    const inMemory = state.userProfile || {};
    const name = String(inMemory.name || '').trim();
    const phone = String(inMemory.phone || '').trim();
    if (name || phone) return { name, phone };

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return { name: "", phone: "" };
      const parsed = JSON.parse(saved);
      const savedProfile = parsed?.userProfile || {};
      return {
        name: String(savedProfile.name || '').trim(),
        phone: String(savedProfile.phone || '').trim()
      };
    } catch (e) {
      console.error("Failed to load user profile for submission", e);
      return { name: "", phone: "" };
    }
  }, [state.userProfile]);

  const startNewSpot = (locType, locGroup, label, isIndoor = false) => {
    setState(prev => ({
      ...prev,
      currentSpot: {
        id: Date.now().toString(),
        type: locType, // A, B, C, D
        group: locGroup, // STREET or ENTRY
        label: label, // "Open Path", etc.
        isIndoor,
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

  const completeAudit = React.useCallback(() => {
    setState(prev => ({ ...prev, isComplete: true }));
  }, []);

  const resetAudit = React.useCallback(() => {
    setState(prev => ({
      ...prev,
      spots: [],
      currentSpot: null,
      isComplete: false,
      rainfallContext: null,
      reflections: { r1: "", r2: "", r3: "" }
    }));
  }, []);

  const submitSingleSpot = React.useCallback(async (spot) => {
    const url = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!url) return { success: false, error: "No URL" };

    const profile = getUserProfileForSubmission();
    const payload = [{
      ...spot,
      ...spot.answers, // Flatten answers for easier sheet columns
      submittedAt: new Date().toISOString(),
      deviceId: deviceId,
      language: state.language,
      rainfallContext: state.rainfallContext,
      name: profile.name,
      phone: profile.phone,
      userProfile: {
        name: profile.name,
        phone: profile.phone
      },
      userAgent: navigator.userAgent
    }];

    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      return { success: true };
    } catch (e) {
      console.error("Single spot submission failed", e);
      return { success: false, error: e.toString() };
    }
  }, [deviceId, state.language, state.rainfallContext, getUserProfileForSubmission]);

  const submitReflections = React.useCallback(async () => {
    const url = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!url) return { success: false, error: "No URL" };

    const profile = getUserProfileForSubmission();
    const payload = [{
      type: 'REFLECTION_ONLY',
      submittedAt: new Date().toISOString(),
      deviceId: deviceId,
      language: state.language,
      name: profile.name,
      phone: profile.phone,
      userProfile: {
        name: profile.name,
        phone: profile.phone
      },
      reflections: { ...state.reflections },
      userAgent: navigator.userAgent
    }];

    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      return { success: true };
    } catch (e) {
      console.error("Reflections submission failed", e);
      return { success: false, error: e.toString() };
    }
  }, [deviceId, state.language, state.reflections, getUserProfileForSubmission]);

  const submitAuditData = React.useCallback(async () => {
    const url = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!url) return { success: false, error: "No URL" };

    if (state.spots.length === 0) return { success: false, error: "No data" };

    const profile = getUserProfileForSubmission();
    const payload = state.spots.map(spot => ({
      ...spot,
      ...spot.answers,
      ...state.reflections,
      submittedAt: new Date().toISOString(),
      deviceId: deviceId,
      language: state.language,
      rainfallContext: state.rainfallContext,
      name: profile.name,
      phone: profile.phone,
      userProfile: {
        name: profile.name,
        phone: profile.phone
      },
      userAgent: navigator.userAgent
    }));

    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      return { success: true };
    } catch (e) {
      console.error("Submission failed", e);
      return { success: false, error: e.toString() };
    }
  }, [state.spots, state.language, state.rainfallContext, state.reflections, getUserProfileForSubmission, deviceId]);

  // Helper stats
  const stopCount = state.spots.length;
  const hasPathStop = state.spots.some(s => s.group === 'STREET');
  const hasEntryStop = state.spots.some(s => s.group === 'ENTRY');

  return (
    <AuditContext.Provider value={{
      state,
      setLanguage,
      setHasSeenSafety,
      setRainfallContext,
      updateReflections,
      updateUserProfile,
      startNewSpot,
      updateCurrentSpot,
      answerQuestion,
      completeCurrentSpot,
      completeAudit,
      resetAudit,
      submitSingleSpot,
      submitReflections,
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
