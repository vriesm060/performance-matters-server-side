// Require Node modules:
var express = require('express');
var router = express.Router();

// Require the controller:
var controller = require('../controllers/controller.js');

// Render the homepage:
router.get('/', controller.homePage);

// Get the search results and give them back to the homepage:
router.get('/search', controller.searchPage);

// Get street details:
router.get('/details/:slug/:id', controller.detailsPage);

// Server side rendering of images per year when no JS is available:
router.get('/images/:year', controller.imagesPage);

module.exports = router;
