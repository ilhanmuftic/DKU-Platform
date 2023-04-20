document.addEventListener("keyup", function(event) {
    if (event.keyCode === 9) {
      document.getElementById("console").focus()
    }
  });


var stringToHTML = function (str) {
var parser = new DOMParser();
var doc = parser.parseFromString(str, 'text/html');
return doc.body.getElementsByTagName('*')[0];
};

const aconsole = document.getElementById("console")

  aconsole.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      executef()
    }
  });
    


    function executef(){

        var command = document.getElementById("console").value

        var cmd = command.split(' ')

        for(i in cmd){
            cmd[i] = cmd[i].replaceAll("*", " ")
        }
       
        if(!localStorage.getItem("prev-queries")){
            localStorage.setItem("prev-queries", command)
        }else{
            localStorage.setItem("prev-queries", localStorage.getItem("prev-queries") + "," + command)
        }


        
        if(cmd[0] == "addStudent"){
            addStudent(cmd[1], cmd[2], cmd[3])
        }else if(cmd[0] == "addUser"){
            addUser(cmd[1], cmd[2], "")
        }else if(cmd[0] == "deleteAssignment"){
            deleteAssignment(cmd[1])
        }else if(cmd[0] == "changePassword"){
            changePassword(cmd[1], cmd[2])
        }else if(cmd[0] == "deleteUser"){
            deleteUser(cmd[1])
        }else if(cmd[0] == "users"){
            location.href="/admin/users"
            return
        }else if(cmd[0] == "logs"){
            location.href="/"
            return
        }else if(cmd[0] == "help"){
            help()
            aconsole.value = ""
            return 
        }else if(cmd[0] == "history"){
            if(cmd[1] == "d"){ 
                localStorage.removeItem("prev-queries")

            }else{
                for(i of localStorage.getItem("prev-queries").split(",")){
                    console.log(i)
                }
            }
            aconsole.value = ""
            return            
        }else if(cmd[0] == "login"){
            location.href = "/login"
            return
        }else if(cmd[0] == "updateAssignment"){
            updateAssignment(cmd[1], cmd[2], cmd[3])
        }else if(cmd[0] == "assignments" || cmd[0] == "ass"){
            location.href = "/admin/assignments"
            return
        }else if(cmd[0] == "students"){
            location.href = "/admin/students"
            return
        }else if(cmd[0] == "updateStudent"){
            updateStudent(cmd[1], cmd[2], cmd[3])
        }else if(cmd[0] == "createAssignment"){
            console.log(cmd)
            cmd[3]=1
            cmd[4]=""
            createAssignment(cmd[1], cmd[2], cmd[3], cmd[4])
            
        }


       

        location.reload()
    }

    function help(){
        console.log(`
        addStudent name class professor (automatically creates a user for the student)
        addUser username type
        deleteAssignment id
        changePassword user password
        deleteUser id
        updateAssignment assignment what value
        updateStudent student what value
        createAssignment name student hours date
        users logs assignments/ass students login
        `)
    }

    function deleteUser(user){
        var xhr = new XMLHttpRequest();
    xhr.open("POST", `/admin/delete-user/${user}`, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
        }
    }
    xhr.send(``);
    }

    function copy(txt){
    navigator.clipboard.writeText(txt);
}



function addStudent(name, c, prof){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/admin/add-student', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
        }
    }
    xhr.send(`name=${name}&class=${c}&prof=${prof}`);
}

function copy(txt){
    navigator.clipboard.writeText(txt);
}

function addUser(username, type, id){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/admin/add-user', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
        }
    }
    xhr.send(`username=${username}&type=${type}&id=${id}`);
}


function createAssignment(name, student, hours, date){
    console.log("aaa", name, student, hours, date)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/create-assignment', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
        }
    }
    xhr.send(`Name=${name}&Student=${student}&Hours=${hours}&Date=${date}`);
}

function createAssignments(info){
    student = info[0]
    ass = info[1]
    c = info[2]
    console.log(student, ass, c)
    if (c==ass.length) return
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/create-assignment', true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("idemo next ", c)
            setTimeout(createAssignments, 3000, [student, ass, c+1])
            

        }
    }

    

    xhr.send(`Name=${ass[0][c]}&Student=${student}&Hours=${ass[1][c]}&Date=${formatDate(ass[2][c])}`);
}


function deleteAssignment(ass){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `/admin/delete-assignment/${ass}`, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
        }
    }
    xhr.send(``);
}

function changePassword(user, pass){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `/admin/change-password/${user}`, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
        }
    }
    xhr.send(`Password=${pass}`);
}

function updateAssignment(id, what, value){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `/admin/update-assignment/${id}`, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
        }
    }
    xhr.send(`What=${what}&Value=${value}`);
}

function updateStudent(id, what, value){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `/admin/update-student/${id}`, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
        }
    }
    xhr.send(`What=${what}&Value=${value}`);
}


function formatDate(date){
    if(date.substr(-1) == ".") date = date.substr(0, date.length-1)
    d = date.replaceAll(".","-")
    d = d.split("-")
    if(d[0].length != 4) d.reverse()
    d=d.join("-")
    return d
}
