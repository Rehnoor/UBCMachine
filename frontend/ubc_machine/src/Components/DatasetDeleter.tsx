import React, { useState, ChangeEvent } from 'react';
import './DatasetDeleter.css';

const DatasetDeleter = () => {
	const [id, setId] = useState('')
	const [responseData, setResponseData] = useState("")

	const handleIdChange = (event: ChangeEvent<HTMLInputElement>) => {
		const newId = event.target.value;
		setId(newId);
	};

	const handleDelete = () => {
		if (!id) {
			setResponseData("Please enter a dataset ID")
			return;
		}
		setResponseData("loading...")
		setId("")

		const url = `http://localhost:4321/dataset/${id}/`;
		const options = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/zip'
			},
			body: id
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
			<div className="delete-container">
				<h3>ID:</h3>
				<input type="text" value={id} onChange={handleIdChange} />
				<button className="delete-button" onClick={handleDelete}>Delete</button>
			</div>
			<div>
				<pre>{responseData}</pre>
			</div>

		</>
	);
};

export default DatasetDeleter;
