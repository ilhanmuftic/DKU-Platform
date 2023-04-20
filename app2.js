const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var session = require('express-session');
const path = require('path');
const { Users, Students, Assignments, Logs } = require('./models')
const { v4: uuidv4 } = require('uuid');
const { copyFileSync } = require('fs');
const req = require('express/lib/request');

const PORT = 80

// Connecting to MongoDB database
mongoose.connect("mongodb://ilhan:12345678@localhost:27017/dku?authSource=admin")

mongoose.connection.once("open", () => {
  console.log("Connected to database")
}).on("error", err => {
  console.log(err)
})

// Router setup
/* #region  Router setup */
app.use(express.static(path.join("public", "static")))
app.set('trust proxy', 1)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'dku', resave: false, saveUninitialized: true }))
/* #endregion */

app.get('/', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect("/login")
  } else {
    res.sendFile(path.join(__dirname, "public", `${req.session.Type}.html`))
  }
})


// Login

/* #region  Login */
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "static", "login.html"));
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;


  // Login info db check
  if (username && password) {
    Users.find({ Username: username, Password: password }, (err, results) => {
      if (err) {
        console.log(err)
        return
      }

      if (results.length > 0) {
        info = results[0]
        req.session.loggedin = true;
        req.session.Id = info.Id
        req.session.Type = info.Type
        res.redirect(`/`);
      } else {
        res.redirect('/login')
      }
    })
  } else {
    res.redirect("/login")
  }
})
/* #endregion */

// Student

/* #region  Students */
app.get('/get-assignments', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "Student") return
  Assignments.find({ $or:[{"Student": req.session.Id}, {"Info.Participants": req.session.Id}] }).sort({ "Info.Date": -1 }).exec((err, results) => {
    if (err) {
      console.log(err)
      return
    }

    res.send(results)
  })
})

app.get("/assignments", (req, res) => {
  if (!req.session.loggedin || req.session.Type != "Student") {
    res.redirect("/login")
  } else {
    res.sendFile(path.join(__dirname, "public", "assignments.html"))
  }
})

app.post('/create-assignment', (req, res) => {
  if (!req.session.loggedin || (req.session.Type != "Student" && req.session.Type != "ADMIN")) return
  var date = req.body.Date
  var hours = req.body.Hours;
  if (!date || date == "" || date == {} || date == "{}") {
    date = new Date().toISOString().slice(0, 10)
  }

  if (hours == 0 || !hours) hours = 1;
  var stu = req.session.Id
  var des = req.body.Description
  if (!des) des = ""
  if (req.session.Type == "ADMIN") stu = req.body.Student
  const ass = { Id: uuidv4(), Name: req.body.Name, Hours: hours, State: "Pending", Info: { Description: des, Date: date }, Student: stu }
  Assignments.insertMany([ass], (err) => {
    if (err) { console.log(err); return }
    log(req.session.Id, req.originalUrl)
  })

  if (req.session.Type == "Student") {
    res.redirect('/')
  } else {
    res.send("Ok")
  }
})

// Profile

app.get('/profile/:ass', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "Student") {res.redirect("/login");return;}
  Assignments.find({ Id: req.params.ass }, (err, results) => {
    if(err) {
      console.log(err)
      return
    }
    if(results.length == 0) {
      res.redirect('/')
      return 
    }

    res.sendFile(path.join(__dirname, "public", "profile.html"))
  })
})


app.get('/profile-info/:ass', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "Student") {res.redirect("/login");return;}
  Assignments.find({ Id: req.params.ass }, (err, results) => {
    if(err) {
      console.log(err)
      return
    }
    if(results.length == 0) {
      res.redirect('/')
      return 
    }

    res.send({Img: results[0].Info.Image, Des: results[0].Info.Description, Name: results[0].Name})
  })
})

