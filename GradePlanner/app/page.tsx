"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "@/components/shared/global.css";
import "@/components/auth/index.css";

const CANVAS_BASE_URL = "https://umamherst.instructure.com/api/v1";

export default function HomePage() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const value = token.trim();
    if (!value) {
      setError("Please enter your Canvas access token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify token with Canvas API
      const response = await fetch("/api/canvas/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseUrl: CANVAS_BASE_URL,
          token: value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify token");
      }

      if (data.valid) {
        // Store credentials in sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("canvas_token", value);
          sessionStorage.setItem("canvas_base_url", CANVAS_BASE_URL);
          sessionStorage.setItem("canvas_user", JSON.stringify(data.user));
        }
        router.push("/courses");
      } else {
        setError("Invalid Canvas token. Please check and try again.");
      }
    } catch (err) {
      console.error("Token verification error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to verify token. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <section className="hero">
        <div className="panel">
          <h1>
            GRADE
            <br />
            PLANNER
          </h1>
          <div className="search">
            <input
              id="token"
              className="input"
              type={showToken ? "text" : "password"}
              placeholder="Enter your access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              id="vis"
              className="icon-btn"
              type="button"
              title="Show/Hide token"
              onClick={() => setShowToken(!showToken)}
              disabled={loading}
            >
              <Image
                src={showToken ? "/icons/eye-close.svg" : "/icons/eye-alt.svg"}
                alt="Toggle visibility"
                width={24}
                height={24}
              />
            </button>

            <button
              id="go"
              className="icon-btn"
              type="submit"
              title="Submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              <Image
                src="/icons/send-outline.svg"
                alt="Submit"
                width={24}
                height={24}
              />
            </button>
          </div>

          {error && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "14px",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {loading && (
            <div
              style={{
                color: "#3b82f6",
                fontSize: "14px",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              Verifying token...
            </div>
          )}

          <div className="hint">
            <span
              id="how"
              className="link"
              onClick={() => setShowModal(true)}
              style={{ cursor: "pointer" }}
            >
              Don't know how to get an access token?
            </span>
          </div>
          <div className="subhint">
            Token will never be stored and will only be used for this session.
          </div>
        </div>
        <div className="hero-gradient"></div>
      </section>

      {/* Modal */}
      <section
        id="modal"
        className="modal"
        aria-hidden={!showModal}
        role="dialog"
        style={{ display: showModal ? "flex" : "none" }}
      >
        <div className="card">
          <h3>How to get an access token</h3>
          <ol className="steps">
            <li>
              <span>
                Log in to Canvas and go to <b>Account → Settings</b>
              </span>
            </li>
            <li>
              <span>
                Click <b>+ New Access Token</b> and enter a purpose
              </span>
            </li>
            <li>
              <span>
                Click <b>Generate Token</b> and copy the value
              </span>
            </li>
            <li>
              <span>Paste it here and click the arrow to continue</span>
            </li>
          </ol>
          <div style={{ textAlign: "right" }}>
            <button
              id="close"
              className="btn btn--outline"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
