import React, {useState} from 'react';
import './App.css';
import DatasetUploader from "./Components/DatasetUploader";

function AddDatasetDropdown() {

	const [showingAddDataset, setShowingAddDataset] = useState(false)
	const handleAddDatasetToggle = () => {
		setShowingAddDataset(!showingAddDataset)
	}

	return (
		<div className="dropdown">
			<button className="dropdown-toggle" onClick={handleAddDatasetToggle}>
				Add Dataset
				<span className="dropdown-arrow"></span>
			</button>
			<div className={`dropdown-content ${showingAddDataset ? "open" : "closed"}`}>
				<DatasetUploader />
			</div>
		</div>
	);
}


function App() {

	return (
		<div>
			<div className="PageTitle">
				<h1>UBC MACHINE</h1>
			</div>
			<div className="button-band">
				<AddDatasetDropdown />
			</div>

		</div>
	);
}

export default App;
