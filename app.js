const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const compression = require("compression");
const cors = require("cors-express");
const multer = require("multer");

const dbConnect = require("./dbConnect/dbConnect");
const authRouter = require("./routes/auth");
const inventoryRouter = require("./routes/inventory");
const barcodeRouter = require("./routes/barcodeGenerator");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(compression());

app.use(multer({ storage: storage }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

const initDataBaseConnection = async () => {
  await dbConnect.init();
};
initDataBaseConnection();

app.use(process.env.API, authRouter);
app.use(process.env.API, inventoryRouter);
app.use(process.env.API, barcodeRouter);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  console.log(error);
  res.status(status).json({ success: false, message: message });
});

app.listen(process.env.PORT, "localhost", () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
