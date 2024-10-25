const express = require('express');
const PouchDB = require('pouchdb');

// Initialize Express and PouchDB (local and remote)
const app = express();
const localDB = new PouchDB('movies_local');
const remoteDB = new PouchDB('http://admin:mtu1234@127.0.0.1:5984/movies');

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "views" folder
app.use(express.static('views'));

// Sync local PouchDB with remote CouchDB
localDB.sync(remoteDB, {
    live: true,    
    retry: true  
}).on('change', (info) => {
    console.log('Sync: Change detected', info);
}).on('error', (err) => {
    console.error('Sync error', err);
});

// Routes for CRUD operations

// Create a new movie (POST)
app.post('/add', async (req, res) => {
    try {
        // Create a new movie document, CouchDB will automatically generate the _id
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

        const response = await localDB.post(movie);  // Using `post` to let CouchDB auto-generate the _id

        // Return success response
        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Read all movies (GET)
app.get('/movies', async (req, res) => {
    try {
        const result = await localDB.allDocs({ include_docs: true });
        const movies = result.rows.map(row => row.doc);
        res.status(200).json({ success: true, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Read a single movie by ID (GET)
app.get('/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movie = await localDB.get(movieId); // Fetch movie by ID
        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});



// Update a movie (PUT)
app.put('/update/:id', async (req, res) => {
    try {
        const movie = await localDB.get(req.params.id);
        
        // Update the fields
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

// Delete a movie (DELETE)
app.delete('/delete/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const rev = req.query.rev; // Get the _rev from the query parameter

        if (!rev) {
            return res.status(400).json({ success: false, error: "Missing _rev for deletion." });
        }

        // Use both _id and _rev to delete the movie
        const response = await localDB.remove(movieId, rev);

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
