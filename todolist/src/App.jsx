import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { analyzeDifficulty } from "./lib/gemini";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        alert("목록 불러오기 실패");
        return;
      }

      setTodos(data);
    } catch (err) {
      console.error("Network Error:", err);
      alert("목록 불러오기 실패 (서버 연결 오류)");
    }
  }

  async function addTodo() {
    if (loading) return;
    if (!title.trim()) {
      alert("할 일을 입력하세요.");
      return;
    }

    setLoading(true);

    try {
      const difficulty = await analyzeDifficulty(title);

      const { error } = await supabase.from("todos").insert([
        {
          title: title,
          difficulty: difficulty,
        },
      ]);

      if (error) {
        console.error(error);
        alert("할 일 추가 실패");
        return;
      }

      setTitle("");
      await fetchTodos();
    } catch (err) {
      console.error("Network Error:", err);
      alert("할 일 추가 실패 (서버 연결 오류)");
    } finally {
      setLoading(false);
    }
  }

  async function updateTodo(id) {
    if (!editingTitle.trim()) {
      alert("수정할 내용을 입력하세요.");
      return;
    }

    setLoading(true);

    try {
      const difficulty = await analyzeDifficulty(editingTitle);

      const { error } = await supabase
        .from("todos")
        .update({
          title: editingTitle,
          difficulty: difficulty,
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        alert("수정 실패");
        return;
      }

      setEditingId(null);
      setEditingTitle("");
      await fetchTodos();
    } catch (err) {
      console.error("Network Error:", err);
      alert("수정 실패 (서버 연결 오류)");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTodo(id) {
    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) {
        console.error(error);
        alert("삭제 실패");
        return;
      }

      await fetchTodos();
    } catch (err) {
      console.error("Network Error:", err);
      alert("삭제 실패 (서버 연결 오류)");
    }
  }

  async function toggleDone(todo) {
    try {
      const { error } = await supabase
        .from("todos")
        .update({
          is_done: !todo.is_done,
        })
        .eq("id", todo.id);

      if (error) {
        console.error(error);
        alert("완료 상태 변경 실패");
        return;
      }

      await fetchTodos();
    } catch (err) {
      console.error("Network Error:", err);
      alert("완료 상태 변경 실패 (서버 연결 오류)");
    }
  }

  function getDifficultyClass(difficulty) {
    if (difficulty === "쉬움") return "easy";
    if (difficulty === "어려움") return "hard";
    return "medium";
  }

  return (
    <div className="container">
      <h1>To-Do List</h1>
      <p className="subtitle">Supabase CRUD + Gemini 난이도 분석</p>

      <div className="input-box">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter") addTodo();
          }}
        />
        <button onClick={addTodo} disabled={loading}>
          {loading ? "분석 중..." : "추가"}
        </button>
      </div>

      <div className="todo-list">
        {todos.length === 0 ? (
          <p className="empty">등록된 할 일이 없습니다.</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="todo-card">
              {editingId === todo.id ? (
                <div className="edit-box">
                  <input
                    className="edit-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                  />
                  <button onClick={() => updateTodo(todo.id)} disabled={loading}>
                    저장
                  </button>
                  <button
                    className="cancel"
                    onClick={() => {
                      setEditingId(null);
                      setEditingTitle("");
                    }}
                  >
                    취소
                  </button>
                </div>
              ) : (
                <>
                  <div className="todo-content">
                    <input
                      type="checkbox"
                      checked={todo.is_done}
                      onChange={() => toggleDone(todo)}
                    />

                    <span className={todo.is_done ? "done todo-title" : "todo-title"}>
                      {todo.title}
                    </span>

                    <span
                      className={`difficulty ${getDifficultyClass(
                        todo.difficulty
                      )}`}
                    >
                      {todo.difficulty}
                    </span>
                  </div>

                  <div className="button-group">
                    <button
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditingTitle(todo.title);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;