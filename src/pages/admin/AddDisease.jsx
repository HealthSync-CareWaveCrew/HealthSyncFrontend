import { useState, useEffect } from "react"
import AOS from "aos"
import "aos/dist/aos.css"
import { FaCloudUploadAlt, FaSave, FaArrowLeft } from "react-icons/fa"
import AdminSidebar from "../../components/AdminSidebar"
import AdminNavbar from "../../components/AdminNavbar"
import "../../styles/admin.css"

function AddDisease() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  function handleImage(e) {
    const file = e.target.files[0]
    if (file) {
      setImage(URL.createObjectURL(file))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const diseaseData = { title, category, content, image }
    console.log(diseaseData)
    // Add success toast or redirection here
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminNavbar />

        <div className="admin-header-flex" data-aos="fade-down">
          <h2 className="admin-page-title">Add New Disease Entry</h2>
        </div>

        <div className="admin-card main-form-card" data-aos="fade-up" data-aos-delay="100">
          <form onSubmit={handleSubmit} className="admin-premium-form">
            <div className="form-grid">
              <div className="admin-form-group">
                <label>Disease Name</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Dengue Fever"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Category</label>
                <select 
                  className="admin-input" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Viral">Viral</option>
                  <option value="Bacterial">Bacterial</option>
                  <option value="Chronic">Chronic</option>
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label>Detailed Content & Symptoms</label>
              <textarea
                className="admin-input admin-textarea"
                rows="6"
                placeholder="Describe the disease detailed..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="upload-section">
              <label className="image-upload-label">
                <input type="file" onChange={handleImage} hidden />
                <div className="upload-placeholder">
                  <FaCloudUploadAlt size={30} />
                  <span>Click to upload disease cover image</span>
                </div>
              </label>

              {image && (
                <div className="image-preview-wrapper" data-aos="zoom-in">
                  <img src={image} alt="preview" className="image-preview-large" />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-update">
                <FaSave /> Save Disease Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddDisease