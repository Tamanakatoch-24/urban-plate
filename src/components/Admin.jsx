
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://urban-plate-2.onrender.com";

// Format date without timezone problems
const parseReservationDate = (value) => {
  if (!value) return null;

  const parts = String(value).split("-");

  if (
    parts.length === 3 &&
    parts.every((part) => /^\d+$/.test(part))
  ) {
    const date = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );

    if (!Number.isNaN(date.getTime())) return date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfWeek = (date) => {
  const result = startOfDay(date);
  const day = result.getDay();

  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  return result;
};

function Admin() {
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewsError, setReviewsError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [chartPeriod, setChartPeriod] = useState("Daily");

  const navigate = useNavigate();

  // Fetch reservations
  const fetchReservations = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/reservations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReservations(response.data.reservations || []);
    } catch (err) {
      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem("adminToken");
        navigate("/admin");
        return;
      }

      setError("Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all customer reviews
  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");

    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${API_URL}/api/reviews/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews(response.data.reviews || []);
    } catch (err) {
      setReviewsError("Unable to load customer reviews.");
      console.error("Reviews error:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Approve or reject customer review
  const updateReviewStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.patch(
        `${API_URL}/api/reviews/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews((previous) =>
        previous.map((review) =>
          review._id === id ? response.data.review : review
        )
      );

      alert(`Review ${status.toLowerCase()} successfully!`);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update review status."
      );
    }
  };

  // Delete customer review
  const deleteReview = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer review?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `${API_URL}/api/reviews/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews((previous) =>
        previous.filter((review) => review._id !== id)
      );

      alert("Customer review deleted successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to delete customer review."
      );
    }
  };

  // Update reservation status
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.patch(
        `${API_URL}/api/reservations/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReservations((previous) =>
        previous.map((item) =>
          item._id === id
            ? {
                ...item,
                status: response.data.reservation.status,
              }
            : item
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update reservation status."
      );
    }
  };

  // Delete reservation
  const deleteReservation = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reservation?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `${API_URL}/api/reservations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReservations((previous) =>
        previous.filter((item) => item._id !== id)
      );

      alert("Reservation deleted successfully!");
    } catch (err) {
      alert("Unable to delete reservation.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  // Reservation statistics
  const totalReservations = reservations.length;

  const pendingReservations = reservations.filter(
    (item) => (item.status || "Pending") === "Pending"
  ).length;

  const confirmedReservations = reservations.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const completedReservations = reservations.filter(
    (item) => item.status === "Completed"
  ).length;

  // Review statistics
  const totalReviews = reviews.length;

  const pendingReviews = reviews.filter(
    (review) => (review.status || "Pending") === "Pending"
  ).length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved"
  ).length;

  const rejectedReviews = reviews.filter(
    (review) => review.status === "Rejected"
  ).length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + Number(review.rating || 0),
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  // Generate chart data
  const getChartData = () => {
    const today = startOfDay(new Date());
    const buckets = [];

    if (chartPeriod === "Daily") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        buckets.push({
          start: date,
          label: date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          count: 0,
        });
      }
    }

    if (chartPeriod === "Weekly") {
      const currentWeek = startOfWeek(today);

      for (let i = 3; i >= 0; i--) {
        const date = new Date(currentWeek);
        date.setDate(date.getDate() - i * 7);

        buckets.push({
          start: date,
          label: `Week ${4 - i}`,
          count: 0,
        });
      }
    }

    if (chartPeriod === "Monthly") {
      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          today.getFullYear(),
          today.getMonth() - i,
          1
        );

        buckets.push({
          start: date,
          label: date.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          }),
          count: 0,
        });
      }
    }

    const getBucketIndex = (date) => {
      if (chartPeriod === "Daily") {
        return buckets.findIndex(
          (bucket) =>
            bucket.start.getTime() === startOfDay(date).getTime()
        );
      }

      if (chartPeriod === "Weekly") {
        const week = startOfWeek(date);

        return buckets.findIndex(
          (bucket) => bucket.start.getTime() === week.getTime()
        );
      }

      return buckets.findIndex(
        (bucket) =>
          bucket.start.getFullYear() === date.getFullYear() &&
          bucket.start.getMonth() === date.getMonth()
      );
    };

    reservations.forEach((item) => {
      const date = parseReservationDate(item.date);

      if (!date) return;

      const index = getBucketIndex(date);

      if (index !== -1) {
        buckets[index].count += 1;
      }
    });

    return buckets;
  };

  const chartData = getChartData();

  const maxChartValue = Math.max(
    1,
    ...chartData.map((item) => item.count)
  );

  // Search and filter reservations
  const filteredReservations = reservations.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      (item.name || "").toLowerCase().includes(search) ||
      (item.email || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      (item.status || "Pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Export reservations to CSV
  const exportReservations = () => {
    if (filteredReservations.length === 0) {
      alert("No reservations available to export.");
      return;
    }

    const headers = [
      "Customer Name",
      "Email",
      "Date",
      "Time",
      "Guests",
      "Status",
    ];

    const rows = filteredReservations.map((item) => [
      item.name,
      item.email,
      item.date,
      item.time,
      item.guests,
      item.status || "Pending",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Urban_Plate_Reservations.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchReservations();
    fetchReviews();
  }, []);

  return (
    <div className="admin-page">
      <h1>Urban Plate</h1>
      <p className="admin-subtitle">Restaurant Admin Dashboard</p>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* Reservation Analytics Cards */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <h3>Total Reservations</h3>
          <h2>{totalReservations}</h2>
        </div>

        <div className="admin-stat-card pending-card">
          <h3>Pending</h3>
          <h2>{pendingReservations}</h2>
        </div>

        <div className="admin-stat-card confirmed-card">
          <h3>Confirmed</h3>
          <h2>{confirmedReservations}</h2>
        </div>

        <div className="admin-stat-card completed-card">
          <h3>Completed</h3>
          <h2>{completedReservations}</h2>
        </div>
      </div>

      {/* Reservation Analytics Chart */}
      <div className="reservation-analytics">
        <div className="analytics-heading">
          <div>
            <h2>Reservation Analytics</h2>
            <p>Track your restaurant bookings over time</p>
          </div>

          <div className="chart-tabs">
            {["Daily", "Weekly", "Monthly"].map((period) => (
              <button
                key={period}
                className={
                  chartPeriod === period ? "active-chart-tab" : ""
                }
                onClick={() => setChartPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="reservation-chart">
          {chartData.map((item, index) => (
            <div className="chart-column" key={index}>
              <span className="chart-count">{item.count}</span>

              <div className="chart-bar-area">
                <div
                  className="chart-bar"
                  style={{
                    height: `${
                      (item.count / maxChartValue) * 100
                    }%`,
                  }}
                />
              </div>

              <span className="chart-label">{item.label}</span>
            </div>
          ))}
        </div>

        <p className="chart-note">
          Total bookings shown:{" "}
          {chartData.reduce(
            (total, item) => total + item.count,
            0
          )}
        </p>
      </div>

      {/* Reservation Header */}
      <div className="admin-table-header">
        <h2 className="admin-heading">Customer Reservations</h2>

        <div className="admin-actions">
          <button
            className="refresh-btn"
            onClick={() => {
              fetchReservations();
              fetchReviews();
            }}
          >
            ↻ Refresh
          </button>

          <button className="export-btn" onClick={exportReservations}>
            ↓ Export Excel
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="reservation-filters">
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="reservation-search"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
        </select>

        <button
          className="clear-filter-btn"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("All");
          }}
        >
          Clear
        </button>
      </div>

      {loading && <p>Loading reservations...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && reservations.length === 0 && (
        <p>No reservations found.</p>
      )}

      {!loading && !error && reservations.length > 0 && (
        <>
          <p className="results-count">
            Showing {filteredReservations.length} of{" "}
            {reservations.length} reservations
          </p>

          {filteredReservations.length === 0 ? (
            <p className="no-results">
              No matching reservations found.
            </p>
          ) : (
            <div className="reservation-table-wrapper">
              <table className="reservation-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReservations.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>{item.guests}</td>

                      <td>
                        <select
                          value={item.status || "Pending"}
                          onChange={(e) =>
                            updateStatus(item._id, e.target.value)
                          }
                          className="status-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => deleteReservation(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Customer Review Management */}
      <section className="admin-reviews-section">
        <div className="admin-reviews-heading">
          <div>
            <h2>Customer Reviews</h2>
            <p>Manage feedback from your restaurant guests</p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchReviews}
          >
            ↻ Refresh Reviews
          </button>
        </div>

        {/* Review Statistics */}
        <div className="review-admin-stats">
          <div className="review-admin-card">
            <h3>Total Reviews</h3>
            <h2>{totalReviews}</h2>
          </div>

          <div className="review-admin-card">
            <h3>Average Rating</h3>
            <h2>{averageRating} / 5</h2>
            <p className="admin-average-stars">
              {"★".repeat(Math.round(Number(averageRating)))}
              {"☆".repeat(
                5 - Math.round(Number(averageRating))
              )}
            </p>
          </div>

          <div className="review-admin-card">
            <h3>Pending Reviews</h3>
            <h2>{pendingReviews}</h2>
          </div>

          <div className="review-admin-card">
            <h3>Approved Reviews</h3>
            <h2>{approvedReviews}</h2>
          </div>

          <div className="review-admin-card">
            <h3>Rejected Reviews</h3>
            <h2>{rejectedReviews}</h2>
          </div>
        </div>

        {reviewsLoading && <p>Loading customer reviews...</p>}

        {reviewsError && (
          <p className="admin-review-error">{reviewsError}</p>
        )}

        {!reviewsLoading &&
          !reviewsError &&
          reviews.length === 0 && (
            <p>No customer reviews available yet.</p>
          )}

        {!reviewsLoading && reviews.length > 0 && (
          <div className="admin-review-grid">
            {reviews.map((review) => (
              <div className="admin-review-card" key={review._id}>
                <div className="admin-review-top">
                  <div>
                    <h3>{review.customerName}</h3>
                    <p>{review.email}</p>
                  </div>

                  <span className="admin-review-rating">
                    {"★".repeat(Number(review.rating))}
                    {"☆".repeat(
                      5 - Number(review.rating)
                    )}
                  </span>
                </div>

                <p className="admin-review-comment">
                  {review.comment}
                </p>

                <div className="admin-review-bottom">
                  <div>
                    <span>
                      {review.createdAt
                        ? new Date(
                            review.createdAt
                          ).toLocaleDateString("en-IN")
                        : ""}
                    </span>

                    <p className="review-status">
                      Status: {review.status || "Pending"}
                    </p>
                  </div>

                  <div className="review-admin-actions">
                    {review.status !== "Approved" && (
                      <button
                        className="approve-review-btn"
                        onClick={() =>
                          updateReviewStatus(
                            review._id,
                            "Approved"
                          )
                        }
                      >
                        Approve
                      </button>
                    )}

                    {review.status !== "Rejected" && (
                      <button
                        className="reject-review-btn"
                        onClick={() =>
                          updateReviewStatus(
                            review._id,
                            "Rejected"
                          )
                        }
                      >
                        Reject
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => deleteReview(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Admin;
