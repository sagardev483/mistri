"use client";

import { useCallback, useState } from "react";

interface GeoCoords {
  lat: number;
  lng: number;
}

interface GeolocationState {
  coords: GeoCoords | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ coords: null, loading: false, error: null });

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ coords: null, loading: false, error: "Geolocation is not supported by your browser." });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: { lat: position.coords.latitude, lng: position.coords.longitude },
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState({ coords: null, loading: false, error: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...state, request };
}