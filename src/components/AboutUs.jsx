import { aboutUs } from "../data/aboutUs";
import "../styles/contentManagement.css";

function AboutUs(){

return(

<section className="page-container">

<h2 className="section-title">{aboutUs.title}</h2>

<div className="about-container">

<img
src={aboutUs.image}
alt="About HealthSync"
className="about-image"
/>

<p className="about-text">
{aboutUs.description}
</p>

</div>

</section>

)

}

export default AboutUs