import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaVirus, FaInfoCircle, FaUser, FaSignOutAlt ,  FaCog} from "react-icons/fa";

const AdminSidebar = () => (
  <aside className="sidebar">
    <h2>Health<span>Sync</span></h2>
    <nav>
      <NavLink to="/admin" end><FaTachometerAlt />  Dashboard</NavLink>
      <NavLink to="/admin/diseases"><FaVirus /> Diseases</NavLink>
      <NavLink to="/admin/about"><FaInfoCircle /> About Content</NavLink>
      <NavLink to="/admin/profile"><FaUser /> Profile</NavLink>
      <NavLink to="/admin/settings"><FaCog /> Settings</NavLink>
    </nav>
    <button className="btn-logout" style={{marginTop: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '12px', borderRadius: '10px', cursor: 'pointer'}}>
       <FaSignOutAlt /> Sign Out
    </button>
  </aside>
);

export default AdminSidebar;