const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");

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
const getPlaceById = (req, res, next) => {
  console.log("Get method received");
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    throw new HttpError("Could not find the place for the provided id.", 404);

    // const error = new Error("Could not find the place for the provided id.");
    // error.code = 404;
    // throw error;

    // return res.status(404).json({message:'This place is not available'})
  }
  res.json({ place }); // {place} => {place : place}
};

const getPlacesByUserId = (req, res, next) => {
  console.log("hello from user routes");
  const userId = req.params.uid;
  console.log(userId);
  const places = DUMMY_PLACES.filter((p) => {
    return p.creatorId === userId;
  });
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
  res.json({ places });
};

const createPlace = (req, res, next) => {
  const { id, title, description, location, address, creatorId } = req.body; // title = req.body.title

  const createdPlace = {
    id: uuidv4(),
    title: title,
    description: description,
    location: location,
    address: address,
    creatorId: creatorId,
  };
  DUMMY_PLACES.push(createdPlace);
  console.log(DUMMY_PLACES);

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const { title, description, location, address } = req.body; // title = req.body.title
  const placeId = req.params.pid;
  const updatePlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const updatePlaceIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatePlace.title = title;
  updatePlace.description = description;
  updatePlace.address = address;
  // TODO : add functionality to update location
  DUMMY_PLACES[updatePlaceIndex] = updatePlace;
  res.status(201).json({ place: updatePlace });
  console.log(DUMMY_PLACES);
};
const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json(DUMMY_PLACES);
};
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
