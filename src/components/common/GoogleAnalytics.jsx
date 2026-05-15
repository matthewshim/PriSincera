import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

/**
 * Google Analytics 4 Page View Tracker
 * This component listens to React Router changes and sends pageviews to GA.
 */
export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Make sure VITE_GA_MEASUREMENT_ID is set in .env
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (measurementId) {
      if (!ReactGA.isInitialized) {
        ReactGA.initialize(measurementId);
      }
      // Send pageview with a custom path
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }
  }, [location]);

  return null;
}
