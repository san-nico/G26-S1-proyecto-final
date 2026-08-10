import PageLayout from "@/components/global/PageLayout";

type ResumenViewProps = {
  children: React.ReactNode;
};

export default function ResumenView({ children }: ResumenViewProps) {
  return (
    <PageLayout mainClassName="container-main">
      <div className="space-y-8">{children}</div>
    </PageLayout>
  );
}
