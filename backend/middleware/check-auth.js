const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try{
    console.log("checking auth")
  const token = req.headers.authorization.split(" ")[1];
  // console.log(token)
  const decodedToken = jwt.verify(token, "sercret_this_should_be_longer");
  console.log(decodedToken)
  req.userData = {email: decodedToken.email, userId: decodedToken.userId}
  next();
  }catch(error){
   res.status(401).json({message: "You didnt signedup "});
  }
};
