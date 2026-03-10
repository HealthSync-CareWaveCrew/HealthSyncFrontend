import { useParams } from "react-router-dom"
import { diseases } from "../data/diseases"

function DiseaseDetailsPage(){

const { id } = useParams()

const disease = diseases.find(d => d.id === parseInt(id))

if(!disease){
return <h2>Disease Not Found</h2>
}

return(

<div className="disease-details">

<h1>{disease.title}</h1>

<img
src={disease.image}
alt={disease.title}
/>

<h3>Category</h3>
<p>{disease.category}</p>

<h3>Description</h3>
<p>{disease.content}</p>

<h3>Symptoms</h3>
<ul>
<li>Fever</li>
<li>Fatigue</li>
<li>Headache</li>
</ul>

<h3>Prevention</h3>
<ul>
<li>Maintain hygiene</li>
<li>Healthy diet</li>
<li>Regular medical checkups</li>
</ul>

<h3>Treatment</h3>
<p>
Consult a healthcare professional for proper diagnosis and treatment.
</p>

</div>

)

}

export default DiseaseDetailsPage