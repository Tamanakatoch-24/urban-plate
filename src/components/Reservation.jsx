
import { useState } from "react";
import axios from "axios";

function Reservation() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    guests: "2",
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/reservations",
        {
          ...formData,
          guests: Number(formData.guests),
        }
      );

      if (response.data.success) {
        setSubmittedData({ ...formData });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Reservation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewReservation = () => {
    setSubmittedData(null);
    setError("");

    setFormData({
      name: "",
      email: "",
      date: "",
      time: "",
      guests: "2",
    });
  };

  return (
    <section className="booking-section" id="reservation">

      {submittedData ? (

        <div className="confirmation-card">

          <div className="success-icon">✓</div>

          <p className="eyebrow">THE URBAN PLATE</p>

          <h2>
            Thank <span>You!</span>
          </h2>

          <h3>Your Table Awaits.</h3>

          <p className="confirmation-text">
            Dear {submittedData.name}, your reservation
            request has been saved successfully.
          </p>

          <div className="booking-details">

            <div>
              <span>Guest Name</span>
              <strong>{submittedData.name}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{submittedData.email}</strong>
            </div>

            <div>
              <span>Reservation Date</span>
              <strong>{submittedData.date}</strong>
            </div>

            <div>
              <span>Reservation Time</span>
              <strong>{submittedData.time}</strong>
            </div>

            <div>
              <span>Number of Guests</span>
              <strong>{submittedData.guests}</strong>
            </div>

          </div>

          <p className="confirmation-note">
            We look forward to welcoming you!
          </p>

          <button
            className="booking-btn"
            onClick={handleNewReservation}
          >
            Make Another Reservation
          </button>

        </div>

      ) : (

        <>
          <div className="booking-heading">

            <p className="eyebrow">
              BOOK YOUR EXPERIENCE
            </p>

            <h2>
              Reserve Your <span>Table.</span>
            </h2>

            <p>
              Make your dining experience unforgettable.
            </p>

          </div>

          <form
            className="booking-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Reservation Date</label>
              <input
                type="date"
                name="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Reservation Time</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">Select time</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="6:00 PM">6:00 PM</option>
                <option value="7:00 PM">7:00 PM</option>
                <option value="8:00 PM">8:00 PM</option>
                <option value="9:00 PM">9:00 PM</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Number of Guests</label>
              <select
                name="guests"
                value={formData.guests}
                onChange={handleChange}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6 Guests</option>
              </select>
            </div>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="booking-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Confirm Reservation"}
            </button>

          </form>
        </>
      )}

    </section>
  );
}

export default Reservation;
