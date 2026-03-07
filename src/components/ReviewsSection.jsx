function ReviewsSection() {
  const reviews = [
    { name: "Nimal", text: "Very accurate AI predictions." },
    { name: "Sanduni", text: "User-friendly and informative." },
    { name: "Kasun", text: "Innovative healthcare solution!" }
  ];

  return (
    <div id="reviews" className="section section-light" data-aos="zoom-in">
    <div className="section section-light">
      <h2 className="section-title">Inspiring Stories</h2>
      <div className="grid grid-3">
        {reviews.map((r, index) => (
          <div className="card" key={index}>
            <h4>{r.name}</h4>
            <p>{r.text}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
export default ReviewsSection;