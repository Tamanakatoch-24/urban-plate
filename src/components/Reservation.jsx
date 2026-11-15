
import { useState } from "react";

function Reservation() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    guests: "2",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage(
      `Thank you ${formData.name}! Your reservation request has been received.`
    );

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

      <div className="booking-heading">
        <p className="eyebrow">BOOK YOUR EXPERIENCE</p>

        <h2>
          Reserve Your <span>Table.</span>
        </h2>

        <p>
          Make your dining experience unforgettable.
        </p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>

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

        <button type="submit" className="booking-btn">
          Confirm Reservation
        </button>

        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}

      </form>

    </section>
  );
}

export default Reservation;
