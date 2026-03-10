import "../styles/contentManagement.css";

function RelatedInfo({info}){

return(

<div className="related-section">

<h3 className="related-title">Symptoms</h3>
<ul className="related-list">
{info.symptoms.map((s,i)=>(
<li key={i}>{s}</li>
))}
</ul>

<h3 className="related-title">Causes</h3>
<ul className="related-list">
{info.causes.map((c,i)=>(
<li key={i}>{c}</li>
))}
</ul>

<h3 className="related-title">Prevention</h3>
<ul className="related-list">
{info.prevention.map((p,i)=>(
<li key={i}>{p}</li>
))}
</ul>

<h3 className="related-title">Treatment</h3>
<ul className="related-list">
{info.treatment.map((t,i)=>(
<li key={i}>{t}</li>
))}
</ul>

</div>

)

}

export default RelatedInfo