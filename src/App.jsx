
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import About from "./components/About";
import Reservation from "./components/Reservation";
import Reviews from "./components/Reviews";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import AdminLogin from "./components/AdminLogin";

import "./App.css";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Menu />
      <About />
      <Reservation />
      <Reviews />
      <Footer />
    </>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  return token ? children : <Navigate to="/admin" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Admin Login */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
