import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter } from "react-icons/fa";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { diseases } from "../../data/diseases";
import "../../styles/admin.css";

function ManageDiseases() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const filteredDiseases = diseases.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || d.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminNavbar />

        <div className="admin-header-flex" data-aos="fade-down">
          <h2 className="admin-page-title">Disease Management</h2>
          <Link to="/admin/add-disease">
            <button className="btn-primary-admin">
              <FaPlus /> Add New Disease
            </button>
          </Link>
        </div>

        {/* Professional Filters Section */}
        <div className="filters-container" data-aos="zoom-in" data-aos-delay="100">
          <div className="search-wrapper">
            <FaSearch className="search-icon-inner" />
            <input
              type="text"
              placeholder="Search by disease name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input-premium"
            />
          </div>

          <div className="select-wrapper">
            <FaFilter className="filter-icon-inner" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="admin-select-premium"
            >
              <option value="All">All Categories</option>
              <option value="Viral">Viral</option>
              <option value="Bacterial">Bacterial</option>
              <option value="Chronic">Chronic</option>
            </select>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="table-responsive-wrapper" data-aos="fade-up" data-aos-delay="200">
          <table className="admin-table-premium">
            <thead>
              <tr>
                <th>Disease Name</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiseases.map((d, index) => (
                <tr key={d.id} style={{"--i": index}}>
                  <td>
                    <span className="disease-name-cell">{d.title}</span>
                  </td>
                  <td>
                    <span className={`tag-${d.category.toLowerCase()}`}>
                      {d.category}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="action-btns-group">
                      <Link to={`/admin/edit-disease/${d.id}`} title="Edit">
                        <button className="btn-icon btn-edit">
                          <FaEdit />
                        </button>
                      </Link>
                      <button className="btn-icon btn-delete" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageDiseases;