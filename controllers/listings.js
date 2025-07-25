const Listing = require("../models/listing")

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}

module.exports.renderNewForm = (req,res) => {
    
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
            populate: {
                path: "author",
            },
    })
    .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    
    res.render("listings/show.ejs", {listing});
}

// module.exports.createListing = async (req,res,next) => {
//     let url = req.file.path;
//     let filename = req.file.filename;
    
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url,filename};
//     await newListing.save();
//     req.flash("success", "New Listing Created");
//     res.redirect("/listings");
//     // let {title,description,image,price,country,location} = req.body;
    
// }

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const { location } = req.body.listing;

  // 🌍 Geocode the location
  const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
  const data = await geoRes.json();

  let coordinates = [0, 0];
  if (data.length > 0) {
    coordinates = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  // Save coordinates
  newListing.locationCoords = {
    type: "Point",
    coordinates: coordinates
  };

  await newListing.save();
  console.log(newListing);
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};


module.exports.editListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
        // if(!req.body.listing) {
        //     throw new ExpressError(400, "send valid data for listing");
        // }
    let { id } = req.params;
    const listing = await Listing.findById(id);
    
   
    // Merge new data but preserve the existing image object if image field is missing
    if (!req.body.listing.image || typeof req.body.listing.image === "string") {
        req.body.listing.image = listing.image;
    }


    let listings = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listings.image = {url,filename};
        await listings.save();
    }
    

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}

