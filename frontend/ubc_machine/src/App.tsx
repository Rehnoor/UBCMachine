import React, {useState} from 'react';
import './App.css';
import DatasetUploader from "./Components/DatasetUploader";


function App() {

	// const [responseData, setResponseData] = useState("")
	// const handleButtonClick = () => {
	// 	fetch('http://localhost:4321/echo/nice')
	// 		.then(response => response.json())
	// 		.then(data => setResponseData(JSON.stringify(data)))
	// 		.catch(error => console.error(error));
	// };

	return (
		<div>
			<div className="PageTitle">
				<h1>UBC MACHINE</h1>
				<div>
					<DatasetUploader />
				</div>
			</div>

		</div>
	);
}

export default App;
