(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Require search JS file:
var search = require('./search.js');

var checkStatus = {
  offlineMsg: document.querySelector('.offline'),
  init: function () {
    window.addEventListener('online', function () {
      checkStatus.showOnline();
    }, false)

    window.addEventListener('offline', function () {
      checkStatus.showOffline();
    }, false)

    if (!navigator.onLine) {
    	this.showOffline();
    }
  },
  showOnline: function () {
    this.offlineMsg.classList.add('hidden');
    search.form.children[0].children.forEach(function (input) {
      input.removeAttribute('disabled');
    });
  },
  showOffline: function () {
    this.offlineMsg.classList.remove('hidden');
    search.form.children[0].children.forEach(function (input) {
      input.setAttribute('disabled', 'true');
    });
  }
};

module.exports = checkStatus;

},{"./search.js":4}],2:[function(require,module,exports){
var imagesContainer = {
  container: {
    el: document.querySelector('.images--container'),
    show: function () {
      this.el.classList.add('show');
    },
    hide: function () {
      this.el.classList.remove('show');
    }
  },
  imageList: {
    el: document.querySelector('.images--container ul'),
  },
  closeBtn: {
    el: document.querySelector('.close-btn')
  },
  addImages: function (year) {
    var self = this;
    this.imageList.el.innerHTML = '';

    year.images.forEach(function (image) {
      var li = document.createElement('LI');
      var img = document.createElement('IMG')

      img.src = image.value;

      self.imageList.el.appendChild(li);
      li.appendChild(img);
    });

    this.closeBtn.el.addEventListener('click', function () {
      self.container.hide();
    }, false);
  }
};

module.exports = imagesContainer;

},{}],3:[function(require,module,exports){
'use strict';

// Required JS files:
var checkStatus = require('./checkStatus.js');
var search = require('./search.js');
var timeline = require('./timeline.js');

(function () {

  var app = {
    init: function () {
      checkStatus.init();
      search.init(streets);
      timeline.init();
    }
  };

  app.init();

}) ();

},{"./checkStatus.js":1,"./search.js":4,"./timeline.js":5}],4:[function(require,module,exports){
var search = {
  form: document.querySelector('.search'),
  searchbar: document.querySelector('input[name="searchbar"]'),
  currentFocus: 0,
  init: function (data) {
    var self = this;

    // Event listener for input value:
    this.searchbar.addEventListener('input', function (e) {
      self.closeAllLists();
      if (!this.value) return false;
      self.currentFocus = -1;
      self.getAutocomplete(data, this.value);
    }, false);

    // Event listener for pressing up or down key:
    this.searchbar.addEventListener('keydown', function (e) {
      var x = document.getElementById(this.id + 'autocomplete-list');

      if (x) x = x.querySelectorAll('li');

      if (e.keyCode == 40) {
        self.currentFocus++;
        self.addActive(x);
      } else if (e.keyCode == 38) {
        self.currentFocus--;
        self.addActive(x);
      } else if (e.keyCode == 13) {
        if (self.currentFocus > -1) {
          if (x) x[self.currentFocus].children[0].click();
        }
        e.preventDefault();
      }

    }, false);

    // Event listener when clicking the document:
    document.addEventListener('click', function (e) {
      self.closeAllLists(e.target);
    }, false);
  },
  getAutocomplete: function (data, val) {
    var results = data.filter(function (street) {
      if (street.properties.streetName.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        return street;
      }
    });
    this.setAutocomplete(results);
  },
  setAutocomplete: function (results) {
    var self = this;
    var ul = document.createElement('ul');

    ul.setAttribute('id', this.searchbar.id + 'autocomplete-list');
    ul.setAttribute('class', 'autocomplete-items');

    this.searchbar.parentNode.nextElementSibling.appendChild(ul);

    results.forEach(function (result, i) {
      if (i < 2) {
        var li = document.createElement('li');
        var a = document.createElement('a');

        li.appendChild(a);

        a.textContent = result.properties.streetName;
        a.href = '/details/' + result.properties.slug + '/' + result.properties.id;

        a.addEventListener('click', function (e) {
          self.searchbar.value = this.textContent;
          self.closeAllLists();
        }, false);

        ul.appendChild(li);
      }
    });
  },
  addActive: function (x) {
    if (!x) return false;
    this.removeActive(x);
    if (this.currentFocus >= x.length) this.currentFocus = 0;
    if (this.currentFocus < 0) this.currentFocus = (x.length - 1);
    x[this.currentFocus].children[0].classList.add('autocomplete-active');
  },
  removeActive: function (x) {
    for (var i = 0; i < x.length; i++) {
      x[i].children[0].classList.remove('autocomplete-active');
    }
  },
  closeAllLists: function (el) {
    var x = document.querySelectorAll('.autocomplete-items');
    for (var i = 0; i < x.length; i++) {
      if (el != x[i] && el != this.searchbar) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
};

module.exports = search;

},{}],5:[function(require,module,exports){
// Require imagesContainer JS file:
var imagesContainer = require('./imagesContainer.js');

var timeline = {
  el: document.querySelectorAll('.timeline > li'),
  init: function () {
    this.el.forEach(function (el) {
      el.children[0].addEventListener('click', function (e) {
        e.preventDefault();

        var self = this;

        var year = details.filter(function (item) {
          if (item.year === self.textContent) {
            return item;
          }
        });

        imagesContainer.container.show();
        imagesContainer.addImages(year[0]);
      }, false);
    });
  }
};

module.exports = timeline;

},{"./imagesContainer.js":2}]},{},[3]);
