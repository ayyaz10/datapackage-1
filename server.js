

const validator = require('validator');
// const {check, validationResult} = reqire('express-validator');
const moment = require('moment');
const {google} = require('googleapis');
const knex = require('knex');
const express = require('express');
// var path = require("path");
const cors = require('cors');
const xlsx = require('xlsx');
const app = express();


app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));




app.get('/', async function (req, res) {
  res.send('working')
 
  // Get metadata about apreadsheet
  // const metaData = await googleSheets.spreadsheets.get({
  //   auth,
  //   spreadsheetId
  // })


  // // Read rows from spreadsheet
  // const getRows = await googleSheets.spreadsheets.values.get({
  //   auth, 
  //   spreadsheetId,
  //   range: "Sheet1"
  // })

  // res.send(getRows.data);
})



const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});

// CREATE TABLE sfc_kh4fm_userdata(
//  id serial PRIMARY KEY, 
//  name VARCHAR(100),
//  address text,
//  religion VARCHAR(100),
//  mobile VARCHAR(100),
//  email text,
//  member VARCHAR(100),
//  created TIMESTAMP
// )


// CREATE TABLE data_collection(
//  id serial PRIMARY KEY, 
//  name VARCHAR(100),
//  address text,
//  religion VARCHAR(100),
//  mobile VARCHAR(100),
//  email text,
//  member VARCHAR(100),
//  created TIMESTAMP
// )


// CREATE TABLE pk_userdata(
//  id serial PRIMARY KEY,
//  voter_id text,
//  name VARCHAR(100),
//  mobile VARCHAR(100),
//  email text,
//  created TIMESTAMP
// )


// CREATE TABLE num_to_add(
//  id serial PRIMARY KEY,
//  number VARCHAR(100),
// )
