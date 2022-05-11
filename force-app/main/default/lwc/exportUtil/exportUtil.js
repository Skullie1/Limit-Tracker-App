/**
 * Converts an array of Javascript objects into CSV format, then initiates a download of that CSV, in UTF-8 encoding and
 * named according to the provided file name and the current date.
 * @param {string} fileName Name of the output file to be written.
 * @param {Object[]} objArray An array of Javascript objects.
 */
export const exportCSV = (fileName, objArray) => {
	// Collect the CSV column headers based on the superset of attributes of each object in the array.
	let csvHeaders = new Set();
	objArray.forEach(function (currObj) {
		Object.keys(currObj).forEach(function (key) {
			csvHeaders.add(key);
		});
	});

	// Convert the set into an array so that it can be manipulated to build the header row.
	csvHeaders = Array.from(csvHeaders);
	let csvString = csvHeaders.join(',') + '\n';

	// Iterate through the headers for each row and populate each cell (with data if attribute present or null if not).
	for (let objIndex = 0; objIndex < objArray.length; objIndex++) {
		for (let headerIndex = 0; headerIndex < csvHeaders.length; headerIndex++){
			let currHeader = csvHeaders[headerIndex];
			let value = objArray[objIndex][currHeader] === undefined ? '' : objArray[objIndex][currHeader];
			csvString += '"' + value + '",';
		}

		// Eliminate the final comma and append a new line at the end of each row.
		csvString = csvString.slice(0,-1) + '\n';
	}

	/*
	Create an anchor element and ensure it is set to link a UTF-8 encoded copy of the CSV built by this function, named
	according to the provided parameter + current date.
	 */

	let downloadElement = document.createElement('a');
	downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
	downloadElement.target = '_self';
	downloadElement.download = fileName + Date.now() + '.csv';

	// Add the anchor element to the page (required for Firefox) and click it to initiate the download.
	document.body.appendChild(downloadElement);
	downloadElement.click();
};