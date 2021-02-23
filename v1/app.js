var express = require("express"),
    app = express(),
    request = require("request"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    SeedDB = require("./seeds"),
    port = 3000;

SeedDB();
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true , useUnifiedTopology: true});
mongoose.set("useFindAndModify" , false);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js")); // redirect bootstrap JS
app.use("/js", express.static(__dirname + "/node_modules/jquery/dist")); // redirect JS jQuery
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css")); // redirect CSS bootstrap
app.set("view engine", "ejs");

// Campground.create({
//   name: "Paddy field",
//   image: "images/img1.jpeg",
//   description: "This is very cool campGround I ever Seen "
// }, function (err, newlyCampground) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Newly Created Campground");
//     console.log(newlyCampground);
//   }
// });

// var campgrounds = [
//   { name: "Paddy field", image: "images/img1.jpeg" },
//   { name: "My Favourite", image: "images/img2.jpeg" },
//   { name: "Hill Camping", image: "images/img3.jpeg" },
// ];

app.get("/", function (req, res) {
  res.render("landing");
});

// Display All Campgrounds on page
app.get("/campgrounds", function (req, res) {
  Campground.find({}, function (err, campgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", { campgrounds: campgrounds });
    }
  });
});

//Show all campgrounds from DB
app.post("/campgrounds", function (req, res) {
  //get data from form
  var name = req.body.name;
  var image = req.body.image;
  var newCampground = { name: name, image: image };
  //add into array
  // campgrounds.push(newCampground);
  //Back to campgrounds Page
  Campground.create(newCampground, function (err, campgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/campgrounds");
    }
  });
});

// Show form for Add new Campground
app.get("/campgrounds/new", function (req, res) {
  res.render("campgrounds/new");
});

//show Single Campground on Page
app.get("/campgrounds/:id", function (req, res) {
  //find the campground through the Id
  Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
    if (err) {
      console.log(err);
    } else {
      //Display single CampGround
      // console.log(foundCampground);
      res.render("campgrounds/show", { campground: foundCampground });
    }
  });
});

//====================================
// COMMENTS ROUTES
//====================================

app.get("/campgrounds/:id/comments/new", function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground ){
    if(err){
      console.log(err);
    } else {
      res.render("comments/new" , {campground: foundCampground});
    }
  });
});

app.post("/campgrounds/:id/comments", function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground){
    if(err){
      console.log(err);
    } else {
      Comment.create(req.body.comment, function(err, newComment){
        if(err){
          console.log(err);
        } else {
          foundCampground.comments.push(newComment);
          foundCampground.save();
          res.redirect("/campgrounds/" + foundCampground._id);
        }
      });
    }
  });
});

app.listen(port, function (req, res) {
  console.log("YelpCamp Server has Started! .. ");
});