"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NearbyProvider } from "@/lib/api";

function makeDotIcon(colorHex: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${colorHex};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const providerIcon = makeDotIcon("#B14A2E");
const userIcon = makeDotIcon("#1E2320");

interface NearbyMapProps {
  center: { lat: number; lng: number };
  providers: NearbyProvider[];
}

export default function NearbyMap({ center, providers }: NearbyMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "320px", width: "100%", borderRadius: "6px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[center.lat, center.lng]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {providers.map((p) =>
        p.latitude != null && p.longitude != null ? (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={providerIcon}>
            <Popup>
              <strong>{p.business_name || p.username}</strong>
              {p.distance_km != null && (
                <>
                  <br />
                  {p.distance_km} km away
                </>
              )}
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}