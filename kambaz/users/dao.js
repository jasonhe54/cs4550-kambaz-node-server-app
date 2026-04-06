import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function UsersDao() {
  // I guess this is implemented later? Why on earth did i even try to work ahead
  const createUser = (user) => {}; 

  const findAllUsers = () => model.find();

  const findUserById = (userId) => model.findById(userId);

  const findUserByUsername = (username) =>
    model.findOne({ username: username });

  const findUserByCredentials = (username, password) =>
    model.findOne({ username, password });

  const updateUser = (userId, userUpdates) => model.updateOne({ _id: userId }, { $set: userUpdates });

  const deleteUser = (userId) => model.deleteOne({ _id: userId });

  return {
    createUser,
    findAllUsers,
    findUserById,
    findUserByUsername,
    findUserByCredentials,
    updateUser,
    deleteUser,
  };
}
