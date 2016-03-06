# SRG Transcriptor

A transcript crawler, search engine and explorer for SRF news and talk shows.
http://srf-transcriptor.herokuapp.com/

This was implemented at the [SRG SSR Hackdays 2014](http://blog.hackdays.ch/?p=55) and is mostly a proof of concept.

Documentation of data formats used can be found in the [wiki](https://github.com/crackofdusk/srg-transcriptor/wiki).

## Run Main Server

```bash
npm install
npm start
```

This will start the server on `localhost:3000` serving API endpoints for searching and recieving transcripts. Additionally `angular/dist` is served statically.

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

The front end dev server will relay requests to the API endpoints to `localhost:3000` via [grunt-connect-proxy](https://github.com/drewzboto/grunt-connect-proxy) - make sure to also run the main server from the root directory.

## Crawler

The crawler is part of the backend.

```bash
cd backend
grunt --help
```

### Add a New Show

```bash
grunt add:show --id=3b016ffc-afa2-466d-a694-c48b7ffe1783
```

### Fetch Data and Transcripts

This will fetch episode information and transcripts of all added shows.

```bash
grunt fetch:shows
grunt fetch:transcripts
```

### Process Data for Delivery

```
grunt parse:transcripts
grunt parse:shows
```

Currently the processed data needs to be checked in for deployment.

## Dependencies
- Node.js
- Grunt
- Bower
- Compass

## Clips

There is an experimental algorithm included to compose short clips out of text.

Usage:
```bash
node backend/clip -m 'Krieg in eine Weile her und es wird Sie eine Weile nicht sehen können, den Fall von ihm zu bekommen, ist nicht ein Problem mit ihm für eine Weile her,'
```

A MP4 clip will be composed and saved to `backend/clips`, alongside with a JSON file with the source meta data.

Above message is sourced from [@lauraperrenoud tweet](https://twitter.com/lauraperrenoud/status/706084373335056384) and translated to German with Google Translate.
