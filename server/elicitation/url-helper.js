var baseURL = require('../base-url')();

module.exports = {
    Action: function(method, controller, params) {
      method = method.toLowerCase();
      
      if (controller === "Elicitation") {
        if (method === "review") {
          return baseURL + "/review/" + params.ReviewToken.toLowerCase();
        } else {
          return baseURL + "/" + method + "/" + params.id; 
        }
      } else if (controller ==="ElicitationAdmin") {
        return "/elicitation/admin/" + method + "/" + params.id + "/" + params.DiscussionName;
      } else if (controller === "Task") {
        return "/discussion/" + params.DiscussionName + "/task/" + method + "/" + params.id;
      } else if (controller === "Discussion" && method === "index") {
        return "/discussion/" + params.DiscussionName;
      } else {
        console.error("FIXME Url.Action(", method, controller, params, ")");
        return "http://www.fixme.org/" + controller + "/" + method;
      }
    },
    Content: function(path) {
      return path;
    }
};