import { useState, useEffect } from 'react'
import legoLogo from './assets/legoIcon.png'
import './App.css'

//Pulled from https://medium.com/@nishchay.bhatta/so-you-use-useeffect-for-your-api-calls-68d956f0ecf3
//Used to directly pull state / abort info
//Data is a json object, so will still need to access inner elements (i.e. 'data.pokes')
function useFetchData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err);
          setLoading(false);
        }
      });

    return () => controller.abort(); // Cleanup

  }, [url]);

  return { data, loading, error };
}


function newPokes(){
  const { data, loading, error } = useFetchData('/api/getPokes');

  if (loading) return <p>Loading pokes...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>Pokes: {data.pokes}</div>;
}

function pokeButton(){

  const buttonCall = () => {
    fetch('/api/poke');
  };

  return <button 
          className="pokeButton"
          onClick={buttonCall}
         > Poke! 
         </button>
}

function App() {
  const [count, setCount] = useState(0)
  const [curTime, setcurTime] = useState(0)

  useEffect(() => {
    fetch('/api/time').then(res => res.json()).then(data => {
      setcurTime(data.time);
    });
  }, []);


  return (
    <>
      <section id="center">
        <div className="hero">
	  <img src={legoLogo} className="logo" width="200" height ="200" alt="stolen lego icon" />
        </div>
        <div>
          <h1>Perry Web Server</h1>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
	
       {newPokes()}
	{pokeButton()}

        <p>The current time is {new Date(curTime * 1000).toLocaleString()}!</p>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Left Side</h2>
          <p>Looking to see if this bar goes away ----)</p>
        </div>
	<div id="sysInfo">
	  <h2>What is this?</h2>
	  <p>This is going to be the best web page ever</p>
	</div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
