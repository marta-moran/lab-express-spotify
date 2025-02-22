require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

hbs.registerPartials(__dirname + '/views/partials')

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:
app.get('/', (req, res) => {
    res.render('home')
})
app.get('/artist-search', (req, res) => {
    const { artist } = req.query
    // console.log(artist)

    spotifyApi
        .searchArtists(artist)
        .then(data => {
            // console.log('The received data from the API: ', data.body.artists.items);
            // res.json(data.body)
            const infoArtist = data.body.artists.items.map((artist) => {
                return {
                    name: artist.name,
                    image: artist.images[0], // array
                    id: artist.id
                }
            })
            // res.json(infoArtist)
            res.render('artist-search', { infoArtist })
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.get('/albums/:artistId', (req, res, next) => {
    spotifyApi
        .getArtistAlbums(req.params.artistId)
        .then((data) => {
            // console.log('Artist albums', data.body)
            const infoAlbums = data.body.items.map((album) => {
                return {
                    name: album.name,
                    image: album.images[0],
                    id: album.id
                }
            })
            res.render('albums', { infoAlbums })
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
});

app.get('/tracks/:albumId', (req, res, next) => {
    spotifyApi.getAlbumTracks(req.params.albumId)
        .then((data) => {
            // res.json(data.body)
            const trackInfo = data.body.items.map((track) => {
                return {
                    name: track.name,
                    preview_url: track.preview_url,
                    id: track.id
                }
            })
            console.log(trackInfo)
            res.render('tracks', { trackInfo })
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
})


app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
