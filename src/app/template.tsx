import { Fx } from "@/components/fx/Fx";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="qz-page-in">{children}</div>
      <Fx />
    </>
  );
}