const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");

// Generate a v4 UUID
const newUUID = uuidv4();

let DUMMY_PLACES = [
  {
    id: "p1",
    imageUrl:
      "https://images.livemint.com/rf/Image-621x414/LiveMint/Period2/2018/11/02/Photos/Processed/statue_of_unity_sardar_patel-U205730969126CB--621x414@LiveMint.jpg",
    title: "Statue of Unity",
    description: "Tallest Building in the world",
    address: "Navagam, India(IN)",
    creatorId: "u1",
    location: { lat: 21.838031685449245, lng: 73.71911602170074 },
  },
  {
    id: "p2",
    imageUrl:
      "https://fastread.in/images/uploads/Galteshwar-Mahadev-Temple.jpg ",
    title: "Galteshwar Mahadev Temple",
    description: "Temple of Lord Shiva",
    address: "Surat, Gujarat, India(IN)",
    creatorId: "u2",
    location: { lat: 21.28072235129267, lng: 73.08025617066227 },
  },
];

//function to get places by using it's id
const getPlaceById = async (req, res, next) => {
  console.log("Get method received");
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong could not find the place", 500)
    );
  }
  if (!place) {
    const error = new HttpError(
      "Could not find the place for the provided id.",
      404
    );
    return next(error);
    // const error = new Error("Could not find the place for the provided id.");
    // error.code = 404;
    // throw error;

    // return res.status(404).json({message:'This place is not available'})
  }
  res.json({ place: place.toObject({ getters: true }) }); // {place} => {place : place}
};

const getPlacesByUserId = async (req, res, next) => {
  console.log("hello from user getPlacesByUserId");
  const userId = req.params.uid;
  console.log(userId);
  // we can also do this by using populate the places of user by using it's user id
  let places;
  try {
    places = await Place.find({ creatorId: userId });
    console.log(places);
  } catch (e) {
    console.log(e);
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could find the places for the provided user id.", 404)
    );
    // const error = new Error("Could find the place for the provided user id.");
    // error.code = 404;

    //     return res
    //       .status(404)
    //       .json({ message: "Place of this user is not available" });
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
    // places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input passes, please check your data", 422)
    );
  }
  const { title, description, address } = req.body; // title = req.body.title

  try {
    location = getCoordsForAddress(address);
  } catch (error) {
    return next();
  }
  // const location = {
  //   lat: 21.28072235129267, // Your hardcoded latitude value
  //   lng: 73.08025617066227, // Your hardcoded longitude value
  // };

  const createdPlace = new Place({
    title,
    description,
    address,
    location,
    image: req.file.path,
    creatorId:req.userData.userId,
  });
  let user;
  // console.log(creatorId);
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    console.log(error);
    return next(
      new HttpError(
        "Creating place failed (user not found), Please try again letter",
        500
      )
    );
  }
  if (!user) {
    return next(new HttpError("Could not find the user for provided id", 404));
  }
  console.log(user);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log("ERROR : ", error);
    const err = new HttpError("Creating place failed, please try again", 500);
    return next(err);
  }
  console.log(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("error from update place", errors);
    return next(
      new HttpError("Invalid input passes, please check your data", 422)
    );
  }
  const { title, description } = req.body; // title = req.body.title
  const placeId = req.params.pid;

  console.log("from Update Place");
  console.log(req.body);

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong could not find the place", 500)
    );
  }
  if (place.creatorId.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place", 401));
  }
  let updatedPlace;

  try {
    updatedPlace = await Place.findOneAndUpdate(
      { _id: placeId },
      { title, description },
      { new: true } // To return the updated document
    );
  } catch (e) {
    return next(
      new HttpError("Something went wrong, could not update place", 500)
    );
  }

  console.log(updatePlace);
  let newPlace;
  try {
    newPlace = await Place.findById(placeId);
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong could not find the place", 500)
    );
  }
  res.status(200).json({ place: newPlace.toObject({ getters: true }) });
};
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creatorId");
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong could find the place", 500)
    );
  }
  if (!place) {
    return next(new HttpError("Could not find place for this ID", 404));
  }
  // console.log(place.creatorId.id.toString()+"hello above is creator\n"+req.userData.userId)
  if (place.creatorId.id.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place", 401));
  }
  const imagePath = place.image;
  try {
    const session = await mongoose.startSession();
    await session.startTransaction();
    await Place.findByIdAndRemove(placeId, session);
    place.creatorId.places.pull(place);
    await place.creatorId.save({ session });
    await session.commitTransaction();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something wrong during deletion", 500));
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ message: "Sucessfully message got deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
