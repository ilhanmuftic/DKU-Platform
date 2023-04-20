const assContainer = document.getElementById('all-assignments')
const brk = document.createElement('br')
var Assignments

var stringToHTML = function (str) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
	return doc.body.getElementsByTagName('*')[0];
};

r = new Request("/get-assignments")

fetch(r).then(re=>{re.json().then(data=>{addAssignments(data)})})

function addAssignments(data){
  var h=0;
    for(ass of data){
        createAssignment(ass)
        if(ass.State == "Approved" ) h+=ass.Hours
       
        
    }

    assContainer.append(stringToHTML("<div style='margin-top:10%;'></div>"))
  setHours(h)  
}


function createAssignment(ass){
    theAss = stringToHTML(`<div id=${ass.Id} class="student-all" >
        <div class="student collapsible"><span style="width:30%;text-align:left;margin-right:20%;">${ass.Name}</span> <button onclick="location.href='/profile/${ass.Id}'" class="viewbtn">View Profile</button></div>
        
        <div class="content ${ass.State}" style="display: none;"><div class="info1" style="width:100%;"><span>Date: ${ass.Info.Date}</span><span>Hours: ${ass.Hours}</span>
        <span style="text-align:left;">Description: ${ass.Info.Description}</span><span >State: ${ass.State}</span></div>
  
        </div></div>`)        
        theAss.getElementsByClassName('collapsible')[0].addEventListener("click", function() {
          this.classList.toggle("active");
          var content = this.nextElementSibling;
          if (content.style.display === "flex") {
            content.style.display = "none";
          } else {
            content.style.display = "flex";
          }
        });                           
        assContainer.append(theAss)
        return theAss
  }

  function setHours(h){
    document.querySelector("#my-hours").innerText = "My Hours: " + h;
  }