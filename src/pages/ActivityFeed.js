// src/components/ActivityFeed.js

import React from 'react';
import './ActivityFeed.css';

const ActivityFeed = ({ activities }) => {
  return (
    <div className="activity-feed">
      <h3>Recent Activity</h3>
      {activities.length > 0 ? (
        <ul>
          {activities.map((activity, index) => (
            <li key={index} className="activity-item">
              <span className="activity-message">{activity.message}</span>
              <span className="activity-timestamp">{activity.timestamp}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-activity">No recent activity</p>
      )}
    </div>
  );
};

export default ActivityFeed;
