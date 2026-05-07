import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import DetailPanel from './components/DetailPanel';
import Filters from './components/Filters';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { filterPanoramas, getOsmPanoramas, normalizeCustomPanorama } from './services/dataService';
import {
  createCustomPanorama,
  listCustomPanoramas,
  removeCustomPanorama,
  updateCustomPanorama
} from './services/firebaseService';

const DEFAULT_FILTERS = {
  category: 'all',
  type: 'all',
  nearMe: false,
  distanceKm: 5
};

function AppNav() {
  const location = useLocation();

  return (
    <div className="view-mode-switch" role="tablist" aria-label="View mode">
      <Link to="/" className={location.pathname === '/' ? 'mode-button is-active' : 'mode-button'}>
        Explore
      </Link>
      <Link to="/admin" className={location.pathname === '/admin' ? 'mode-button is-active' : 'mode-button'}>
        Admin
      </Link>
    </div>
  );
}

function App() {
  const [osmData, setOsmData] = useState([]);
  const [customData, setCustomData] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [adminNotice, setAdminNotice] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const loadPanoramas = async () => {
      const items = await getOsmPanoramas();
      setOsmData(items);
    };

    loadPanoramas();
  }, []);

  useEffect(() => {
    const loadCustomPanoramas = async () => {
      const docs = await listCustomPanoramas();
      setCustomData(docs.map((item, index) => normalizeCustomPanorama(item, index)).filter(Boolean));
    };

    loadCustomPanoramas();
  }, []);

  const mergedData = useMemo(() => [...osmData, ...customData], [osmData, customData]);

  const categoryOptions = useMemo(
    () => [...new Set(mergedData.map((item) => item.category))],
    [mergedData]
  );

  const typeOptions = useMemo(() => {
    const allTypes = mergedData.flatMap((item) => item.types || [item.type]);
    return [...new Set(allTypes)];
  }, [mergedData]);

  const filteredData = useMemo(() => filterPanoramas(mergedData, filters, userPosition), [mergedData, filters, userPosition]);

  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    const stillExists = mergedData.find((item) => item.id === selectedPlace.id);
    if (!stillExists) {
      setSelectedPlace(null);
    }
  }, [mergedData, selectedPlace]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition({ lat: coords.latitude, lng: coords.longitude });
        setFilters((current) => ({ ...current, nearMe: true }));
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000
      }
    );
  };

  const refreshCustomData = async () => {
    try {
      const docs = await listCustomPanoramas();
      setCustomData(docs.map((item, index) => normalizeCustomPanorama(item, index)).filter(Boolean));
      setAdminNotice('');
    } catch {
      setAdminNotice('No se pudo sincronizar customData desde Firestore.');
    }
  };

  const handleCreatePanorama = async (payload) => {
    try {
      await createCustomPanorama(payload);
      await refreshCustomData();
    } catch {
      setAdminNotice('No se pudo crear el panorama. Revisa la configuracion de Firebase.');
    }
  };

  const handleUpdatePanorama = async (panorama, payload) => {
    try {
      await updateCustomPanorama(panorama.firestoreId, payload);
      await refreshCustomData();
    } catch {
      setAdminNotice('No se pudo actualizar el panorama. Revisa la configuracion de Firebase.');
    }
  };

  const handleDeletePanorama = async (panoramaId) => {
    const panorama = customData.find((item) => item.id === panoramaId);

    if (!panorama?.firestoreId) {
      return;
    }

    try {
      await removeCustomPanorama(panorama.firestoreId);
      await refreshCustomData();
    } catch {
      setAdminNotice('No se pudo eliminar el panorama. Revisa la configuracion de Firebase.');
    }
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  const customOnlyData = useMemo(() => mergedData.filter((item) => item.source === 'custom'), [mergedData]);

  return (
    <div className="app-shell">
      <aside className="control-panel">
        <header className="app-header">
          <p>Santiago de Chile</p>
          <h1>Discover panoramas on a calm interactive map</h1>
        </header>

        <AppNav />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Filters
                  filters={filters}
                  categoryOptions={categoryOptions}
                  typeOptions={typeOptions}
                  onFilterChange={handleFilterChange}
                  onReset={handleReset}
                  onLocateMe={handleLocateMe}
                  locating={locating}
                />

                <Sidebar panoramas={filteredData} selectedId={selectedPlace?.id} onSelect={handleSelectPlace} />
              </>
            }
          />
          <Route
            path="/admin"
            element={
              <>
                <AdminPanel
                  panoramas={customOnlyData}
                  pickedLocation={pickedLocation}
                  selectedPlace={selectedPlace}
                  adminNotice={adminNotice}
                  onSelectPlace={handleSelectPlace}
                  onCreate={handleCreatePanorama}
                  onUpdate={handleUpdatePanorama}
                  onDelete={handleDeletePanorama}
                />
              </>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </aside>

      <main className="map-panel">
        <Routes>
          <Route
            path="/"
            element={
              <MapView
                panoramas={filteredData}
                userPosition={userPosition}
                selectedPlace={selectedPlace}
                onSelectPlace={handleSelectPlace}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <MapView
                panoramas={mergedData}
                userPosition={userPosition}
                selectedPlace={selectedPlace}
                onSelectPlace={handleSelectPlace}
                onMapPick={setPickedLocation}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <div className="map-detail-floating">
          <DetailPanel panorama={selectedPlace} />
        </div>
      </main>
    </div>
  );
}

export default App;
