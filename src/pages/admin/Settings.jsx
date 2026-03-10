import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaCog, FaGlobe, FaHeadset, FaPhoneAlt, FaSyncAlt, FaTools } from "react-icons/fa";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin.css";

function Settings() {
  const [siteName, setSiteName] = useState("HealthSync");
  const [contactEmail, setContactEmail] = useState("support@healthsync.com");
  const [phone, setPhone] = useState("+94 77 000 0000");

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const settingsData = { siteName, contactEmail, phone };
    console.log("Settings Updated:", settingsData);
    // Add success toast/notification here
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminNavbar />

        <div className="admin-header-flex" data-aos="fade-down">
          <div className="title-wrapper">
            <h2 className="admin-page-title">
              <FaCog style={{ marginRight: "12px", color: "#E36A6A" }} />
              System Settings
            </h2>
            <p className="admin-subtitle">Manage global website configurations and support info</p>
          </div>
        </div>

        <div className="admin-card settings-card" data-aos="zoom-in" data-aos-delay="100">
          <div className="settings-header">
            <FaTools className="settings-icon-bg" />
            <h3>General Configuration</h3>
          </div>

          <form className="admin-premium-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label><FaGlobe className="form-icon" /> Website Display Name</label>
              <input
                className="admin-input"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. HealthSync Portal"
                required
              />
            </div>

            <div className="form-row-split">
              <div className="admin-form-group">
                <label><FaHeadset className="form-icon" /> Support Email</label>
                <input
                  className="admin-input"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label><FaPhoneAlt className="form-icon" /> Support Hotline</label>
                <input
                  className="admin-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions-settings">
              <button type="submit" className="btn-update">
                <FaSyncAlt /> Save System Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;