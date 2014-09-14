# SRG Transcriptor

Hack for the SRG SSR Hackdays 2014

## Run Main Server

```bash
npm install
npm start
```

This will start the server on `localhost:3000` with the API and `angular/dist` (last frontend build).

Live Page:
http://srf-transcriptor.herokuapp.com/

Api Example:
http://srf-transcriptor.herokuapp.com/search?q=Geri%20M%C3%BCller

### Notes

The front end build is checked in for easy deploy to heroku of the whole application. Could be optimized in the future.

## Develop Front End

```bash
npm install
npm start
cd angular/
npm install
bower install
grunt serve
```

The front end will try to access the backend via [grunt-connect-proxy](https://github.com/drewzboto/grunt-connect-proxy) at localhost:3000 - make sure to also run the main server from the root directory.

### Dependencies
- Node.js
- Grunt
- Bower
- Compass

