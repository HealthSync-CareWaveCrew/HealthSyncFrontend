import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaInfoCircle, FaAlignLeft, FaImage, FaSyncAlt } from "react-icons/fa";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin.css";

function ManageAbout() {
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    // Logic for update here
    console.log("About Us Content Updated");
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminNavbar />

        <div className="admin-header-flex" data-aos="fade-down">
          <h2 className="admin-page-title">
            <FaInfoCircle style={{ marginRight: "12px" }} />
            Manage About Us
          </h2>
        </div>

        <div className="admin-card about-form-card" data-aos="zoom-in" data-aos-delay="100">
          <form className="admin-premium-form" onSubmit={handleUpdate}>
            
            <div className="admin-form-group">
              <label><FaInfoCircle className="form-icon" /> Page Title</label>
              <input 
                className="admin-input" 
                placeholder="Enter the main title (e.g., Who We Are)" 
                required
              />
            </div>

            <div className="admin-form-group">
              <label><FaAlignLeft className="form-icon" /> About Description</label>
              <textarea 
                className="admin-input admin-textarea" 
                placeholder="Share your mission and vision..." 
                rows="8"
                required
              />
            </div>

            <div className="admin-form-group">
              <label><FaImage className="form-icon" /> Feature Image URL</label>
              <input 
                className="admin-input" 
                placeholder="https://example.com/image.jpg" 
                required
              />
              <p className="input-hint">Enter a high-quality URL for the about section image.</p>
            </div>

            <div className="form-actions-about">
              <button type="submit" className="btn-update">
                <FaSyncAlt /> Update Content
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManageAbout;