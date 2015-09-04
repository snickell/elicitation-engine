var request = require('request');

var authPath = "/authenticate-access-to-elicitation/";

module.exports = function authenticateAcessTo(elicitationID, req, res, cb) {  
  var returnURL = req.originalUrl;
  
  var host = req.protocol + '://' + req.get('host');
  
  var url = host + authPath + elicitationID + "?ReturnURL=" + encodeURIComponent(returnURL);
  
  console.log("auth url is: ", url);
  
  request({
    url: url,
    followRedirect: false
  }, function (error, response, body) {
    if (!error && response.statusCode >= 300 && response.statusCode < 400) {
      console.log("Redirecting to ", response.headers.location);
      res.redirect(response.headers.location);
    } else if (!error && response.statusCode == 200) {
      var authResponse = JSON.parse(body);
      
      console.log("Auth succeeded: ", authResponse);
      
      var personID = parseInt(authResponse.personID)
      if (personID > 0) {
        // auth succeeded
        cb(null, authResponse.personID);
      } else {
        cb("you were logged in, but you don't have permission to access this elicitation");
      }
    } else {
      console.error("error auntheticating access to elicitation: ", error);
      cb("couldn't authenticate access to elicitation: " + error);
    }
  });
}
