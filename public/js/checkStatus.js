// Require search JS file:
var search = require('./search.js');

var checkStatus = {
  offlineMsg: document.querySelector('.offline'),
  init: function () {
    window.addEventListener('online', function () {
      this.showOnline();
    }, false)

    window.addEventListener('offline', function () {
      this.showOffline();
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
    offlineMsg.classList.remove('hidden');
    search.form.children[0].children.forEach(function (input) {
      input.setAttribute('disabled', 'true');
    });
  }
};

module.exports = checkStatus;
