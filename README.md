# SRG Transcriptor

Hack for the SRG SSR Hackdays 2014

## Run Main Server

```bash
npm install
npm start
```

This will start the server on `localhost:3000` serving API endpoints for searching and recieving transcripts. Additionally `angular/dist` is served statically.

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

The front end dev server will relay requests to the API endpoints to localhost:3000 via [grunt-connect-proxy](https://github.com/drewzboto/grunt-connect-proxy) - make sure to also run the main server from the root directory.

### Dependencies
- Node.js
- Grunt
- Bower
- Compass

