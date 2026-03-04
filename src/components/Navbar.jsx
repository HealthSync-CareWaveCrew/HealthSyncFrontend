import React from "react";
import "../styles/landing.css";
import { FaPhoneAlt, FaSearch } from "react-icons/fa";

function Navbar() {
  return (
    <nav className="navbar">
      
      {/* Logo */}
      <div className="nav-logo">
        <h2>Health<span>Sync</span></h2>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>About</li>
        <li>Services</li>
        <li>Reviews</li>
        <li>Contact</li>
      </ul>

      {/* Search + Contact + CTA */}
      <div className="nav-actions">
        
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search health topics..." />
        </div>

        <div className="call-info">
          <FaPhoneAlt />
          <span>24/7 Support: 1111</span>
        </div>

        <button className="btn-primary">Login</button>
      </div>

    </nav>
  );
}

export default Navbar;