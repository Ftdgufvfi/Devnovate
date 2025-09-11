import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useBuilderStore from '../store/builderStore';

export const useRouteChangeHandler = () => {
  const location = useLocation();
  const setSelectedComponent = useBuilderStore(state => state.setSelectedComponent);

  useEffect(() => {
    // Clear selected component when navigating away from builder pages
    if (!location.pathname.includes('/builder')) {
      setSelectedComponent(null);
    }
  }, [location.pathname, setSelectedComponent]);
};
