var Promise = require('bluebird');
var request = Promise.promisify(require('request-promise'));

var authPath = "/authenticate-access-to-elicitation/";

module.exports = function authenticateAcessTo(elicitationID, req, res, cb) {  
  var returnURL = req.originalUrl;
  
  var host = req.protocol + '://' + req.get('host');
  
  var url = host + authPath + elicitationID + "?ReturnURL=" + encodeURIComponent(returnURL);
  
  console.log("auth url is: ", url);
  
  return request({
    url: url,
    followRedirect: false
  }).then(function (response, body) {
    if (response.statusCode >= 300 && response.statusCode < 400) {
      console.log("Redirecting to ", response.headers.location);
      res.redirect(response.headers.location);
    } else if (response.statusCode == 200) {
      var authResponse = JSON.parse(body);
      
      console.log("Auth succeeded: ", authResponse);
      
      var personID = parseInt(authResponse.personID)
      if (personID > 0) {
        return authResponse.personID;
      } else {
        throw "You don't have permission to access this elicitation";
      }
    }
  });
}
