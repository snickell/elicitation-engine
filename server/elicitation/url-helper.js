module.exports = {
    Action: function(baseURL, method, controller, params) {
      method = method.toLowerCase();
      
      if (controller === "Elicitation") {
        if (method === "review") {
          return baseURL + "/review/" + params.ReviewToken.toLowerCase();
        } else {
          return baseURL + "/" + method + "/" + params.id; 
        }
      } else if (controller ==="ElicitationAdmin") {
        return baseURL + "/admin/" + method + "/" + params.id + "/" + params.DiscussionName;
      } else if (controller === "Task") {
        return "/discussion/" + params.DiscussionName + "/task/" + method + "/" + params.id;
      } else if (controller === "Discussion" && method === "index") {
        return "/discussion/" + params.DiscussionName;
      } else if (controller === "ImageInElicitation" && method === "index") {
        return "/elicitation/image";
      } else {
        console.error("FIXME Url.Action(", method, controller, params, ")");
        return "http://www.fixme.org/" + controller + "/" + method;
      }
    },
    Content: function(baseURL, path) {
      return baseURL + path;
    }
};