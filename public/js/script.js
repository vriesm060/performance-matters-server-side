'use strict';

var offlineMsg = document.querySelector('.offline');

window.addEventListener('online', function () {
  online();
}, false)

window.addEventListener('offline', function () {
  offline();
}, false)

if (!navigator.onLine) {
	offline();
}

function online() {
  offlineMsg.classList.add('hidden');
  document.querySelector('.search .inputs > input').removeAttribute('disabled');
  document.querySelector('.search .inputs > button').removeAttribute('disabled');
}

function offline() {
  offlineMsg.classList.remove('hidden');
  document.querySelector('.search .inputs > input').setAttribute('disabled', 'true');
  document.querySelector('.search .inputs > button').setAttribute('disabled', 'true');
}

(function () {

  var app = {
    init: function () {
      search.init(streets);
      timeline.init();
    }
  };

  var search = {
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

  app.init();

}) ();
