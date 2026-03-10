import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import HomePage from '../pages/HomePage'
import LandingPage from "../pages/LandingPage"
import DiseasePage from "../pages/DiseasePage"
import DiseaseDetailsPage from "../pages/DiseaseDetailsPage"
import AboutPage from "../pages/AboutPage"

import AdminDashboard from "../pages/admin/AdminDashboard"
import ManageDiseases from "../pages/admin/ManageDiseases"
import AddDisease from "../pages/admin/AddDisease"
import EditDisease from "../pages/admin/EditDisease"
import ManageAbout from "../pages/admin/ManageAbout"
import Profile from "../pages/admin/Profile"
import Settings from "../pages/admin/Settings"

function AllRoutes() {

return (

<Router>

<Routes>

{/* Public Pages */}

<Route path="/" element={<LandingPage />} />

<Route path="/home" element={<HomePage />} />

<Route path="/diseases" element={<DiseasePage />} />

<Route path="/diseases/:id" element={<DiseaseDetailsPage />} />

<Route path="/about" element={<AboutPage />} />

{/* Admin */}

<Route path="/admin" element={<AdminDashboard/>}/>

<Route path="/admin/diseases" element={<ManageDiseases/>}/>

<Route path="/admin/add-disease" element={<AddDisease/>}/>

<Route path="/admin/edit-disease/:id" element={<EditDisease/>}/>

<Route path="/admin/about" element={<ManageAbout/>}/>

<Route path="/admin/profile" element={<Profile/>}/>

<Route path="/admin/settings" element={<Settings/>}/>

</Routes>

</Router>

)

}

export default AllRoutes