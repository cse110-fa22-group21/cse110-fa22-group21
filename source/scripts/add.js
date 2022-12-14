// Import functions from edit.js
import { openEditForm } from "./edit.js";

// Global Variables
/**
 * @type {Array}
 */
var data = [];
var currentTasks = 0;
const MAX_TASKS = 100; // Change this to set the max number of tasks, currently set to 100 tasks
// Run the init() function when the page has loaded
window.addEventListener("DOMContentLoaded", init);

// Starts the task program, all function calls trace back here
function init() {
	let tasks = getTasksFromStorage();
	// Count the number of tasks in the table, make sure the tasks "finished" are false
	for (let i = 0; i < tasks.length; i++) {
		if (!tasks[i].finished) {
			currentTasks++;
		}
	}
	// Add each task to the <tbody> element
	addTaskToDocument(tasks);
	// Add the event listeners to the form elements
	initFormHandler();
}
// -------------------------- MAX LIMIT TASK POPUP --------------------------------------
document.getElementById("okLimitPopup").addEventListener("click", hideMaxPopup);

/*
 * Max Limit Popup function
 * Once the user clicks on ok button, it will hide the maxLimitPopup display.
 */
function hideMaxPopup() {
	document.getElementById("maxLimitPopup").style.display = "none";
}

// -------------------------- ADD TASK POPUP --------------------------------------

// Add functions to add button on-click
document.getElementById("addButton").addEventListener("click", openForm);
document.getElementById("cancelButton").addEventListener("click", closeForm);

/*
 * Add button function
 * Once the user clicks on the add button, it will check to see if the limit of
 * the number of tasks being displayed has been reached. If yes, then it will
 * display the maxLimitPopup display. If no, the popup form will pop up.
 */
function openForm() {
	// Change how many tasks can be displayed
	if (currentTasks < MAX_TASKS) {
		document.getElementById("popupForm").style.display = "block";
	} else {
		document.getElementById("maxLimitPopup").style.display = "block";
	}
}

/*
 * Cancel button function
 * Once the user clicks on the button, the popup form should be closed
 */
function closeForm() {
	document.getElementById("popupForm").style.display = "none";
}

// -------------------------- ADD DATA STORAGE --------------------------------------
/**
 * Generates a unique ID using crypto.randomUUID.
 * https://stackoverflow.com/questions/1155008/how-unique-is-uuid
 * @returns {string} A unique string ID to represent each task.
 */
function generateUniqueID() {
	return crypto.randomUUID();
}

/**
 * Iterates through each task in tasks. For each task, if the difference
 * is less than 0, then call addTask and add it to the table.
 * Doesn't add a new task once a time difference is calculated,
 * e.g. if the Task is finished
 * @param {Array<Object>} tasks An array of recipes
 */
function addTaskToDocument(tasks) {
	for (let i = 0; i < tasks.length; i++) {
		if (tasks[i].difference < 0) {
			addTask(tasks[i]);
		}
	}
}

/**
 * Populate the table using the data object. This function is specific for
 * the home page.
 *
 * @param {Object} data - The data to pass into the <task>, must be of the
 *                        following format:
 *                        {
 *                          "id": "number",
 *                          "name": "string",
 *                          "hours": "number",
 *                          "minutes": "number",
 *                          "type": "string",
 *                          "status": "string",
 *                          "notes": "string",
 *                          "start": "object",
 *                          "end": "object",
 *                          "difference": "number",
 *                          "started" : "boolean",
 *                          "finished" : "boolean"
 *                        }
 */
function addTask(data) {
	// populate data in the table
	const tableRow = document.createElement("tr");

	// The information from data is added following the below format
	tableRow.innerHTML = `<td>${data.name}</td>
	<td>${data.hours} hr ${data.minutes} min</td>
	<td>${data.status}</td>
	<td>
	<button class="startButton" id="startButton${data.id}">Start</button>
	<button class="editButton" id="editButton${data.id}">
	<img id="editIcon" src="/source/images/edit-icon.svg" alt="Edit icon button for task ${data.id}">
	</button>
	</td>`;
	tableRow.id = `task${data.id}`;
	tableRow.className = "task";
	document.body.querySelector("tbody").append(tableRow);

	// On Click Task Name, Show the Task Notes
	// Create another task row tag and put the notes into it
	const tableRowNotes = document.createElement("tr");
	tableRowNotes.innerHTML = `<td COLSPAN="4">${data.notes}</td>`;
	// Each note will have its own ID
	tableRowNotes.className = "notes";
	tableRowNotes.id = `notes${data.id}`;
	// tableRow.append(tableRowNotes);
	document.body.querySelector("tbody").append(tableRowNotes);

	// Display notes when clicked, hide when clicked again
	tableRow.addEventListener("click", () => {
		document.getElementById(`notes${data.id}`).style.display = document.getElementById(`notes${data.id}`).style.display == "none" ? "table-row" : "none";
		//document.getElementById(`task${data.id}`).childNodes.forEach(x => {if(x.localName == "td") x.style.backgroundColor = (document.getElementById(`notes${data.id}`).style.display=="none") ? "none" : "#e8e0e2"});
	});

	// Checks each data.started and chagnes the innerText of the startButton to Finish or Start
	// Set the button inner to End
	if (data.started) {
		document.getElementById(`startButton${data.id}`).innerText = "Finish";
	}

	// Else set button inner to Start
	else {
		document.getElementById(`startButton${data.id}`).innerText = "Start";
	}

	// Checks to see if the data has already "finished" (data.finished) if so, hide the table row
	if (data.finished) {
		// Hide the current row from the table
		document.getElementById(`task${data.id}`).style.display = "none";
	}

	// When startButton is clicked, check to see if started or not
	document.getElementById(`startButton${data.id}`).addEventListener("click", () => {
		// If started is true
		if (data.started) {
			// Call endSwitch
			endSwitch(data.id);
		}
		// If started is false
		else {
			// Call startSwitch to set the data accordingly
			startSwitch(data.id);
		}
	});

	// When editbutton is clicked, it will call openEditForm to open the form with the populated data
	document.getElementById(`editButton${data.id}`).addEventListener("click", () => {
		openEditForm(data.id);
	});
}

