var stringToHTML = function (str) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
	return doc.body.getElementsByTagName('*')[0];
};

tform = document.querySelector("#tform")

tform.action = `/profile-create/${location.href.split('/').reverse()[0]}`

function makeFileList() {
    var input = document.getElementById("uploadImage");
    var ul = document.getElementById("fileList");

    for (img of input.files) {
        var src = URL.createObjectURL(img);
        console.log(src)
      var li = stringToHTML(`<img src=${src}>`)
      ul.prepend(li);
    }
    
  }