const {
  v4: uuidv4
} = require('uuid');
const knex = require('knex');
const express = require('express');
// var path = require("path");
const cors = require('cors');
const xlsx = require('xlsx');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());

const db = knex ({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
});



function addDataToExcel(userData) {
  const wb = xlsx.readFile('./userdata.xlsx');
  const ws = wb.Sheets['userdata'];
  const data = xlsx.utils.sheet_to_json(ws)
  // console.log(ws)
  data.push(userData)
  const newWorkbook = xlsx.utils.book_new();
  const newws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(newWorkbook, newws, "userdata");

  xlsx.writeFile(newWorkbook, "./userdata.xlsx");

}

app.get('/', function (req, res) {
  res.send('successs');
})

app.post('/userdata', function (req, res) {
  try {
    const { name, address, religion, mobile, email, member } = req.body;
    console.log(address)
    db('userdata').insert({
      name: name,
      address: address,
      religion: religion,
      mobile: mobile,
      email: email,
      member: member,
      created: new Date(),
    })
    .then(data => {
      console.log('helo')
      console.log(data)
    })
    // addDataToExcel(userData);
    res.status(200).send({
      isSuccess: true
    })
  } catch (error) {
    res.status(500).send({
      isSuccess: false
    })
  }


})


const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});

// CREATE TABLE userdata(
// 	id serial PRIMARY KEY, 
// 	name VARCHAR(100),
// 	address text,
// 	religion VARCHAR(100),
// 	mobile VARCHAR(100),
// 	email text,
// 	member VARCHAR(100),
// 	created TIMESTAMP
// )
