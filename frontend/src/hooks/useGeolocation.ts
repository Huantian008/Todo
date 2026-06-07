import { useState, useEffect } from 'react';

export interface LocationState {
  loading: boolean;
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
}

const DEFAULT_COORDINATES = {
  // Nanchang Xihu District fallback. Used when browser geolocation is unavailable.
  lat: 28.6573,
  lng: 115.8774,
};

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
        coordinates: DEFAULT_COORDINATES,
        error: null,
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
        console.warn('Browser geolocation failed, using default weather location:', error.message);
        setState({
          loading: false,
          coordinates: DEFAULT_COORDINATES,
          error: null,
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
