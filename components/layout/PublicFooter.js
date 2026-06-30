export default function PublicFooter() {
  return (
    <footer className="footer footer-center bg-base-200 text-base-content p-6 mt-auto border-t border-base-300">
      <aside>
        <p className="font-bold text-lg">FoodZen</p>
        <p className="text-sm opacity-70">Fresh food. Simple service.</p>
        <p className="text-xs opacity-50 mt-2">
          © {new Date().getFullYear()} FoodZen. All rights reserved.
        </p>
      </aside>
    </footer>
  );
}
