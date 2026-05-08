import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmbeddedVideoUrl } from '../services/videoService';

function Sidebar({ panoramas, selectedId, onSelect }) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPanoramas = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return panoramas;
    }

    return panoramas.filter((panorama) => {
      const types = (panorama.types || [panorama.type]).join(' ').toLowerCase();
      return (
        panorama.name.toLowerCase().includes(normalizedSearch) ||
        panorama.location.commune.toLowerCase().includes(normalizedSearch) ||
        panorama.category.toLowerCase().includes(normalizedSearch) ||
        types.includes(normalizedSearch)
      );
    });
  }, [panoramas, searchTerm]);

  return (
    <section className="panel-section results-panel">
      <div className="section-headline">
        <h2>{t('resultsTitle')}</h2>
        <span className="pill">{filteredPanoramas.length}</span>
      </div>

      <label className="field results-search-field">
        {t('resultsSearch')}
        <input
          type="text"
          className="results-search-input"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t('resultsSearchPlaceholder')}
        />
      </label>

      <ul className="results-list">
        {filteredPanoramas.length ? (
          filteredPanoramas.map((panorama) => {
            const embeddedVideoUrl = getEmbeddedVideoUrl(panorama.videoUrl);

            return (
              <li
                key={panorama.id}
                className={[
                  selectedId === panorama.id ? 'is-selected' : '',
                  panorama.source === 'custom' ? 'is-custom' : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(panorama)}
              >
                <div className="result-card-media">
                  <img
                    src={panorama.images?.[0]}
                    alt={panorama.name}
                    className="result-card-image"
                    loading="lazy"
                  />
                  {embeddedVideoUrl ? (
                    <iframe
                      className="result-card-video"
                      src={embeddedVideoUrl}
                      title={t('detailVideoTitle', { name: panorama.name })}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : null}
                </div>
                <h3>{panorama.name}</h3>
                <p>{panorama.location.commune}</p>
                <small>
                  {panorama.price === 0 ? t('detailFree') : `$${panorama.price.toLocaleString('es-CL')}`} · {(panorama.types || [panorama.type]).join(', ')}
                </small>
                {panorama.featured ? <small className="featured-text">{t('resultsFeatured')}</small> : null}
              </li>
            );
          })
        ) : (
          <li className="results-empty">{t('resultsEmpty')}</li>
        )}
      </ul>
    </section>
  );
}

export default Sidebar;
