// Source excluding the comments: https://github.com/voorhoede/workshop-cmd-pwa/blob/exercise-11-use-cached-page/src/sw.js

self.addEventListener('install', event => event.waitUntil(
	caches.open('oba-project')
		// Add the following files/'routes' to the cache
		.then(cache => cache.addAll([
			'/',
			'/offline/',
      '/css/style.css',
      '/js/script.js'
		]))
		.then(self.skipWaiting())
));

// self is the serviceworker but not needed
self.addEventListener('fetch', event => {
	const request = event.request;
	// If it is a navigating request e.g. change in url
	console.log(request.url);

	if (request.mode === 'navigate' || request.url.match('.jpg|.jpeg|.png|.gif')) {
		event.respondWith(
			fetch(request)
				// Cache the page
				.then(response => cachePage(request, response))
				// On error check wether the page has been cached before
				.catch(err => getCachedPage(request))
				// Go to the offline page
				.catch(err => fetchCoreFile('/offline/'))
		);
	} else {
		event.respondWith(
			fetch(request)
				.catch(err => fetchCoreFile(request.url))
				.catch(err => fetchCoreFile('/offline/'))
		);
	}
});

function fetchCoreFile (url) {
	return caches.open('oba-project')
	// Get/Check cache on our core files (css ect.)
		 .then(cache => cache.match(url))
		 .then(response => response || Promise.reject());
}

function getCachedPage (request) {
	return caches.open('oba-project')
	// Get/Check cache on cached pages
		 .then(cache => cache.match(request))
		 .then(response => response || Promise.reject());
}

function cachePage (request, response) {
	// Make a clone of the response e.g. the page
	const clonedResponse = response.clone();

	// Cache the page
	caches.open('oba-project')
		 .then(cache => cache.put(request, clonedResponse));

	// Return the requested page
	return response;
}
