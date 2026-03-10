function ActivityTable(){

const activities=[
"Admin added Dengue",
"Admin updated Diabetes",
"Admin edited About Page"
]

return(

<table>

<thead>
<tr>
<th>Recent Activity</th>
</tr>
</thead>

<tbody>

{activities.map((a,i)=>(
<tr key={i}>
<td>{a}</td>
</tr>
))}

</tbody>

</table>

)

}

export default ActivityTable