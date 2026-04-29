function MarkerPopup({ panorama }) {
  return (
    <article className="popup-card">
      <h3>{panorama.name}</h3>
      <p>{panorama.description}</p>
      <ul>
        <li>
          <span>Category</span>
          <strong>{panorama.category}</strong>
        </li>
        <li>
          <span>Price</span>
          <strong>{panorama.price === 0 ? 'Free' : `$${panorama.price.toLocaleString('es-CL')}`}</strong>
        </li>
        <li>
          <span>Best for</span>
          <strong>{(panorama.types || [panorama.type]).join(', ')}</strong>
        </li>
      </ul>
      {panorama.featured ? <small>Panorama destacado</small> : null}
    </article>
  );
}

export default MarkerPopup;
