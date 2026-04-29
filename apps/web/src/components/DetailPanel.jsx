const DETAIL_PLACEHOLDER =
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80';

function DetailPanel({ panorama }) {
  if (!panorama) {
    return (
      <section className="panel-section detail-panel">
        <h2>Detalle</h2>
        <p className="detail-empty">Selecciona un panorama desde el mapa o listado.</p>
      </section>
    );
  }

  const mainImage = Array.isArray(panorama.images) && panorama.images.length > 0 ? panorama.images[0] : DETAIL_PLACEHOLDER;

  return (
    <section className="panel-section detail-panel">
      <div className="detail-image-wrap">
        <img src={mainImage} alt={panorama.name} className="detail-image" loading="lazy" />
        {panorama.featured ? <span className="featured-badge">Destacado</span> : null}
      </div>

      <div className="section-headline">
        <h2>{panorama.name}</h2>
      </div>

      <p className="detail-description">{panorama.description || 'Sin descripcion disponible.'}</p>

      <ul className="detail-list">
        <li>
          <span>Categoria</span>
          <strong>{panorama.category}</strong>
        </li>
        <li>
          <span>Precio</span>
          <strong>{panorama.price === 0 ? 'Gratis' : `$${panorama.price.toLocaleString('es-CL')}`}</strong>
        </li>
        <li>
          <span>Comuna</span>
          <strong>{panorama.location.commune}</strong>
        </li>
        <li>
          <span>Tipo</span>
          <strong>{panorama.types.join(', ')}</strong>
        </li>
      </ul>
    </section>
  );
}

export default DetailPanel;
