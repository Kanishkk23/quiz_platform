import { QLoader, StatusMessages } from "@/components/fx/Loaders";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[#BDF2D5] px-4"
      style={{
        backgroundImage: `
          linear-gradient(rgba(15, 61, 46, 0.18) 1.5px, transparent 1.5px),
          linear-gradient(90deg, rgba(15, 61, 46, 0.18) 1.5px, transparent 1.5px),
          linear-gradient(rgba(15, 61, 46, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15, 61, 46, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: "160px 160px, 160px 160px, 32px 32px, 32px 32px",
      }}
    >
      <QLoader size={130} />
      <StatusMessages
        messages={[
          "warming up the arena…",
          "shuffling questions…",
          "sharpening pencils…",
          "counting the points…",
        ]}
      />
      <div className="qz-load-track" aria-hidden="true">
        <div className="qz-load-bar" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}