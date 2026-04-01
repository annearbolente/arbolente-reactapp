import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import "./App.css";

function App() {
  const [note, setNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [notes, setNotes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const notesCollection = collection(db, "notes");

  const addNote = async () => {
    if (note.trim() === "") return;
    await addDoc(notesCollection, {
      text: note,
      deadline: deadline,
      status: status,
      createdAt: new Date()
    });
    setNote("");
    setDeadline("");
    setStatus("Not Started");
    fetchNotes();
  };

  const fetchNotes = async () => {
    const data = await getDocs(notesCollection);
    setNotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const deleteNote = async (id) => {
    const noteDoc = doc(db, "notes", id);
    await deleteDoc(noteDoc);
    fetchNotes();
  };

  const updateStatus = async (id, newStatus) => {
    const noteDoc = doc(db, "notes", id);
    await updateDoc(noteDoc, { status: newStatus });
    fetchNotes();
  };

  const startEdit = (n) => {
    setEditId(n.id);
    setEditText(n.text);
    setEditDeadline(n.deadline || "");
    setEditStatus(n.status);
  };

  const saveEdit = async () => {
    if (editText.trim() === "") return;
    const noteDoc = doc(db, "notes", editId);
    await updateDoc(noteDoc, {
      text: editText,
      deadline: editDeadline,
      status: editStatus
    });
    setEditId(null);
    setEditText("");
    setEditDeadline("");
    setEditStatus("");
    fetchNotes();
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText("");
    setEditDeadline("");
    setEditStatus("");
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const notStarted = notes.filter((n) => n.status === "Not Started").length;
  const inProgress = notes.filter((n) => n.status === "In Progress").length;
  const accomplished = notes.filter((n) => n.status === "Accomplished").length;

  const getBadgeClass = (status) => {
    if (status === "Not Started") return "status-badge badge-not-started";
    if (status === "In Progress") return "status-badge badge-in-progress";
    return "status-badge badge-accomplished";
  };

  return (
    <div className="container">
      <h1>🌸 My Notes App</h1>

      <div className="monitor">
        <div className="monitor-box not-started">
          <span className="monitor-count">{notStarted}</span>
          <span className="monitor-label">Not Started</span>
        </div>
        <div className="monitor-box in-progress">
          <span className="monitor-count">{inProgress}</span>
          <span className="monitor-label">In Progress</span>
        </div>
        <div className="monitor-box accomplished">
          <span className="monitor-count">{accomplished}</span>
          <span className="monitor-label">Accomplished</span>
        </div>
      </div>

      <div className="input-card">
        <h2>✏️ Add New Task</h2>
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter a task..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="input-bottom">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Accomplished</option>
            </select>
            <button onClick={addNote}>Add Task</button>
          </div>
        </div>
      </div>

      <div className="notes-list">
        <h2>📋 My Tasks</h2>
        {notes.length === 0 && (
          <p className="empty">No tasks yet. Add one above! 🌸</p>
        )}
        {notes.map((n) => (
          <div className={`note ${n.status === "Accomplished" ? "done" : ""}`} key={n.id}>
            {editId === n.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="edit-bottom">
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Accomplished</option>
                  </select>
                </div>
                <div className="edit-actions">
                  <button className="save-btn" onClick={saveEdit}>💾 Save</button>
                  <button className="cancel-btn" onClick={cancelEdit}>✕ Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="note-info">
                  <p className={`note-text ${n.status === "Accomplished" ? "accomplished-text" : ""}`}>
                    {n.text}
                  </p>
                  {n.deadline && (
                    <span className="deadline">📅 {n.deadline}</span>
                  )}
                  <br />
                  <span className={getBadgeClass(n.status)}>{n.status}</span>
                </div>
                <div className="note-actions">
                  <select
                    value={n.status}
                    onChange={(e) => updateStatus(n.id, e.target.value)}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Accomplished</option>
                  </select>
                  <button className="edit-btn" onClick={() => startEdit(n)}>✏️ Edit</button>
                  <button onClick={() => deleteNote(n.id)}>🗑️ Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;