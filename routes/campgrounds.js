var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");


router.get("/",function(req,res){
	
	Campground.find({},function(err,campgrounds){
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/campgrounds",{campgrounds:campgrounds});
		}
	});
	//res.render("campgrounds",{campgrounds:campgrounds});
});

router.post("/",isLoggedIn,function(req,res){
	var name=req.body.name;
	var image=req.body.image;
	var description =req.body.description;
	var author = {
        id: req.user._id,
        username: req.user.username
    }
	var newCampground={name:name,image:image,description:description,author:author};
	Campground.create(newCampground, function(err,newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	});
	// campgrounds.push(newCampground);
	// res.redirect("/campgrounds");
});

router.get("/new",isLoggedIn,function(req,res){
	res.render("campgrounds/new");
	
});

router.get("/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground)
	{
		if(err){
			console.log(error);
		}
		else{
			res.render("campgrounds/show",{campground: foundCampground});
		}
	});
	
});

//EDIT AND UPDATE

router.get("/:id/edit",checkCampgroundOwnership,  function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

router.put("/:id",checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updated){
		if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
	})
});

router.delete("/:id",checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
   });
});
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

 function checkCampgroundOwnership(req, res, next) {
 if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err){
               res.redirect("/campgrounds");
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
                res.send("you donot have permission to do that");
            }
           }
        });
    } else {
        res.send("LOG IN");
    }
}


module.exports = router;