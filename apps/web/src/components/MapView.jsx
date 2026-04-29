import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import MarkerPopup from './MarkerPopup';

const SANTIAGO_CENTER = [-33.4489, -70.6693];
const CATEGORY_COLORS = {
  aire_libre: '#5b8a72',
  cultura: '#7e8194',
  entretenimiento: '#b28767',
  default: '#8a8f98'
};

function MapCenterUpdater({ userPosition, selectedPlace }) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition) {
      return;
    }

    map.flyTo([userPosition.lat, userPosition.lng], 13, {
      duration: 1.4
    });
  }, [map, userPosition]);

  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    map.flyTo([selectedPlace.location.lat, selectedPlace.location.lng], 14, {
      duration: 0.9
    });
  }, [map, selectedPlace]);

  return null;
}

function AdminMapPicker({ onMapPick }) {
  useMapEvents({
    click(event) {
      if (!onMapPick) {
        return;
      }

      onMapPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });

  return null;
}

function createCategoryIcon(category, isActive, isFeatured) {
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default;
  const classes = [
    'custom-marker',
    isActive ? 'is-active' : '',
    isFeatured ? 'is-featured' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'custom-marker-wrapper',
    html: `<span class="${classes}" style="--marker-color:${color}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 18],
    popupAnchor: [0, -14]
  });
}

function MapView({ panoramas, userPosition, selectedPlace, onSelectPlace, onMapPick }) {
  const markers = useMemo(
    () =>
      panoramas.map((panorama) => ({
        ...panorama,
        icon: createCategoryIcon(
          panorama.category,
          selectedPlace?.id === panorama.id,
          panorama.featured || panorama.source === 'custom'
        )
      })),
    [panoramas, selectedPlace]
  );

  return (
    <section className="map-shell" aria-label="Interactive map of Santiago panoramas">
      <MapContainer center={SANTIAGO_CENTER} zoom={12} scrollWheelZoom className="map-view">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater userPosition={userPosition} selectedPlace={selectedPlace} />
        <AdminMapPicker onMapPick={onMapPick} />

        <MarkerClusterGroup chunkedLoading>
          {markers.map((panorama) => (
            <Marker
              key={panorama.id}
              position={[panorama.location.lat, panorama.location.lng]}
              icon={panorama.icon}
              eventHandlers={{
                click: () => onSelectPlace?.(panorama)
              }}
            >
              <Popup>
                <MarkerPopup panorama={panorama} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </section>
  );
}

export default MapView;
