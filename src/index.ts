import express from "express";
import InfoRouter from "./routes/getInfo.routes";
import authRouter from "./routes/user.routes";

const app = express();

app.use(express.json());

app.use("/api", authRouter, InfoRouter);

app.listen(3000, () => {
  console.log("App listening on port 3000!");
});
