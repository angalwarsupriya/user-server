const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname,'website.db');
db = null;

const initializeServer = async () => {
    try{
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database,
        });
        app.listen(3000, () => console.log('Server Running on port number 3000!'))
    }catch(e){
        console.log(`DB Error : ${e.message}`)
    }

};

initializeServer()


app.post('/register', async (request, response) => {
  const { name, email, password } = request.body;
  console.log('register')
  const hashedPassword = await bcrypt.hash(request.body.password, 10)
  
  const selectUserQuery = `SELECT * FROM users WHERE name = '${name}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        users (name,email, password) 
      VALUES 
        (
          '${name}',
          '${email}',
          '${hashedPassword}' 
        )`
      const dbResponse = await db.run(createUserQuery);
      response.send(`Created new user`);
        
  } else {
    response.status(400)
    response.send('User already exists')
  }
  
});



//** LOGIN **/
app.get('/', async(req,res)=> {
    res.send('llllllllllllllllllllllllllll')
})

app.post('/login', async (request, response) => {
  const {name, password} = request.body
  const selectUserQuery = `SELECT * FROM users WHERE name = '${name}'`
  const dbUser = await db.get(selectUserQuery)
  
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const payload = {
        name:name,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
})

