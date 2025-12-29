import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import sections from '../data/section';
import '../styles/dashboard/userProgress.css';

export default function UserProgress() {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await authAPI.getProgress();
        setProgress(response.progress);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="user-progress">
        <h3>Progress Tracking</h3>
        <p className="progress-message">Please log in to track your learning progress.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-progress">
        <h3>Progress Tracking</h3>
        <p className="progress-message">Loading progress...</p>
      </div>
    );
  }

  const stats = progress?.stats || {
    totalLessonsCompleted: 0,
    totalQuizzesCompleted: 0,
    averageQuizScore: 0,
  };

  const completedSections = progress?.completedSections || {};
  const quizScores = progress?.quizScores || {};

  // Calculate progress for each topic
  const topicProgress = sections.map(topic => {
    const topicCompleted = completedSections[topic.key] || {};
    const topicScores = quizScores[topic.key] || {};
    
    let completedCount = 0;
    let totalCount = 0;
    let quizCount = 0;
    let totalQuizScore = 0;

    // Count completed sections
    ['Introduction', 'Learn', 'Practice', 'Quiz'].forEach(section => {
      const sectionData = topicCompleted[section] || {};
      const sectionSize = topic.sectionSizes[section] || 0;
      
      for (let page = 0; page <= sectionSize; page++) {
        totalCount++;
        if (sectionData[page.toString()]) {
          completedCount++;
        }
      }

      // Calculate quiz scores
      if (section === 'Quiz') {
        const quizData = topicScores[section] || {};
        Object.values(quizData).forEach(score => {
          if (typeof score === 'number') {
            quizCount++;
            totalQuizScore += score;
          }
        });
      }
    });

    const completionPercentage = totalCount > 0 
      ? Math.round((completedCount / totalCount) * 100) 
      : 0;
    
    const averageScore = quizCount > 0 
      ? Math.round(totalQuizScore / quizCount) 
      : null;

    return {
      ...topic,
      completedCount,
      totalCount,
      completionPercentage,
      averageScore,
      quizCount,
    };
  });

  const overallCompleted = topicProgress.reduce((sum, t) => sum + t.completedCount, 0);
  const overallTotal = topicProgress.reduce((sum, t) => sum + t.totalCount, 0);
  const overallPercentage = overallTotal > 0 
    ? Math.round((overallCompleted / overallTotal) * 100) 
    : 0;

  return (
    <div className="user-progress">
      <h3>Your Progress</h3>
      
      {/* Overall Statistics */}
      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalLessonsCompleted}</div>
          <div className="stat-label">Lessons Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalQuizzesCompleted}</div>
          <div className="stat-label">Quizzes Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {stats.averageQuizScore > 0 ? `${stats.averageQuizScore}%` : 'N/A'}
          </div>
          <div className="stat-label">Average Quiz Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overallPercentage}%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
      </div>

      {/* Topic Progress */}
      <div className="topic-progress">
        <h4>Topic Progress</h4>
        {topicProgress.map(topic => (
          <div key={topic.key} className="topic-progress-item">
            <div className="topic-header">
              <span className="topic-name">{topic.name}</span>
              <span className="topic-percentage">{topic.completionPercentage}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${topic.completionPercentage}%` }}
              />
            </div>
            <div className="topic-details">
              <span>{topic.completedCount} / {topic.totalCount} completed</span>
              {topic.averageScore !== null && (
                <span className="quiz-score">Avg Quiz: {topic.averageScore}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

