import { useI18n } from '../i18n/I18nProvider';
import { getEmbeddedVideoUrl } from '../services/videoService';

const DETAIL_PLACEHOLDER =
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80';

function DetailPanel({ panorama }) {
  const { t } = useI18n();

  if (!panorama) {
    return (
      <section className="panel-section detail-panel">
        <h2>{t('detailTitle')}</h2>
        <p className="detail-empty">{t('detailEmpty')}</p>
      </section>
    );
  }

  const mainImage = Array.isArray(panorama.images) && panorama.images.length > 0 ? panorama.images[0] : DETAIL_PLACEHOLDER;
  const embeddedVideoUrl = getEmbeddedVideoUrl(panorama.videoUrl);

  return (
    <section className="panel-section detail-panel">
      <div className="detail-image-wrap">
        <img src={mainImage} alt={panorama.name} className="detail-image" loading="lazy" />
        {panorama.featured ? <span className="featured-badge">{t('detailFeatured')}</span> : null}
      </div>

      <div className="section-headline">
        <h2>{panorama.name}</h2>
      </div>

      <p className="detail-description">{panorama.description || t('detailNoDescription')}</p>

      {embeddedVideoUrl ? (
        <div className="detail-video-wrap">
          <iframe
            className="detail-video"
            src={embeddedVideoUrl}
            title={t('detailVideoTitle', { name: panorama.name })}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : null}

      <ul className="detail-list">
        <li>
          <span>{t('detailCategory')}</span>
          <strong>{panorama.category}</strong>
        </li>
        {panorama.subcategory ? (
          <li>
            <span>{t('detailSubcategory')}</span>
            <strong>{panorama.subcategory}</strong>
          </li>
        ) : null}
        <li>
          <span>{t('detailPrice')}</span>
          <strong>{panorama.price === 0 ? t('detailFree') : `$${panorama.price.toLocaleString('es-CL')}`}</strong>
        </li>
        <li>
          <span>{t('detailCommune')}</span>
          <strong>{panorama.location.commune}</strong>
        </li>
        <li>
          <span>{t('detailType')}</span>
          <strong>{panorama.types.join(', ')}</strong>
        </li>
        {panorama.location.address ? (
          <li className="detail-list-stacked">
            <span>{t('detailAddress')}</span>
            <strong>{panorama.location.address}</strong>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

export default DetailPanel;
