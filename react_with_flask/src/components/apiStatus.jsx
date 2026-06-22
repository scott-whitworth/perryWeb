//Goal is to be a bare-bones check to make sure the API is up and running

import {useState, useEffect} from 'react'

import PokeStatus from './poke.jsx'

import axios from "axios";

function ServerTime(){
        const [curTime, setCurTime] = useState(0)

        useEffect(() => {
                axios.get('/api/time').             //Call API call to get time from server
                then( (resp) => {
			setCurTime(resp.data.time);
		});
        },[]); //No dependencies, run on mount

        return(
        <p>
                Server Time: {new Date(curTime*1000).toLocaleString()}
        </p>
        )

}

export default function ApiStatus(){
	return (
	<>
		<svg className="icon" role="presentation" aria-hidden="true">
		<use href="/graph.svg"></use></svg>
		<h2> API Status </h2>
		<ServerTime />
		<PokeStatus />
	</>
	)
}
