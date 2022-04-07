const {
  v4: uuidv4
} = require('uuid');
const express = require('express');
var path = require("path");
const cors = require('cors');
// const ExcelJS = require('exceljs');
const xlsx = require('xlsx');
const app = express();

app.use(express.json());
// app.use(router);
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());

function addDataToExcel(userData) {
  // console.log(userData)
  const wb = xlsx.readFile('./assets/userdata.xlsx');
  const ws = wb.Sheets['userdata'];
  const data = xlsx.utils.sheet_to_json(ws)
  // console.log(ws)
  data.push(userData)
  // console.log(data)
  const newWorkbook = xlsx.utils.book_new();
  const newws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(newWorkbook, newws, "userdata");

  xlsx.writeFile(newWorkbook, "./assets/userdata.xlsx");

}

app.get('/', function (req, res) {
  res.send('successs');
})

app.post('/emaildata', function (req, res) {
  try {
    const userData = req.body.jsonFormData;
    // console.log(userData)
    addDataToExcel(userData);
    res.status(200).send({
      isSuccess: true
    })
  } catch (error) {
    console.log('error is happened')
    // console.error(error);
    res.status(500).send({
      isSuccess: false
    })
  }


})


const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});