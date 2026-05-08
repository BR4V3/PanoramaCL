import { getEmbeddedVideoUrl } from './videoService';

const CATEGORY_MAP = {
  park: 'aire_libre',
  museo: 'cultura',
  museum: 'cultura',
  attraction: 'entretenimiento',
  atraccion: 'entretenimiento',
  aire_libre: 'aire_libre',
  cultura: 'cultura',
  entretenimiento: 'entretenimiento'
};

const VALID_CATEGORIES = new Set(['aire_libre', 'cultura', 'entretenimiento']);
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80';

function normalizeCategory(rawCategory) {
  const key = String(rawCategory ?? '').trim().toLowerCase();
  return CATEGORY_MAP[key] ?? 'entretenimiento';
}

function toTypes(types, fallbackType) {
  const fromArray = Array.isArray(types) ? types : [];
  const normalized = fromArray.filter(Boolean).map((item) => String(item).trim().toLowerCase());

  if (normalized.length > 0) {
    return Array.from(new Set(normalized));
  }

  return [String(fallbackType ?? 'solo').trim().toLowerCase() || 'solo'];
}

function sanitizeImages(images, fallbackImage) {
  const fromImages = Array.isArray(images) ? images : [];
  const fromLegacy = typeof fallbackImage === 'string' && fallbackImage.trim().length > 0 ? [fallbackImage] : [];
  const merged = [...fromImages, ...fromLegacy]
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());

  return merged.length > 0 ? Array.from(new Set(merged)) : [PLACEHOLDER_IMAGE];
}

function sanitizeVideoUrl(videoUrl) {
  if (typeof videoUrl !== 'string') {
    return '';
  }

  return getEmbeddedVideoUrl(videoUrl) ? videoUrl.trim() : '';
}

function hasValidCoordinates(location) {
  return Number.isFinite(location.lat) && Number.isFinite(location.lng);
}

function isValidPanorama(panorama) {
  return Boolean(
    panorama.name &&
      panorama.name !== 'Sin nombre' &&
      VALID_CATEGORIES.has(panorama.category) &&
      hasValidCoordinates(panorama.location)
  );
}

function normalizeOsmPanorama(item) {
  const types = toTypes(item.tipo, 'solo');
  const category = normalizeCategory(item.categoria);

  return {
    id: String(item.id),
    name: String(item.nombre ?? '').trim() || 'Sin nombre',
    description: item.descripcion ?? '',
    category,
    subcategory: item.subcategoria ?? 'atraccion',
    types,
    type: types[0],
    price: Number(item.precio?.valor ?? 0),
    source: 'osm',
    featured: false,
    tags: Array.isArray(item.tags) ? item.tags : [],
    images: sanitizeImages(item.imagenes, item.imagen),
    videoUrl: '',
    location: {
      address: item.ubicacion?.direccion ?? '',
      commune: item.ubicacion?.comuna ?? 'Santiago',
      region: item.ubicacion?.region ?? 'RM',
      lat: Number(item.ubicacion?.lat),
      lng: Number(item.ubicacion?.lng)
    }
  };
}

export function normalizeCustomPanorama(item, index = 0) {
  const types = toTypes(item.types, item.type);
  const category = normalizeCategory(item.category);

  return {
    id: `custom-${item.firestoreId ?? item.id ?? index}`,
    firestoreId: item.firestoreId,
    name: String(item.name ?? '').trim() || 'Sin nombre',
    description: item.description ?? '',
    category,
    subcategory: item.subcategory ?? 'recomendado',
    types,
    type: types[0],
    price: Number(item.price ?? 0),
    source: 'custom',
    featured: true,
    tags: Array.isArray(item.tags) ? item.tags : ['featured'],
    images: sanitizeImages(item.images, item.image),
    videoUrl: sanitizeVideoUrl(item.videoUrl),
    location: {
      address: item.location?.address ?? '',
      commune: item.location?.commune ?? 'Santiago',
      region: item.location?.region ?? 'RM',
      lat: Number(item.location?.lat),
      lng: Number(item.location?.lng)
    }
  };
}

export async function getOsmPanoramas() {
  const response = await fetch('/data.json');

  if (!response.ok) {
    throw new Error(`Could not load data.json: ${response.status}`);
  }

  const rawPanoramas = await response.json();
  const dedupe = new Set();

  return rawPanoramas
    .map(normalizeOsmPanorama)
    .filter((item) => {
      if (!isValidPanorama(item)) {
        return false;
      }

      const key = `${item.name.toLowerCase()}|${item.location.lat.toFixed(5)}|${item.location.lng.toFixed(5)}`;

      if (dedupe.has(key)) {
        return false;
      }

      dedupe.add(key);
      return true;
    });
}

export function haversineDistanceInKm(from, to) {
  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function filterPanoramas(panoramas, filters, userPosition) {
  return panoramas.filter((item) => {
    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesType = filters.type === 'all' || item.types.includes(filters.type);

    const matchesDistance =
      !filters.nearMe ||
      !userPosition ||
      haversineDistanceInKm(userPosition, item.location) <= Number(filters.distanceKm);

    return matchesCategory && matchesType && matchesDistance;
  });
}
