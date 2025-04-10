import React, { useState } from "react";
import "./registrationForm.css"; // Add styling if needed

const RegistrationForm = ({ onComplete }) => {
  const [username, setUsername] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && rollNo && department && year) {
      console.log("Registration Successful!");
      console.log(`Name: ${username}`);
      console.log(`Roll No: ${rollNo}`);
      console.log(`Department: ${department}`);
      console.log(`Year: ${year}`);
      onComplete(); // Trigger the completion handler (if provided)
    } else {
      alert("Please fill out all fields.");
    }
  };

  return (
    <div className="registration-form">
      <h1>Registration Form</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter Your Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        >
          <option value="">Select Department</option>
          <option value="Ece">ECE</option>
          <option value="Cse">CSE</option>
          <option value="Csm">CSM</option>
          <option value="Csd">CSD</option>
          <option value="Csc">CSC</option>
          <option value="Eee">EEE</option>
          <option value="Mec">Mechanical</option>
          <option value="Civ">Civil</option>
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        >
          <option value="">Select Year</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
