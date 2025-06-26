"use client";
import { useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function InventoryChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      let assistantMsg = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMsg += new TextDecoder().decode(value);
        setMessages([...newMessages, { role: "assistant" as const, content: assistantMsg }]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant" as const, content: "Error: Could not get a response." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating button when closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 shadow-xl flex items-center justify-center hover:bg-blue-700 transition-colors focus:outline-none"
          aria-label="Open chat"
          title="Open chat"
          type="button"
        >
          {/* Chat icon */}
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l.8-3.2A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
      {/* Chat box when open */}
      {open && (
        <div className="w-full max-w-md transition-all duration-300 shadow-xl">
          {/* Header / Toggle */}
          <div
            className="flex items-center justify-between px-4 py-2 rounded-t-lg bg-blue-600"
            style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
          >
            <span className="text-white font-semibold text-base">Inventory Chat</span>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-700 transition-colors"
              aria-label="Minimize chat"
              title="Minimize chat"
              type="button"
            >
              {/* Down arrow icon */}
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {/* Chat Body */}
          <div
            className="bg-white border border-t-0 rounded-b-lg flex flex-col h-96 transition-all duration-300"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`whitespace-pre-line max-w-[90%] break-words rounded-lg px-3 py-2 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "ml-auto bg-blue-100 text-blue-900"
                      : "mr-auto bg-gray-100 text-gray-800"
                  }`}
                >
                  <span className="block font-semibold mb-1 text-xs text-gray-500">
                    {msg.role === "user" ? "You" : "Assistant"}
                  </span>
                  <span>{msg.content}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="flex border-t p-2 bg-gray-50 transition-all duration-300"
            >
              <input
                className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none text-sm"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about inventory..."
                disabled={loading || !open}
              />
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 text-sm"
                disabled={loading || !input.trim() || !open}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 