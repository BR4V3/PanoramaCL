function Sidebar({ panoramas }) {
  return (
    <section className="panel-section">
      <div className="section-headline">
        <h2>Results</h2>
        <span className="pill">{panoramas.length}</span>
      </div>

      <ul className="results-list">
        {panoramas.map((panorama) => (
          <li key={panorama.id}>
            <h3>{panorama.name}</h3>
            <p>{panorama.location.commune}</p>
            <small>
              {panorama.price === 0 ? 'Free' : `$${panorama.price.toLocaleString('es-CL')}`} · {panorama.type}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Sidebar;
