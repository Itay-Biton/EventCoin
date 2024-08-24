import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';

function TaskManagement({ eventId }) {
  const [eventManager, setEventManager] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [minRating, setMinRating] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { eventManager } = await getContracts();
      setEventManager(eventManager);
      const eventTasks = await eventManager.methods.getEventTasks(eventId).call();
      setTasks(eventTasks);
    };
    init();
  }, [eventId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.createTask(eventId, taskName, taskDetails, taskReward, minRating).send({ from: accounts[0] });
    // Reload the task list
    const eventTasks = await eventManager.methods.getEventTasks(eventId).call();
    setTasks(eventTasks);
  };

  return (
    <div>
      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Task Name"
        />
        <input
          type="text"
          value={taskDetails}
          onChange={(e) => setTaskDetails(e.target.value)}
          placeholder="Task Details"
        />
        <input
          type="number"
          value={taskReward}
          onChange={(e) => setTaskReward(e.target.value)}
          placeholder="Task Reward"
        />
        <input
          type="number"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          placeholder="Minimum Rating"
        />
        <button type="submit">Create Task</button>
      </form>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task.name} - {task.completed ? 'Completed' : 'Pending'}</li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManagement;