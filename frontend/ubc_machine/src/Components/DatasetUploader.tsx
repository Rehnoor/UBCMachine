import React, { useState, ChangeEvent } from 'react';
import './DatasetUploader.css';

const DatasetUploader = () => {
	const [file, setFile] = useState<File | null>(null);
	const [fileName, setFileName] = useState('Select a File')
	const [id, setId] = useState('');
	const [type, setType] = useState<'sections' | 'rooms'>('sections');
	const [responseData, setResponseData] = useState("")

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files ? event.target.files[0] : null;
		setFileName(selectedFile ? selectedFile.name : "Select a File")
		setFile(selectedFile);
	};

	const handleIdChange = (event: ChangeEvent<HTMLInputElement>) => {
		const newId = event.target.value;
		setId(newId);
	};

	const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const newType = event.target.value as 'sections' | 'rooms';
		setType(newType);
	};

	const handleFileUpload = () => {
		if (!file) {
			// handle error - no file selected
			// just do nothing or possibly give error message
			setResponseData("No File Selected")
			return;
		}
		if (!id) {
			setResponseData("Please enter a dataset ID")
			return;
		}
		setResponseData("loading...")
		setId("")

		const url = `http://localhost:4321/dataset/${id}/${type}`;
		const options = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/zip'
			},
			body: file
		};

		fetch(url, options)
			.then(response => response.json())
			.then(data => setResponseData(JSON.stringify(data)))
			.catch(error => {
				console.log(error)
			});
	};

	return (
		<>
			<div className="upload-container">
				<h3>ID:</h3>
				<input type="text" value={id} onChange={handleIdChange} />
				<h3>TYPE:</h3>
				<select value={type} onChange={handleTypeChange}>
					<option value="sections">Sections</option>
					<option value="rooms">Rooms</option>
				</select>
				<label htmlFor="file-upload" className="upload-button choose-file-button">Choose File</label>
				<input id="file-upload" type="file" onChange={handleFileChange} />
				<pre>{fileName}</pre>
				<button className="upload-button" onClick={handleFileUpload}>Upload</button>
			</div>
			<div>
				<pre>{responseData}</pre>
			</div>

		</>
	);
};

export default DatasetUploader;
