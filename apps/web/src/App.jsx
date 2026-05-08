import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import AdminPanoramaTable from './components/AdminPanoramaTable';
import DetailPanel from './components/DetailPanel';
import Filters from './components/Filters';
import LoginPanel from './components/LoginPanel';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { useI18n } from './i18n/I18nProvider';
import { filterPanoramas, getOsmPanoramas, normalizeCustomPanorama } from './services/dataService';
import {
  createCustomPanorama,
  listCustomPanoramas,
  observeAuthState,
  removeCustomPanorama,
  signInAdmin,
  signOutAdmin,
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
  const { t } = useI18n();
  const isAdminRoute = location.pathname === '/admin';
  const isExploreActive = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="view-mode-switch" role="tablist" aria-label="View mode">
      <Link to="/" className={isExploreActive ? 'mode-button is-active' : 'mode-button'}>
        {isAdminRoute ? (
          <>
            <span className="mode-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" aria-label="Back">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            {t('navBack')}
          </>
        ) : (
          t('navExplore')
        )}
      </Link>
    </div>
  );
}

function App() {
  const location = useLocation();
  const { locale, t, toggleLocale } = useI18n();
  const [osmData, setOsmData] = useState([]);
  const [customData, setCustomData] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [adminNotice, setAdminNotice] = useState('');
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [isAdminTableOpen, setIsAdminTableOpen] = useState(false);

  useEffect(() => {
    const loadPanoramas = async () => {
      const items = await getOsmPanoramas();
      setOsmData(items);
    };

    loadPanoramas();
  }, []);

  useEffect(() => {
    const loadCustomPanoramas = async () => {
      try {
        const docs = await listCustomPanoramas();
        setCustomData(docs.map((item, index) => normalizeCustomPanorama(item, index)).filter(Boolean));
      } catch {
        setCustomData([]);
      }
    };

    loadCustomPanoramas();
  }, []);

  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      setAuthUser(user);
      setAuthLoading(false);
      setAuthError('');
    });

    return unsubscribe;
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

  useEffect(() => {
    if (location.pathname !== '/admin') {
      setIsAdminTableOpen(false);
    }
  }, [location.pathname]);

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
      setAdminNotice(t('adminSyncError'));
    }
  };

  const handleCreatePanorama = async (payload) => {
    try {
      await createCustomPanorama(payload);
      await refreshCustomData();
    } catch {
      setAdminNotice(t('adminCreateError'));
    }
  };

  const handleUpdatePanorama = async (panorama, payload) => {
    try {
      await updateCustomPanorama(panorama.firestoreId, payload);
      await refreshCustomData();
    } catch {
      setAdminNotice(t('adminUpdateError'));
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
      setAdminNotice(t('adminDeleteError'));
    }
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  const handleSelectFromAdminTable = (place) => {
    setSelectedPlace(place);

    if (window.matchMedia('(max-width: 950px)').matches) {
      setIsAdminTableOpen(false);
    }
  };

  const handleLogin = async (email, password) => {
    setAuthSubmitting(true);
    setAuthError('');

    try {
      await signInAdmin(email, password);
    } catch {
      setAuthError(t('authLoginError'));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
    } catch {
      setAuthError(t('authLogoutError'));
    }
  };

  const customOnlyData = useMemo(() => mergedData.filter((item) => item.source === 'custom'), [mergedData]);
  const accountLink = authUser ? '/admin' : '/login';
  const accountLabel = authUser ? t('accountAdminPanel') : t('accountAccess');
  const nextLocaleLabel = locale === 'es' ? 'English' : 'Espanol';
  const languageFlag = locale === 'es' ? '🇪🇸' : '🇬🇧';

  return (
    <div className="app-shell">
      <button
        type="button"
        className="language-bubble"
        onClick={toggleLocale}
        aria-label={nextLocaleLabel}
        title={nextLocaleLabel}
      >
        {languageFlag}
      </button>

      <Link to={accountLink} className="account-bubble" aria-label={accountLabel}>
        <span className="account-bubble-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" aria-label="User">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0 1 16 0" />
          </svg>
        </span>
      </Link>

      <footer className="app-version" aria-label="App version">
        v{import.meta.env.VITE_APP_VERSION || '0.1.0'}
      </footer>

      <aside className="control-panel">
        <header className="app-header">
          <p>{t('appCity')}</p>
          <h1>{t('appTitle')}</h1>
        </header>

        {authUser ? <AppNav /> : null}

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
            path="/login"
            element={
              <LoginPanel
                authUser={authUser}
                isSubmitting={authSubmitting}
                errorMessage={authError}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/admin"
            element={
              authLoading ? (
                <section className="panel-section login-panel">
                  <h2>{t('authCheckingSession')}</h2>
                </section>
              ) : authUser ? (
                <>
                  <AdminPanel
                    panoramas={customOnlyData}
                    selectedPlace={selectedPlace}
                    adminNotice={adminNotice}
                    onSelectPlace={handleSelectPlace}
                    onCreate={handleCreatePanorama}
                    onUpdate={handleUpdatePanorama}
                    onDelete={handleDeletePanorama}
                  />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </aside>

      <main className="map-panel">
        {location.pathname === '/admin' && authUser ? (
          <>
            <button
              type="button"
              className="admin-map-bubble"
              aria-label={t('adminBubbleLabel')}
              onClick={() => setIsAdminTableOpen((current) => !current)}
            >
              <span className="admin-map-bubble-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" aria-label={t('adminTableIconLabel')}>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                  <path d="M9 4v16" />
                </svg>
              </span>
            </button>

            {isAdminTableOpen ? (
              <div className="admin-table-floating">
                <AdminPanoramaTable
                  panoramas={customOnlyData}
                  selectedId={selectedPlace?.id}
                  onSelect={handleSelectFromAdminTable}
                  onDelete={handleDeletePanorama}
                  onClose={() => setIsAdminTableOpen(false)}
                />
              </div>
            ) : null}
          </>
        ) : null}

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
            path="/login"
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
              authLoading ? (
                <MapView
                  panoramas={filteredData}
                  userPosition={userPosition}
                  selectedPlace={selectedPlace}
                  onSelectPlace={handleSelectPlace}
                />
              ) : authUser ? (
                <MapView
                  panoramas={mergedData}
                  userPosition={userPosition}
                  selectedPlace={selectedPlace}
                  onSelectPlace={handleSelectPlace}

                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {location.pathname !== '/admin' ? (
          <div className="map-detail-floating">
            <DetailPanel panorama={selectedPlace} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
