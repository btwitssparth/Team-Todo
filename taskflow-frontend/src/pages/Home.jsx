import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, CheckCircle, Circle, Calendar, Tag } from "lucide-react";
import api from "../services/api";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  });
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTask, setEditTask] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all tasks of logged-in user
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await api.get("/tasks");
      console.log("Tasks response:", response.data);
      
      // Your backend returns response.data.data, not response.data.tasks
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tasks", error);
      setError(error.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    try {
      setError("");
      await api.post("/tasks", newTask);
      
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: ""
      });
      fetchTasks();
    } catch (error) {
      console.error("Error adding task", error);
      setError(error.response?.data?.message || "Failed to add task");
    }
  };

  // Update task
  const updateTask = async (id) => {
    try {
      setError("");
      await api.put(`/tasks/${id}`, editTask);
      
      setEditTaskId(null);
      setEditTask({});
      fetchTasks();
    } catch (error) {
      console.error("Error updating task", error);
      setError(error.response?.data?.message || "Failed to update task");
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (task) => {
    try {
      setError("");
      await api.put(`/tasks/${task._id}`, {
        ...task,
        completed: !task.completed,
        status: !task.completed ? "completed" : "pending"
      });
      fetchTasks();
    } catch (error) {
      console.error("Error toggling task", error);
      setError(error.response?.data?.message || "Failed to update task");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      setError("");
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task", error);
      setError(error.response?.data?.message || "Failed to delete task");
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditTaskId(null);
    setEditTask({});
  };

  // Start editing
  const startEdit = (task) => {
    setEditTaskId(task._id);
    setEditTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
    });
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Task Manager
          </h1>
          <p className="text-gray-600">Organize your tasks efficiently</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Add Task Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Add New Task
          </h2>
          
          <form onSubmit={addTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <div>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description (optional)..."
                  rows="3"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Tasks ({tasks.length})
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-500">Create your first task to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    task.completed 
                      ? "bg-green-50 border-green-200" 
                      : "bg-gray-50 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {editTaskId === task._id ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editTask.title}
                          onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Task title"
                        />
                        <select
                          value={editTask.priority}
                          onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                      
                      <textarea
                        value={editTask.description}
                        onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Description"
                        rows="2"
                      />
                      
                      <input
                        type="date"
                        value={editTask.dueDate}
                        onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTask(task._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTaskCompletion(task)}
                        className="mt-1 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.status && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                              {task.status}
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className={`text-sm mb-2 ${task.completed ? "text-gray-400" : "text-gray-600"}`}>
                            {task.description}
                          </p>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            Due: {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(task)}
                          className="text-blue-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;