import { useState, useEffect } from 'react'

import legoLogo from './assets/legoIcon.png'
import PokeStatus from './components/poke.jsx'
import ESPStatus from './components/espDisplay.jsx'
import ApiStatus from './components/apiStatus.jsx'

import axios from "axios";

import './App.css'

//Possible source, didn't end up using it https://medium.com/@nishchay.bhatta/so-you-use-useeffect-for-your-api-calls-68d956f0ecf3
//Possible source, didn't really use it // Reference: https://www.digitalocean.com/community/tutorials/react-axios-react

//Nice icon source: https://www.iconshock.com/freeicons/collection/elusive-icons

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
	  <img src={legoLogo} className="logo" width="200" height ="200" alt="stolen lego icon" />
        </div>
        <div>
          <h1>Perry Web Server</h1>
        </div>
        
      </section>

      <div className="ticks"></div>
	
	<ESPStatus />

      <div className="ticks"></div>

      <section id="next-steps">

	<div id="docs">
		<ApiStatus />
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
