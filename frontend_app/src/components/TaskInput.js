import React, { useState } from "react";

// PUBLIC_INTERFACE
export default function TaskInput({ onAddTask }) {
  /** Input form for creating a new task. */
  const [title, setTitle] = useState("");

  const canSubmit = title.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    onAddTask(trimmed);
    setTitle("");
  };

  return (
    <form className="taskInput" onSubmit={handleSubmit} aria-label="Add a task">
      <label className="srOnly" htmlFor="new-task">
        New task
      </label>
      <input
        id="new-task"
        className="taskInput-field"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Type a quest... (e.g., 'Defeat the bug')"
        autoComplete="off"
        maxLength={120}
      />
      <button
        className="btn btnPrimary"
        type="submit"
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
      >
        Add
      </button>
    </form>
  );
}
