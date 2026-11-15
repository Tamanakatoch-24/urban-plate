
import { useEffect, useState } from "react";
import axios from "axios";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    rating: 5,
    comment: "",
  });

  // Fetch customer reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/reviews"
      );

      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Unable to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !formData.customerName.trim() ||
      !formData.email.trim() ||
      !formData.comment.trim()
    ) {
      setMessage("Please fill all the fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          ...formData,
          customerName: formData.customerName.trim(),
          email: formData.email.trim(),
          comment: formData.comment.trim(),
          rating: Number(formData.rating),
        }
      );

      setMessage(response.data.message);

      setFormData({
        customerName: "",
        email: "",
        rating: 5,
        comment: "",
      });

      await fetchReviews();

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to submit your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-container">

        <div className="reviews-heading">
          <p className="reviews-subtitle">CUSTOMER EXPERIENCES</p>
          <h2>What Our Guests Say</h2>
          <p>
            Your experience matters to us. Share your thoughts
            with the Urban Plate family.
          </p>
        </div>

        {/* Review Form */}
        <div className="review-form-card">
          <h3>Share Your Experience</h3>

          <form onSubmit={handleSubmit}>
            <label>Your Name</label>
            <input
              type="text"
              name="customerName"
              placeholder="Enter your name"
              value={formData.customerName}
              onChange={handleChange}
              maxLength={80}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Your Rating</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value="5">★★★★★ - Excellent</option>
              <option value="4">★★★★ - Very Good</option>
              <option value="3">★★★ - Good</option>
              <option value="2">★★ - Fair</option>
              <option value="1">★ - Poor</option>
            </select>

            <label>Your Review</label>
            <textarea
              name="comment"
              placeholder="Tell us about your experience..."
              value={formData.comment}
              onChange={handleChange}
              maxLength={500}
              rows="5"
              required
            />

            <p className="review-character-count">
              {formData.comment.length}/500 characters
            </p>

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>

            {message && (
              <p className="review-message" role="status">
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Customer Reviews */}
        <div className="customer-reviews">
          <h3>Guest Reviews</h3>

          {loading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p>Be the first to share your experience!</p>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <div className="review-card" key={review._id}>
                  <div className="review-stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>

                  <h4>{review.customerName}</h4>

                  <p>{review.comment}</p>

                  <span>
                    {new Date(review.createdAt).toLocaleDateString(
                      "en-IN"
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default Reviews;
