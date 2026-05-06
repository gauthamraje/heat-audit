import { useAudit } from '../context/AuditContext';
import { translations } from '../translations';

export const useTranslation = (namespace) => {
  const { state } = useAudit();
  const lang = state?.language || 'EN';
  const t = translations[lang] || translations['EN'];
  
  if (namespace) {
    return t[namespace] || translations['EN'][namespace];
  }
  
  return t;
};
