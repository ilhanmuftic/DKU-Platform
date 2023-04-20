const studentContainer = document.getElementById('all-students')
const brk = document.createElement('br')

var stringToHTML = function (str) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
	return doc.body.getElementsByTagName('*')[0];
};

r = new Request("/get-students")

fetch(r).then(re=>{re.json().then(data=>{addStudent(data)})})

function addStudent(data){
    console.log(data)
    for(ass of data){
        studentContainer.append(createStudent(ass))
    }

    studentContainer.append(stringToHTML("<div style='margin-top:15%;'></div>"))
}


function createStudent(info){
    console.log(info, "a" )
    var pend = ""
    var assignments = stringToHTML('<div id="assignments-all"></div>')
    for(a of info.Assignments){
        if(a.State=="Pending"){
            if(pend!="Pending") pend = "ass-pend"
            assignments.prepend(createAssignment(a))
        }else{
            assignments.append(createAssignment(a)) 
        }
        
    }

    theStu = stringToHTML(`<div class="student-all" id="${info.Id}">
    <div class="student collapsible ${pend}">
    <div style="left:0;width:20%;text-align:left;height:100%;">${info.Name}</div> &nbsp &nbsp ${info.Class} &nbsp &nbsp Hours: ${info.Hours}</div>
    <div class="content" style="display: none;">
    <div class="info1">
       
    </div>
    </div>
    </div>
    `)

    theStu.getElementsByClassName("info1")[0].append(assignments)

    theStu.getElementsByClassName('collapsible')[0].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if(content.querySelector("#assignments-all").innerHTML == "") return 
        if (content.style.display === "flex") {
          content.style.display = "none";
        } else {
          content.style.display = "flex";
        }
      });      

    return theStu
}

function createAssignment(ass){

    var appBtns = ''
    var pend=""

    if(ass.State == "Pending"){
      appBtns = `<div style="width:50%;display:flex;flex-direction:row;">
      <button class="appBtn" onclick="approveAss('${ass.Id}')" style="background: rgb(64, 224, 125);" >Approve</button>
      <button class="appBtn" onclick="denyAss('${ass.Id}')" style="background: rgb(224, 88, 64);">Deny</button>
      </div>`

      pend="ass-pend"
    }

    theAss = stringToHTML(`<div id=${ass.Id} class="assignment-details" style="margin-top:0.5%;">
        <div class="assignment collapsible ${pend}"><span style="margin-right:5%;">${ass.Name}</span> </div>
        
        <div class="content ${ass.State}" style="display: none;"><div class="info1" style="width:100%;flex-direction:row;">
        <div style="width:50%;display:flex;flex-direction:column;"><span>Date: ${ass.Info.Date}</span><span>Hours: ${ass.Hours}</span>
        <span style="text-align:left;">Description: ${ass.Info.Description}</span><span >State: ${ass.State}</span></div>
        ${appBtns}
        </div>
  
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
        
        return theAss
  }

function approveAss(ass){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", `/approve/${ass}`, true);
  
  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  
  xhr.onreadystatechange = function() { // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          // Request finished. Do processing here.
      }
  }
  xhr.send("");
  location.reload()
} 

function denyAss(ass){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", `/deny/${ass}`, true);
  
  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  
  xhr.onreadystatechange = function() { // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          // Request finished. Do processing here.
      }
  }
  xhr.send("");
  location.reload()
}