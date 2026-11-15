
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import About from "./components/About";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Hero />

      <Menu />

      <About />

      <section className="reservation" id="reservation">

        <p className="eyebrow">
          YOUR TABLE IS WAITING
        </p>

        <h2>
          Make Your Evening <span>Special.</span>
        </h2>

        <p>
          Join us for delicious food and unforgettable memories.
        </p>

        <a
          href="mailto:hello@theurbanplate.com?subject=Table%20Reservation"
          className="primary-btn"
        >
          Reserve Your Table
        </a>

      </section>

      <Footer />
    </>
  );
}

export default App;
