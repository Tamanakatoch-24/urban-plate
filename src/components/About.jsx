
function About() {
  return (
    <section className="about-section" id="about">

      <div className="about-image">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000"
          alt="Elegant restaurant dining experience"
        />
      </div>

      <div className="about-content">

        <p className="eyebrow">OUR STORY</p>

        <h2>
          More Than Food.
          <br />
          It's An <span>Experience.</span>
        </h2>

        <p>
          At The Urban Plate, we believe every meal
          should be memorable. Our chefs combine fresh
          ingredients, creativity and passion to bring
          you an exceptional dining experience.
        </p>

        <p>
          From carefully selected ingredients to
          beautifully presented dishes, every detail
          reflects our love for exceptional food.
        </p>

        <a href="#reservation" className="primary-btn">
          Experience Us
        </a>

      </div>

    </section>
  );
}

export default About;
