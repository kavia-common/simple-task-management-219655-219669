import React, { useEffect, useMemo, useRef, useState } from "react";

// PUBLIC_INTERFACE
export default function TaskItem({ task, onToggle, onDelete, onRename }) {
  /** Single task row with edit mode and actions. */
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const trimmedDraft = useMemo(() => draft.trim(), [draft]);

  const commitRename = () => {
    const nextTitle = trimmedDraft;
    if (!nextTitle) {
      // If user clears the title, revert instead of saving empty
      setDraft(task.title);
      setIsEditing(false);
      return;
    }

    if (nextTitle !== task.title) onRename(task.id, nextTitle);
    setIsEditing(false);
  };

  const cancelRename = () => {
    setDraft(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") cancelRename();
  };

  return (
    <li className={`taskItem ${task.completed ? "isDone" : ""}`}>
      <label className="taskItem-check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${
            task.completed ? "incomplete" : "complete"
          }`}
        />
        <span className="taskItem-checkUi" aria-hidden="true" />
      </label>

      <div className="taskItem-main">
        {!isEditing ? (
          <div className="taskItem-titleRow">
            <span className="taskItem-title">{task.title}</span>
            <span className="taskItem-meta" aria-label="Task status">
              {task.completed ? "COMPLETED" : "ACTIVE"}
            </span>
          </div>
        ) : (
          <div className="taskItem-editRow">
            <label className="srOnly" htmlFor={`edit-${task.id}`}>
              Edit task title
            </label>
            <input
              id={`edit-${task.id}`}
              ref={inputRef}
              className="taskItem-editField"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={120}
            />
            <div className="taskItem-editHint" aria-hidden="true">
              Enter to save · Esc to cancel
            </div>
          </div>
        )}
      </div>

      <div className="taskItem-actions" aria-label="Task actions">
        {!isEditing ? (
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <button
            type="button"
            className="btn btnGhost"
            onClick={commitRename}
            disabled={!trimmedDraft}
          >
            Save
          </button>
        )}

        {!isEditing ? (
          <button
            type="button"
            className="btn btnDanger"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}
          >
            Delete
          </button>
        ) : (
          <button
            type="button"
            className="btn btnGhost"
            onClick={cancelRename}
          >
            Cancel
          </button>
        )}
      </div>
    </li>
  );
}
