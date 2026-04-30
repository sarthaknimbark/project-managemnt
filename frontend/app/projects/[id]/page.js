"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";

const STATUSES = ["To Do", "In Progress", "Done"];

function SortableTaskCard({
  task,
  isAdmin,
  users,
  user,
  isExpanded,
  onToggleExpand,
  commentText,
  setCommentText,
  changeStatus,
  updateTask,
  addComment
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: "task", status: task.status }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`card card-interactive space-y-3 ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-slate-900">{task.title}</h4>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
            {task.description || "No description"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleExpand(task._id)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          {isExpanded ? "Hide" : "Open"}
        </button>
      </div>

      <div
        {...attributes}
        {...listeners}
        className="cursor-grab rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 active:cursor-grabbing"
      >
        Drag task
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-2.5 py-2">
        <p className="text-xs text-slate-500">
          Assignee{" "}
          <span className="ml-1 rounded bg-brand-100 px-2 py-0.5 font-semibold text-brand-700">
            {task.assigned_to_name}
          </span>
        </p>
        <p className="text-xs font-medium text-slate-600">{task.status}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => changeStatus(task._id, item)}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition ${
              task.status === item
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}
        {isAdmin ? (
          <select
            value={task.assigned_to}
            onChange={(e) =>
              updateTask(task._id, {
                assigned_to: e.target.value
              })
            }
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            {users.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <p className="text-xs text-slate-500">
        Last updated by: <span className="font-semibold">{task.lastUpdatedBy?.userName || "Unknown"}</span>
      </p>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="space-y-1 rounded-lg bg-slate-50 p-2">
              <p className="text-xs font-semibold text-slate-500">Comments</p>
              {task.comments?.slice(-3).map((comment) => (
                <p key={comment._id} className="text-xs text-slate-700">
                  <span className="font-semibold">{comment.user_name}:</span> {comment.text}
                </p>
              ))}
              <div className="flex gap-2">
                <input
                  value={commentText[task._id] || ""}
                  onChange={(e) =>
                    setCommentText((prev) => ({ ...prev, [task._id]: e.target.value }))
                  }
                  placeholder={`Comment as ${user?.name || "you"}`}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                />
                <button
                  onClick={() => addComment(task._id)}
                  type="button"
                  className="rounded bg-slate-900 px-2 py-1 text-xs text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-2">
              <p className="mb-1 text-xs font-semibold text-slate-500">Activity</p>
              {task.activity?.slice(-3).map((item) => (
                <p key={item._id} className="text-xs text-slate-600">
                  <span className="font-semibold">{item.user_name}</span> - {item.action}
                </p>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

function KanbanColumn({ status, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: { type: "column", status }
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 rounded-2xl border p-3 transition min-h-[300px] ${
        isOver
          ? "border-brand-300 bg-brand-50 ring-2 ring-brand-200"
          : "border-slate-200 bg-slate-100/80"
      }`}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{status}</h3>
      {children}
    </div>
  );
}

