import React, { useState, useEffect } from 'react';
import getContracts from '../utils/getContracts';
import Web3 from 'web3';
import '../css/TaskManagement.css';

function TaskManagement({ eventId, isOwner }) {
  const [rating, setRating] = useState('');
  const [account, setAccount] = useState(null);
  const [companyAddress, setCompanyAddress] = useState('');
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
      const eventTasks = await eventManager.methods.getAllTasks(eventId).call();
      setTasks(eventTasks);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(Web3.utils.toChecksumAddress(accounts[0]));
    };
    init();
  }, [eventId, isOwner]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.createTask(eventId, taskName, taskDetails, Web3.utils.toWei(taskReward, 'ether'), minRating).send({ from: accounts[0] });
    const eventTasks = await eventManager.methods.getAllTasks(eventId).call();
    setTasks(eventTasks);
  };

  const handleRateTask = async (e, taskId) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.rateTask(eventId, taskId, rating).send({ from: accounts[0] });
    const eventTasks = await eventManager.methods.getAllTasks(eventId).call();
    setTasks(eventTasks);
  };

  const handleAssignTask = async (e, taskId) => {
    e.preventDefault();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.assignCompanyToTask(eventId, taskId, Web3.utils.toChecksumAddress(companyAddress)).send({ from: accounts[0] });
    const eventTasks = await eventManager.methods.getAllTasks(eventId).call();
    setTasks(eventTasks);
  };
  
  const completeTask = async (taskId) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await eventManager.methods.completeTask(eventId, taskId).send({ from: accounts[0] });
    const eventTasks = await eventManager.methods.getAllTasks(eventId).call();
    setTasks(eventTasks);
  };

  return (
    <div className="task-management">
      {isOwner && (
        <div>
          <h2>Add a task needed to be done</h2>
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
              onChange={(e) => {
                if (e.target.value >= 0) 
                  setTaskReward(e.target.value)}}
              step="0.001"
              placeholder="Task Reward"
            />
            <input
              type="number"
              value={minRating}
              onChange={(e) => {
                if (e.target.value >= 0 && e.target.value <= 5) 
                  setMinRating(e.target.value)}}
              placeholder="Minimum Rating"
            />
            <button type="submit">Create Task</button>
          </form>
        </div>
      )}
      <h2>List of tasks in this event</h2>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            <div>
              <h4>{task.name}</h4>
              <p>Status: {task.completed ? 'Completed' : 'Pending'}</p>
              <p>{task.details}</p>
              <p>Reward is {Web3.utils.fromWei(task.reward, 'ether')} ETH</p>
              <p>Assigned company address: {task.assignedCompany}</p>
              <p>Minimum avg rating needed: {Number(task.minRating)}</p>
              <ul className="ratings">
                {task.ratings.map((rate, i) => (
                  <li key={i}>Rating {i+1}: {Number(rate)}</li>
                ))}
              </ul>
            </div>
            {task.completed ? (
              <div className="completed">
                {!task.raters.includes(account) && task.assignedCompany !== account && !isOwner && (
                  <form onSubmit={(e) => handleRateTask(e, index)}>
                    <input
                      type="number"
                      value={rating}
                      onChange={(e) => {
                        if (e.target.value >= 0 && e.target.value <= 5) 
                          setRating(e.target.value)}}
                      placeholder="Rate this task"
                    />
                    <button type="submit">Rate</button>
                  </form>
                )}
              </div>
            ) : (
              <div>
                {isOwner && (
                  <form onSubmit={(e) => handleAssignTask(e, index)}>
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Company Address"
                    />
                    <button type="submit">Assign Task</button>
                  </form>
                )}
                {task.assignedCompany === account && (
                  <button onClick={() => completeTask(index)}>Complete Task</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManagement;