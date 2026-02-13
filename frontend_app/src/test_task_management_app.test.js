import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function seedLocalStorage({ tasks, filter } = {}) {
  if (tasks !== undefined) {
    window.localStorage.setItem("retro_tasks_v1", JSON.stringify(tasks));
  }
  if (filter !== undefined) {
    window.localStorage.setItem("retro_filter_v1", JSON.stringify(filter));
  }
}

function makeTask({ id, title, completed, createdAt }) {
  return {
    id,
    title,
    completed,
    createdAt,
  };
}

describe("Retro Task Manager (CRUD, filters, localStorage)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("add task persists to UI and localStorage", async () => {
    render(<App />);

    const input = screen.getByLabelText(/new task/i);
    await userEvent.type(input, "Defeat the bug");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    // UI shows new task row
    expect(screen.getByText("Defeat the bug")).toBeInTheDocument();

    // localStorage persisted tasks array
    const stored = JSON.parse(window.localStorage.getItem("retro_tasks_v1"));
    expect(Array.isArray(stored)).toBe(true);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(
      expect.objectContaining({
        title: "Defeat the bug",
        completed: false,
      })
    );
    expect(typeof stored[0].id).toBe("string");
    expect(typeof stored[0].createdAt).toBe("number");
  });

  test("toggle task completed state updates status label and filters", async () => {
    render(<App />);

    // Add two tasks
    const input = screen.getByLabelText(/new task/i);
    await userEvent.type(input, "Quest A");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));
    await userEvent.type(input, "Quest B");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    // Toggle Quest A to completed using its checkbox by aria-label
    const questACheckbox = screen.getByRole("checkbox", {
      name: /mark "quest a" as complete/i,
    });
    await userEvent.click(questACheckbox);

    // Now its status should show COMPLETED somewhere in its row
    const taskList = screen.getByLabelText(/task list/i);
    const questARow = within(taskList).getByText("Quest A").closest("li");
    expect(questARow).not.toBeNull();
    expect(within(questARow).getByLabelText(/task status/i)).toHaveTextContent(
      "COMPLETED"
    );

    // Filter Active should hide completed Quest A and show Quest B only
    await userEvent.click(screen.getByRole("button", { name: /active/i }));
    expect(screen.queryByText("Quest A")).not.toBeInTheDocument();
    expect(screen.getByText("Quest B")).toBeInTheDocument();

    // Filter Completed should show Quest A only
    await userEvent.click(screen.getByRole("button", { name: /completed/i }));
    expect(screen.getByText("Quest A")).toBeInTheDocument();
    expect(screen.queryByText("Quest B")).not.toBeInTheDocument();

    // Filter All shows both
    await userEvent.click(screen.getByRole("button", { name: /^all$/i }));
    expect(screen.getByText("Quest A")).toBeInTheDocument();
    expect(screen.getByText("Quest B")).toBeInTheDocument();
  });

  test("edit task title via Edit -> Save persists new title and updates localStorage", async () => {
    render(<App />);

    const input = screen.getByLabelText(/new task/i);
    await userEvent.type(input, "Original title");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    // Enter edit mode
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    // Edit field is labeled via srOnly label
    const editField = screen.getByLabelText(/edit task title/i);
    await userEvent.clear(editField);
    await userEvent.type(editField, "Renamed title");

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByText("Renamed title")).toBeInTheDocument();
    expect(screen.queryByText("Original title")).not.toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem("retro_tasks_v1"));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(
      expect.objectContaining({
        title: "Renamed title",
      })
    );
  });

  test("delete task removes it from UI and localStorage", async () => {
    render(<App />);

    const input = screen.getByLabelText(/new task/i);
    await userEvent.type(input, "Disposable quest");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText("Disposable quest")).toBeInTheDocument();

    // Delete button has an aria-label containing the title
    await userEvent.click(
      screen.getByRole("button", { name: /delete "disposable quest"/i })
    );

    expect(screen.queryByText("Disposable quest")).not.toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem("retro_tasks_v1"));
    expect(stored).toEqual([]);
  });

  test("hydrates tasks and filter from localStorage on load", async () => {
    const seededTasks = [
      makeTask({
        id: "t1",
        title: "Seeded active",
        completed: false,
        createdAt: 1700000000000,
      }),
      makeTask({
        id: "t2",
        title: "Seeded done",
        completed: true,
        createdAt: 1700000000001,
      }),
    ];
    seedLocalStorage({ tasks: seededTasks, filter: "completed" });

    render(<App />);

    // Wait for initial render/hydration from localStorage.
    // Because filter was hydrated to "completed", only completed task should be visible.
    expect(await screen.findByText("Seeded done")).toBeInTheDocument();
    expect(screen.queryByText("Seeded active")).not.toBeInTheDocument();

    // Switching to All should show both (sanity check that UI is functional after hydration)
    await userEvent.click(screen.getByRole("button", { name: /^all$/i }));
    expect(await screen.findByText("Seeded active")).toBeInTheDocument();
    expect(screen.getByText("Seeded done")).toBeInTheDocument();
  });

  test("writes filter selection to localStorage", async () => {
    render(<App />);

    // default is "all" as initial hook value; clicking another filter should persist
    await userEvent.click(screen.getByRole("button", { name: /active/i }));

    const storedFilterRaw = window.localStorage.getItem("retro_filter_v1");
    expect(storedFilterRaw).toBe(JSON.stringify("active"));
  });
});