export default function ProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: ""
  });
  const [commentText, setCommentText] = useState({});
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        !searchText.trim() ||
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(searchText.toLowerCase());
      const matchesAssignee = assigneeFilter === "all" || task.assigned_to === assigneeFilter;
      return matchesSearch && matchesAssignee;
    });
  }, [tasks, searchText, assigneeFilter]);

  const groupedTasks = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = filteredTasks.filter((task) => task.status === status);
      return acc;
    }, {});
  }, [filteredTasks]);

  const loadData = async () => {
    try {
      const [projects, taskList, userList] = await Promise.all([
        apiFetch("/projects"),
        apiFetch(`/tasks?projectId=${id}`),
        apiFetch("/users")
      ]);
      setProject(projects.find((item) => item._id === id) || null);
      setTasks(taskList);
      setUsers(userList);
      if (userList[0] && !form.assigned_to) {
        setForm((prev) => ({ ...prev, assigned_to: userList[0]._id }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function createTask(event) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          project_id: id
        })
      });
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        due_date: ""
      }));
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeStatus(taskId, status) {
    if (!taskId || !status) return;
    await apiFetch(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    await loadData();
  }

  async function updateTask(taskId, payload) {
    await apiFetch(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    await loadData();
  }

  async function addComment(taskId) {
    const text = commentText[taskId]?.trim();
    if (!text) return;
    await apiFetch(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text })
    });
    setCommentText((prev) => ({ ...prev, [taskId]: "" }));
    await loadData();
  }

  function findTaskById(taskId) {
    return tasks.find((task) => task._id === taskId) || null;
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTaskId(null);
    if (!over) return;

    const draggedTask = findTaskById(active.id);
    if (!draggedTask) return;

    const overId = over.id;
    const overTask = findTaskById(overId);
    const targetStatus = overTask?.status || overId;
    if (!STATUSES.includes(targetStatus) || targetStatus === draggedTask.status) return;

    setTasks((prev) =>
      prev.map((task) => (task._id === draggedTask._id ? { ...task, status: targetStatus } : task))
    );

    try {
      await changeStatus(draggedTask._id, targetStatus);
    } catch (_error) {
      await loadData();
    }
  }

  return (
    <RequireAuth>
      <Header />
      <main className="page-shell space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-700 p-6 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <h1 className="relative z-10 text-2xl font-semibold">{project?.title || "Project"}</h1>
          <p className="relative z-10 mt-1 text-sm text-slate-100/90">
            {project?.description || "No description"}
          </p>
        </section>

        {isAdmin ? (
          <section className="glass-card p-5">
            <h2 className="mb-3 text-lg font-semibold">Add Task</h2>
            <form onSubmit={createTask} className="grid gap-3 md:grid-cols-5">
              <input
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="input-modern"
                required
              />
              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="input-modern"
              />
              <select
                value={form.assigned_to}
                onChange={(e) => setForm((prev) => ({ ...prev, assigned_to: e.target.value }))}
                className="input-modern"
              >
                {users.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
                className="input-modern"
              />
              <button className="rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 px-4 py-2 font-medium text-white hover:opacity-95">
                Create
              </button>
            </form>
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          </section>
        ) : (
          <section className="glass-card p-5">
            <p className="text-sm text-slate-600">
              Admin controls task assignment. You can still update status and add comments.
            </p>
          </section>
        )}

        <section className="glass-card p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search tasks..."
              className="input-modern"
            />
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="input-modern"
            >
              <option value="all">All assignees</option>
              {users.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <div className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm text-slate-700">
              {filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"} shown
            </div>
          </div>
        </section>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(event) => setActiveTaskId(event.active.id)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveTaskId(null)}
        >
          <section className="grid gap-4 lg:grid-cols-3">
            {STATUSES.map((status) => (
              <KanbanColumn key={status} status={status}>
                <SortableContext
                  items={(groupedTasks[status] || []).map((task) => task._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {groupedTasks[status]?.map((task) => (
                    <SortableTaskCard
                      key={task._id}
                      task={task}
                      isAdmin={isAdmin}
                      users={users}
                      user={user}
                      isExpanded={expandedTaskId === task._id}
                      onToggleExpand={(taskId) =>
                        setExpandedTaskId((prev) => (prev === taskId ? null : taskId))
                      }
                      commentText={commentText}
                      setCommentText={setCommentText}
                      changeStatus={changeStatus}
                      updateTask={updateTask}
                      addComment={addComment}
                    />
                  ))}
                </SortableContext>
                {groupedTasks[status]?.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
                    Drop a card here
                  </div>
                ) : null}
              </KanbanColumn>
            ))}
          </section>
          <DragOverlay>
            {activeTaskId ? (
              <div className="card w-[320px] rotate-1 border-brand-200 bg-white/95 shadow-2xl">
                <p className="text-sm font-semibold">{findTaskById(activeTaskId)?.title}</p>
                <p className="text-xs text-slate-500">
                  {findTaskById(activeTaskId)?.assigned_to_name}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </RequireAuth>
  );
}
