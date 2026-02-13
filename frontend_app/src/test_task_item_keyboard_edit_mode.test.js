import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskItem from "./components/TaskItem";

function makeTask(overrides = {}) {
  return {
    id: "t1",
    title: "Original title",
    completed: false,
    createdAt: 1700000000000,
    ...overrides,
  };
}

describe("TaskItem - keyboard interactions in edit mode", () => {
  test("Enter commits rename and exits edit mode", async () => {
    const user = userEvent.setup();

    const task = makeTask();
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    const onRename = jest.fn();

    render(
      <TaskItem
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
        onRename={onRename}
      />
    );

    // Enter edit mode
    await user.click(screen.getByRole("button", { name: /edit/i }));

    const editField = screen.getByLabelText(/edit task title/i);
    await user.clear(editField);
    await user.type(editField, "Renamed title");

    // Press Enter to save
    await user.keyboard("{Enter}");

    // rename callback invoked with expected args
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onRename).toHaveBeenCalledWith("t1", "Renamed title");

    // edit mode exited (input removed; normal row UI visible)
    expect(screen.queryByLabelText(/edit task title/i)).not.toBeInTheDocument();
    expect(screen.getByText("Renamed title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();

    // no unrelated actions
    expect(onToggle).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("Escape cancels rename, reverts draft, and exits edit mode without calling onRename", async () => {
    const user = userEvent.setup();

    const task = makeTask();
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    const onRename = jest.fn();

    render(
      <TaskItem
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
        onRename={onRename}
      />
    );

    // Enter edit mode
    await user.click(screen.getByRole("button", { name: /edit/i }));

    const editField = screen.getByLabelText(/edit task title/i);
    await user.clear(editField);
    await user.type(editField, "This should be cancelled");

    // Press Escape to cancel
    await user.keyboard("{Escape}");

    // should not rename
    expect(onRename).not.toHaveBeenCalled();

    // edit mode exited and original title is shown again
    expect(screen.queryByLabelText(/edit task title/i)).not.toBeInTheDocument();
    expect(screen.getByText("Original title")).toBeInTheDocument();
    expect(
      screen.queryByText("This should be cancelled")
    ).not.toBeInTheDocument();

    // no unrelated actions
    expect(onToggle).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
