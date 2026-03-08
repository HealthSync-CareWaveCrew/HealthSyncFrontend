import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage'; // import your auth page
import AppShell from '../components/AppShell';
import AdminDiseaseManagementPage from '../pages/AdminDiseaseManagementPage';
import AdminLayoutPage from '../pages/AdminLayoutPage';

function AllRoutes() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        {/* or if you want both on same page */}
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminLayoutPage />}>
            <Route
              index
              element={<Navigate to="disease-management" replace />}
            />
            <Route
              path="disease-management"
              element={<AdminDiseaseManagementPage />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default AllRoutes;