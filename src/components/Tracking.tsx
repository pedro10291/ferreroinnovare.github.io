import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const Tracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (!sessionStorage.getItem('clinic_tracking_entry_page')) {
      sessionStorage.setItem('clinic_tracking_entry_page', location.pathname);
      sessionStorage.setItem('clinic_tracking_referrer', document.referrer || '');
      
      const params = new URLSearchParams(window.location.search);
      const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      
      utms.forEach(utm => {
        const value = params.get(utm);
        if (value) {
          sessionStorage.setItem('clinic_tracking_' + utm, value);
        }
      });
    }
  }, [location.pathname]);

  return null;
};

export const getTrackingData = () => {
  return {
    utm_source: sessionStorage.getItem('clinic_tracking_utm_source') || '',
    utm_medium: sessionStorage.getItem('clinic_tracking_utm_medium') || '',
    utm_campaign: sessionStorage.getItem('clinic_tracking_utm_campaign') || '',
    utm_content: sessionStorage.getItem('clinic_tracking_utm_content') || '',
    utm_term: sessionStorage.getItem('clinic_tracking_utm_term') || '',
    entry_page: sessionStorage.getItem('clinic_tracking_entry_page') || '',
    referrer: sessionStorage.getItem('clinic_tracking_referrer') || ''
  };
};