/**
 * Find the task in local storage, set its started to be true, status to be In-Progress
 * and record the start time in start. Once we set the new data, save it to storage and reload the page.
 * @param {number} id ID of the start button.
 */
// Change the ID and Classname of the start button to be endButton
function startSwitch(id) {
	// Obtain tasks from storage
	const taskList = getTasksFromStorage();
	// Iterate until we find the ID
	for (var i = 0; i < taskList.length; i++) {
		// If ID matches, set to be new status
		if (taskList[i].id == id) {
			taskList[i].started = true;
			taskList[i].status = "In-Progress";
			taskList[i].start = new Date();
		}
	}
	saveTaskToStorage(taskList);
	location.reload();
}

/**
 * Find the task in local storage, set its started to be true, status to be In-Progress
 * and record the start time in start. Once we set the new data, save it to storage and reload the page.
 * @param {number} id ID of the start button.
 */
// Change the ID and Classname of the start button to be endButton
function endSwitch(id) {
	// Obtain tasks from storage
	const taskList = getTasksFromStorage();
	// Iterate until we find the ID
	for (var i = 0; i < taskList.length; i++) {
		// If ID matches, set to be new status
		if (taskList[i].id == id) {
			taskList[i].end = new Date();
			taskList[i].status = "Completed";
			taskList[i].finished = true;
			// dates are stringified as JSON into local storage differently, so we need to call
			// Date.parse() to get the correct start time form.
			// Divide by 1000 to get the answer in seconds (instead of milliseconds by default).
			taskList[i].difference = (taskList[i].end - Date.parse(taskList[i].start)) / 1000;
		}
	}
	saveTaskToStorage(taskList);
	location.reload();
}

/**
 * Reads 'tasks' from localStorage and returns an array of
 * all of the tasks found. If nothing is found in localStorage for
 * 'tasks', an empty array is returned.
 * @returns {Array<Object>} An array of recipes found in localStorage
 */
function getTasksFromStorage() {
	return JSON.parse(localStorage.getItem("tasks")) || [];
}

/**
 * Takes in an array of tasks, converts it to a string, and then
 * saves that string to 'tasks' in localStorage
 * @param {Array<Object>} tasks An array of recipes
 */
function saveTaskToStorage(tasks) {
	localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Customized error class to handle invalid input when the form is submitted
 * Invalid input corresponds to negative minutes/hours or minutes greater than 60
 */
class InvalidTime extends Error {
	constructor(message) {
		super(message);
		this.name = "InvalidTime";
	}
}

/** STORE DATA FROM TASK POPUP
 * Initializes the handler function when the task form is submitted.
 *
 * Task data is populated from each input in the form, generated with a unique ID, and
 * assigned the initial status. The new task is then added into local storage.
 */
function initFormHandler() {
	// Get data from task popup form
	const form = document.querySelector("form");

	form.addEventListener("submit", () => {
		// Only addTask to local storage if the currentTasks is less than MAX_TASKS
		// This is to help with E2E tests
		if (currentTasks < MAX_TASKS) {
			let formData = new FormData(form);

			const hours = formData.get("hours");
			const mins = formData.get("minutes");

			try {
				// Check for invalid input (negative or go over 60)
				if (hours < 0 || mins < 0) {
					throw new InvalidTime("Invalid Input! Cannot have Negative Hours/Minutes!");
				} else if (mins > 60) {
					throw new InvalidTime("Invalid Input! Minutes cannot be greater than 60!");
				}

				// Populate taskData with data from the popup form
				let taskData = new Object();
				for (const key of formData.keys()) {
					taskData[key] = formData.get(key);
				}

				// Initially set status to be planned, started and finished to be false, generate unique ID for the task
				// set difference to -1
				taskData.status = "Planned";
				taskData.started = false;
				taskData.finished = false;
				taskData.difference = -1;
				taskData.id = generateUniqueID();

				// populate the table
				addTask(taskData);

				// save data to global variable
				data.push(taskData);

				// Extract data from storage, add the new data then save it to storage
				let tasks = getTasksFromStorage();
				tasks.push(taskData);
				saveTaskToStorage(tasks);
			} catch (err) {
				//message to the user
				alert(err.message);
			}
		}
	});
}

export { getTasksFromStorage, saveTaskToStorage, startSwitch, InvalidTime };
