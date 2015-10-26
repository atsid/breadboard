[![Build Status](https://travis-ci.org/atsid/breadboard.svg?branch=master)](https://travis-ci.org/atsid/breadboard)
[![Code Climate](https://codeclimate.com/github/atsid/breadboard/badges/gpa.svg)](https://codeclimate.com/github/atsid/breadboard)
[![Dependency Status](https://david-dm.org/atsid/breadboard.svg)](https://david-dm.org/atsid/breadboard)
[![Dev Dependency Status](https://david-dm.org/atsid/breadboard/dev-status.svg)](https://david-dm.org/atsid/breadboard)

Breadboard is a rapid-prototyping platform for Node.js applications that include RESTful services with hypermedia.

JSON Schema is used to define object models and the possible links associated with them, and then Breadboard auto-generates MongoDB persistence code and Express RESTful service middleware.
RQL is used to allow very simple query matchers to determine if a given link should be present on a response object, hence expressing all application state via the responses.
