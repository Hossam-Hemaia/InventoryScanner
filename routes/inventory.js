const express = require("express");
const inventoryController = require("../controllers/inventoryController");

const router = express.Router();

router.get("/asset/details", inventoryController.getAssetDetails);

router.post("/create/asset", inventoryController.postCreateAsset);

router.post("/update/asset", inventoryController.postUpdateAsset);

router.get("/locations", inventoryController.getLocations);

router.get("/employees", inventoryController.getEmployees);

module.exports = router;
