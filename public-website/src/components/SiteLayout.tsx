import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatAssistant } from "./ChatAssistant";

export function SiteLayout() {
  return (
    <div className="min-h-screen text-foreground">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
}
