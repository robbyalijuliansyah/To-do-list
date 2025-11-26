// UI Manager - Handles all DOM manipulations and user interactions
class UIManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.editingTaskId = null;
        this.selectedCategory = 'other';

        this.initializeElements();
        this.initializeEventListeners();
        this.setMinDateForDeadline();
        this.initializeTheme();
    }

    initializeElements() {
        // DOM Elements
        this.elements = {
            // Theme
            themeToggle: document.getElementById('theme-toggle'),
            
            // Sidebar
            totalTasks: document.getElementById('total-tasks'),
            completedTasks: document.getElementById('completed-tasks'),
            pendingTasks: document.getElementById('pending-tasks'),
            overdueTasks: document.getElementById('overdue-tasks'),
            overdueBadge: document.getElementById('overdue-badge'),
            navBtns: document.querySelectorAll('.nav-btn'),
            
            // Header
            addTaskBtn: document.getElementById('add-task-btn'),
            searchInput: document.getElementById('search-input'),
            sortSelect: document.getElementById('sort-select'),
            viewBtns: document.querySelectorAll('.view-btn'),
            
            // Quick Stats
            highPriorityCount: document.getElementById('high-priority-count'),
            todayCount: document.getElementById('today-count'),
            weekCount: document.getElementById('week-count'),
            
            // Tasks
            tasksContainer: document.getElementById('tasks-container'),
            
            // Modals
            addTaskModal: document.getElementById('add-task-modal'),
            editTaskModal: document.getElementById('edit-task-modal'),
            taskDetailsModal: document.getElementById('task-details-modal'),
            
            // Add Task Modal
            taskTitle: document.getElementById('task-title'),
            taskDescription: document.getElementById('task-description'),
            taskDeadline: document.getElementById('task-deadline'),
            taskPriority: document.getElementById('task-priority'),
            closeAddModal: document.getElementById('close-add-modal'),
            cancelAddTask: document.getElementById('cancel-add-task'),
            saveTask: document.getElementById('save-task'),
            categoryTags: document.querySelectorAll('.category-tag'),
            
            // Edit Task Modal
            editTitle: document.getElementById('edit-title'),
            editDescription: document.getElementById('edit-description'),
            editDeadline: document.getElementById('edit-deadline'),
            editPriority: document.getElementById('edit-priority'),
            closeEditModal: document.getElementById('close-edit-modal'),
            cancelEdit: document.getElementById('cancel-edit'),
            saveEdit: document.getElementById('save-edit'),
            deleteTask: document.getElementById('delete-task'),
            editCategoryTags: document.querySelectorAll('.category-tag'),
            
            // Task Details Modal
            closeDetailsModal: document.getElementById('close-details-modal'),
            closeDetails: document.getElementById('close-details'),
            editFromDetails: document.getElementById('edit-from-details'),
            detailsTitle: document.getElementById('details-title'),
            detailsPriority: document.getElementById('details-priority'),
            detailsDeadline: document.getElementById('details-deadline'),
            detailsCategory: document.getElementById('details-category'),
            detailsCreated: document.getElementById('details-created'),
            detailsDescription: document.getElementById('details-description')
        };
    }

    initializeEventListeners() {
        // Theme
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Navigation
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.navBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFilter = e.currentTarget.dataset.filter;
                this.renderTasks();
            });
        });

        // Header Actions
        this.elements.addTaskBtn.addEventListener('click', () => this.openAddTaskModal());
        this.elements.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.renderTasks();
        });
        this.elements.sortSelect.addEventListener('change', (e) => {
            this.taskManager.setSort(e.target.value);
            this.renderTasks();
        });
        this.elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.viewBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.taskManager.setView(e.currentTarget.dataset.view);
                this.renderTasks();
            });
        });

        // Add Task Modal
        this.elements.closeAddModal.addEventListener('click', () => this.closeAddTaskModal());
        this.elements.cancelAddTask.addEventListener('click', () => this.closeAddTaskModal());
        this.elements.saveTask.addEventListener('click', () => this.handleAddTask());
        this.elements.categoryTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.elements.categoryTags.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.selectedCategory = e.currentTarget.dataset.category;
            });
        });

        // Edit Task Modal
        this.elements.closeEditModal.addEventListener('click', () => this.closeEditTaskModal());
        this.elements.cancelEdit.addEventListener('click', () => this.closeEditTaskModal());
        this.elements.saveEdit.addEventListener('click', () => this.handleSaveEdit());
        this.elements.deleteTask.addEventListener('click', () => this.handleDeleteTask());
        this.elements.editCategoryTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.elements.editCategoryTags.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.selectedCategory = e.currentTarget.dataset.category;
            });
        });

        // Task Details Modal
        this.elements.closeDetailsModal.addEventListener('click', () => this.closeTaskDetailsModal());
        this.elements.closeDetails.addEventListener('click', () => this.closeTaskDetailsModal());
        this.elements.editFromDetails.addEventListener('click', () => this.editFromDetails());

        // Close modals when clicking outside
        [this.elements.addTaskModal, this.elements.editTaskModal, this.elements.taskDetailsModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.elements.searchInput.focus();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openAddTaskModal();
            }
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    setMinDateForDeadline() {
        const now = new Date();
        const localDateTime = now.toISOString().slice(0, 16);
        this.elements.taskDeadline.min = localDateTime;
        this.elements.editDeadline.min = localDateTime;
    }

    // Task Management
    handleAddTask() {
        try {
            const title = this.elements.taskTitle.value;
            const description = this.elements.taskDescription.value;
            const deadline = this.elements.taskDeadline.value;
            const priority = this.elements.taskPriority.value;

            if (!title || !title.trim()) {
                this.showNotification('Task title is required!', 'error');
                return;
            }

            this.taskManager.addTask(title, description, deadline, priority, this.selectedCategory);
            this.renderTasks();
            this.updateStats();
            this.closeAddTaskModal();
            this.showNotification('Task created successfully!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handleSaveEdit() {
        try {
            const title = this.elements.editTitle.value;
            const description = this.elements.editDescription.value;
            const deadline = this.elements.editDeadline.value;
            const priority = this.elements.editPriority.value;

            if (!title || !title.trim()) {
                this.showNotification('Task title is required!', 'error');
                return;
            }

            this.taskManager.editTask(this.editingTaskId, title, description, deadline, priority, this.selectedCategory);
            this.renderTasks();
            this.closeEditTaskModal();
            this.showNotification('Task updated successfully!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handleDeleteTask() {
        if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            try {
                this.taskManager.deleteTask(this.editingTaskId);
                this.renderTasks();
                this.updateStats();
                this.closeEditTaskModal();
                this.showNotification('Task deleted successfully!', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    handleToggleTask(taskId) {
        try {
            this.taskManager.toggleTask(taskId);
            this.renderTasks();
            this.updateStats();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // Modal Management
    openAddTaskModal() {
        this.elements.addTaskModal.style.display = 'flex';
        this.elements.taskTitle.focus();
        // Reset form
        this.elements.taskTitle.value = '';
        this.elements.taskDescription.value = '';
        this.elements.taskDeadline.value = '';
        this.elements.taskPriority.value = 'medium';
        this.elements.categoryTags.forEach(tag => tag.classList.remove('active'));
        this.elements.categoryTags[4].classList.add('active'); // Select "Other" by default
        this.selectedCategory = 'other';
    }

    closeAddTaskModal() {
        this.elements.addTaskModal.style.display = 'none';
    }

    openEditTaskModal(taskId) {
        const task = this.taskManager.getTaskById(taskId);
        if (task) {
            this.editingTaskId = taskId;
            this.elements.editTitle.value = task.title || '';
            this.elements.editDescription.value = task.description || '';
            this.elements.editDeadline.value = this.taskManager.formatDateForInput(task.deadline);
            this.elements.editPriority.value = task.priority;
            
            // Set category
            this.elements.editCategoryTags.forEach(tag => tag.classList.remove('active'));
            const categoryTag = Array.from(this.elements.editCategoryTags).find(
                tag => tag.dataset.category === task.category
            );
            if (categoryTag) {
                categoryTag.classList.add('active');
                this.selectedCategory = task.category;
            }
            
            this.elements.editTaskModal.style.display = 'flex';
            this.elements.editTitle.focus();
        }
    }

    closeEditTaskModal() {
        this.elements.editTaskModal.style.display = 'none';
        this.editingTaskId = null;
    }

    openTaskDetailsModal(taskId) {
        const task = this.taskManager.getTaskById(taskId);
        if (task) {
            this.elements.detailsTitle.textContent = task.title;
            this.elements.detailsPriority.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            this.elements.detailsPriority.className = `priority-${task.priority}`;
            
            const deadlineStatus = this.taskManager.getDeadlineStatus(task);
            this.elements.detailsDeadline.textContent = deadlineStatus.text;
            this.elements.detailsDeadline.className = `deadline-${deadlineStatus.status}`;
            
            this.elements.detailsCategory.textContent = task.category.charAt(0).toUpperCase() + task.category.slice(1);
            this.elements.detailsCategory.style.color = this.taskManager.getCategoryColor(task.category);
            
            this.elements.detailsCreated.textContent = this.taskManager.formatDate(task.createdAt);
            this.elements.detailsDescription.textContent = task.description || 'No description provided.';
            
            this.elements.taskDetailsModal.style.display = 'flex';
        }
    }

    closeTaskDetailsModal() {
        this.elements.taskDetailsModal.style.display = 'none';
    }

    editFromDetails() {
        this.closeTaskDetailsModal();
        this.openEditTaskModal(this.editingTaskId);
    }

    closeAllModals() {
        this.closeAddTaskModal();
        this.closeEditTaskModal();
        this.closeTaskDetailsModal();
    }

    // Rendering
    renderTasks() {
        const tasks = this.taskManager.getTasks(this.currentFilter, this.currentSearch);
        this.elements.tasksContainer.innerHTML = '';

        if (tasks.length === 0) {
            this.elements.tasksContainer.innerHTML = this.createEmptyState();
            return;
        }

        // Set container class based on view mode
        this.elements.tasksContainer.className = `tasks-container ${this.taskManager.currentView}-view`;

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.elements.tasksContainer.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        const deadlineStatus = this.taskManager.getDeadlineStatus(task);
        const isOverdue = deadlineStatus.status === 'overdue' && !task.completed;
        
        taskElement.className = `task-card ${task.priority}-priority ${isOverdue ? 'overdue' : ''}`;
        taskElement.innerHTML = this.getTaskHTML(task, deadlineStatus);
        
        // Add event listeners
        this.attachTaskEventListeners(taskElement, task);
        
        return taskElement;
    }

    getTaskHTML(task, deadlineStatus) {
        return `
            <div class="task-header">
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                <div class="task-actions">
                    <button class="action-btn view-btn" data-id="${task.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" data-id="${task.id}" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${task.id}" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            ${task.description ? `
                <div class="task-description">${this.escapeHtml(task.description)}</div>
            ` : ''}
            
            <div class="task-meta">
                <div class="meta-item">
                    <span class="priority-badge priority-${task.priority}">
                        ${task.priority}
                    </span>
                </div>
                <div class="meta-item">
                    <i class="fas ${this.taskManager.getCategoryIcon(task.category)}"></i>
                    <span>${task.category}</span>
                </div>
                <div class="meta-item">
                    <i class="fas ${deadlineStatus.icon}"></i>
                    <span class="deadline-${deadlineStatus.status}">${deadlineStatus.text}</span>
                </div>
            </div>
            
            <div class="task-footer">
                <div class="task-checkbox" data-id="${task.id}">
                    <div class="checkbox ${task.completed ? 'checked' : ''}"></div>
                    <span>${task.completed ? 'Completed' : 'Mark complete'}</span>
                </div>
                <div class="task-date">
                    <small>${this.taskManager.formatDate(task.updatedAt)}</small>
                </div>
            </div>
        `;
    }

    attachTaskEventListeners(taskElement, task) {
        // Checkbox
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('click', () => this.handleToggleTask(task.id));

        // Action buttons
        const viewBtn = taskElement.querySelector('.view-btn');
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editingTaskId = task.id;
            this.openTaskDetailsModal(task.id);
        });

        const editBtn = taskElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditTaskModal(task.id);
        });

        const deleteBtn = taskElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this task?')) {
                this.handleDeleteTask(task.id);
            }
        });

        // Click on task card to view details
        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-actions') && !e.target.closest('.task-checkbox')) {
                this.editingTaskId = task.id;
                this.openTaskDetailsModal(task.id);
            }
        });
    }

    createEmptyState() {
        const emptyStates = {
            all: {
                icon: 'fa-clipboard-list',
                title: 'No tasks yet',
                message: 'Get started by creating your first task!'
            },
            today: {
                icon: 'fa-calendar-day',
                title: 'No tasks for today',
                message: 'Enjoy your day! Or create a new task with today\'s deadline.'
            },
            upcoming: {
                icon: 'fa-calendar-alt',
                title: 'No upcoming tasks',
                message: 'All your tasks are either completed or have no deadlines set.'
            },
            overdue: {
                icon: 'fa-exclamation-triangle',
                title: 'No overdue tasks',
                message: 'Great job! You\'re staying on top of your deadlines.'
            },
            completed: {
                icon: 'fa-check-double',
                title: 'No completed tasks',
                message: 'Tasks you complete will appear here.'
            }
        };

        const state = emptyStates[this.currentFilter] || emptyStates.all;

        return `
            <div class="empty-state">
                <i class="fas ${state.icon}"></i>
                <h3>${state.title}</h3>
                <p>${state.message}</p>
                ${this.currentSearch ? '<p>Try adjusting your search terms.</p>' : ''}
            </div>
        `;
    }

    // Stats and Updates
    updateStats() {
        const stats = this.taskManager.getStats();
        const advancedStats = this.taskManager.getAdvancedStats();

        // Basic stats
        this.elements.totalTasks.textContent = stats.total;
        this.elements.completedTasks.textContent = stats.completed;
        this.elements.pendingTasks.textContent = stats.pending;
        this.elements.overdueTasks.textContent = stats.overdue;
        this.elements.overdueBadge.textContent = stats.overdue;

        // Quick stats
        this.elements.highPriorityCount.textContent = advancedStats.highPriority;
        this.elements.todayCount.textContent = advancedStats.dueToday;
        this.elements.weekCount.textContent = advancedStats.dueThisWeek;
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: var(--radius-md);
            color: white;
            font-weight: 600;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            background: ${this.getNotificationColor(type)};
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: var(--shadow-lg);
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: 'var(--success)',
            error: 'var(--danger)',
            warning: 'var(--warning)',
            info: 'var(--info)'
        };
        return colors[type] || 'var(--info)';
    }

    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined || unsafe === '') {
            return '';
        }
        return unsafe.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initialize the UI
    init() {
        this.renderTasks();
        this.updateStats();
        console.log('TaskFlow UI initialized successfully!');
    }
}