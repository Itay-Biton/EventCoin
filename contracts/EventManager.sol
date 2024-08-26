// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./TicketNFT.sol";

contract EventManager {
    event TicketPurchased(uint256 ticketID);

    struct Task {
        string name;
        string details;
        uint256 reward;
        uint8 minRating;
        bool completed;
        address assignedCompany;
        address[] raters;
        uint8[] ratings;
    }

    struct Company {
        address companyAddress;
        string name;
        bool approved;
    }

    struct Event {
        bool isFinalized;
        string name;
        string details;
        uint256 date;
        uint256 cashBank;
        uint256 ticketPrice;
        address owner;
        Task[] tasks;
        Company[] companies;
        uint32 totalTickets;
        uint32 ticketsSold;
        mapping(uint32 => bool) seatTaken;
    }

    mapping(uint => Event) public events;
    uint public eventCount;
    TicketNFT public ticketNFT;

    constructor(address _ticketNFT) {
        ticketNFT = TicketNFT(_ticketNFT);
    }

    function createEvent(
        string memory _name, 
        string memory _details, 
        uint256 _date, 
        uint256 _ticketPrice,
        uint32 _totalTickets
    ) public {
        eventCount++;
        Event storage newEvent = events[eventCount];
        newEvent.isFinalized = false;
        newEvent.name = _name;
        newEvent.details = _details;
        newEvent.date = _date;
        newEvent.ticketPrice = _ticketPrice;
        newEvent.totalTickets = _totalTickets;
        newEvent.ticketsSold = 0;
        newEvent.owner = msg.sender;
        newEvent.cashBank = 0;
    }

    function addMoneyToCashBank(uint _eventId) public payable {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.owner == msg.sender, "Only the event owner can add money.");
        eventInstance.cashBank += msg.value;
    }

    function createTask(
        uint _eventId, 
        string memory _name, 
        string memory _details, 
        uint256 _reward, 
        uint8 _minRating
    ) public {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.owner == msg.sender, "Only the event owner can create tasks.");
        uint256 totalRewardRequired = _reward;
        for (uint i = 0; i < eventInstance.tasks.length; i++) 
            totalRewardRequired += eventInstance.tasks[i].reward;
        require(eventInstance.cashBank >= totalRewardRequired, "Not enough money in the cash bank to cover all tasks.");

        Task memory newTask = Task({
            name: _name,
            details: _details,
            reward: _reward,
            minRating: _minRating,
            completed: false,
            assignedCompany: address(0),
            raters: new address[](0),
            ratings: new uint8[](0)
        });
        eventInstance.tasks.push(newTask);
    }

    function getAllTasks(uint _eventId) public view returns (Task[] memory) {
        Event storage eventInstance = events[_eventId];
        return eventInstance.tasks;
    }

    function addCompany(uint _eventId, address _companyAddress, string memory _name) public {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.owner == msg.sender, "Only the event owner can add companies.");
        eventInstance.companies.push(Company({
            companyAddress: _companyAddress,
            name: _name,
            approved: true
        }));
    }

    function requestToJoin(uint _eventId, string memory _name) public {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        for (uint i = 0; i < eventInstance.companies.length; i++) {
            require(eventInstance.companies[i].companyAddress != msg.sender, "Company already requested to join.");
        }
        eventInstance.companies.push(Company({
            companyAddress: msg.sender,
            name: _name,
            approved: false
        }));
    }

    function approveCompany(uint _eventId, address _companyAddress) public {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.owner == msg.sender, "Only the event owner can approve companies.");
        for (uint i = 0; i < eventInstance.companies.length; i++) {
            if (eventInstance.companies[i].companyAddress == _companyAddress) {
                eventInstance.companies[i].approved = true;
                return;
            }
        }
        revert("Company not found.");
    }

    function getAllCompanies(uint _eventId) public view returns (Company[] memory) {
        Event storage eventInstance = events[_eventId];
        return eventInstance.companies;
    }

    function assignCompanyToTask(uint _eventId, uint _taskId, address _companyAddress) public {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.owner == msg.sender, "Only the event owner can assign companies.");
        require(!eventInstance.tasks[_taskId].completed, "Cannot assign a company to a completed task.");
        bool companyApproved = false;
        for (uint i = 0; i < eventInstance.companies.length; i++) {
            if (eventInstance.companies[i].companyAddress == _companyAddress && eventInstance.companies[i].approved) {
                companyApproved = true;
                break;
            }
        }
        require(companyApproved, "Company is not approved for this event.");
        
        eventInstance.tasks[_taskId].assignedCompany = _companyAddress;
    }

    function purchaseTicket(
        uint _eventId,
        uint32 _seat
    ) public payable {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.ticketsSold < eventInstance.totalTickets, "Event is sold out.");
        require(!eventInstance.seatTaken[_seat], "This seat is already taken.");
        require(_seat < eventInstance.totalTickets && _seat >= 0, "Invalid seat number.");
        require(msg.value == eventInstance.ticketPrice, "Incorrect ticket price.");

        uint256 ticketID = ticketNFT.mint(
            msg.sender, 
            eventInstance.name, 
            eventInstance.details, 
            eventInstance.date, 
            _seat
        );
        eventInstance.ticketsSold++;
        eventInstance.cashBank += msg.value;
        eventInstance.seatTaken[_seat] = true;

        emit TicketPurchased(ticketID);
    }

    function getSeatAvailability(uint _eventId) public view returns (bool[] memory) {
        Event storage eventInstance = events[_eventId];
        bool[] memory availability = new bool[](eventInstance.totalTickets);
        
        for (uint32 i = 0; i < eventInstance.totalTickets; i++) {
            availability[i] = !eventInstance.seatTaken[i];
        }
        
        return availability;
    }

    function completeTask(uint _eventId, uint _taskId) public {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.tasks[_taskId].assignedCompany == msg.sender, "Only the assigned company can complete the task.");
        eventInstance.tasks[_taskId].completed = true;
    }

    function rateTask(uint _eventId, uint _taskId, uint8 _rating) public {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.tasks[_taskId].completed, "Task must be completed to be rated.");
        require(eventInstance.tasks[_taskId].assignedCompany != msg.sender, "Executing company cannot rate their own task.");
        bool isCompanyInEvent = false;
        for (uint i = 0; i < eventInstance.companies.length; i++) {
            if (eventInstance.companies[i].companyAddress == msg.sender) {
                isCompanyInEvent = true;
                break;
            }
        }
        require(isCompanyInEvent, "Only companies in the event can rate tasks.");
        bool thisCompanyAlreadyRated = false;
        for (uint i = 0; i < eventInstance.tasks[_taskId].raters.length; i++) {
            if (eventInstance.tasks[_taskId].raters[i] == msg.sender) {
                thisCompanyAlreadyRated = true;
                break;
            }
        }
        require(!thisCompanyAlreadyRated, "Your company has already rated this task.");
        eventInstance.tasks[_taskId].raters.push(msg.sender);
        eventInstance.tasks[_taskId].ratings.push(_rating);
    }

    function finalizeEvent(uint _eventId) public {
        Event storage eventInstance = events[_eventId];
        require(!eventInstance.isFinalized, "Event is already finalized");
        require(eventInstance.owner == msg.sender, "Only the event owner can finalize the event.");
        require(block.timestamp >= eventInstance.date, "Event date has not passed yet.");
        uint totalRewards = 0;
        for (uint i = 0; i < eventInstance.tasks.length; i++) {
            Task storage task = eventInstance.tasks[i];
            if (task.completed) {
                uint8 averageRating = calculateAverageRating(_eventId, i);
                if (averageRating >= task.minRating) {
                    totalRewards += task.reward;
                }
            }
        }
        require(address(this).balance >= totalRewards + eventInstance.cashBank, "Insufficient contract balance.");
        
        for (uint i = 0; i < eventInstance.tasks.length; i++) {
            Task storage task = eventInstance.tasks[i];
            if (task.completed) {
                uint8 averageRating = calculateAverageRating(_eventId, i);
                if (averageRating >= task.minRating) {
                    payable(task.assignedCompany).transfer(task.reward);
                    eventInstance.cashBank -= task.reward;
                }
            }
        }

        payable(eventInstance.owner).transfer(eventInstance.cashBank);
        eventInstance.cashBank = 0;
        eventInstance.isFinalized = true;
    }

    function calculateAverageRating(uint _eventId, uint _taskId) public view returns (uint8) {
        Event storage eventInstance = events[_eventId];
        uint256 numOfRatings = eventInstance.tasks[_taskId].ratings.length;
        uint256 ratingSum = 0;

        for (uint i = 0; i < numOfRatings; i++) {
            ratingSum += eventInstance.tasks[_taskId].ratings[i];
        }

        return uint8(ratingSum / numOfRatings);
    }
}