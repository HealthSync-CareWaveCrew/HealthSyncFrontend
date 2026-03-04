import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LandingPage from "../pages/LandingPage";
function AllRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/" element={<HomePage />} />
        
      </Routes>
    </Router>
  );
}

export default AllRoutes;
