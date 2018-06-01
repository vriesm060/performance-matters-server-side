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
