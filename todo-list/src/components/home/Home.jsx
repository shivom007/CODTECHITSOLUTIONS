import { toast } from "sonner";
import Note from "../note/Note";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
function Home() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
    sessionStorage.clear();
    return;
  };

  const handleDelete = (id) => {
    const updatedTodos = todos.filter((t) => t._id !== id);
    setTodos(updatedTodos);
    fetch(`https://noteapi1-5efk703l.b4a.run/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete note");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        toast(data.message, {
          description: new Date().toDateString(),
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
      })
      .catch((error) => {
        console.error("Error deleting note:", error);
      });
  };
  const handleAddTodo = () => {
    fetch("https://noteapi1-5efk703l.b4a.run/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newTodo, 
        content: "undefined", 
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add new todo");
        }
        return response.json();
      })
      .then((data) => {
        const newTodoItem = {
          _id: data.Id,
          title: newTodo,
          content: "undefined",
        };
        setTodos([...todos, newTodoItem]);
        setNewTodo("");
        toast(data.message, {
          description: new Date().toDateString(),
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
      })
      .catch((error) => {
        console.error("Error adding new todo:", error);
      });
  };

  const handleUpdate = (id, titleUpdate, content) => {
    fetch(`https://noteapi1-5efk703l.b4a.run/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: titleUpdate,
        content,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update todo on the server");
        }
        console.log("Update todo with id:", id);
        return response.json();
      })
      .then((data) => {
        const updatedTodos = todos.map((t) =>
          t._id === id ? { ...t, title: titleUpdate } : t
        );

        setTodos(updatedTodos);
        toast(data.message, {
          description: new Date().toDateString(),
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });
      })
      .catch((error) => {
        console.error("Error updating todo:", error);
      });
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("https://noteapi1-5efk703l.b4a.run/api/notes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          navigate("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data.notes.length === 0) {
          toast("No Todos Exists", {
            description: new Date().toDateString(),
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          });
        } else {
          setTodos(data.notes);
          toast("Todos found!", {
            description: new Date().toDateString(),
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          });
        }
      })
      .catch((error) => console.log(error));
  }, [token]);

  return (
    <div
      className="flex flex-col items-center w-full bg-cover bg-center h-screen"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1476108621677-3c620901b5e7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
      }}
    >
      <h1 className="md:text-8xl text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-blue-500">
        Your Todos
      </h1>
      <div className="flex md:w-full w-[20rem] max-w-[30rem] h-20 items-center space-x-2">
        <Input
          type="text"
          className="border border-gray-500 h-11  focus:border-blue-500"
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add Todo"
        />
        <Button type="submit" className="h-11" onClick={handleAddTodo}>
          Add
        </Button>
        <Button onClick={handleLogout} className="h-11">
          Logout
        </Button>
      </div>
      <div className="flex flex-col justify-center pt-5 gap-6 w-[20rem] md:w-[30rem] ">
        {todos &&
          todos.map((todo) => (
            <Note
              key={todo._id}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              todo={todo}
            />
          ))}
      </div>
    </div>
  );
}

export default Home;
