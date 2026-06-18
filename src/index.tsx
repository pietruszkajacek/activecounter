import { createRoot } from "react-dom/client";
import App from "./app";
// import { InitData } from "@/interfaces/init-data";
// import { AccountCreated } from "@/interfaces/account-created";

const container = document.getElementById("app");
const root = createRoot(container!);

root.render(<App />);

