import { useState, useEffect } from 'react';

export interface LocationState {
  loading: boolean;
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
}

// Hook to retrieve coordinates from the browser's Geolocation API
export const useGeolocation = (): LocationState => {
  const [state, setState] = useState<LocationState>({
    loading: true,
    coordinates: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        coordinates: null,
        error: 'Enable browser location permission',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
        });
      },
      (error) => {
        setState({
          loading: false,
          coordinates: null,
          error:
            error.code === error.PERMISSION_DENIED
              ? 'Enable browser location permission'
              : 'Location unavailable. Check browser location permission',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return state;
};
