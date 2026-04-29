function Sidebar({ panoramas, selectedId, onSelect }) {
  return (
    <section className="panel-section">
      <div className="section-headline">
        <h2>Results</h2>
        <span className="pill">{panoramas.length}</span>
      </div>

      <ul className="results-list">
        {panoramas.map((panorama) => (
          <li
            key={panorama.id}
            className={selectedId === panorama.id ? 'is-selected' : ''}
            onClick={() => onSelect(panorama)}
          >
            <h3>{panorama.name}</h3>
            <p>{panorama.location.commune}</p>
            <small>
              {panorama.price === 0 ? 'Free' : `$${panorama.price.toLocaleString('es-CL')}`} · {(panorama.types || [panorama.type]).join(', ')}
            </small>
            {panorama.featured ? <small className="featured-text">Destacado</small> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Sidebar;
