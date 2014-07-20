App.HardPathRouter = HardPathRouter;
function HardPathRouter(basePath) {
  this.basePath = basePath;
  this.routes = {};
}

HardPathRouter.prototype = {
  add : function (path, cb) {
    this.routes[path] = cb;
  },
  match : function (url) {
    var routes = this.routes;
    url = url || window.location.pathname.replace(this.basePath, '');
    Object.keys(routes).forEach(function (path) {
      if (path === url) {
        routes[path]();
        return;
      }
    });
  }
};
