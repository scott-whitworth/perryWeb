import {useState, useEffect} from 'react';
import axios from 'axios';

function ServerPokesText({value}){
        return <>Current number of server pokes: {value} </>
}

function ServerPokesButton({onPokeClick}){
        return <button className="counter" onClick={onPokeClick} > POKE! </button>
}

export default function ServerPokeStatus(){
        const [serverPokes, setServerPokes] = useState(null);

        function handleClick() {
                axios.get('/api/poke')
                  .then( (res) => {
                        setServerPokes(res.data.pokes);
                  });
        };

        if(!serverPokes) { //Handle first time load
                axios.get('/api/getPokes')
                  .then( (res) => {
                    setServerPokes(res.data.pokes);
                  });
        }

        return(
          <>
            <ServerPokesText value={serverPokes} />
            <ServerPokesButton onPokeClick= {handleClick} />
          </>
        );
}

