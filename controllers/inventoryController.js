const dbConnect = require("../dbConnect/dbConnect");

exports.getAssetDetails = async (req, res, next) => {
  const assetNumber = req.query.assetNumber;
  try {
    const connection = await dbConnect.getConnection();
    const asset = await connection.execute(
      `SELECT ASSET_NUMBER, DESCRIPTION, CAT_MAJOR, SERIAL_NUMBER, PLATE_NUMBER,
      LOCATION, SUB_INVENTORY, EMP_NUMBER, EMP_NAME, ASSIGN_FROM_DATE, LAST_UPDATE_DATE, QTY,
      URL_IMG, PRODUCTION_LINE, NOTES FROM XXASSET_TRANSACTIONS WHERE ASSET_NUMBER = ${assetNumber}`
    );
    if (asset.rows.length === 0) {
      return res
        .status(422)
        .json({ success: false, message: "Asset does not exist!" });
    }
    res.status(200).json({ success: true, asset: asset });
  } catch (err) {
    next(err);
  }
};

exports.postCreateAsset = async (req, res, next) => {
  const {
    transactionId,
    assetNumber,
    assetName,
    assetCategory,
    serial,
    plateNumber,
    location,
    inventory,
    assignToEmployee,
    assignFromDate,
    transactionQuantity,
  } = req.body;
  try {
    const connection = await dbConnect.getConnection();
    await connection.execute(
      `INSERT INTO XXASSET_TRANSACTIONS (TRANSACTION_ID, ASSET_NUMBER, DESCRIPTION, CAT_MAJOR,
       SERIAL_NUMBER, PLATE_NUMBER, LOCATION, SUB_INVENTORY, EMP_NUMBER, ASSIGN_FROM_DATE, QTY)
       VALUES (${transactionId}, ${assetNumber}, ${assetName}, ${assetCategory}, ${serial},
       ${plateNumber} ,${location} , ${inventory}, ${assignToEmployee}, ${assignFromDate},
       ${transactionQuantity})`
    );
    res.status(201).json({ success: true, message: "Record Created!" });
  } catch (err) {
    next(err);
  }
};

exports.putUpdateAsset = async (req, res, next) => {
  const {
    assetNumber,
    location,
    inventory,
    employeeNumber,
    employeeName,
    assignFromDate,
    quantity,
    productionLine,
    notes,
  } = req.body;
  const image = req.file;
  try {
    const connection = await dbConnect.getConnection();
    if (image) {
      const imagePath = `${req.protocol}s://${req.hostname}/${image.path}`;
      const date = new Date(assignFromDate).toLocaleDateString();
      await connection.execute(
        `INSERT INTO XXASSET_TRANSACTIONS (LOCATION, SUB_INVENTORY, EMP_NUMBER, EMP_NAME, ASSIGN_FROM_DATE,
         QTY, URL_IMG, PRODUCTION_LINE, NOTES, ASSET_NUMBER) VALUES('${location}', '${inventory}',
         '${employeeNumber}', '${employeeName}', '${date}', '${quantity}', '${imagePath}', '${productionLine}',
         '${notes}', ${assetNumber})`
      );
      await connection.tpcCommit();
      const transactionId = await connection.execute(
        `SELECT TRANSACTION_ID FROM XXASSET_TRANSACTIONS WHERE ASSET_NUMBER = ${assetNumber}`
      );
      return res.status(201).json({
        success: true,
        transactionId: transactionId.rows[0][0],
        message: "Asset Record Updated",
      });
    } else {
      const date = new Date(assignFromDate).toLocaleDateString();
      await connection.execute(
        `INSERT INTO XXASSET_TRANSACTIONS (LOCATION, SUB_INVENTORY, EMP_NUMBER, EMP_NAME, ASSIGN_FROM_DATE,
        QTY, URL_IMG, PRODUCTION_LINE, NOTES, ASSET_NUMBER) VALUES('${location}', '${inventory}',
        '${employeeNumber}', '${employeeName}', '${date}', '${quantity}', '${imagePath}', '${productionLine}',
        '${notes}', ${assetNumber})`
      );
      await connection.tpcCommit();
      const transactionId = await connection.execute(
        `SELECT TRANSACTION_ID FROM XXASSET_TRANSACTIONS WHERE ASSET_NUMBER = ${assetNumber}`
      );
      return res.status(201).json({
        success: true,
        transactionId: transactionId.rows[0][0],
        message: "Asset Record Updated",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getLocations = async (req, res, next) => {
  const searchTerm = req.query.searchTerm.toUpperCase();
  const username = req.query.username;
  try {
    const connection = await dbConnect.getConnection();
    const locations = await connection.execute(
      `SELECT * FROM XX_ASSET_LOCATION a , LOCATION_ROLL b  where a.LOCATION_ID = b.LOCATION
       and upper(b.user_id) = upper('${username}') and  upper(a.LOCATION) LIKE '%${searchTerm}%'
      OR upper(a.CITY) LIKE '%${searchTerm}%' OR upper(a.DEPT) LIKE '%${searchTerm}%'`
    );
    res.status(200).json({ success: true, locations: locations });
  } catch (err) {
    next(err);
  }
};

exports.getEmployees = async (req, res, next) => {
  const searchTerm = req.query.searchTerm.toUpperCase();
  try {
    const connection = await dbConnect.getConnection();
    const employees = await connection.execute(`
      SELECT * FROM XXASSET_EMP_V WHERE upper(EMPLOYEE_NUMBER) LIKE '%${searchTerm}%'
      OR upper(EMPLOYEE_NAME) LIKE '%${searchTerm}%'
    `);
    res.status(200).json({
      success: true,
      employees: employees,
    });
  } catch (err) {
    next(err);
  }
};
