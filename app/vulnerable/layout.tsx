export default function VulnerableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-vulnerable-bg text-vulnerable-text">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 border-l-4 border-vulnerable-accent bg-vulnerable-bg/50 px-4 py-2">
          <h1 className="text-xl font-bold text-vulnerable-accent">
            Modo Vulnerable
          </h1>
          <p className="text-sm text-gray-400">
            Demostraci&oacute;n de vulnerabilidades OWASP
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}