app.post('/profile-create/:ass', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "Student") {res.redirect("/login");return;}
  Assignments.updateMany({Id:req.params.ass}, {$set:{"Info.Description":req.body.Des, "Info.Image":req.body.Img}}, (err) => {
    if(err){
      console.log(err)
      return
    }
  })
  res.redirect(`/profile/${req.params.ass}`)
})

/* #endregion */


// Professor

/* #region  Professor */
app.get('/get-students', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "Professor") return

  Students.aggregate([{ $lookup: { from: "assignments", localField: 'Id', foreignField: "Student", as: "Assignments" }}, {$sort:{"Class":-1, "Name":1, "Assignments.Info.Date":1}} ], (err, results) => {
    var theresults = []
    for (i of results) {
      if (i.Professor == req.session.Id) {
        theresults.push(i)
      }
    }
    res.send(theresults)
  })

})



app.post('/approve/:id', (req, res) => {
  console.log("aaa")
  if (!req.session.loggedin || req.session.Type != "Professor") return
  
  Assignments.find({ Id: req.params.id }, (err, resultsa) => {
    console.log(resultsa)
    if (resultsa.length > 0) {
      if (resultsa[0].State != "Pending") return
      Students.find({ Id: resultsa[0].Student }, (err, results) => {
        if (results[0].Professor == req.session.Id) {
          Assignments.updateOne({ Id: req.params.id }, { $set: { "State": "Approved" } }, (err) => {
            if (err) console.log(err)
          })

          Students.updateOne({ Id: results[0].Id }, { $inc: { "Hours": resultsa[0].Hours } }, (err) => {
            if (err) console.log(err)
            log(req.session.Id, req.originalUrl)
            res.redirect('/')
          })
        }
      })
    }
  })

})

app.post('/deny/:id', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "Professor") return
  Assignments.find({ Id: req.params.id }, (err, resultsa) => {
    if (resultsa.length > 0) {
      if (resultsa[0].State != "Pending") return
      Students.find({ Id: resultsa[0].Student }, (err, results) => {
        if (results[0].Professor == req.session.Id) {
          Assignments.updateOne({ Id: req.params.id }, { $set: { "State": "Denied" } }, (err) => {
            if (err) console.log(err)
            log(req.session.Id, req.originalUrl)
            res.redirect('/')
          })
        }
      })
    }
  })

})

app.post('/change-hours/:student/:hours', (req, res) => {
  if (!req.session.loggedin || (req.session.Type != "Professor" && req.session.Type != "ADMIN")) return
  Students.find({ Id: req.params.student }, (err, results) => {
    if (results[0].Professor == req.session.Id || req.session.Type == "Admin") {
      Students.updateOne({ Id: req.params.student }, { $inc: { "Hours": req.params.hours } }, (err) => {
        if (err) console.log(err)
        log(req.session.Id, req.originalUrl)
      })
    }
  })
})

/* #endregion */


// ADMIN

/* #region   ADMIN*/
app.get("/admin/get-logs", (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  Logs.find({}).sort({ Time: -1 }).exec((err, results) => {
    if (err) console.log(err)
    res.send(results)
  })
})

app.get("/admin/get-users", (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  Users.find({}).sort({ Type: 1 }).exec((err, results) => {
    if (err) console.log(err)
    res.send(results)
  })
})

app.get("/admin/get-assignments", (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  Assignments.find({}).sort({ Student: 1, "Info.Date": -1 }).exec((err, results) => {
    if (err) console.log(err)
    res.send(results)
  })
})

app.get("/admin/get-students", (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  Students.find({}).sort({ Class: 1, Name: 1 }).exec((err, results) => {
    if (err) console.log(err)
    res.send(results)
  })
})

app.get("/admin/users", (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") {
    res.redirect("/login")
    return
  }
  res.sendFile(path.join(__dirname, 'public', "users.html"))
})

app.get("/admin/assignments", (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") {
    res.redirect("/login")
    return
  }
  res.sendFile(path.join(__dirname, 'public', "adminass.html"))
})

