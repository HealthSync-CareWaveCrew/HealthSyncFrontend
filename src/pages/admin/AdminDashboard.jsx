import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import StatsCard from "../../components/StatsCard";
import { FaUserMd, FaChartLine, FaRegFileAlt } from "react-icons/fa";

function AdminDashboard() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminNavbar title="System Overview" />
        
        <div className="stats-grid">
          <StatsCard title="Total Cases" value="1,240" icon={FaUserMd} delay="100" />
          <StatsCard title="Predictions" value="856" icon={FaChartLine} delay="200" />
          <StatsCard title="Reports" value="42" icon={FaRegFileAlt} delay="300" />
        </div>

        <section className="recent-activity-card" data-aos="fade-up">
           <div className="table-container">
             <h3 style={{padding: '20px', color: 'var(--admin-sidebar)'}}>Recent Analytics</h3>
             {/* Add Table Here */}
           </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;