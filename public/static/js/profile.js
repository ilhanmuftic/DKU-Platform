const selekt = document.getElementById('0')

var stringToHTML = function (str) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
	return doc.body.getElementsByTagName('*')[0];
};

tform = document.querySelector("#tform")

tform.action = `/profile-create/${location.href.split('/').reverse()[0]}`


r = new Request(`/profile-info/${location.href.split('/').reverse()[0]}`)

fetch(r).then(re=>{re.json().then(data=>{configData(data)})})

r = new Request(`/get-colleagues`)

fetch(r).then(re=>{re.json().then(data=>{participants(data.Colleagues)})})

function configData(data){
    if(data.Img == undefined) data.Img = "/data/ass-default.png"
    document.querySelector("#preview").src = data.Img
    document.querySelector("#des").value = data.Des
    document.querySelector("#name").innerText = data.Name
    document.querySelector("#image").value = data.Img
    var ParticipantsContainer = document.querySelector('#all-participants')
    for(part in data.Participants){
        ParticipantsContainer.append(createParticipant(part))
    }
}

function createParticipant(info){
    var participant = stringToHTML(`<div id=${info.Id} class="student-all" >
        <div class="student"><span style="width:30%;text-align:left;margin-right:20%;">${ass.Name}</span> <button onclick="location.href='/profile/${ass.Id}'" class="viewbtn">View Profile</button></div>
        </div>`)        

        return participant
}

function changeImg(){
    img = document.querySelector("#uploadImage").files[0]
    var src = URL.createObjectURL(img);
    console.log(src)
    document.querySelector("#preview").src = src
    document.querySelector("#preview").onload = ()=>{
        convImg()
    }
    
}

function convImg(){
    var canvas = document.getElementById("canvas");

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var img = document.querySelector("#preview")
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log(img.src)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    imgUrl = canvas.toDataURL()
    document.querySelector("#image").value = imgUrl
}

function participants(part){
    
    for(p of part){
        addPart(p)
    }
}

function addPart(p){
    selekt.append(stringToHTML(`<option id="${p.Id}" onclick="selectParticipant('${p.Id}')">${p.Name}</option>`))
}

function selectParticipant(p){
    document.getElementById(p).className = "clicked"
}