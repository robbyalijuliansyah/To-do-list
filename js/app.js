// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Task Manager
    const taskManager = new TaskManager();
    
    // Initialize UI Manager
    const uiManager = new UIManager(taskManager);
    
    // Start the application
    uiManager.init();
    
    console.log('Modern To-Do List App initialized successfully!');
});