app.get("/admin/students", (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") {
    res.redirect("/login")
    return
  }
  res.sendFile(path.join(__dirname, 'public', "adminstu.html"))
})

app.post('/admin/add-user', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  generateUser(req.body.username, req.body.type, req.body.id)

})


app.post('/admin/change-password/:user', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  Users.updateOne({ "Id": req.params.user }, { $set: { "Password": req.body.Password } }, (err) => {
    if (err) console.log(err)
    log(req.session.Id, req.originalUrl)
  })
})


app.post('/admin/update-student/:id', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  if (req.body.What != "Class" && req.body.What != "Professor" && req.body.What != "Hours") return
  const change = {}
  change[req.body.What] = req.body.Value
  Students.updateMany({ "Id": req.params.id }, { $set: change }, (err) => {
    if (err) console.log(err)
    log(req.session.Id, req.originalUrl)
  })
})

app.post('/admin/update-assignment/:id', (req, res) => {
  
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  if (req.body.What != "Name" && req.body.What != "Description" && req.body.What != "_id" && req.body.What != "Info.Description" && req.body.What != "Hours" && req.body.What != "Date" && req.body.What != "Info.Date" && req.body.What != "Student" && req.body.What != "State") return
  var what = req.body.What
  if (what == "Description") what = "Info.Description"
  if (what == "Date") what = "Info.Date"
  if (what == "State" && (req.body.Value != "Approved" && req.body.Value != "Denied" && req.body.Value != "Pending")) return
  const change = {}
  change[what] = req.body.Value
  Assignments.updateMany({ "Id": req.params.id }, { $set: change }, (err) => {
    if (err) console.log(err)
    log(req.session.Id, req.originalUrl)
  })
})

app.post('/admin/add-student', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  generateStudent(req.body.name, req.body.class, req.body.prof)
})

app.post('/admin/delete-assignment/:id', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  Assignments.deleteOne({ Id: req.params.id }, (err) => {
    if (err) console.log(err)
    log(req.session.Id, req.originalUrl)
  })
})

app.post('/admin/delete-user/:id', (req, res) => {
  if (!req.session.loggedin || req.session.Type != "ADMIN") return
  log(req.session.Id, req.originalUrl)
  Users.deleteOne({ Id: req.params.id }, (err) => {
    if (err) console.log(err)

  })
})

/* #endregion */


app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`)
})

function generateStudent(name, c, prof) {
  student = { Id: uuidv4(), Name: name, Hours: 0, Class: c, Professor: prof }
  console.log(student)
  Students.insertMany(student, (err) => {
    if (err) {
      console.log(err)
      return false
    }
  })
  return generateUser(name, "Student", student.Id)
}

function generateUser(username, type, id) {
  if (id == '') id = uuidv4()
  user = { Id: id, Username: username, Password: uuidv4().substring(0, 6), Type: type }
  console.log(user)
  Users.insertMany(user, (err) => {
    if (err) {
      console.log(err)
      return false
    }
    return true
  })
}

function log(user, action) {
  try {
    Users.find({ Id: user }, (err, results) => {
      if (err) console.log(err)
      var time = new Date().toISOString().substring(0, 16).replace("T", " ")
      console.log(`{User: ${user}, Name: ${results[0].Username}, Action:${action}, Time:${time}}`)
      Logs.insertMany({ User: user, Name: results[0].Username, Action: action, Time: time }, (err) => {
        if (err) console.log(err)
      })
    })

  } catch { console.log("Error Logging") }

}

//one time funcs

// app.post('/api/images', parser.single("image"), (req, res) => {
//   console.log(req.file) // to see what is returned to you
//   const image = {};
//   image.url = req.file.url;
//   image.id = req.file.public_id;
//   Image.create(image) // save image information in database
//     .then(newImage => res.json(newImage))
//     .catch(err => console.log(err));
// });