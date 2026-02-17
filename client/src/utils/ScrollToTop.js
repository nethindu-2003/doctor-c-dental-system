import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantly scrolls to the top of the page (0, 0) whenever the route (pathname) changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything visibly
};

export default ScrollToTop;