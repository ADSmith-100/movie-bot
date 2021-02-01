const express = require("express");
// will use this later to send requests
const http = require("http");
// import env variables
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Server is working.");
});

app.listen(port, () => {
  console.log(`🌏 Server is running at http://localhost:${port}`);
  console.log(process.env.API_KEY);
});

app.post("/getmovie", (req, res) => {
  const movieToSearch =
    //   req.body.result.parameters.movie;
    //this code from the tutorial doesn't work?
    req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.movie
      ? req.body.result.parameters.movie
      : "";

  //   ${movieToSearch}

  console.log(req.body.result.parameters.movie);

  const reqUrl = encodeURI(
    // "http://www.omdbapi.com/?t=Rocky&apikey=e80888db"
    `http://www.omdbapi.com/?t=${movieToSearch}&apikey=${process.env.API_KEY}`
  );
  http.get(
    reqUrl,
    (responseFromAPI) => {
      let completeResponse = "";
      responseFromAPI.on("data", (chunk) => {
        completeResponse += chunk;
      });
      responseFromAPI.on("end", () => {
        const movie = JSON.parse(completeResponse);
        console.log(completeResponse);

        let dataToSend = movieToSearch;
        dataToSend = `${movie.Title} was released in the year ${movie.Year}. It was directed by ${movie.Director} and stars ${movie.Actors}.\n Here is a synopsis: ${movie.Plot}.
                }`;

        return res.json({
          fulfillmentText: dataToSend,
          source: "getmovie",
        });
      });
    },
    (error) => {
      return res.json({
        fulfillmentText: "Could not get results at this time",
        source: "getmovie",
      });
    }
  );
});
