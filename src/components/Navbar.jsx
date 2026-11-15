
function Navbar() {
  return (
    <nav className="navbar">
      <a href="#home" className="logo">
        THE URBAN <span>PLATE.</span>
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#about">Our Story</a>
        <a href="#menu">Menu</a>
        <a href="#contact">Contact</a>
      </div>

      <a href="#reservation" className="nav-btn">
        Book a Table
      </a>
    </nav>
  );
}

export default Navbar;
