import express from 'express'
import hello from "./hello.js"
import lab5 from "./lab5/index.js";
import cors from "cors";
import db from "./kambaz/database/index.js";
import UserRoutes from "./kambaz/users/routes.js";

const app = express()
app.use(cors());
app.use(express.json());
UserRoutes(app, db);
lab5(app)
hello(app)
app.listen(process.env.PORT || 4000)
