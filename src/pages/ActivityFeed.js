import React, { useState, useEffect, useRef } from 'react';
import './ActivityFeed.css';
import * as signalR from '@microsoft/signalr'; // Import SignalR

const ActivityFeed = ({ activities }) => {
  const [newActivity, setNewActivity] = useState(null); // Store new activity for real-time updates
  const connectionRef = useRef(null); // Use useRef to persist the connection without re-rendering

  useEffect(() => {
    // Initialize SignalR connection once when the component mounts
    const connectSignalR = async () => {
      // Only create a new connection if one doesn't exist already
      if (connectionRef.current) {
        console.log('SignalR connection already established.');
        return; // Skip if already connected
      }

      const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:8080/file-sharing-hub") // Your SignalR hub URL
        .configureLogging(signalR.LogLevel.Information) // Optional: Log SignalR messages for debugging
        .build();

      // Listen for messages from the SignalR hub
      hubConnection.on("ReceiveMessage", (message) => {
        console.log("Received message:", message);
        // Add the received message to the activities array
        setNewActivity({ message, timestamp: new Date().toLocaleString() });
      });

      try {
        // Start the connection to SignalR
        await hubConnection.start();
        console.log("SignalR connection established.");
        connectionRef.current = hubConnection; // Store the connection in the ref
      } catch (error) {
        console.error("Error while starting SignalR connection:", error);
      }
    };

    connectSignalR();

    // Clean up the connection when the component unmounts
    return () => {
      if (connectionRef.current) {
        console.log("Cleaning up SignalR connection...");
        connectionRef.current.stop();
        console.log("SignalR connection stopped.");
        connectionRef.current = null; // Reset the connection
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

  // Send test message when the button is clicked
  const sendTestMessage = () => {
    if (connectionRef.current) {
      const userEmail = "user@example.com"; // Example user email
      const message = "Test message from ActivityFeed component";
      console.log("Sending test message:", message);
      connectionRef.current.invoke("SendMessageToUser", userEmail, message)
        .then(() => {
          console.log("Test message sent.");
        })
        .catch(err => {
          console.error("Error sending message:", err);
        });
    }
  };

  // Combine existing activities with the new activity received via SignalR
  const displayedActivities = newActivity
    ? [...activities, newActivity]
    : activities;

  return (
    <div className="activity-feed">
      <h3>Recent Activity</h3>
      {displayedActivities.length > 0 ? (
        <ul>
          {displayedActivities.map((activity, index) => (
            <li key={index} className="activity-item">
              <span className="activity-message">{activity.message}</span>
              <span className="activity-timestamp">{activity.timestamp}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-activity">No recent activity</p>
      )}

      {/* Button to trigger sending a test message */}
      <button onClick={sendTestMessage} className="send-test-button">
        Send Test Message
      </button>
    </div>
  );
};

export default ActivityFeed;
