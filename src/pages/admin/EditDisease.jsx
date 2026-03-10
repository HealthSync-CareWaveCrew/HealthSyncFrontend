import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaSave, FaArrowLeft, FaEdit, FaSyncAlt } from "react-icons/fa";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { diseases } from "../../data/diseases";
import "../../styles/admin.css";

function EditDisease() {
  const { id } = useParams();
  const disease = diseases.find((d) => d.id === parseInt(id));

  const [title, setTitle] = useState(disease?.title || "");
  const [category, setCategory] = useState(disease?.category || "");
  const [content, setContent] = useState(disease?.content || "");

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const updatedDisease = { id, title, category, content };
    console.log("Updated Disease:", updatedDisease);
    // Add success logic/toast here
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminNavbar />

        <div className="admin-header-flex" data-aos="fade-down">
          <div className="title-section">
            <h2 className="admin-page-title">
              <FaEdit style={{ marginRight: "12px", fontSize: "24px" }} />
              Edit Disease Info
            </h2>
            <p className="admin-subtitle">Updating technical data for: <strong>{disease?.title}</strong></p>
          </div>
          <Link to="/admin/diseases" className="btn-back-link">
             <FaArrowLeft /> Back to List
          </Link>
        </div>

        <div className="admin-card edit-form-card" data-aos="zoom-in" data-aos-delay="100">
          <form onSubmit={handleSubmit} className="admin-premium-form">
            <div className="form-grid">
              <div className="admin-form-group">
                <label>Disease Name</label>
                <input
                  className="admin-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter name..."
                />
              </div>

              <div className="admin-form-group">
                <label>Category Tag</label>
                <input
                  className="admin-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Viral, Chronic..."
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Full Clinical Description</label>
              <textarea
                className="admin-input admin-textarea"
                rows="8"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Update medical content here..."
              />
            </div>

            <div className="form-actions-edit">
              <button type="submit" className="btn-update">
                <FaSyncAlt /> Update Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditDisease;