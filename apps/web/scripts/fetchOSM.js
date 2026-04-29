import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter'
];
const BBOX = {
  south: -33.6,
  west: -70.8,
  north: -33.3,
  east: -70.5
};

const CATEGORY_CONFIG = [
  {
    tagKey: 'leisure',
    tagValue: 'park',
    categoria: 'aire_libre',
    subcategoria: 'parque'
  },
  {
    tagKey: 'tourism',
    tagValue: 'museum',
    categoria: 'cultura',
    subcategoria: 'museo'
  },
  {
    tagKey: 'tourism',
    tagValue: 'attraction',
    categoria: 'entretenimiento',
    subcategoria: 'atraccion'
  }
];

const FILTER_UNNAMED = true;

function buildOverpassQuery() {
  const { south, west, north, east } = BBOX;
  const bboxText = `${south},${west},${north},${east}`;

  const categoryLines = CATEGORY_CONFIG.map(
    (entry) => `nwr["${entry.tagKey}"="${entry.tagValue}"](${bboxText});`
  ).join('\n      ');

  return `
[out:json][timeout:25];
(
  ${categoryLines}
);
out center;
`.trim();
}

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getCoordinates(element) {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lng: element.lon };
  }

  if (typeof element.center?.lat === 'number' && typeof element.center?.lon === 'number') {
    return { lat: element.center.lat, lng: element.center.lon };
  }

  return null;
}

function getDescription(tags = {}) {
  return (
    normalizeText(tags.description) ||
    normalizeText(tags['description:es']) ||
    normalizeText(tags.short_description) ||
    normalizeText(tags.wikipedia)
  );
}

function getCommune(tags = {}) {
  return (
    normalizeText(tags['addr:suburb']) ||
    normalizeText(tags['addr:district']) ||
    normalizeText(tags['addr:city']) ||
    normalizeText(tags.is_in) ||
    'Santiago'
  );
}

function getAddress(tags = {}) {
  const street = normalizeText(tags['addr:street']);
  const houseNumber = normalizeText(tags['addr:housenumber']);

  if (street && houseNumber) {
    return `${street} ${houseNumber}`;
  }

  return street || normalizeText(tags.address);
}

function getCategoria(tags = {}) {
  for (const config of CATEGORY_CONFIG) {
    if (tags[config.tagKey] === config.tagValue) {
      return config;
    }
  }

  return {
    categoria: 'entretenimiento',
    subcategoria: 'atraccion'
  };
}

function transformElements(elements = []) {
  const transformed = [];
  const dedupe = new Set();
  let idCounter = 1;

  for (const element of elements) {
    if (!element || typeof element !== 'object') {
      continue;
    }

    const coordinates = getCoordinates(element);

    if (!coordinates) {
      continue;
    }

    const tags = element.tags ?? {};
    const nombre = normalizeText(tags.name) || 'Sin nombre';

    if (FILTER_UNNAMED && nombre === 'Sin nombre') {
      continue;
    }

    const dedupeKey = `${nombre.toLowerCase()}|${coordinates.lat.toFixed(5)}|${coordinates.lng.toFixed(5)}`;

    if (dedupe.has(dedupeKey)) {
      continue;
    }

    dedupe.add(dedupeKey);

    const categoriaInfo = getCategoria(tags);

    transformed.push({
      id: idCounter++,
      nombre,
      descripcion: getDescription(tags),
      categoria: categoriaInfo.categoria,
      subcategoria: categoriaInfo.subcategoria,
      tipo: ['solo', 'pareja', 'familia'],
      precio: {
        tipo: 'gratis',
        valor: 0,
        moneda: 'CLP'
      },
      ubicacion: {
        direccion: getAddress(tags),
        comuna: getCommune(tags),
        region: 'RM',
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      tags: Object.keys(tags),
      fuente: 'openstreetmap'
    });
  }

  return transformed;
}

async function fetchFromOverpass(query) {
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'PanoramaCL/1.0 (https://github.com/panoramacl)'
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) {
        lastError = new Error(`Overpass request failed with status ${response.status} on ${endpoint}`);
        continue;
      }

      const payload = await response.json();

      if (!payload || !Array.isArray(payload.elements)) {
        lastError = new Error('Overpass response does not contain a valid elements array');
        continue;
      }

      if (payload.elements.length === 0) {
        throw new Error('Overpass returned zero elements for the selected bbox/categories');
      }

      return payload.elements;
    } catch (err) {
      lastError = err;
      if (err.message.includes('zero elements')) {
        throw err;
      }
      console.warn(`Warning: endpoint ${endpoint} failed — ${err.message}. Trying next...`);
    }
  }

  throw lastError;
}

async function writeDataFile(items) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputDirs = [
    path.resolve(__dirname, '../src/data'),
    path.resolve(__dirname, '../public')
  ];
  const payload = JSON.stringify(items, null, 2);

  for (const outputDir of outputDirs) {
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, 'data.json'), payload, 'utf-8');
  }

  return path.join(outputDirs[0], 'data.json');
}

async function main() {
  try {
    const query = buildOverpassQuery();
    const elements = await fetchFromOverpass(query);
    const transformedItems = transformElements(elements);

    if (transformedItems.length === 0) {
      throw new Error('No valid places after transformation/filtering');
    }

    const outputPath = await writeDataFile(transformedItems);

    console.log(`data.json generado en: ${outputPath}`);
    console.log(`Cantidad de lugares generados: ${transformedItems.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error al generar data.json: ${message}`);
    process.exitCode = 1;
  }
}

main();
