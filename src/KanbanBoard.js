import React, { useState, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FaPlus, FaEllipsisH } from 'react-icons/fa'; 


const TaskCard = ({ task, onDelete, users }) => {
    const handleDelete = () => {
      onDelete(task.id);
    };
  
    const user = users.find(u => u.id === task.userId);
    const userName = user ? user.name : 'Unassigned';
    
    const userInitials = userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
    
      return (
        <div className="kanban-card">
          <div>
            <p className="task-id">{task.id}</p>
            <div className="task-title-wrapper">
              <input type="checkbox" className="task-checkbox" />
              <h4 className="task-title"><strong>{task.title}</strong></h4>
            </div>
            <div className="task-meta">
              {task.tag && task.tag.map((tag, index) => (
                <span key={index} className="task-tag">{tag}</span>
              ))}
            </div>
          </div>
          <div className="user-image">
            {user && user.avatar ? (
              <img src="/Display.svg" alt={userName} />
            ) : (
              <div className="user-icon">{userInitials}</div>
            )}
          </div>
        </div>
      );
    };

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState('status');
  const [sortBy, setSortBy] = useState('priority');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        if (data.tickets && data.users) {
          setTickets(data.tickets);
          setUsers(data.users);
        } else {
          console.error('Invalid API response format:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleDeleteTask = (taskId) => {
    setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== taskId));
  };

  const groupedTickets = groupTickets(tickets, groupBy, users);

  const sortedTickets = sortTickets(groupedTickets, sortBy);

  return (
    <div className="kanban-board">
      <div className="display-options">
        <label>
          Group by:
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="status">Status</option>
            <option value="userId">User</option>
            <option value="priority">Priority</option>
          </select>
        </label>
        <label>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>
      <div className="kanban-columns">
        {Object.keys(sortedTickets).map((column) => (
          <div key={column} className="kanban-column">
            <div className="column-header">
            <div className="column-title">
              <h3>{getColumnTitle(column, groupBy, users)}</h3>
              <span className="column-count">({sortedTickets[column].length})</span>
              </div>
              <div className="column-actions">
                <FaPlus className="add-icon" title="Add Task" />
                <FaEllipsisH className="options-icon" title="More Options" />
              </div>
            </div>
            <div className="kanban-cards">
              {sortedTickets[column].map((ticket) => (
                <TaskCard 
                  key={ticket.id} 
                  task={ticket} 
                  onDelete={handleDeleteTask}
                  users={users}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getColumnTitle(key, groupBy, users) {
  if (groupBy === 'priority') {
    const priorityLabels = {
      '0': 'No Priority',
      '1': 'Low',
      '2': 'Medium',
      '3': 'High',
      '4': 'Urgent'
    };
    return priorityLabels[key] || key;
  }
  if (groupBy === 'userId') {
    const user = users.find(u => u.id === key);
    return user ? user.name : key;
  }
  return key;
}

function groupTickets(tickets, groupBy, users) {
  const groupedTickets = {};

  tickets.forEach((ticket) => {
    let key = ticket[groupBy];
    
    if (groupBy === 'priority') {
      key = ticket.priority.toString();
    } else if (groupBy === 'status') {
      if (!groupedTickets['Backlog']) groupedTickets['Backlog'] = [];
      if (!groupedTickets['Todo']) groupedTickets['Todo'] = [];
      if (!groupedTickets['In progress']) groupedTickets['In progress'] = [];
      if (!groupedTickets['Done']) groupedTickets['Done'] = [];
    }

    if (!groupedTickets[key]) {
      groupedTickets[key] = [];
    }
    groupedTickets[key].push(ticket);
  });

  return groupedTickets;
}

function sortTickets(groupedTickets, sortBy) {
  const sortedTickets = {};

  Object.keys(groupedTickets).forEach((key) => {
    sortedTickets[key] = [...groupedTickets[key]].sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  });

  return sortedTickets;
}

export default KanbanBoard;