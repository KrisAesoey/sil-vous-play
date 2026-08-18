import { Electroview } from "electrobun/view"
import { createRoot } from "react-dom/client"
import type { MyRPC } from "../shared/rpc"
import { App } from "./App"

console.log("Hello Electrobun view loaded!")

const rpc = Electroview.defineRPC<MyRPC>({
	maxRequestTime: Infinity,
	handlers: {},
})
new Electroview({ rpc })

const rootElement = document.getElementById("root")

if (!rootElement) throw new Error("Missing root element")

createRoot(rootElement).render(<App rpc={rpc} />)
