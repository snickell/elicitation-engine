var request = require('request-promise');
var StatusCodeError = require('request-promise/errors').StatusCodeError;

var authPath = "/authenticate-access-to-elicitation/";

function authenticateAccessTo(elicitationID, req, res) {  
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
  })
  .then(function (body) {
    console.log("OK, got something: ", body);
    var authResponse = JSON.parse(body);
    
    console.log("Auth succeeded: ", authResponse);
    
    var personID = parseInt(authResponse.personID)
    if (personID > 0) {
      return authResponse.personID;
    } else {
      throw "You don't have permission to access this elicitation";
    }
  })  
  .catch(StatusCodeError, function (error) {
    console.log("Dealing with error: ", error);
    if (error.statusCode >= 300 && error.statusCode < 400) {
      throw new RedirectToLoginError(error.response.headers.location)
    } else {
      throw error;
    }
  });
}

function RedirectToLoginError(url) {
  this.name = 'RedirectToLogin';
  this.message = 'redirect to login: ' + url;
  this.url = url;

  if (Error.captureStackTrace) {
      Error.captureStackTrace(this);
  }
}
RedirectToLoginError.prototype = Object.create(Error.prototype);
RedirectToLoginError.prototype.constructor = RedirectToLoginError;
authenticateAccessTo.RedirectToLoginError = RedirectToLoginError;

module.exports = authenticateAccessTo;