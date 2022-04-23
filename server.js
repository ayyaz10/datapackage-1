const validator = require('validator');
// const moment = require('moment');
// const {google} = require('googleapis');
const knex = require('knex');
const express = require('express');
const cors = require('cors');
// const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = knex ({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }
});

app.get('/', async function (req, res) {
  res.send('working')
})

app.post('/sfjkhuserdata', cors({origin: "*"}), async function (req, res) {
  console.log(req.body)
  const { name, address, mobile, email, tlamount, nameofbank } = req.body;

  try {
    if(!validator.isMobilePhone(mobile)) {
      res.send({
        isSuccess: false,
        msg: "Please enter a valid Mobile Number"
      })
      return
    }
    if(!validator.isEmail(email)) {
      res.send({
        isSuccess: false,
        msg: "Please enter a valid Email Address"
      })
      return
    }

    if(!validator.isEmpty(address) && !validator.isEmpty(mobile) && !validator.isEmpty(email) && !validator.isEmpty(tlamount) && !validator.isEmpty(nameofbank)) {
      db('sfj_kh4fm_userdata').insert({
        name,
        address,
        mobile,
        email,
        tlamount,
        nameofbank,
        created: new Date(),
      })
      .then(data => {
        // console.log(data)
        res.status(200).send({
          isSuccess: true
        })
      })
    } else {
      res.send({
        isSuccess: false,
        msg: "Please fill the empty fields"
      })
    }
  } catch (error) {
    res.status(500).send({
      isSuccess: false
    })
  }
})

// Voter website router /voterdata
function assignVoterId(id, numToAdd) {
  const obj = {};
  function addZeros(preZeroId) {
    let zeroAddedId;
    if (preZeroId <= 9) {
      zeroAddedId = `0000${preZeroId}`;
    }else if (preZeroId > 9 && preZeroId <= 99) {
      zeroAddedId = `000${preZeroId}`;
    } else if (preZeroId > 99 && preZeroId <= 999) {
      zeroAddedId = `00${preZeroId}`;
    } else if (preZeroId > 999 && preZeroId <= 9999) {
      zeroAddedId = `0${preZeroId}`;
    } else {
      zeroAddedId = `${preZeroId}`;
    }
     obj.id = zeroAddedId;
  }
    if (id) {
      if (numToAdd === 3) {
        
        id = id + numToAdd;
        addZeros(id);
        numToAdd = 5;
    
      } else if (numToAdd === 5) {
        id = id + numToAdd;
        addZeros(id);
        numToAdd = 7;
    
      } else {
        id = id + numToAdd;
        addZeros(id);
        numToAdd = 3;
    
      }
    } else {
      id = 1;
      addZeros(id);
      numToAdd = 3;
  
    }
    // obj.id = id;
    obj.numToAdd = numToAdd;
    return obj;
  
  }
  
  async function insertNumToAdd(number) {
    const dbNumToAdd = await getDbNumToAdd();
    if(typeof dbNumToAdd == 'undefined') {
      const dbNum = db('num_to_add').insert({
        number
       })
      return dbNum;
    } else {
      const res = await db('num_to_add').update({number});
      // console.log(res)
    }
  }   
  
  async function getDbVoterId() {
     const dbData = await db.select().from('pk_userdata').orderBy([{column:"id",order:"desc"}]).limit(1)
     if(dbData.length < 1) {
      return;
     }
     return dbData[0].voter_id;
  }
  // HAVING ISSUE WITH 9
  async function getDbNumToAdd() {
     const dbNumToAdd = await db.select("number").table('num_to_add');
     if(dbNumToAdd.length < 1) {
      return;
     } 
       return dbNumToAdd[0].number;
  }
  
  app.post('/voterdata', cors({origin: "*"}), async function(req, res) {
    const { name, mobile, email } = req.body;
    const dbVoterId = await getDbVoterId();
    const dbNumToAdd = await getDbNumToAdd();
    const voterData = assignVoterId(Number(dbVoterId), Number(dbNumToAdd));
    const dbNum = insertNumToAdd(voterData.numToAdd);
    db('pk_userdata').insert({
    voter_id: voterData.id,
    name: name,
    mobile: mobile,
    email: email,
    created: new Date(),
  })
    .then(dbres => {
      res.status(200).send({
        voterId: voterData.id,
        isSuccess: true
      })
    })
    // const databaseRes = await assignVoterId(req)
    // res.send('ok')
  })
  // ****************

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});