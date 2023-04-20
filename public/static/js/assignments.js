var cur = 0
var stringToHTML = function (str) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
	return doc.body.getElementsByTagName('*')[0];
};


function next(){
  console.log("next")
  if(cur == 1 && document.getElementById("s1").getElementsByTagName("input")[0].value == "") return
    if(document.getElementById("s"+cur)) document.getElementById("s"+cur).setAttribute("class", "not")
    cur++
    var current = document.getElementById("s"+cur);
    document.getElementById("s"+cur).setAttribute("class", "")
    var x="input"
    if(cur==3) x = "textarea"

    if(cur == 5){
        
        document.getElementById("next").setAttribute("class", "not")
        name = document.getElementById("s1").getElementsByTagName("input")[0].value
        date = document.getElementById("s2").getElementsByTagName("input")[0].value
        description = document.getElementById("s3").getElementsByTagName("textarea")[0].value
        hours = document.getElementById("s4").getElementsByTagName("input")[0].value
        if(hours == "") hours = 1
        a = `<h1>${name}</h1><p class="s3">${description}</p><p>Date: ${date}</p><p>Hours: ${hours}</p>`
        document.getElementById("s5").append(stringToHTML(`<div class="card" id="preview">${a}</div>`))
    }else{

        current.getElementsByTagName(x)[0].addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
              event.preventDefault();
              document.getElementById("next").click()
            }
          });
    }

}  

function prev(){
    if(cur == 1) location.href = "/" 
    if(document.getElementById("s"+cur)) document.getElementById("s"+cur).setAttribute("class", "not")
    cur--
    
    document.getElementById("next").setAttribute("class", "createBtn")
    document.getElementById("s5").setAttribute("class", "not")
    try{document.getElementById("s5").querySelector("#preview").remove()}catch{}
    var current = document.getElementById("s"+cur);
    document.getElementById("s"+cur).setAttribute("class", "")
    // var x="input"
    // if(cur==3) x = "textarea"
    // current.getElementsByTagName(x)[0].addEventListener("keyup", function(event) {
    //     if (event.keyCode === 13) {
    //       event.preventDefault();
    //       document.getElementById("prev").click()
    //     }
    //   });
}

window.onload = () => {
  next()
}