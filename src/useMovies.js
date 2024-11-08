import { useState, useEffect } from "react";

export function useMovies(query, callback) {

    const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

const KEY = '44b94982';


    useEffect(function() {

        callback?.();

        // to avoid response race condn many reqs are sent which may are not required - when query is typed quickly sometimes it shows movies not found bc each letter is typed into query and sends req for every substring of the query which maybe slow than the required query - ex : in inc ince incepti inception
        const controller = new AbortController();
    
        async function fetchMovies() {
          try {
            setIsLoading(true);
            setError("");
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal : controller.signal});
    
        // fetch()
        // .then((res) => res.json())
        // .then((data) => setMovies(data.Search))
    
        
        if(!res.ok) throw new Error("Something went wrong while fetching");
        
        const data = await res.json();
        if(data.Response === "False") throw new Error("Movie not found");
          setMovies(data.Search);
          setError("");
          // console.log(data.Search);
        }
          catch (err) {
            console.log(err);
            if(err.name !== "AbortError") setError(err.message);
            setMovies([]);
          }
          finally {
          setIsLoading(false);
          }
      }
      if(!query.length) {
        setMovies([]);
        setError("");
        return;
      }
    //   handleCloseMovie();
      fetchMovies();
    
      // clean up fn for n/w performance
      return function() {
        controller.abort();
      }
    }, [query]);
    
    return {movies, isLoading, error};

}