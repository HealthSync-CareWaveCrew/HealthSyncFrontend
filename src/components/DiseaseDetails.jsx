import RelatedInfo from "./RelatedInfo";
import "../styles/contentManagement.css";

function DiseaseDetails({disease}){

return(

<div className="page-container">

<h1 className="section-title">{disease.title}</h1>

<img
src={disease.image}
alt={disease.title}
style={{width:"100%",maxWidth:"500px",borderRadius:"10px"}}
/>

<p style={{marginTop:"20px",fontSize:"18px"}}>
{disease.content}
</p>

<RelatedInfo info={disease.relatedInfo}/>

</div>

)

}

export default DiseaseDetails