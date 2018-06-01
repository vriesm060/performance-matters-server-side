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
