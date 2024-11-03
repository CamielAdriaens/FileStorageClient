// src/pages/ActivityFeedPage.js

import React, { useState, useEffect } from 'react';
import ActivityFeed from './ActivityFeed';
import './ActivityFeed.css';

const ActivityFeedPage = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Simulate fetching activity data; replace with real data fetching if needed.
    const savedActivities = JSON.parse(localStorage.getItem('activities')) || [];
    setActivities(savedActivities);
  }, []);

  return (
    <div className="activity-feed-page">
      <h2>Activity Feed</h2>
      <ActivityFeed activities={activities} />
    </div>
  );
};

export default ActivityFeedPage;
