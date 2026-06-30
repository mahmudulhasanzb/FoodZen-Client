import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export default function PublicLayout({ children }) {
  return (
    <>
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </>
  );
}
