// Task Manager - Handles task data and localStorage operations
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentSort = 'newest';
        this.currentView = 'list';
    }

    loadTasks() {
        try {
            const tasks = localStorage.getItem('tasks');
            const parsedTasks = tasks ? JSON.parse(tasks) : [];
            
            // Validasi dan bersihkan data yang korup
            return parsedTasks.filter(task => this.validateTask(task));
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    validateTask(task) {
        if (!task || typeof task !== 'object') {
            return false;
        }
        
        // Pastikan properti yang diperlukan ada
        if (!task.id || !task.title) {
            return false;
        }
        
        // Set default values untuk properti baru
        task.priority = task.priority || 'medium';
        task.category = task.category || 'other';
        task.deadline = task.deadline || null;
        
        return true;
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    addTask(title, description = '', deadline = null, priority = 'medium', category = 'other') {
        if (!title || !title.trim()) {
            throw new Error('Judul tugas tidak boleh kosong');
        }

        const newTask = {
            id: Date.now(),
            title: title.trim(),
            description: description ? description.trim() : '',
            deadline: deadline,
            priority: priority,
            category: category,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        return newTask;
    }

    editTask(id, title, description = '', deadline = null, priority = 'medium', category = 'other') {
        if (!title || !title.trim()) {
            throw new Error('Judul tugas tidak boleh kosong');
        }

        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) {
            throw new Error('Tugas tidak ditemukan');
        }

        this.tasks[taskIndex].title = title.trim();
        this.tasks[taskIndex].description = description ? description.trim() : '';
        this.tasks[taskIndex].deadline = deadline;
        this.tasks[taskIndex].priority = priority;
        this.tasks[taskIndex].category = category;
        this.tasks[taskIndex].updatedAt = new Date().toISOString();
        
        this.saveTasks();
        return this.tasks[taskIndex];
    }

    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) {
            throw new Error('Tugas tidak ditemukan');
        }

        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
    }

    toggleTask(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) {
            throw new Error('Tugas tidak ditemukan');
        }

        this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
        this.tasks[taskIndex].updatedAt = new Date().toISOString();
        this.saveTasks();
        
        return this.tasks[taskIndex];
    }

    getTasks(filter = 'all', searchQuery = '') {
        let filteredTasks = this.tasks;
        
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query) ||
                task.category.toLowerCase().includes(query)
            );
        }
        
        // Apply category filter
        switch (filter) {
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
            case 'pending':
                filteredTasks = filteredTasks.filter(task => !task.completed);
                break;
            case 'overdue':
                filteredTasks = filteredTasks.filter(task => 
                    !task.completed && 
                    task.deadline && 
                    new Date(task.deadline) < new Date()
                );
                break;
            case 'today':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                filteredTasks = filteredTasks.filter(task => 
                    !task.completed && 
                    task.deadline && 
                    new Date(task.deadline) >= today && 
                    new Date(task.deadline) < tomorrow
                );
                break;
            case 'upcoming':
                const now = new Date();
                const nextWeek = new Date(now);
                nextWeek.setDate(nextWeek.getDate() + 7);
                filteredTasks = filteredTasks.filter(task => 
                    !task.completed && 
                    task.deadline && 
                    new Date(task.deadline) > now &&
                    new Date(task.deadline) <= nextWeek
                );
                break;
            default:
                // 'all' - no additional filtering
                break;
        }
        
        // Apply sorting
        return this.sortTasks(filteredTasks, this.currentSort);
    }

    sortTasks(tasks, sortBy) {
        const sortedTasks = [...tasks];
        
        switch (sortBy) {
            case 'newest':
                return sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return sortedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'deadline':
                return sortedTasks.sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                });
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            case 'title':
                return sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sortedTasks;
        }
    }

    setSort(sortBy) {
        this.currentSort = sortBy;
    }

    setView(view) {
        this.currentView = view;
    }

    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const overdue = this.tasks.filter(task => 
            !task.completed && 
            task.deadline && 
            new Date(task.deadline) < new Date()
        ).length;

        return { total, completed, pending, overdue };
    }

    getAdvancedStats() {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const highPriority = this.tasks.filter(task => 
            !task.completed && task.priority === 'high'
        ).length;

        const dueToday = this.tasks.filter(task => 
            !task.completed && 
            task.deadline && 
            new Date(task.deadline) >= today && 
            new Date(task.deadline) < tomorrow
        ).length;

        const dueThisWeek = this.tasks.filter(task => 
            !task.completed && 
            task.deadline && 
            new Date(task.deadline) >= today && 
            new Date(task.deadline) <= nextWeek
        ).length;

        return { highPriority, dueToday, dueThisWeek };
    }

    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Tanggal tidak valid';
        }
    }

    formatDateForInput(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            // Format: YYYY-MM-DDTHH:mm
            return date.toISOString().slice(0, 16);
        } catch (error) {
            return '';
        }
    }

    getDeadlineStatus(task) {
        if (!task.deadline) {
            return { status: 'none', text: 'No deadline', icon: 'fa-calendar-times' };
        }

        const now = new Date();
        const deadline = new Date(task.deadline);
        const timeDiff = deadline - now;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (task.completed) {
            return { status: 'completed', text: `Completed - ${this.formatDate(task.deadline)}`, icon: 'fa-check-circle' };
        }

        if (timeDiff < 0) {
            const overdueDays = Math.abs(daysDiff);
            return { 
                status: 'overdue', 
                text: `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`,
                icon: 'fa-exclamation-circle'
            };
        }

        if (daysDiff === 0) {
            return { status: 'today', text: 'Due today', icon: 'fa-clock' };
        }

        if (daysDiff === 1) {
            return { status: 'tomorrow', text: 'Due tomorrow', icon: 'fa-calendar-day' };
        }

        if (daysDiff <= 7) {
            return { status: 'upcoming', text: `Due in ${daysDiff} days`, icon: 'fa-calendar-alt' };
        }

        return { status: 'future', text: `Due ${this.formatDate(task.deadline)}`, icon: 'fa-calendar' };
    }

    getCategoryColor(category) {
        const colors = {
            work: '#3b82f6',
            personal: '#ec4899',
            shopping: '#f59e0b',
            health: '#10b981',
            other: '#6b7280'
        };
        return colors[category] || '#6b7280';
    }

    getCategoryIcon(category) {
        const icons = {
            work: 'fa-briefcase',
            personal: 'fa-user',
            shopping: 'fa-shopping-cart',
            health: 'fa-heart',
            other: 'fa-star'
        };
        return icons[category] || 'fa-star';
    }

    exportTasks() {
        const data = {
            exportedAt: new Date().toISOString(),
            totalTasks: this.tasks.length,
            tasks: this.tasks
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importTasks(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.tasks && Array.isArray(data.tasks)) {
                        // Validasi setiap task sebelum mengimpor
                        const validTasks = data.tasks.filter(task => this.validateTask(task));
                        this.tasks = validTasks;
                        this.saveTasks();
                        resolve(validTasks.length);
                    } else {
                        reject(new Error('Format file tidak valid'));
                    }
                } catch (error) {
                    reject(new Error('Gagal memparse file JSON'));
                }
            };
            reader.onerror = () => reject(new Error('Gagal membaca file'));
            reader.readAsText(file);
        });
    }
}