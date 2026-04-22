function Filters({
  filters,
  categoryOptions,
  typeOptions,
  maxPrice,
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

      <label className="field">
        Max price: {filters.maxPrice === maxPrice ? 'No limit' : `$${filters.maxPrice.toLocaleString('es-CL')}`}
        <input
          type="range"
          min="0"
          max={maxPrice}
          step="1000"
          value={filters.maxPrice}
          onChange={(event) => onFilterChange('maxPrice', Number(event.target.value))}
        />
      </label>

      <button type="button" className="primary-button" onClick={onLocateMe} disabled={locating}>
        {locating ? 'Finding your location...' : 'Near me'}
      </button>
    </section>
  );
}

export default Filters;
