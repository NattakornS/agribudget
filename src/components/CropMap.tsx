import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import type { Crop } from "@/types";
// import { Card, CardContent } from '@/components/ui/card';
import { Sprout } from "lucide-react";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Create custom green icon for crops
const cropIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "crop-marker",
});

interface MapClickHandlerProps {
  onMapClick?: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface CropMapProps {
  crops: Crop[];
  height?: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  showClickInstruction?: boolean;
  isModal?: boolean;
}

const CropMap = ({
  crops,
  height = 400,
  onMapClick,
  selectedLocation,
  showClickInstruction = false,
}: CropMapProps) => {
  const mapRef = useRef<LeafletMap>(null);

  // Default center (you can change this to your region)
  const defaultCenter: [number, number] = [0, 0]; // World center, you might want to set this to your farm location
  const defaultZoom = 2;

  // Calculate bounds to fit all crops
  const validCrops = crops.filter((crop) => crop.latitude && crop.longitude);

  useEffect(() => {
    if (mapRef.current && validCrops.length > 0) {
      const bounds = L.latLngBounds(
        validCrops.map((crop) => [crop.latitude!, crop.longitude!])
      );
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [validCrops]);

  return (
    <div>
      <div style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

          {/* Render crop markers */}
          {validCrops.map((crop) => (
            <Marker
              key={crop.id}
              position={[crop.latitude!, crop.longitude!]}
              icon={cropIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Sprout className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{crop.name}</span>
                  </div>
                  {crop.location && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Location: {crop.location}
                    </p>
                  )}
                  {crop.area && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Area: {crop.area} m²
                    </p>
                  )}
                  {crop.amount && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Quantity: {crop.amount} units
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/70">
                    Lat: {crop.latitude?.toFixed(6)}, Lng:{" "}
                    {crop.longitude?.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render selected location if provided */}
          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={L.icon({
                iconUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                shadowUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
                className: "selected-location-marker",
              })}
            >
              <Popup>
                <div>
                  <p className="font-semibold">Selected Location</p>
                  <p className="text-xs text-muted-foreground/70">
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng:{" "}
                    {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {showClickInstruction && onMapClick && (
        <div className="p-3 bg-blue-50 border-t text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          💡 Click on map to set crop location
        </div>
      )}
    </div>
  );
};

export default CropMap;
