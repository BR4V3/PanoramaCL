import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

function AdminPanoramaTable({ panoramas, selectedId, onSelect, onDelete, onClose }) {
  const { locale, t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    setSortBy((current) => {
      if (current === field) {
        setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
        return current;
      }

      setSortDirection('asc');
      return field;
    });
  };

  const resolveSortValue = (panorama, field) => {
    if (field === 'commune') {
      return panorama.location.commune;
    }

    if (field === 'hasImage') {
      return panorama.images?.length ? 1 : 0;
    }

    if (field === 'hasVideo') {
      return panorama.videoUrl ? 1 : 0;
    }

    return panorama[field] ?? '';
  };

  const sortItems = (items) => {
    return [...items].sort((left, right) => {
      const leftValue = resolveSortValue(left, sortBy);
      const rightValue = resolveSortValue(right, sortBy);

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return sortDirection === 'asc' ? leftValue - rightValue : rightValue - leftValue;
      }

      const comparisonWithLocale = String(leftValue).localeCompare(
        String(rightValue),
        locale === 'en' ? 'en-US' : 'es-CL',
        { sensitivity: 'base' }
      );

      return sortDirection === 'asc' ? comparisonWithLocale : -comparisonWithLocale;
    });
  };

  const getSortLabel = (field) => {
    if (sortBy !== field) {
      return t('adminTableSortable');
    }

    return sortDirection === 'asc' ? t('adminTableAsc') : t('adminTableDesc');
  };

  const getSortIndicator = (field) => {
    if (sortBy !== field) {
      return '↕';
    }

    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const selectPanorama = (panorama) => {
    onSelect?.(panorama);
  };

  const handleDeletePanorama = (panorama) => {
    const shouldDelete = window.confirm(t('adminTableDeleteConfirm', { name: panorama.name }));

    if (!shouldDelete) {
      return;
    }

    onDelete?.(panorama.id);
  };

  const categoryOptions = useMemo(
    () => [...new Set(panoramas.map((item) => item.category).filter(Boolean))],
    [panoramas]
  );

  const filteredPanoramas = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return panoramas.filter((panorama) => {
      const matchesCategory = categoryFilter === 'all' || panorama.category === categoryFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        panorama.name.toLowerCase().includes(normalizedSearch) ||
        panorama.location.commune.toLowerCase().includes(normalizedSearch) ||
        panorama.location.address.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, panoramas, searchTerm]);

  const sortedPanoramas = useMemo(
    () => sortItems(filteredPanoramas),
    [filteredPanoramas, sortBy, sortDirection]
  );

  return (
    <section className="admin-table-panel" aria-label={t('adminTableTitle')}>
      <div className="admin-table-header">
        <div>
          <h2>{t('adminTableTitle')}</h2>
          <p>{t('adminTableResults', { count: sortedPanoramas.length })}</p>
        </div>

        <button type="button" className="text-button" onClick={onClose}>
          {t('adminTableClose')}
        </button>
      </div>

      <div className="admin-table-filters">
        <label className="field">
          {t('adminTableSearch')}
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('adminTableSearchPlaceholder')}
          />
        </label>

        <label className="field">
          {t('adminTableCategory')}
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">{t('adminTableAll')}</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <button type="button" className="admin-table-sort" onClick={() => handleSort('name')}>
                  {t('adminTableName')} <span aria-hidden="true">{getSortIndicator('name')}</span>
                  <span className="sr-only">{t('adminTableOrder')} {getSortLabel('name')}</span>
                </button>
              </th>
              <th>
                <button type="button" className="admin-table-sort" onClick={() => handleSort('commune')}>
                  {t('adminTableCommune')} <span aria-hidden="true">{getSortIndicator('commune')}</span>
                  <span className="sr-only">{t('adminTableOrder')} {getSortLabel('commune')}</span>
                </button>
              </th>
              <th>
                <button type="button" className="admin-table-sort" onClick={() => handleSort('category')}>
                  {t('adminTableCategory')} <span aria-hidden="true">{getSortIndicator('category')}</span>
                  <span className="sr-only">{t('adminTableOrder')} {getSortLabel('category')}</span>
                </button>
              </th>
              <th>
                <button type="button" className="admin-table-sort" onClick={() => handleSort('hasImage')}>
                  {t('adminTableImage')} <span aria-hidden="true">{getSortIndicator('hasImage')}</span>
                  <span className="sr-only">{t('adminTableOrder')} {getSortLabel('hasImage')}</span>
                </button>
              </th>
              <th>
                <button type="button" className="admin-table-sort" onClick={() => handleSort('hasVideo')}>
                  {t('adminTableVideo')} <span aria-hidden="true">{getSortIndicator('hasVideo')}</span>
                  <span className="sr-only">{t('adminTableOrder')} {getSortLabel('hasVideo')}</span>
                </button>
              </th>
              <th>{t('adminTableActions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedPanoramas.length ? (
              sortedPanoramas.map((panorama) => (
                <tr
                  key={panorama.id}
                  className={selectedId === panorama.id ? 'is-selected' : ''}
                  onClick={() => selectPanorama(panorama)}
                >
                  <td>
                    <strong>{panorama.name}</strong>
                    <small>{panorama.location.address || t('adminTableNoAddress')}</small>
                  </td>
                  <td>{panorama.location.commune}</td>
                  <td>{panorama.category}</td>
                  <td>{panorama.images?.length ? t('yes') : t('no')}</td>
                  <td>{panorama.videoUrl ? t('yes') : t('no')}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        type="button"
                        className="text-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectPanorama(panorama);
                        }}
                      >
                        {t('adminTableEdit')}
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeletePanorama(panorama);
                        }}
                      >
                        {t('adminTableDelete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="admin-table-empty">
                  {t('adminTableNoResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminPanoramaTable;