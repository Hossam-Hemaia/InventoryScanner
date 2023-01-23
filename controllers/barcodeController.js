const fs = require("fs");
const path = require("path");
const bwipJs = require("bwip-js");
const PdfKit = require("pdfkit");
const dbConnect = require("../dbConnect/dbConnect");
const utilities = require("../utils/utilities");

exports.postSetPaperSize = async (req, res, next) => {
  const { paperWidth, paperHeight } = req.body;
  try {
    const connection = await dbConnect.getConnection();
    const paperSettings = await connection.execute(
      `SELECT * FROM PAPER_SETTING`
    );
    const convertedSizes = utilities.convertToPostScriptPoint(
      paperWidth,
      paperHeight
    );
    if (paperSettings.rows.length === 0) {
      await connection.execute(`INSERT INTO PAPER_SETTING (WIDTH, HEIGHT) 
      VALUES (${convertedSizes.pageWidth}, ${convertedSizes.pageHeight})`);
      await connection.tpcCommit();
    } else {
      await connection.execute(`UPDATE PAPER_SETTING SET WIDTH = ${convertedSizes.pageWidth},
      HEIGHT = ${convertedSizes.pageHeight}`);
      await connection.tpcCommit();
    }
    return res
      .status(201)
      .json({ success: true, message: "paper size is set successfully" });
  } catch (err) {
    next(err);
  }
};

exports.postGenerateBarcode = async (req, res, next) => {
  const printDetails = req.body.printDetails;
  try {
    const connection = await dbConnect.getConnection();
    paperSettings = await connection.execute(`SELECT * FROM PAPER_SETTING`);
    const pageHeight = paperSettings.rows[0][1];
    const pageWidth = paperSettings.rows[0][2];
    let labels = [];
    for (let print of printDetails) {
      for (let i = 0; i < print.numberOfBarcodes; ++i) {
        let barcodeBuffer = await bwipJs.toBuffer({
          bcid: "code128",
          text: print.assetNumber.toString(),
          scale: 3,
          height: 8,
          includetext: true,
          textxalign: "center",
        });
        labels.push(barcodeBuffer);
      }
    }
    const reportName = "barcodes-" + Date.now() + ".pdf";
    const reportPath = path.join("barcodes", reportName);
    const Doc = new PdfKit({ size: [pageWidth, pageHeight], margin: 1 });
    Doc.pipe(fs.createWriteStream(reportPath));
    Doc.pipe(res);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      'inline; filename="' + reportName + '"'
    );
    labels.forEach((barcodeImage, idx) => {
      Doc.image(barcodeImage, 5, 10, {
        width: 130,
        height: 45,
        align: "center",
      });
      if (idx < labels.length - 1) {
        Doc.addPage();
      }
    });
    Doc.end();
  } catch (err) {
    next(err);
  }
};

exports.postGenBulkBarcode = async (req, res, next) => {
  const printDetails = req.body.printDetails;
  console.log(printDetails);
  try {
    const connection = await dbConnect.getConnection();
    const paperSettings = await connection.execute(
      `SELECT * FROM PAPER_SETTING`
    );
    const pageHeight = paperSettings.rows[0][1];
    const pageWidth = paperSettings.rows[0][2];
    const startBarcode = printDetails.range.from;
    const endBarcode = printDetails.range.to;
    const numberOfBarcode = printDetails.number;
    let labels = [];
    for (let i = startBarcode; i <= endBarcode; ++i) {
      for (let j = 0; j < numberOfBarcode; ++j) {
        let barcodeBuffer = await bwipJs.toBuffer({
          bcid: "code128",
          text: i.toString(),
          scale: 3,
          height: 8,
          includetext: true,
          textxalign: "center",
        });
        labels.push(barcodeBuffer);
      }
    }
    const reportName = "barcodes-" + Date.now() + ".pdf";
    const reportPath = path.join("barcodes", reportName);
    const Doc = new PdfKit({ size: [pageWidth, pageHeight], margin: 1 });
    Doc.pipe(fs.createWriteStream(reportPath));
    Doc.pipe(res);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      'inline; filename="' + reportName + '"'
    );
    console.log(res);
    labels.forEach((barcodeImage, idx) => {
      Doc.image(barcodeImage, 5, 10, {
        width: 130,
        height: 45,
        align: "center",
      });
      if (idx < labels.length - 1) {
        Doc.addPage();
      }
    });
    Doc.end();
  } catch (err) {
    next(err);
  }
};
