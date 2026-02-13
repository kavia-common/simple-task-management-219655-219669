import React from "react";
import TaskItem from "./TaskItem";

// PUBLIC_INTERFACE
export default function TaskList({ tasks, onToggle, onDelete, onRename }) {
  /** Renders a list of tasks with empty-state messaging. */
  if (tasks.length === 0) {
    return (
      <div className="emptyState" role="status" aria-live="polite">
        <div className="emptyState-title">No quests here.</div>
        <div className="emptyState-subtitle">
          Add a task above to begin your retro adventure.
        </div>
      </div>
    );
  }

  return (
    <ul className="taskList" aria-label="Task list">
      {tasks.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </ul>
  );
}
