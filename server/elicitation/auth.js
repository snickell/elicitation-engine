var request = require('request');

module.exports = function authenticateAcessTo(elicitationID, cb) {
  console.log("Authenticating acess to ", elicitationID);
  var url = "http://www.nearzero.org/authenticate-access-to-elicitation/" + elicitationID;
  console.log(url);
  
  console.error("DISABLED AUTHENTICATION");
  cb();
  return;
  
  request(url, function (error, response, body) {
    console.log("error ", error, "response.statusCode", response.statusCode);
    if (!error && response.statusCode == 200) {
      cb();
    } else {
      cb("couldn't authenticate access to elicitation");
    }
  });
}
