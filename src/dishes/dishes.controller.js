// eslint-disable-next-line strict
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

const list = (req, res, next) => {
  res.json({ data: dishes });
};

const create = (req, res, next) => {
  const id = nextId();
  const {price} = res.locals.validDish.data
  const newDish = { ...res.locals.validDish.data, id, price: Number(price) };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

const isValid = (req, res, next) => {
  const {
    data: { name, description, image_url, price },
  } = req.body;
  if (isNaN(price) || price <= 0)
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  const requiredFields = ["name", "description", "image_url", "price"];
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({ status: 400, message: `Dish must include a ${field}` });
    }
  }
  res.locals.validDish = req.body;
  next();
};

const read = (req, res, next) => {
  res.json({ data: res.locals.dish });
};

const isFound = (req, res, next) => {
  const found = dishes.find((dish) => dish.id === req.params.dishId);
  if (!found) return next({ status: 404, message: "No matching dish found" });
  res.locals.dish = found;
  next();
};

const update = (req, res, next) => {
  let index = dishes.indexOf(res.locals.dish);
  if (req.body.data.id && req.body.data.id !== dishes[index].id)
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${dishes[index].id}`,
    });
  if (typeof dishes[index].price !== "number")
    return next({ status: 400, message: "price is not a number" });
  dishes[index] = { ...req.body.data, id: dishes[index].id };
  res.json({ data: dishes[index] });
};

module.exports = {
  list,
  create: [isValid, create],
  read: [isFound, read],
  update: [isFound, isValid, update],
};
