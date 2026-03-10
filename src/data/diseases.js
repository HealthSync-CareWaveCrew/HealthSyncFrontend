import dengueImg from "../assets/images/dengue.jpg"
import malariaImg from "../assets/images/malaria.jpg"
import diabetesImg from "../assets/images/diabetes.jpg"
import cancerImg from "../assets/images/cancer.jpg"
import strokeImg from "../assets/images/stroke.jpg"
import asthmaImg from "../assets/images/asthma.jpg"

export const diseases = [

{
id:1,
title:"Dengue Fever",
category:"Viral Infection",
content:"Dengue fever is a mosquito-borne viral disease common in tropical climates.",
image:dengueImg,

relatedInfo:{
symptoms:[
"High fever",
"Severe headache",
"Joint pain",
"Skin rash"
],
causes:[
"Dengue virus transmitted by Aedes mosquitoes"
],
prevention:[
"Eliminate stagnant water",
"Use mosquito repellents"
],
treatment:[
"Hydration",
"Pain relievers",
"Medical observation"
]
}
},

{
id:2,
title:"Malaria",
category:"Parasitic Disease",
content:"Malaria is caused by Plasmodium parasites transmitted through mosquito bites.",
image:malariaImg,

relatedInfo:{
symptoms:[
"Fever",
"Chills",
"Sweating"
],
causes:[
"Parasite infection from mosquito bites"
],
prevention:[
"Mosquito nets",
"Insect repellent"
],
treatment:[
"Antimalarial medicines"
]
}
},

{
id:3,
title:"Diabetes",
category:"Chronic Disease",
content:"Diabetes affects how the body processes blood sugar.",
image:diabetesImg,

relatedInfo:{
symptoms:[
"Increased thirst",
"Frequent urination",
"Fatigue"
],
causes:[
"Insulin resistance",
"Genetic factors"
],
prevention:[
"Healthy diet",
"Regular exercise"
],
treatment:[
"Insulin therapy",
"Blood sugar monitoring"
]
}
},

{
id:4,
title:"Cancer",
category:"Chronic Disease",
content:"Cancer occurs when abnormal cells divide uncontrollably.",
image:cancerImg,

relatedInfo:{
symptoms:[
"Unexplained weight loss",
"Fatigue",
"Lumps"
],
causes:[
"Genetic mutations",
"Tobacco use"
],
prevention:[
"Avoid smoking",
"Healthy lifestyle"
],
treatment:[
"Surgery",
"Chemotherapy",
"Radiation therapy"
]
}
},

{
id:5,
title:"Stroke",
category:"Neurological",
content:"Stroke occurs when blood flow to the brain is interrupted.",
image:strokeImg,

relatedInfo:{
symptoms:[
"Sudden numbness",
"Confusion",
"Trouble speaking"
],
causes:[
"Blocked arteries",
"Blood clots"
],
prevention:[
"Healthy diet",
"Blood pressure control"
],
treatment:[
"Emergency medical care"
]
}
},

{
id:6,
title:"Asthma",
category:"Respiratory",
content:"Asthma is a chronic condition affecting the airways.",
image:asthmaImg,

relatedInfo:{
symptoms:[
"Shortness of breath",
"Wheezing",
"Coughing"
],
causes:[
"Allergens",
"Air pollution"
],
prevention:[
"Avoid triggers",
"Use inhalers"
],
treatment:[
"Bronchodilators",
"Steroid inhalers"
]
}
}

]