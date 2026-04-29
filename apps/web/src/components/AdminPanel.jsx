import { useMemo, useState } from 'react';

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'entretenimiento',
  subcategory: 'atraccion',
  typeSolo: true,
  typePareja: true,
  typeFamilia: true,
  typeAmigos: false,
  price: 0,
  address: '',
  commune: 'Santiago',
  lat: '',
  lng: '',
  images: ''
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
    price: panorama.price || 0,
    address: panorama.location?.address || '',
    commune: panorama.location?.commune || 'Santiago',
    lat: panorama.location?.lat || '',
    lng: panorama.location?.lng || '',
    images: toImageString(panorama.images)
  };
}

function AdminPanel({ panoramas, pickedLocation, selectedPlace, adminNotice, onSelectPlace, onCreate, onUpdate, onDelete }) {
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const selectedPanorama = useMemo(
    () => panoramas.find((item) => item.id === selectedId) ?? null,
    [panoramas, selectedId]
  );

  const handleInput = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleToggleType = (key) => {
    setForm((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSelectPanorama = (panorama) => {
    setSelectedId(panorama.id);
    setForm(formFromPanorama(panorama));
    onSelectPlace?.(panorama);
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim() || 'Sin nombre',
      description: form.description.trim(),
      category: form.category,
      subcategory: form.subcategory.trim() || 'atraccion',
      types: buildTypes(form),
      type: buildTypes(form)[0],
      price: Number(form.price) || 0,
      source: 'admin',
      tags: ['admin'],
      featured: true,
      images: fromImageString(form.images),
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

  const applyPickedLocation = () => {
    if (!pickedLocation) {
      return;
    }

    setForm((current) => ({
      ...current,
      lat: pickedLocation.lat,
      lng: pickedLocation.lng
    }));
  };

  return (
    <section className="panel-section panel-admin">
      <div className="section-headline">
        <h2>Admin panel</h2>
        <span className="pill">{panoramas.length}</span>
      </div>

      {adminNotice ? <p className="admin-notice">{adminNotice}</p> : null}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="field">
          Name
          <input
            type="text"
            value={form.name}
            onChange={(event) => handleInput('name', event.target.value)}
            placeholder="Panorama name"
          />
        </label>

        <label className="field">
          Description
          <textarea
            value={form.description}
            onChange={(event) => handleInput('description', event.target.value)}
            rows="2"
          />
        </label>

        <div className="admin-grid">
          <label className="field">
            Category
            <select value={form.category} onChange={(event) => handleInput('category', event.target.value)}>
              <option value="aire_libre">aire_libre</option>
              <option value="cultura">cultura</option>
              <option value="entretenimiento">entretenimiento</option>
            </select>
          </label>

          <label className="field">
            Subcategory
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
            solo
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.typePareja}
              onChange={() => handleToggleType('typePareja')}
            />
            pareja
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.typeFamilia}
              onChange={() => handleToggleType('typeFamilia')}
            />
            familia
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.typeAmigos}
              onChange={() => handleToggleType('typeAmigos')}
            />
            amigos
          </label>
        </div>

        <div className="admin-grid">
          <label className="field">
            Price CLP
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) => handleInput('price', event.target.value)}
            />
          </label>

          <label className="field">
            Commune
            <input
              type="text"
              value={form.commune}
              onChange={(event) => handleInput('commune', event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          Address
          <input
            type="text"
            value={form.address}
            onChange={(event) => handleInput('address', event.target.value)}
          />
        </label>

        <div className="admin-grid">
          <label className="field">
            Latitude
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(event) => handleInput('lat', event.target.value)}
            />
          </label>

          <label className="field">
            Longitude
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={(event) => handleInput('lng', event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          Images URLs (comma separated)
          <input
            type="text"
            value={form.images}
            onChange={(event) => handleInput('images', event.target.value)}
            placeholder="https://..., https://..."
          />
        </label>

        <button type="button" className="text-button" onClick={applyPickedLocation} disabled={!pickedLocation}>
          Use point selected on map
        </button>

        <div className="admin-actions">
          <button type="submit" className="primary-button">{selectedPanorama ? 'Update' : 'Create'}</button>
          <button type="button" className="text-button" onClick={resetForm}>Clear</button>
          <button type="button" className="danger-button" onClick={handleDelete} disabled={!selectedPanorama}>
            Delete
          </button>
        </div>
      </form>

      <ul className="admin-list">
        {panoramas.map((panorama) => (
          <li key={panorama.id}>
            <button
              type="button"
              onClick={() => handleSelectPanorama(panorama)}
              className={selectedPlace?.id === panorama.id ? 'is-selected' : ''}
            >
              <strong>{panorama.name}</strong>
              <small>{panorama.location.commune} · {panorama.category}</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminPanel;
