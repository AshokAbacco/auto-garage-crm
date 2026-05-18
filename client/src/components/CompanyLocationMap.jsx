//client/src/components/CompanyLocationMap.jsx

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function CompanyLocationMap({
  latitude,
  longitude,
  companyName,
}) {
  // Prevent crash if values are empty
  if (!latitude || !longitude) {
    return (
      <div className="p-4 border rounded-xl text-gray-500">
        Location not available
      </div>
    );
  }

  const position = [Number(latitude), Number(longitude)];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>
            <div>
              <strong>
                {companyName || "Company Name"}
              </strong>

              <br />

              Latitude: {latitude}

              <br />

              Longitude: {longitude}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}