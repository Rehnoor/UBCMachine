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
				<h3>About UBC Machine</h3>
				<p>Welcome to UBC Machine, a web app for storing and querying datasets containing data all about
				ubc! With this app you can:</p>
				<ul>
					<li>Add datasets that conform to an incredibly specific format. In the highly unlikely event
					that you encounter a dataset you believe may be compatible with UBC Machine, check out the
						<a href="https://sites.google.com/view/ubc-cpsc310-22w2/project/c0#h.jj3nvrjvrihj"> sections </a>
						and
						<a href="https://sites.google.com/view/ubc-cpsc310-22w2/project/checkpoint-2#h.3c6w83pxlaa2"> rooms </a>
					dataset format requirements</li>
					<li>Remove the aforementioned datasets by specifying their unique identifier ID</li>
					<li>Query added datasets using an extensive
					<a href="https://sites.google.com/view/ubc-cpsc310-22w2/project/checkpoint-2#h.gv2vg94gg2m2"> EBNF </a>
					that follows SQL style syntax (Get Answers)</li>
				</ul>
			</div>

		</div>
	);
}

export default App;
