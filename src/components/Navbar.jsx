import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
import { FaPhoneAlt, FaSearch } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      
      {/* Logo */}
      <div className="nav-logo">
        <h2>Health<span>Sync</span></h2>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#reviews">Reviews</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      {/* Search + Contact + CTA */}
      <div className="nav-actions">
        
        {/* <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search health topics..." />
        </div> */}

        <div className="call-info">
          <FaPhoneAlt />
          <span>24/7 Support: 1111</span>
        </div>

        <button className="btn-primary" onClick={() => navigate('/login')}>Login</button>
      </div>

    </nav>
  );
}

export default Navbar;