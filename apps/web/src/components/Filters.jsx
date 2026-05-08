import { useI18n } from '../i18n/I18nProvider';

function Filters({
  filters,
  categoryOptions,
  typeOptions,
  onFilterChange,
  onReset,
  onLocateMe,
  locating
}) {
  const { t } = useI18n();

  return (
    <section className="panel-section filters-panel">
      <div className="section-headline">
        <h2>{t('filtersTitle')}</h2>
        <button type="button" className="text-button" onClick={onReset}>
          {t('filtersClear')}
        </button>
      </div>

      <label className="field">
        {t('filtersCategory')}
        <select
          value={filters.category}
          onChange={(event) => onFilterChange('category', event.target.value)}
        >
          <option value="all">{t('filtersAllCategories')}</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        {t('filtersType')}
        <select value={filters.type} onChange={(event) => onFilterChange('type', event.target.value)}>
          <option value="all">{t('filtersAnyType')}</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="field field-inline near-me-toggle">
        <input
          className="near-me-checkbox"
          type="checkbox"
          checked={filters.nearMe}
          onChange={(event) => onFilterChange('nearMe', event.target.checked)}
        />
        <span>{t('filtersEnableNearMe')}</span>
      </label>

      <label className="field">
        {t('filtersDistanceRadius', { km: filters.distanceKm })}
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
        {locating ? t('filtersFindingLocation') : t('filtersNearMe')}
      </button>
    </section>
  );
}

export default Filters;
