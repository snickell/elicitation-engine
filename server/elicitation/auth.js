var request = require('request');

var baseURL = "http://www.nearzero.org/authenticate-access-to-elicitation/";

module.exports = function authenticateAcessTo(elicitationID, req, res, cb) {  
  var returnURL = req.originalUrl;
  
  console.log("Authenticating acess to ", elicitationID, req.cookies);
  var url = baseURL + elicitationID + "?ReturnURL=" + encodeURIComponent(returnURL);
  
  console.error("AUTH DISABLED");
  cb(null, 666);
  return;
  
  request({
    url: url,
    followRedirect: false
  }, function (error, response, body) {
    if (!error && response.statusCode >= 300 && response.statusCode < 400) {
      console.log("Redirecting to ", response.headers.location);
      res.redirect(response.headers.location);
    } else if (!error && response.statusCode == 200) {
      console.log("Imallowit");
      cb(null, 666);
    } else {
      cb("couldn't authenticate access to elicitation");
    }
  });
}
