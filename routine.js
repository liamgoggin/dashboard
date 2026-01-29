// Get routine type from script tag data attribute
const routineType = document.currentScript.dataset.routine;

// Default tasks for each routine
const defaultTasks = {
    morning: [
        'Wake up and make bed',
        'Drink a glass of water',
        'Morning exercise or stretch',
        'Shower and get dressed',
        'Healthy breakfast',
        'Review daily goals'
    ],
    evening: [
        'Prepare tomorrow\'s clothes',
        'Pack bag for tomorrow',
        'Tidy living space',
        'Skincare routine',
        'Read or journal',
        'Lights out by bedtime'
    ]
};

// Storage keys
const TASKS_KEY = `${routineType}_tasks`;
const COMPLETED_KEY = `${routineType}_completed`;
const LAST_RESET_KEY = `${routineType}_last_reset`;

// State
let tasks = [];
let completedTasks = new Set();
let editMode = false;

// DOM elements
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const editModeBtn = document.getElementById('editModeBtn');
const addTaskForm = document.getElementById('addTaskForm');
const newTaskInput = document.getElementById('newTaskInput');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');
const dateElement = document.getElementById('currentDate');

// Initialize
function init() {
    displayDate();
    checkAndResetDaily();
    loadTasks();
    loadCompleted();
    renderTasks();
    attachEventListeners();
}

// Display current date
function displayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Check if we need to reset for a new day
function checkAndResetDaily() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    
    if (lastReset !== today) {
        // New day - reset completed tasks
        localStorage.removeItem(COMPLETED_KEY);
        localStorage.setItem(LAST_RESET_KEY, today);
        completedTasks.clear();
    }
}

// Load tasks from storage
function loadTasks() {
    const stored = localStorage.getItem(TASKS_KEY);
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        // First time - use defaults
        tasks = [...defaultTasks[routineType]];
        saveTasks();
    }
}

// Save tasks to storage
function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// Load completed tasks
function loadCompleted() {
    const stored = localStorage.getItem(COMPLETED_KEY);
    if (stored) {
        completedTasks = new Set(JSON.parse(stored));
    }
}

// Save completed tasks
function saveCompleted() {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...completedTasks]));
}

// Render all tasks
function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskItem = createTaskElement(task, index);
        taskList.appendChild(taskItem);
    });
}

// Create a task element
function createTaskElement(task, index) {
    const div = document.createElement('div');
    div.className = 'task-item';
    if (completedTasks.has(index)) {
        div.classList.add('completed');
    }
    if (editMode) {
        div.classList.add('edit-mode');
    }
    
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = completedTasks.has(index);
    checkbox.addEventListener('change', () => toggleTask(index));
    
    // Label
    const label = document.createElement('label');
    label.textContent = task;
    label.addEventListener('click', () => checkbox.click());
    
    div.appendChild(checkbox);
    div.appendChild(label);
    
    // Edit button (only in edit mode)
    if (editMode) {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-task-btn';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', () => editTask(index));
        div.appendChild(editBtn);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => deleteTask(index));
        div.appendChild(deleteBtn);
    }
    
    return div;
}

// Toggle task completion
function toggleTask(index) {
    if (completedTasks.has(index)) {
        completedTasks.delete(index);
    } else {
        completedTasks.add(index);
    }
    saveCompleted();
    renderTasks();
}

// Delete a task
function deleteTask(index) {
    if (confirm('Delete this task?')) {
        tasks.splice(index, 1);
        completedTasks.delete(index);
        
        // Update completed indices
        const newCompleted = new Set();
        completedTasks.forEach(i => {
            if (i > index) {
                newCompleted.add(i - 1);
            } else if (i < index) {
                newCompleted.add(i);
            }
        });
        completedTasks = newCompleted;
        
        saveTasks();
        saveCompleted();
        renderTasks();
    }
}

// Edit a task
function editTask(index) {
    const taskItem = taskList.children[index];
    const label = taskItem.querySelector('label');
    const currentText = tasks[index];
    
    // Replace label with input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    label.replaceWith(input);
    input.focus();
    input.select();
    
    // Save on enter or blur
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText && newText !== currentText) {
            tasks[index] = newText;
            saveTasks();
        }
        renderTasks();
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

// Add a new task
function addTask() {
    const text = newTaskInput.value.trim();
    if (text) {
        tasks.push(text);
        saveTasks();
        newTaskInput.value = '';
        addTaskForm.classList.add('hidden');
        renderTasks();
    }
}

// Toggle edit mode
function toggleEditMode() {
    editMode = !editMode;
    editModeBtn.textContent = editMode ? '✓ Done' : '✏️ Edit';
    editModeBtn.classList.toggle('btn-primary');
    renderTasks();
}

// Attach event listeners
function attachEventListeners() {
    addTaskBtn.addEventListener('click', () => {
        addTaskForm.classList.toggle('hidden');
        if (!addTaskForm.classList.contains('hidden')) {
            newTaskInput.focus();
        }
    });
    
    saveTaskBtn.addEventListener('click', addTask);
    
    cancelTaskBtn.addEventListener('click', () => {
        newTaskInput.value = '';
        addTaskForm.classList.add('hidden');
    });
    
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    editModeBtn.addEventListener('click', toggleEditMode);
}

// Start the app
init();
