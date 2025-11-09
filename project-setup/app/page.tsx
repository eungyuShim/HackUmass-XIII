import { TokenInputForm } from "@/components/auth/TokenInputForm";

export default function HomePage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[clamp(500px,33vw,640px)_1fr]">
      {/* Left Panel */}
      <section className="bg-[var(--bg-left)] flex flex-col justify-center p-12 lg:p-16 shadow-[30px_4px_40px_rgba(0,0,0,0.25)] relative z-10">
        <div className="max-w-xl">
          <h1 className="text-[52px] font-black leading-none tracking-tight mb-8">
            GRADE
            <br />
            PLANNER
          </h1>

          <TokenInputForm />
        </div>
      </section>

      {/* Right Gradient Panel */}
      <section
        className="hidden lg:block"
        style={{
          background:
            "radial-gradient(circle at 57% 46%, rgba(192, 56, 56, 1) 0%, rgba(136, 28, 28, 1) 55%)",
        }}
      />
    </div>
  );
}
