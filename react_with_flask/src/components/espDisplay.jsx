import {useState, useEffect} from 'react';
import axios from 'axios';
import {Component} from 'react';

// Based on TicTacToe tutorial and https://blog.logrocket.com/understanding-axios-get-requests/
//This is key: https://react.dev/learn/responding-to-events


function Toggle( { toggleState, lZero, lOne, onC} ){

	return(
		<button onClick={onC}>{(toggleState ? lOne : lZero)}</button>
	)
}

//onC is passing up the text value of the field
function Field( { value , onC } ){
	
	return(
		<input type="text" value={value} onChange={(e) => onC(e.target.value)} />
	);
}

// espIn is just the name of the ESP node
//    This should then ask the API for detail for that node
function ESP( { espIn, onPowerClick, onEditEnd }){
	const [editMode, setEditMode] = useState(false)
	const [workingName, setWorkingName] = useState(espIn.name)
	const [workingDesc, setWorkingDesc] = useState(espIn.description)

	//We don't want to do anything if selected other than change form context
	//Once it changes to off, we want to make an API call
	function handleEditMode(){
		if(editMode){
			//alert('API CALL! with ' + workingName + ' and ' + workingDesc)
			onEditEnd(espIn.name, workingName, workingDesc)
		}

		setEditMode(!editMode)
	}

	return(
		<>
			<h3>Name: {(	editMode ?
					<Field key="espName" value={workingName} onC={(v) => setWorkingName(v)} /> :
					espIn.name
				 )} </h3>
			<ul>
				<li>Index: {espIn.index}</li>
				<li>Description: {(
							editMode ?
							<Field key="espDesc" value={workingDesc} onC={(v) => setWorkingDesc(v)} /> :
							espIn.description
						)}</li>
				<li>{(espIn.lighting ? "Lights are On!" : "Lights are off"
				)}</li>
				<li>
				<Toggle onC={() => onPowerClick(espIn.name)}
					toggleState={espIn.lighting}
					lZero="Turn lights on"
					lOne="Turn lights off" />				
				</li>
				<li> 
					<label>
						<input type="checkbox"
							checked = {editMode}
							onChange = {handleEditMode}
						 />
						Edit Info
					</label>
				 </li>
			</ul>
		</>
	)
}



function getESPData( espName ){
	//console.log("Getting Data for ESP: " + espName)

	return new Promise( (resolve, reject) => {
		const postMsg = {"esp":espName};
				
		axios.post('/api/espStatus/', postMsg).
		then( (pres) => {
			//console.log("Inside post pRes: ", pres.data.name)
			return resolve(pres.data)
		}).
		catch( (err) => {
			console.log("Error in getESPData!")
			return reject('Error in getESPData')
		});
	}); //End of promise
}


//Utility function to get ESP data
function getESPList(){
	return new Promise((resolve) => {

	        //console.log("Starting promise of getESPList")

                axios.get('/api/getConnectedESPs'). //Get all of the names
                then( (res) => {
			console.log("Total number of esp names: " + res.data.esps.length)
                        const requests = res.data.esps.map((nm) =>{ //Once we have all of the name, then get the whole list
				//console.log("Calling getESPData for name: " + nm)
                                return getESPData(nm);                                        
                        });

			//All of the requests have been formed as promises, now just need to run all of them
			Promise.all(requests).then( (allRes) => {
				//console.log('All Promise Results: ' + allRes)
				resolve(allRes) // pass back the collected results!
			});

                }).
                catch( (err) => console.log('There was an error loading ESPStatus: ' + err.message)); //I don't think this is working

	}); //End of promise
}

export default function ESPStatus(){
	const [espList, setEspList] = useState([]) //I think this should probably all be stored in a larger object
	const [loading, setLoading] = useState(true)
	//const [reload, setReload] = useState()

	//Loads the complete status of all ESPs
	useEffect( () => {
		getESPList().then( (data) => {
			setEspList(data)
			setLoading(false) //Just to keep the output reasonable
		});
	}, [getESPList]); //I may want to add dependencies if I have buttons here

	// Handle the toggle for the power button in the ESP object
	function handlePowerToggle(espName){
		//alert('Power Button Pressed for ESP: ' + espName)
		const curEsp = espList.filter(esp => esp.name === espName)[0]; //The last zero just returns the first item
		//console.log('Before toggle light setting for ' + espName + ' : ' + JSON.stringify(curEsp.lighting))

		const nextLight = (curEsp.lighting ? 0 : 1) //At the moment just toggling between 0/1, this could be more complicated

		const pMessage = {"esp":espName,"lightSet":nextLight}
		axios.post('/api/setLighting/',pMessage).
		then( (res) => {
			//console.log('Return is: ' + JSON.stringify(res.data))
			setEspList(espList.map(esp => {
				if(esp.name === espName){ //Only update the one element whose lighting changed
					return {...esp, lighting: res.data.lighting};
				} else {
					return esp;
				}
			}));
		}).
		catch( (err) => console.log('Error with posting power button toggle') );
	} //End of handlePowerToggle

	//Handle what happens when an edit button is un-selected
	function handleEditEnd( oldName, newName, newDesc ){
		//alert('Edit End for ' + oldName + " | " + newName + " | " + newDesc) 
		const curEsp = espList.filter(esp => esp.name === oldName)[0]; //The last zero just returns the first item

		//Send description first to keep oldName the same until changing it
		const pMessage = {"oldName":oldName,"newName":newName,"newDesc":newDesc}
		axios.post('/api/ConfigureESP/',pMessage).
		then( (res) => {
			console.log('Return in: ' + JSON.stringify(res.data))
			setEspList(espList.map(esp => {
                                if(esp.name === oldName){ //Only update the one element whose lighting changed
                                        return {...esp, name: newName, description:newDesc};
                                } else {
                                        return esp;
                                }
                        }));
		});

	} //End of handleEditEnd

        return(
          <>
		<h2>Current ESP List</h2>
		{loading ? 
			<div>Loading...</div>	
		 : 
			<div>
			Number of connected ESPs: {espList.length}
			{espList.map(esp =>
				<li key={esp.name}>
					<ESP espIn={esp}
					     onPowerClick={handlePowerToggle}
					     onEditEnd={handleEditEnd}
					/>
				</li>
			)}
			</div>
		}		
          </>
        );
}

