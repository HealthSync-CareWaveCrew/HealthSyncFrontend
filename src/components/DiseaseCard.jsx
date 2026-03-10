import { Link } from "react-router-dom";
import "../styles/contentManagement.css";

function DiseaseCard({ disease }) {

return(

<div className="disease-card">

<img
src={disease.image}
alt={disease.title}
className="disease-img"
/>

<div className="disease-body">

<h3 className="disease-title">{disease.title}</h3>

<p className="disease-content">
{disease.content}
</p>

<Link to={`/diseases/${disease.id}`}>
Read More →
</Link>

</div>

</div>

)

}

export default DiseaseCard