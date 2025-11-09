"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TokenInputForm() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    const trimmedToken = token.trim();
    if (trimmedToken) {
      sessionStorage.setItem("canvas_token_present", "1");
      sessionStorage.setItem("canvas_token", trimmedToken);
    } else {
      sessionStorage.removeItem("canvas_token_present");
      sessionStorage.removeItem("canvas_token");
    }
    router.push("/courses");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <div className="relative w-full max-w-xl">
        <Input
          type={showToken ? "text" : "password"}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your access token"
          className="h-[52px] pr-24 text-[15px] border-2"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setShowToken(!showToken)}
            title="Show/Hide token"
          >
            {showToken ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handleSubmit}
            title="Submit"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mt-3 text-sm">
        <button
          onClick={() => setShowModal(true)}
          className="text-[var(--txt)] underline hover:text-[var(--accent)] font-medium cursor-pointer"
        >
          Don't know how to get an access token?
        </button>
      </div>

      <div className="mt-2 text-xs text-[var(--input-placeholder)]">
        Token will never be stored and will only be used for this session.
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[1000]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-[600px] w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold mb-6">
              How to get an access token
            </h3>

            <ol className="list-none space-y-4 mb-6">
              {[
                "Log in to Canvas and go to Account → Settings",
                "Click + New Access Token and enter a purpose",
                "Click Generate Token and copy the value",
                "Paste it here and click the arrow to continue",
              ].map((step, index) => (
                <li
                  key={index}
                  className="flex gap-4 items-start p-4 bg-[var(--bg-gray)] rounded-lg"
                >
                  <div className="min-w-[32px] h-8 rounded-full bg-[var(--txt)] text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="flex-1 pt-1 text-[15px]">
                    {step.split("→").map((part, i, arr) => (
                      <span key={i}>
                        {i > 0 && " → "}
                        {part.includes("Account") ||
                        part.includes("Settings") ||
                        part.includes("New Access Token") ||
                        part.includes("Generate Token") ? (
                          <b>{part.trim()}</b>
                        ) : (
                          part
                        )}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ol>

            <div className="text-right">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
