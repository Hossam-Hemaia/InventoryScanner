const jwt = require("jsonwebtoken");
const dbConnect = require("../dbConnect/dbConnect");

exports.postUserLogin = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const connection = await dbConnect.getConnection();
    const user = await connection.execute(
      `SELECT * FROM USERS WHERE USER_NAME = '${userName}'`
    );
    if (!user) {
      throw new Error("Invalid user name");
    }
    const doMatch = user.rows[0][3] == password ? true : false;
    if (!doMatch) {
      throw new Error("Invalid password");
    }
    if (user.rows[0][4] !== "Y") {
      throw new Error("User is not Authorized");
    }
    res.status(201).json({ success: true, message: "Logged in successfully" });
  } catch (err) {
    next(err);
  }
};
