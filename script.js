
// Get references to HTML elements

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskStatus = document.getElementById("task-status");

taskInput.addEventListener("input", () => {
    taskInput.removeAttribute("aria-invalid");
});

const filterButtons = document.querySelectorAll("[data-filter]");

// Store all tasks in an array
let tasks = [];

// Initially, show all tasks
let currentFilter = "all";


function renderTasks() {

    // Clear the existing task list
    taskList.innerHTML = "";

    // Filter tasks based on the selected filter
    const filteredTasks = tasks.filter(task => {

        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    // Display each task
    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        // Create the task label
        const label = document.createElement("label");
        label.className = "task-label";

        // Create the checkbox
        const checkbox = document.createElement("input");
        checkbox.dataset.taskId = task.id;
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        // Create the task text
        const span = document.createElement("span");
        span.textContent = task.text;

        if (task.completed) {
            span.classList.add("completed");
        }

        // Connect checkbox and task text
        label.appendChild(checkbox);
        label.appendChild(span);

        // Create delete button
        const deleteButton = document.createElement("button");
        deleteButton.dataset.taskId = task.id;
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        

        deleteButton.setAttribute(
            "aria-label",
            `Delete task: ${task.text}`
        );

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        // Add elements to the list item
        li.appendChild(label);
        li.appendChild(deleteButton);

        // Add list item to the task list
        taskList.appendChild(li);

    });

}


function addTask(text) {

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskStatus.textContent = `Task added: ${text}`;

}

// Listen for form submission

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {

        taskInput.setAttribute("aria-invalid", "true");

        taskStatus.textContent =
            "Please enter a task. The task field cannot be empty.";

        taskInput.focus();

        return;
    }

    // The input is now valid
    taskInput.removeAttribute("aria-invalid");

    addTask(text);

    // Clear the input field
    taskInput.value = "";

    // Return focus to the input
    taskInput.focus();

});



function restoreTaskFocus(taskId, selector) {

    let element = null;

    if (taskId !== null && taskId !== undefined) {
        element = taskList.querySelector(
            `${selector}[data-task-id="${taskId}"]`
        );
    }

    if (!element) {
        element = taskList.querySelector(selector);
    }

    if (!element) {
        element = document.querySelector(
            '[data-filter][aria-pressed="true"]'
        );
    }

    if (!element) {
        element = taskInput;
    }

    element.focus();
}


function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (task) {

        task.completed = !task.completed;

        saveTasks();
        renderTasks();

        restoreTaskFocus(id, 'input[type="checkbox"]');

        taskStatus.textContent = task.completed
            ? `Task completed: ${task.text}`
            : `Task marked as pending: ${task.text}`;

    }

}



function deleteTask(id) {

    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return;
    } 

    const deletedTask = tasks[index];

    const nextTask = tasks[index + 1] || tasks[index - 1];

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();

    restoreTaskFocus(
        nextTask ? nextTask.id : null,
        "button.delete-button"
    );

    taskStatus.textContent =
        `Task deleted: ${deletedTask.text}`;

}


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Update the current filter
        currentFilter = button.dataset.filter;

        // Update the selected state
        filterButtons.forEach(filterButton => {

            const isSelected =
                filterButton.dataset.filter === currentFilter;

            filterButton.setAttribute(
                "aria-pressed",
                isSelected
            );

        });

        renderTasks();

        taskStatus.textContent =
            `Showing ${currentFilter} tasks.`;

    });

});


function saveTasks() {

    localStorage.setItem(
        "accessboard-tasks",
        JSON.stringify(tasks)
    );

}


function loadTasks() {

    const savedTasks = localStorage.getItem(
        "accessboard-tasks"
    );

    if (savedTasks) {

        try {
            tasks = JSON.parse(savedTasks);

            // Ensure the stored data is an array
            if (!Array.isArray(tasks)) {
                tasks = [];
            }

        } catch (error) {

            tasks = [];
            taskStatus.textContent =
                "Saved tasks could not be loaded.";

        }

    }

}


// Load previously saved tasks
loadTasks();

// Display tasks when the page opens
renderTasks();
