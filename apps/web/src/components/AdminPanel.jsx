import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getEmbeddedVideoUrl } from '../services/videoService';

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'entretenimiento',
  subcategory: 'atraccion',
  typeSolo: true,
  typePareja: true,
  typeFamilia: true,
  typeAmigos: false,
  address: '',
  commune: 'Santiago',
  lat: '',
  lng: '',
  images: '',
  videoUrl: ''
};

function buildTypes(form) {
  const selected = [];

  if (form.typeSolo) {
    selected.push('solo');
  }

  if (form.typePareja) {
    selected.push('pareja');
  }

  if (form.typeFamilia) {
    selected.push('familia');
  }

  if (form.typeAmigos) {
    selected.push('amigos');
  }

  return selected.length ? selected : ['solo'];
}

function toImageString(images) {
  if (!Array.isArray(images)) {
    return '';
  }

  return images.join(', ');
}

function fromImageString(value) {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formFromPanorama(panorama) {
  const types = new Set(panorama.types || []);

  return {
    name: panorama.name || '',
    description: panorama.description || '',
    category: panorama.category || 'entretenimiento',
    subcategory: panorama.subcategory || 'atraccion',
    typeSolo: types.has('solo'),
    typePareja: types.has('pareja'),
    typeFamilia: types.has('familia'),
    typeAmigos: types.has('amigos'),
    address: panorama.location?.address || '',
    commune: panorama.location?.commune || 'Santiago',
    lat: panorama.location?.lat || '',
    lng: panorama.location?.lng || '',
    images: toImageString(panorama.images),
    videoUrl: panorama.videoUrl || ''
  };
}

function AdminPanel({ panoramas, selectedPlace, adminNotice, onSelectPlace, onCreate, onUpdate, onDelete }) {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const selectedPanorama = useMemo(
    () => panoramas.find((item) => item.id === selectedId) ?? null,
    [panoramas, selectedId]
  );
  const embeddedVideoUrl = useMemo(() => getEmbeddedVideoUrl(form.videoUrl), [form.videoUrl]);
  const hasInvalidVideoUrl = form.videoUrl.trim().length > 0 && !embeddedVideoUrl;

  const handleInput = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleToggleType = (key) => {
    setForm((current) => ({ ...current, [key]: !current[key] }));
  };

  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    const matchingPanorama = panoramas.find((item) => item.id === selectedPlace.id);

    if (!matchingPanorama) {
      return;
    }

    setSelectedId(matchingPanorama.id);
    setForm(formFromPanorama(matchingPanorama));
  }, [panoramas, selectedPlace]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const stillExists = panoramas.some((item) => item.id === selectedId);

    if (!stillExists) {
      setSelectedId(null);
      setForm(EMPTY_FORM);
    }
  }, [panoramas, selectedId]);

  const resetForm = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim() || t('unnamedPanorama'),
      description: form.description.trim(),
      category: form.category,
      subcategory: form.subcategory.trim() || 'atraccion',
      types: buildTypes(form),
      type: buildTypes(form)[0],
      price: 0,
      source: 'admin',
      tags: ['admin'],
      featured: true,
      images: fromImageString(form.images),
      videoUrl: form.videoUrl.trim(),
      location: {
        address: form.address.trim(),
        commune: form.commune.trim() || 'Santiago',
        region: 'RM',
        lat: Number(form.lat),
        lng: Number(form.lng)
      }
    };

    return payload;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasInvalidVideoUrl) {
      return;
    }

    const payload = buildPayload();

    if (!Number.isFinite(payload.location.lat) || !Number.isFinite(payload.location.lng)) {
      return;
    }

    if (selectedPanorama) {
      onUpdate(selectedPanorama, payload);
    } else {
      onCreate(payload);
    }

    resetForm();
  };

  const handleDelete = () => {
    if (!selectedPanorama) {
      return;
    }

    onDelete(selectedPanorama.id);
    resetForm();
  };

  return (
    <section className="panel-section panel-admin">
      <div className="section-headline">
        <h2>{t('adminPanelTitle')}</h2>
        <span className="pill">{panoramas.length}</span>
      </div>

      {adminNotice ? <p className="admin-notice">{adminNotice}</p> : null}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="field">
          {t('adminName')}
          <input
            type="text"
            value={form.name}
            onChange={(event) => handleInput('name', event.target.value)}
            placeholder={t('adminNamePlaceholder')}
          />
        </label>

        <label className="field">
          {t('adminDescription')}
          <textarea
            value={form.description}
            onChange={(event) => handleInput('description', event.target.value)}
            rows="2"
          />
        </label>

        <div className="admin-grid">
          <label className="field">
            {t('adminCategory')}
            <select value={form.category} onChange={(event) => handleInput('category', event.target.value)}>
              <option value="aire_libre">aire_libre</option>
              <option value="cultura">cultura</option>
              <option value="entretenimiento">entretenimiento</option>
            </select>
          </label>

          <label className="field">
            {t('adminSubcategory')}
            <input
              type="text"
              value={form.subcategory}
              onChange={(event) => handleInput('subcategory', event.target.value)}
            />
          </label>
        </div>

        <div className="type-group">
          <label>
            <input
              type="checkbox"
              checked={form.typeSolo}
              onChange={() => handleToggleType('typeSolo')}
            />
            {t('adminTypeSolo')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.typePareja}
              onChange={() => handleToggleType('typePareja')}
            />
            {t('adminTypePareja')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.typeFamilia}
              onChange={() => handleToggleType('typeFamilia')}
            />
            {t('adminTypeFamilia')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.typeAmigos}
              onChange={() => handleToggleType('typeAmigos')}
            />
            {t('adminTypeAmigos')}
          </label>
        </div>

        <label className="field">
          {t('adminCommune')}
          <input
            type="text"
            value={form.commune}
            onChange={(event) => handleInput('commune', event.target.value)}
          />
        </label>

        <label className="field">
          {t('adminAddress')}
          <input
            type="text"
            value={form.address}
            onChange={(event) => handleInput('address', event.target.value)}
          />
        </label>


        <div className="admin-grid">
          <label className="field">
            {t('adminLatitude')}
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(event) => handleInput('lat', event.target.value)}
            />
          </label>

          <label className="field">
            {t('adminLongitude')}
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={(event) => handleInput('lng', event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          {t('adminImages')}
          <input
            type="text"
            value={form.images}
            onChange={(event) => handleInput('images', event.target.value)}
            placeholder={t('adminImagesPlaceholder')}
          />
        </label>

        <label className="field">
          {t('adminVideoUrl')}
          <input
            type="url"
            value={form.videoUrl}
            onChange={(event) => handleInput('videoUrl', event.target.value)}
            placeholder={t('adminVideoPlaceholder')}
          />
        </label>

        {hasInvalidVideoUrl ? <p className="field-feedback field-feedback-error">{t('adminVideoInvalid')}</p> : null}

        {embeddedVideoUrl ? (
          <div className="admin-video-preview">
            <p className="field-feedback">{t('adminVideoPreview')}</p>
            <iframe
              className="detail-video"
              src={embeddedVideoUrl}
              title={t('adminVideoPreview')}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : null}

        <div className="admin-actions">
          <button type="submit" className="primary-button">{selectedPanorama ? t('adminUpdate') : t('adminCreate')}</button>
          <button type="button" className="text-button" onClick={resetForm}>{t('adminClear')}</button>
          <button type="button" className="danger-button" onClick={handleDelete} disabled={!selectedPanorama}>
            {t('adminDelete')}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminPanel;
