// ..................................................
// Particulate.js
//
// version : 0.3.1
// authors : Jay Weeks
// license : MIT
// particulatejs.org
// ..................................................

(function () {
  'use strict';

  var lib = {
    VERSION : '0.3.1'
  };

  require('utils/*');
  require('math/*');
  require('forces/*');
  require('constraints/*');
  require('systems/*');

  /**
    @class Particulate
    @static
  */
  this.Particulate = lib;
}).call(this);
