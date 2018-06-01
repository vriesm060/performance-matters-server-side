// Require node modules:
var express = require('express');
var router = express.Router();

// Require local modules:
var controller = require('../controllers/controller.js');

// Get the homepage:
router.get('/', controller.homePage);

// Get the search page when there is no client-side JS:
router.get('/search', controller.searchPage);

// Get the details page:
router.get('/details/:slug/:id', controller.detailsPage);

// Get the images page when there is no client-side JS:
router.get('/images/:year', controller.imagesPage);

module.exports = router;
