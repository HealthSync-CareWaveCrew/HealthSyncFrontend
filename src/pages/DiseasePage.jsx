import { Link } from "react-router-dom"
import { diseases } from "../data/diseases"

function DiseasePage(){

return(

<div>

<h1>Diseases</h1>

<div className="disease-grid">

{diseases.map((d)=>(

<div className="disease-card" key={d.id}>

<img src={d.image} alt={d.title}/>

<h3>{d.title}</h3>

<p>{d.category}</p>

<Link to={`/disease/${d.id}`}>
<button>View Details</button>
</Link>

</div>

))}

</div>

</div>

)

}

export default DiseasePage