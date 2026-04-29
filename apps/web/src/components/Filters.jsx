function Filters({
  filters,
  categoryOptions,
  typeOptions,
  onFilterChange,
  onReset,
  onLocateMe,
  locating
}) {
  return (
    <section className="panel-section">
      <div className="section-headline">
        <h2>Filters</h2>
        <button type="button" className="text-button" onClick={onReset}>
          Clear
        </button>
      </div>

      <label className="field">
        Category
        <select
          value={filters.category}
          onChange={(event) => onFilterChange('category', event.target.value)}
        >
          <option value="all">All categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Type
        <select value={filters.type} onChange={(event) => onFilterChange('type', event.target.value)}>
          <option value="all">Any type</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="field field-inline">
        <input
          type="checkbox"
          checked={filters.nearMe}
          onChange={(event) => onFilterChange('nearMe', event.target.checked)}
        />
        Enable near me radius
      </label>

      <label className="field">
        Distance radius: {filters.distanceKm} km
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          value={filters.distanceKm}
          onChange={(event) => onFilterChange('distanceKm', Number(event.target.value))}
          disabled={!filters.nearMe}
        />
      </label>

      <button type="button" className="primary-button" onClick={onLocateMe} disabled={locating}>
        {locating ? 'Finding your location...' : 'Near me'}
      </button>
    </section>
  );
}

export default Filters;
