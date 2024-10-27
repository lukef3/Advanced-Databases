const express = require('express');
const PouchDB = require('pouchdb');

const app = express();
const localDB = new PouchDB('movies_local');
const remoteDB = new PouchDB('https://apikey-v2-1jsyzxnf10huzbh42l2kd3zwqp80mok7zg062c73n64n:e0d771e48d1da891389652a6e556f671@9e25c456-bb25-4ff5-9e6d-29de265c694e-bluemix.cloudantnosqldb.appdomain.cloud/movies', {
    auth: {
        username: 'apikey-v2-1jsyzxnf10huzbh42l2kd3zwqp80mok7zg062c73n64n',
        password: 'e0d771e48d1da891389652a6e556f671'
      }
    }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('views'));

localDB.sync(remoteDB, {
    live: true,    
    retry: true  
}).on('change', (info) => {
    console.log('Sync: Change detected', info);
}).on('error', (err) => {
    console.error('Sync error', err);
});

app.post('/add', async (req, res) => {
    try {
        const movie = {
            Poster_Link: req.body.Poster_Link,
            Series_Title: req.body.Series_Title,
            Released_Year: req.body.Released_Year,
            Certificate: req.body.Certificate,
            Runtime: req.body.Runtime,
            Genre: req.body.Genre,
            IMDB_Rating: req.body.IMDB_Rating,
            Overview: req.body.Overview,
            Meta_score: req.body.Meta_score,
            Director: req.body.Director,
            Star1: req.body.Star1,
            Star2: req.body.Star2,
            Star3: req.body.Star3,
            Star4: req.body.Star4,
            No_of_Votes: req.body.No_of_Votes,
            Gross: req.body.Gross
        };

        const response = await localDB.post(movie);

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/movies', async (req, res) => {
    try {
        const result = await localDB.allDocs({ include_docs: true });
        const movies = result.rows.map(row => row.doc);
        res.status(200).json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movie = await localDB.get(movieId);
        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/update/:id', async (req, res) => {
    try {
        const movie = await localDB.get(req.params.id);
        
        movie.Poster_Link = req.body.Poster_Link || movie.Poster_Link;
        movie.Series_Title = req.body.Series_Title || movie.Series_Title;
        movie.Released_Year = req.body.Released_Year || movie.Released_Year;
        movie.Certificate = req.body.Certificate || movie.Certificate;
        movie.Runtime = req.body.Runtime || movie.Runtime;
        movie.Genre = req.body.Genre || movie.Genre;
        movie.IMDB_Rating = req.body.IMDB_Rating || movie.IMDB_Rating;
        movie.Overview = req.body.Overview || movie.Overview;
        movie.Meta_score = req.body.Meta_score || movie.Meta_score;
        movie.Director = req.body.Director || movie.Director;
        movie.Star1 = req.body.Star1 || movie.Star1;
        movie.Star2 = req.body.Star2 || movie.Star2;
        movie.Star3 = req.body.Star3 || movie.Star3;
        movie.Star4 = req.body.Star4 || movie.Star4;
        movie.No_of_Votes = req.body.No_of_Votes || movie.No_of_Votes;
        movie.Gross = req.body.Gross || movie.Gross;

        const response = await localDB.put(movie);
        
        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const rev = req.query.rev;

        const response = await localDB.remove(movieId, rev);

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
