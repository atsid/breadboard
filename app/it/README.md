Basic integ tests against the HTTP endpoints.
There isn't much data setup here, so the initial assertions are fairly generic.
The main intent for now is to get some baseline tests in place for link verification and refactor assurance.

These tests use the sample RESTBucks app, and currently assume there is a little bit of data in place.
They don't create any new data.

It is also assumed the app is currently running on localhost. Eventually we'll want to bootstrap in app startup and clearing out of a temporary data store for "true" integ tests.

Note the use of the timeout increase in these tests - this is normally not an issue when running against the local filesystem,
however, if you want to double-check and run against the mongodb instance, it can be very slow due to the free mongoHQ throttled instances.