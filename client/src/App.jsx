import { useState, useEffect } from 'react';
import './App.css';

const API_URL = '/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [newTodoPriority, setNewTodoPriority] = useState('none');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [sortBy]);

  const fetchTodos = async () => {
    try {
      const url = sortBy !== 'default' ? `${API_URL}?sortBy=${sortBy}` : API_URL;
      const response = await fetch(url);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputValue,
          priority: newTodoPriority,
          due_date: newTodoDueDate || null,
        }),
      });
      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setInputValue('');
      setNewTodoPriority('none');
      setNewTodoDueDate('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority }),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const updateDueDate = async (id, due_date) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ due_date: due_date || null }),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('Error updating due date:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: editValue }),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const moveUp = async (index) => {
    if (index === 0) return;
    const newTodos = [...todos];
    [newTodos[index - 1], newTodos[index]] = [newTodos[index], newTodos[index - 1]];
    setTodos(newTodos);
    await reorderTodos(newTodos);
  };

  const moveDown = async (index) => {
    if (index === todos.length - 1) return;
    const newTodos = [...todos];
    [newTodos[index], newTodos[index + 1]] = [newTodos[index + 1], newTodos[index]];
    setTodos(newTodos);
    await reorderTodos(newTodos);
  };

  const reorderTodos = async (reorderedTodos) => {
    try {
      await fetch(`${API_URL}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todos: reorderedTodos }),
      });
    } catch (error) {
      console.error('Error reordering todos:', error);
    }
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const days = getDaysRemaining(dueDate);

    if (days < 0) return { text: `${Math.abs(days)}일 지남`, className: 'overdue' };
    if (days === 0) return { text: 'D-day', className: 'today' };
    if (days <= 3) return { text: `D-${days}`, className: 'urgent' };
    return { text: `D-${days}`, className: 'normal' };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'mid': return 'priority-mid';
      case 'low': return 'priority-low';
      default: return 'priority-none';
    }
  };

  return (
    <div className="app">
      <div className="todo-container">
        <h1>📝 TODO App</h1>

        <div className="sort-controls">
          <label>정렬:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="default">기본 (순서)</option>
            <option value="priority">우선순위</option>
            <option value="dueDate">마감일</option>
          </select>
        </div>

        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="새로운 할 일을 입력하세요..."
            className="todo-input"
          />

          <select
            value={newTodoPriority}
            onChange={(e) => setNewTodoPriority(e.target.value)}
            className="priority-select"
          >
            <option value="none">우선순위 없음</option>
            <option value="high">높음</option>
            <option value="mid">중간</option>
            <option value="low">낮음</option>
          </select>

          <input
            type="date"
            value={newTodoDueDate}
            onChange={(e) => setNewTodoDueDate(e.target.value)}
            className="date-input"
          />

          <button type="submit" className="add-button">추가</button>
        </form>

        <div className="todo-list">
          {todos.length === 0 ? (
            <p className="empty-message">할 일이 없습니다!</p>
          ) : (
            todos.map((todo, index) => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''} ${getPriorityColor(todo.priority)}`}
              >
                {editingId === todo.id ? (
                  <div className="edit-container">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button onClick={() => saveEdit(todo.id)} className="save-button">저장</button>
                      <button onClick={cancelEdit} className="cancel-button">취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="todo-main">
                      <div className="todo-content">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id, todo.completed)}
                          className="checkbox"
                        />
                        <span className="todo-text">{todo.text}</span>
                      </div>

                      <div className="todo-meta">
                        <select
                          value={todo.priority || 'none'}
                          onChange={(e) => updatePriority(todo.id, e.target.value)}
                          className={`priority-badge ${getPriorityColor(todo.priority)}`}
                        >
                          <option value="none">-</option>
                          <option value="high">높음</option>
                          <option value="mid">중간</option>
                          <option value="low">낮음</option>
                        </select>

                        <input
                          type="date"
                          value={todo.due_date || ''}
                          onChange={(e) => updateDueDate(todo.id, e.target.value)}
                          className="due-date-input"
                        />

                        {todo.due_date && formatDueDate(todo.due_date) && (
                          <span className={`due-badge ${formatDueDate(todo.due_date).className}`}>
                            {formatDueDate(todo.due_date).text}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="todo-actions">
                      <div className="order-buttons">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="order-button"
                          title="위로 이동"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === todos.length - 1}
                          className="order-button"
                          title="아래로 이동"
                        >
                          ▼
                        </button>
                      </div>
                      <button onClick={() => startEdit(todo)} className="edit-button">수정</button>
                      <button onClick={() => deleteTodo(todo.id)} className="delete-button">삭제</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
