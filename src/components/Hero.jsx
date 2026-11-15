
function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">

        <p className="eyebrow">
          WELCOME TO THE URBAN PLATE
        </p>

        <h1>
          Taste The Art
          <br />
          Of <span>Fine Dining.</span>
        </h1>

        <p className="hero-description">
          Experience exceptional flavours, handcrafted
          dishes and unforgettable moments in an
          elegant atmosphere.
        </p>

        <div className="hero-buttons">
          <a href="#menu" className="primary-btn">
            Explore Menu
          </a>

          <a href="#about" className="secondary-btn">
            Our Story
          </a>
        </div>

      </div>
    </section>
  );
}

export default Hero;
