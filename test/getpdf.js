console.log("file is ready");
const getpdffile = async () => {
  const data = JSON.stringify({
    printDetails: {
      range: {
        from: 10066500,
        to: 10067000,
      },
      number: 1,
    },
  });
  const response = await fetch("http://localhost:5500/api/v1/generate/range", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const resJson = await response.json();
  console.log(resJson);
  if (resJson.barcodes) {
    setTimeout(() => {
      const newWin = window.open(resJson.barcodes, "_blank");
      newWin.focus();
    }, 2000);
  }
  // .then((res) => {
  //   return res.json();
  // })
  // .then((resData) => {
  //   console.log(resData);
  //   window.location.replace(resData.barcodes);
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
};

const getpdfBtn = document.getElementById("getpdf");

if (getpdfBtn) {
  getpdfBtn.addEventListener("click", () => {
    getpdffile();
  });
}
