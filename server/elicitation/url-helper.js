module.exports = {
    Action: function(method, controller, params) {
      if (controller === "Elicitation") {
        return "/gorilla/" + method.toLowerCase() + "/" + params.id;
      } else if (controller ==="ElicitationAdmin") {
        return "/elicitation/admin/" + method.toLowerCase() + "/" + params.id + "/" + params.DiscussionName;
      } else if (controller === "Discussion" && method === "Index") {
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