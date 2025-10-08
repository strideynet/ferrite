import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input.tsx";
import "./App.css";
import {invoke} from "@tauri-apps/api/core";
import {useState} from "react";

function App() {
  const [name, setName] = useState("")
  const [greetMsg, setGreetMsg] = useState("");

  async function boop() {
    const got = await invoke("greet", {
      name: name,
    })
    setGreetMsg(got)
  }
  return (
    <main className="container">
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Input onChange={(e) => setName(e.currentTarget.value)} />
        <Button variant={"destructive"} onClick={boop}>Click me</Button>
        <p>{greetMsg}</p>
      </div>
    </main>
  );
}

export default App;
