import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useI18n } from '../i18n/I18nProvider';

const SANTIAGO_CENTER = [-33.4489, -70.6693];
const CATEGORY_COLORS = {
  aire_libre: '#5b8a72',
  cultura: '#7e8194',
  entretenimiento: '#b28767',
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

function SelectedPlaceFocus({ selectedPlace }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    map.flyTo([selectedPlace.location.lat, selectedPlace.location.lng], 18, {
      duration: 0.9
    });
  }, [map, selectedPlace]);

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

function createUserLocationIcon() {
  return L.divIcon({
    className: 'user-location-wrapper',
    html: '<span class="user-location-dot"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function MapView({ panoramas, userPosition, selectedPlace, onSelectPlace }) {
  const { t } = useI18n();
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);
  const selectedId = selectedPlace?.id ?? null;

  const selectedMarker = useMemo(() => {
    if (!selectedId) {
      return null;
    }

    const selectedFromList = panoramas.find((item) => item.id === selectedId);
    if (!selectedFromList) {
      return null;
    }

    return {
      ...selectedFromList,
      icon: createCategoryIcon(
        selectedFromList.category,
        true,
        selectedFromList.featured || selectedFromList.source === 'custom'
      )
    };
  }, [panoramas, selectedId]);

  const clusterMarkers = useMemo(
    () =>
      panoramas
        .filter((panorama) => panorama.id !== selectedId)
        .map((panorama) => ({
          ...panorama,
          icon: createCategoryIcon(
            panorama.category,
            false,
            panorama.featured || panorama.source === 'custom'
          )
        })),
    [panoramas, selectedId]
  );

  return (
    <section className="map-shell" aria-label={t('mapAriaLabel')}>
      <MapContainer center={SANTIAGO_CENTER} zoom={12} scrollWheelZoom className="map-view">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater userPosition={userPosition} />
        <SelectedPlaceFocus selectedPlace={selectedPlace} />


        {userPosition ? (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userLocationIcon}>
            <Popup>{t('mapUserLocation')}</Popup>
          </Marker>
        ) : null}

        {selectedMarker ? (
          <Marker
            key={`selected-${selectedMarker.id}`}
            position={[selectedMarker.location.lat, selectedMarker.location.lng]}
            icon={selectedMarker.icon}
            zIndexOffset={1000}
            eventHandlers={{
              click: () => onSelectPlace?.(selectedMarker)
            }}
          />
        ) : null}

        <MarkerClusterGroup chunkedLoading>
          {clusterMarkers.map((panorama) => (
            <Marker
              key={panorama.id}
              position={[panorama.location.lat, panorama.location.lng]}
              icon={panorama.icon}
              eventHandlers={{
                click: () => onSelectPlace?.(panorama)
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </section>
  );
}

export default MapView;
