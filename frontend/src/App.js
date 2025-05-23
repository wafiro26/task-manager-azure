import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Error fetching tasks:', response.status);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask,
          completed: false
        }),
      });
      
      if (response.ok) {
        const task = await response.json();
        setTasks([...tasks, task]);
        setNewTask('');
      } else {
        console.error('Error adding task:', response.status);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          completed: !task.completed
        }),
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 Gestionnaire de Tâches Azure</h1>
        
        <div className="task-input">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nouvelle tâche..."
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask} disabled={!newTask.trim()}>
            ➕ Ajouter
          </button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="task-list">
            {tasks.length === 0 ? (
              <p style={{opacity: 0.7}}>Aucune tâche. Créez votre première tâche !</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className="task-title">{task.title}</span>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <div className="status">
          <p>Total: {tasks.length} tâches | Terminées: {tasks.filter(t => t.completed).length}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
