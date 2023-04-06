import React, {useState} from 'react';
import './App.css';
import DatasetUploader from "./Components/DatasetUploader";
import QuerySubmitForm from "./Components/QuerySubmitForm";

function AddDatasetDropdown() {

	const [showingAddDataset, setShowingAddDataset] = useState(false)
	const [showingQuery, setShowingQuery] = useState(false)
	const handleAddDatasetToggle = () => {
		setShowingAddDataset(!showingAddDataset)
	}

	const handleQueryToggle = () => {
		setShowingQuery(!showingQuery)
	}

	return (

		<div className="dropdown-container">
			<div className="dropdown-buttons">
				<button className="dropdown-toggle" onClick={handleAddDatasetToggle}>
					Add Dataset
				</button>
				<button className="dropdown-toggle" onClick={handleQueryToggle}>
					Get Answers
				</button>
			</div>
			<div className={`dropdown-content-container ${showingAddDataset || showingQuery ? "open" : "closed"}`}>
				{showingAddDataset && <DatasetUploader />}
				{showingQuery && <QuerySubmitForm />}
			</div>
		</div>

	);
}


function App() {

	return (
		<div className="container">
			<div className="PageTitle">
				<h1>UBC MACHINE</h1>
			</div>
			<div className="button-band">
				<AddDatasetDropdown />
			</div>
			<div className="content">
				<h3>About UBC MACHINE</h3>
				<p>Welcome to UBC MACHINE, a web app for storing and using datasets that conform to a incredibly specific
				set of specifications!</p>
			</div>

		</div>
	);
}

export default App;
