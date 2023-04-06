import React, { useState } from "react";
import "./QuerySubmitForm.css"

interface Result {
	[key: string]: string | number;
}

const QuerySubmitForm: React.FC = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Result[]>([]);
	const [headerNames, setHeaderNames] = useState<String[]>([])
	const [responseData, setResponseData] = useState("")

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			const queryObj = JSON.parse(query);
			const response = await fetch("http://localhost:4321/query", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(queryObj),
			});
			const json = await response.json();
			setResults(json.result);
			if (!results || results.length < 1) {
				setResponseData("No results")
			}
			let firstResult = json.result[0]
			let headerValues = Object.keys(firstResult)
			setHeaderNames(headerValues)
			setResponseData("")

		} catch (err) {
			setHeaderNames([])
			setResults([])
			setResponseData('Query must be in valid JSON format! For example: ' +
				'{\n' +
				' "WHERE" : {\n' +
				' \t"GT" : { "sections_avg" : 96 }\n' +
				'\t},\n' +
				'"OPTIONS": { ... }')
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>

				<h3>QUERY:</h3>
				<textarea
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					rows={10}
					cols={80}
				/>

				<button type="submit">Submit</button>
			</form>
			<table>
				<thead>
				<tr>
					{headerNames && headerNames.length > 0 ? (
						headerNames.map((colName) => (
							<th>{colName}</th>
						))
					) : (
						<th>No results</th>
					)}
				</tr>
				</thead>
				<tbody>
				{results && results.length > 0 && headerNames && headerNames.length > 0 ? ( // last 2 clauses should
					// always hold
					results.map((result) => (
						<tr>
							{headerNames.map((colName) => (
								<td>{result[colName as keyof typeof result]}</td>
							))}
						</tr>
					))
				) : (
					<tr>
						<td colSpan={3}>No results found</td>
					</tr>
				)}
				</tbody>
			</table>
			<pre>{responseData}</pre>
		</div>
	);
};

export default QuerySubmitForm;
