import { SetBreadcrumb } from "@/components/breadcrumb-context";

export default function HomePage() {
  return (
    <>
      <SetBreadcrumb items={[{ label: "Dashboard" }]} />
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Hello world</h1>
      </div>
    </>
  );
}
