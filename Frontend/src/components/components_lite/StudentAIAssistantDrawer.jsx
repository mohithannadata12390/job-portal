import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AI_API_ENDPOINT } from "@/utils/data";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Bot,
  Send,
  Loader2,
  X,
  Trash2,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import FormattedMessage from "../admincomponent/FormattedMessage";

const QUICK_PROMPTS = [
  "Which jobs match my skills best?",
  "What skills should I learn to improve my hiring chances?",
  "Give me 3 mock interview questions on my stack.",
  "Help me draft a tailored cover letter for my applications.",
];

const StudentAIAssistantDrawer = ({ isOpen, onClose, userName }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load chat history when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      try {
        setFetchingHistory(true);
        const res = await axios.get(`${AI_API_ENDPOINT}/student/history`, {
          withCredentials: true,
        });
        if (res.data.success && res.data.messages) {
          setMessages(res.data.messages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching AI chat history:", error);
      } finally {
        setFetchingHistory(false);
      }
    };

    fetchHistory();
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = (typeof textToSend === "string" ? textToSend : inputMessage).trim();
    if (!text || loading) return;

    // Add user message optimistically
    const userMsg = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${AI_API_ENDPOINT}/student/chat`,
        { message: text },
        { withCredentials: true }
      );

      if (res.data.success) {
        const aiMsg = {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        toast.error(res.data.message || "Failed to get AI response");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "AI Career Coach is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await axios.delete(`${AI_API_ENDPOINT}/student/history`, {
        withCredentials: true,
      });
      setMessages([]);
      toast.success("Chat history cleared.");
    } catch (error) {
      toast.error("Failed to clear chat history.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <Bot className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                AI Career Coach
                <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              </h2>
              <p className="text-xs text-purple-200">
                Personalized job matching & interview mentor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              title="Clear Chat History"
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2.5 bg-purple-50/70 border-b border-purple-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
          <span className="text-xs font-semibold text-purple-800 shrink-0">
            Quick prompts:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs bg-white text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-full px-2.5 py-1 shrink-0 transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {fetchingHistory ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-xs">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
              <div className="p-4 bg-purple-100 rounded-full mb-3 text-purple-600">
                <Bot className="h-10 w-10" />
              </div>
              <h3 className="font-semibold text-gray-800 text-base mb-1">
                Welcome{userName ? `, ${userName}` : ""}!
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                I'm your AI Career Coach. Ask me anything about jobs, skills,
                interview prep, cover letters, or general coding & career questions.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <Avatar className="h-8 w-8 shrink-0 bg-purple-600 text-white text-xs">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isUser
                        ? "bg-purple-600 text-white rounded-tr-none whitespace-pre-wrap"
                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none leading-relaxed"
                    }`}
                  >
                    {isUser ? (
                      <div>{msg.content}</div>
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}

                    {/* Sources badge */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-purple-700">Jobs Referenced:</span>
                        {msg.sources.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-purple-50 text-purple-700 border border-purple-200 rounded px-1.5 py-0.5 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <Avatar className="h-8 w-8 shrink-0 bg-gray-200 text-gray-700 text-xs">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-2.5 justify-start items-center">
              <Avatar className="h-8 w-8 shrink-0 bg-purple-600 text-white text-xs">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                Thinking and preparing your career advice...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3.5 bg-white border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about jobs, skills, interview prep, or anything..."
              disabled={loading}
              className="flex-1 focus-visible:ring-purple-600"
            />
            <Button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentAIAssistantDrawer;
