var request = require('request-promise');

var authPath = "/authenticate-access-to-elicitation/";

module.exports = function authenticateAcessTo(elicitationID, req, res, cb) {  
  var returnURL = req.originalUrl;
  
  var hostname = req.get('host');
  
  if (hostname === "elicitation-gorilla.azurewebsites.net") {
    console.warn("Hack to handle reverse proxy on nearzero.org hosting of elicitation engine");
    hostname = "www.nearzero.org";
  }
  
  var host = req.protocol + '://' + hostname;
  
  
  
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
