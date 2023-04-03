import React, { useState, ChangeEvent } from 'react';

const DatasetUploader = () => {
	const [file, setFile] = useState<File | null>(null);
	const [id, setId] = useState('');
	const [type, setType] = useState<'sections' | 'rooms'>('sections');
	const [responseData, setResponseData] = useState("")

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files ? event.target.files[0] : null;
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
			return;
		}

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
				// Handle error as needed
				console.log(error)
			});
	};

	return (
		<>
			<input type="text" value={id} onChange={handleIdChange} />
			<select value={type} onChange={handleTypeChange}>
				<option value="sections">Sections</option>
				<option value="rooms">Rooms</option>
			</select>
			<input type="file" onChange={handleFileChange} />
			<button onClick={handleFileUpload}>Upload</button>
			<pre>{responseData}</pre>
		</>
	);
};

export default DatasetUploader;
