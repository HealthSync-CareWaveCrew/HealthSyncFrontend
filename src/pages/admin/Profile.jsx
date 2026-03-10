import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaUserCircle, FaEnvelope, FaLock, FaUserShield, FaSyncAlt } from "react-icons/fa";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin.css";

function Profile() {
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@healthsync.com");
  const [password, setPassword] = useState("");

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const profileData = { name, email, password };
    console.log("Updated Profile:", profileData);
    // Add success toast logic here
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminNavbar />

        <div className="admin-header-flex" data-aos="fade-down">
          <h2 className="admin-page-title">
            <FaUserShield style={{ marginRight: "12px", color: "var(--admin-sidebar)" }} />
            Account Profile
          </h2>
        </div>

        <div className="admin-card profile-card" data-aos="zoom-in" data-aos-delay="100">
          <div className="profile-header-section">
            <div className="avatar-wrapper">
              <FaUserCircle size={80} color="#FFB2B2" />
              <div className="badge-status">Admin</div>
            </div>
            <div className="profile-info-text">
              <h3>{name}</h3>
              <p>{email}</p>
            </div>
          </div>

          <form className="admin-premium-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label><FaUserCircle className="form-icon" /> Full Name</label>
              <input
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label><FaEnvelope className="form-icon" /> Email Address</label>
              <input
                className="admin-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label><FaLock className="form-icon" /> New Password</label>
              <input
                className="admin-input"
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-actions-profile">
              <button type="submit" className="btn-update">
                <FaSyncAlt /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;