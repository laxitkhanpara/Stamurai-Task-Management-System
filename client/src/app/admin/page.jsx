'use client';
import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../../store/thunks/taskThunk';

import {
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  List,
  CircleDashed,
  ClipboardCheck,
  Calendar
} from 'lucide-react';
import styles from './Dashboard.module.css';

export default function TaskDashboard() {
  const dispatch = useDispatch();
  const { dashboardStats, isLoading, error } = useSelector((state) => state.task);

  useEffect(() => {
    // Fetch dashboard stats when component mounts
    console.log('Fetching dashboard stats...');
    console.log(dashboardStats);
      dispatch(fetchDashboardStats());

  }, [dispatch, dashboardStats]);

  // For debugging
  useEffect(() => {
    console.log('Dashboard stats from Redux:', dashboardStats);
  }, [dashboardStats]);

  const formatLabel = (label) => {
    return label
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  // Ensure dashboardStats exists and has all required properties
  // Check if dashboardStats exists and contains the expected data structure
  const data = dashboardStats && dashboardStats.data ? dashboardStats.data : {
    totalTasks: 0,
    statusCounts: {
      "todo": 0,
      "in-progress": 0,
      "review": 0,
      "completed": 0
    },
    priorityCounts: {
      "low": 0,
      "medium": 0,
      "high": 0
    },
    overdueTasks: 0,
    dueToday: 0
  };

  // Guard against division by zero
  const calculatePercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>Task Dashboard</h1>
          <p className={styles.subtitle}>Overview of your tasks and their status</p>
        </header>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Tasks"
            value={data.totalTasks}
            icon={<List className={styles.blueIcon} />}
            colorClass={styles.blueCard}
          />
          <StatCard
            title="Completed"
            value={data.statusCounts.completed}
            icon={<CheckCircle2 className={styles.greenIcon} />}
            colorClass={styles.greenCard}
          />
          <StatCard
            title="Overdue"
            value={data.overdueTasks}
            icon={<AlertCircle className={styles.redIcon} />}
            colorClass={styles.redCard}
          />
          <StatCard
            title="Due Today"
            value={data.dueToday}
            icon={<Calendar className={styles.yellowIcon} />}
            colorClass={styles.yellowCard}
          />
        </div>

        <div className={styles.chartsGrid}>
          {/* Status Distribution */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Status Distribution</h2>
            <div className={styles.chartContent}>
              {Object.entries(data.statusCounts).map(([status, count]) => (
                <div key={status}>
                  <div className={styles.chartLabelRow}>
                    <span className={styles.chartLabel}>{formatLabel(status)}</span>
                    <span className={styles.chartValue}>
                      {count} ({calculatePercentage(count, data.totalTasks)}%)
                    </span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={`${styles.progressBar} ${styles[`${status}Bar`]}`}
                      style={{ width: `${calculatePercentage(count, data.totalTasks)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Priority Breakdown</h2>
            <div className={styles.chartContent}>
              {Object.entries(data.priorityCounts).map(([priority, count]) => (
                <div key={priority}>
                  <div className={styles.chartLabelRow}>
                    <span className={styles.chartLabel}>{formatLabel(priority)}</span>
                    <span className={styles.chartValue}>
                      {count} ({calculatePercentage(count, data.totalTasks)}%)
                    </span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={`${styles.progressBar} ${styles[`${priority}PriorityBar`]}`}
                      style={{ width: `${calculatePercentage(count, data.totalTasks)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Status Cards */}
        <div className={styles.statusCardsGrid}>
          <StatusCard
            title="To Do"
            count={data.statusCounts.todo}
            icon={<CircleDashed className={styles.grayIcon} />}
            colorClass={styles.grayCardIcon}
          />
          <StatusCard
            title="In Progress"
            count={data.statusCounts["in-progress"]}
            icon={<Clock className={styles.blueIconMd} />}
            colorClass={styles.blueCardIcon}
          />
          <StatusCard
            title="Review"
            count={data.statusCounts.review}
            icon={<ClipboardCheck className={styles.yellowIconMd} />}
            colorClass={styles.yellowCardIcon}
          />
          <StatusCard
            title="Completed"
            count={data.statusCounts.completed}
            icon={<CheckCircle2 className={styles.greenIconMd} />}
            colorClass={styles.greenCardIcon}
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, colorClass }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statCardContent}>
        <div className={colorClass}>
          {icon}
        </div>
        <div className={styles.statInfo}>
          <h3 className={styles.statTitle}>{title}</h3>
          <p className={styles.statValue}>{value}</p>
        </div>
      </div>
    </div>
  );
}

// Status Card Component
function StatusCard({ title, count, icon, colorClass }) {
  return (
    <div className={styles.statusCard}>
      <div className={`${colorClass} ${styles.statusIcon}`}>
        {icon}
      </div>
      <h3 className={styles.statusTitle}>{title}</h3>
      <p className={styles.statusCount}>{count}</p>
    </div>
  );
}