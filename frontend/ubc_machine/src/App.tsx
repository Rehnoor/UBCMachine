import React, {useState} from 'react';
import './App.css';


interface Props {
	handleClick: () => void;
}

function AddDatasetButton(props: Props) {
	return (
		<button className="AddDatasetButton"
				onClick ={props.handleClick}>
			Add Dataset
		</button>
	)
}

function App() {

	const [responseData, setResponseData] = useState("")

	const handleButtonClick = () => {
		fetch('http://localhost:4321/echo/nice')
			.then(response => response.json())
			.then(data => setResponseData(JSON.stringify(data)))
			.catch(error => console.error(error));
	};

	return (
		<div>
			<div className="PageTitle">
				<h1>UBC MACHINE</h1>
				<div>
					<AddDatasetButton handleClick={handleButtonClick}/>
				</div>
			</div>
			<p>
				{responseData}
			</p>
		</div>
	);
}

export default App;
