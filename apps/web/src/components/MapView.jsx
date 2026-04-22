import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerPopup from './MarkerPopup';

const SANTIAGO_CENTER = [-33.4489, -70.6693];
const CATEGORY_COLORS = {
  nature: '#5b8a72',
  culture: '#7e8194',
  food: '#b28767',
  nightlife: '#6f7b9f',
  sport: '#6a9773',
  default: '#8a8f98'
};

function MapCenterUpdater({ userPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition) {
      return;
    }

    map.flyTo([userPosition.lat, userPosition.lng], 13, {
      duration: 1.4
    });
  }, [map, userPosition]);

  return null;
}

function createCategoryIcon(category) {
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default;

  return L.divIcon({
    className: 'custom-marker-wrapper',
    html: `<span class="custom-marker" style="--marker-color:${color}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 18],
    popupAnchor: [0, -14]
  });
}

function MapView({ panoramas, userPosition }) {
  const markers = useMemo(
    () =>
      panoramas.map((panorama) => ({
        ...panorama,
        icon: createCategoryIcon(panorama.category)
      })),
    [panoramas]
  );

  return (
    <section className="map-shell" aria-label="Interactive map of Santiago panoramas">
      <MapContainer center={SANTIAGO_CENTER} zoom={12} scrollWheelZoom className="map-view">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater userPosition={userPosition} />

        {markers.map((panorama) => (
          <Marker
            key={panorama.id}
            position={[panorama.location.lat, panorama.location.lng]}
            icon={panorama.icon}
          >
            <Popup>
              <MarkerPopup panorama={panorama} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}

export default MapView;
