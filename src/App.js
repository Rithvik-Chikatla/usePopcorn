import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";



const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '44b94982';


export default function App() {
  const [query, setQuery] = useState("");
  
  const [selectedId, setSelectedId] = useState(null);

  const {movies, isLoading, error} = useMovies(query, handleCloseMovie);

  const [watched, setWatched] = useLocalStorageState([], 'watched');

  // const [watched, setWatched] = useState(function() {
  //   const storedValue = localStorage.getItem('watched');
  //   return JSON.parse(storedValue);
  // });

  // useEffect(function() {
  //   console.log('a', [])
  // })

  // useEffect(function() {
  //   console.log('b')
  // })

  // console.log('c')


  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId) ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // useEffect(function() {
  //   localStorage.setItem('watched', JSON.stringify(watched));
  // }, [watched])

  

  return (
    <>
      <NavBar>
        <Logo/>
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies}/>
      </NavBar>

      <Main>
        {/* <Box element={<MovieList movies={movies}/>} />
        <Box element={
          <>
            <WatchedSummary watched={watched}/>
          <WatchedMovieList watched={watched} />
          </>
        }/> */}
        <Box>
          {/* {isLoading ? <Loader></Loader> : <MovieList movies={movies}/>} */}
          {isLoading && <Loader/>}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error}/>}
        </Box>

        <Box>
        <>
        {
          selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched} watched={watched}/> : <>
          <WatchedSummary watched={watched}/>
          <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched}/>
          </>
        }
        </>
        </Box>
        {/* <WatchedBox /> */}
      </Main>
    </>
  );
}

function Loader() {
  return <h1>Loading...</h1>
}

function ErrorMessage({message}) {
  return <h1 className="error">{message}</h1>
}

function NavBar({children}) {
  return (
    <nav className="nav-bar">
        {children}
      </nav>
  )
}

function Logo() {
  return (
    <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>
  )
}

function NumResults({movies}) {
  return (
  <p className="num-results">
          Found <strong>{movies.length !== 0 ? movies.length : 0}</strong> results
        </p>
  )
}

function Search({query, setQuery}) {
  // const [query, setQuery] = useState("");
  // useEffect(function() {
  //   const el = document.querySelector(".search");
  //   console.log(el);
  //   el.focus();
  // }, []);

  const inputEl = useRef(null);

  useEffect(function() {
    function callback(e) {
      if(document.activeElement === inputEl.current) return;

      if(e.code === "Enter") {
        inputEl.current.focus();
        setQuery("");
      }
    }
    document.addEventListener("keydown", callback);
    return () => document.addEventListener("keydown", callback);
  }, [setQuery]);

  return (
    <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref = {inputEl}
        />
  )
}

function Main({children}) {
  
  return (
    <main className="main">
        
    {children}
      </main>
  )
}


function Box({children}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && 
            children
          }
        </div>
  )
}

// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//     <button
//       className="btn-toggle"
//       onClick={() => setIsOpen2((open) => !open)}
//     >
//       {isOpen2 ? "–" : "+"}
//     </button>
//     {isOpen2 && (
//       <>
//         <WatchedSummary watched={watched}/>
//         <WatchedMovieList watched={watched} />
        
//       </>
//     )}
//   </div>
//   )
// }

function MovieList({movies, onSelectMovie}) {

  return (
    <ul className="list list-movies">
              {movies?.map((movie) => (
                <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
              ))}
            </ul>
  )
}

function Movie({movie, onSelectMovie}) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
                  <img src={movie.Poster} alt={`${movie.Title} poster`} />
                  <h3>{movie.Title}</h3>
                  <div>
                    <p>
                      <span>🗓</span>
                      <span>{movie.Year}</span>
                    </p>
                  </div>
                </li>
  )
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {

  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const countRef = useRef(0);

  useEffect(function() {
    if(userRating) countRef.current = countRef.current + 1;
  }, [userRating]);

  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId);
  // console.log(isWatched);

  const watchedUserRating = watched.find(movie => movie.imdbID === selectedId)?.userRating;


  const {Title : title, Year : year, Poster : poster, Runtime : runtime, Actors : actors, Director : director, imdbRating, Plot : plot, Released : released} = movie;

  // console.log(title, year);
  

  function handleAdd() {
    const newWatchedMovie = {
      imdbID : selectedId,
      title,
      year,
      poster,
      imdbRating : Number(imdbRating),
      runtime : Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions : countRef.current
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // useEffect(function() {
  //   function callback(e) {
  //     if(e.code === "Escape") {
  //       onCloseMovie();
  //       // console.log('close')
  //     }
  //   }
  //   document.addEventListener("keydown", callback);

  //   return function() {
  //     document.removeEventListener('keydown', callback);
  //   }
  // }, [onCloseMovie]);
  useKey('Escape', onCloseMovie);

  useEffect(function() {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  useEffect(function() {
    if(!title) return;
    document.title = `Movie | ${title}`;

    return function() {
      document.title = "usePopcorn"; // clean up fn is activated after movie is unmounted
    };
  }, [title]);

  return <div className="details">
    {isLoading ? <Loader/> : <>
    <header>
    <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
    <img src={poster} alt={`Poster of ${movie}`} />
    <div className="details-overview">
      <h2>{title}</h2>
      <p>{released} &bull; {runtime}</p>
      <p>
        <span>x</span>
        {imdbRating} imdb rating
      </p>
    </div>
    </header>

    <section>
      <div className="rating">
      {!isWatched ? <>
        <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>
      {userRating > 0 && (<button className="btn-add" onClick={handleAdd}>+ Add to list</button>)
      }</> : <p>You already rated this movie {watchedUserRating}</p>}
      </div> 
      
      <p>
        <em>{plot}</em>
      </p>
      <p>Starring {actors}</p>
      <p>Directed by {director}</p>
    </section>
    {/* {selectedId} */}
    </>
    }
  </div>
}

function WatchedSummary({watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
          <h2>Movies you watched</h2>
          <div>
            <p>
              <span>#️⃣</span>
              <span>{watched.length} movies</span>
            </p>
            <p>
              <span>⭐️</span>
              <span>{avgImdbRating.toFixed(2)}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{avgUserRating.toFixed(2)}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{avgRuntime} min</span>
            </p>
          </div>
        </div>
  )
}

function WatchedMovieList({watched, onDeleteWatched}) {
  return (
    <ul className="list">
          {watched.map((movie) => (
            <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
          ))}
        </ul>
  )
}

function WatchedMovie({movie, onDeleteWatched}) {
  return (
    <li key={movie.imdbID}>
              <img src={movie.poster} alt={`${movie.title} poster`} />
              <h3>{movie.title}</h3>
              <div>
                <p>
                  <span>⭐️</span>
                  <span>{movie.imdbRating}</span>
                </p>
                <p>
                  <span>🌟</span>
                  <span>{movie.userRating}</span>
                </p>
                <p>
                  <span>⏳</span>
                  <span>{movie.runtime} min</span>
                </p>

                <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}></button>
              </div>
            </li>
  )
}