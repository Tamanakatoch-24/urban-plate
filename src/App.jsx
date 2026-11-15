
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import About from "./components/About";
import Reservation from "./components/Reservation";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  return (
    <>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Restaurant Menu */}
      <Menu />

      {/* About Our Restaurant */}
      <About />

      {/* Table Reservation Form */}
      <Reservation />

      {/* Website Footer */}
      <Footer />
    </>
  );
}

export default App;
