import { useMemo, useState } from 'react';
import Filters from './components/Filters';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import panoramasData from './data/data.json';

const DEFAULT_FILTERS = {
  category: 'all',
  type: 'all',
  maxPrice: Infinity
};

function App() {
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    maxPrice: Math.max(...panoramasData.map((item) => item.price))
  });
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(false);

  const maxDatasetPrice = useMemo(
    () => Math.max(...panoramasData.map((item) => item.price)),
    []
  );

  const categoryOptions = useMemo(
    () => [...new Set(panoramasData.map((item) => item.category))],
    []
  );

  const typeOptions = useMemo(() => [...new Set(panoramasData.map((item) => item.type))], []);

  const filteredPanoramas = useMemo(() => {
    return panoramasData.filter((item) => {
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesType = filters.type === 'all' || item.type === filters.type;
      const matchesPrice = item.price <= filters.maxPrice;

      return matchesCategory && matchesType && matchesPrice;
    });
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      maxPrice: maxDatasetPrice
    });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition({ lat: coords.latitude, lng: coords.longitude });
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

  return (
    <div className="app-shell">
      <aside className="control-panel">
        <header className="app-header">
          <p>Santiago de Chile</p>
          <h1>Discover panoramas on a calm interactive map</h1>
        </header>

        <Filters
          filters={filters}
          categoryOptions={categoryOptions}
          typeOptions={typeOptions}
          maxPrice={maxDatasetPrice}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onLocateMe={handleLocateMe}
          locating={locating}
        />

        <Sidebar panoramas={filteredPanoramas} />
      </aside>

      <main className="map-panel">
        <MapView panoramas={filteredPanoramas} userPosition={userPosition} />
      </main>
    </div>
  );
}

export default App;
