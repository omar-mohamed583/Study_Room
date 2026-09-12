import { Link } from "react-router";

export default function Tasks() {
  console.log("Tasks");
  return (
    <div className="grid gap-4 p-5">
      <h1>Tasks</h1>
      <Link to="./tasks.tsx">Home</Link>
    </div>
  )
}