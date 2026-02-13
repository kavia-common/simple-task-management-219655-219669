import React, { useMemo } from "react";
import "./App.css";
import TaskInput from "./components/TaskInput";
import FilterBar from "./components/FilterBar";
import TaskList from "./components/TaskList";
import { useLocalStorageState } from "./hooks/useLocalStorageState";

function createId() {
  // Simple collision-resistant-enough id for local-only tasks.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks
    .filter((t) => t && typeof t === "object")
    .map((t) => ({
      id: typeof t.id === "string" ? t.id : createId(),
      title: typeof t.title === "string" ? t.title : "",
      completed: Boolean(t.completed),
      createdAt:
        typeof t.createdAt === "number" ? t.createdAt : Date.now(),
    }))
    .filter((t) => t.title.trim().length > 0);
}

// PUBLIC_INTERFACE
function App() {
  /** Retro-themed task manager with CRUD, filtering, responsive UI, and localStorage persistence. */
  const [tasks, setTasks] = useLocalStorageState("retro_tasks_v1", []);
  const [filter, setFilter] = useLocalStorageState("retro_filter_v1", "all");

  const normalizedTasks = useMemo(() => normalizeTasks(tasks), [tasks]);

  // Keep storage clean if older/invalid entries existed
  React.useEffect(() => {
    if (normalizedTasks !== tasks) setTasks(normalizedTasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const total = normalizedTasks.length;
    const completed = normalizedTasks.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [normalizedTasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "active") return normalizedTasks.filter((t) => !t.completed);
    if (filter === "completed")
      return normalizedTasks.filter((t) => t.completed);
    return normalizedTasks;
  }, [normalizedTasks, filter]);

  const handleAddTask = (title) => {
    const next = {
      id: createId(),
      title,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([next, ...normalizedTasks]);
  };

  const handleToggle = (id) => {
    setTasks(
      normalizedTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDelete = (id) => {
    setTasks(normalizedTasks.filter((t) => t.id !== id));
  };

  const handleRename = (id, title) => {
    setTasks(
      normalizedTasks.map((t) => (t.id === id ? { ...t, title } : t))
    );
  };

  const handleClearCompleted = () => {
    setTasks(normalizedTasks.filter((t) => !t.completed));
  };

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="appHeader-left">
          <div className="brand">
            <div className="brand-badge" aria-hidden="true">
              TM
            </div>
            <div className="brand-text">
              <h1 className="brand-title">Retro Task Manager</h1>
              <p className="brand-subtitle">
                Your quests, saved locally. No excuses.
              </p>
            </div>
          </div>
        </div>

        <div className="appHeader-right">
          <button
            type="button"
            className="btn btnGhost"
            onClick={handleClearCompleted}
            disabled={counts.completed === 0}
            aria-disabled={counts.completed === 0}
          >
            Clear completed
          </button>
        </div>
      </header>

      <main className="appMain">
        <section className="panel" aria-label="Task input">
          <TaskInput onAddTask={handleAddTask} />
          <FilterBar value={filter} onChange={setFilter} counts={counts} />
        </section>

        <section className="panel panelList" aria-label="Tasks">
          <TaskList
            tasks={visibleTasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        </section>

        <footer className="appFooter">
          <div className="footerTip">
            Tip: Double-check completed quests before clearing them.
          </div>
          <div className="footerMeta">
            Data persists via <code>localStorage</code>.
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
