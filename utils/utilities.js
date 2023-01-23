exports.convertToPostScriptPoint = (paperWidth, paperHeight) => {
  const postScriptPoint = 28.346456693;
  const pageWidth = (paperWidth * postScriptPoint).toFixed(2);
  const pageHeight = (paperHeight * postScriptPoint).toFixed(2);
  return { pageWidth, pageHeight };
};
