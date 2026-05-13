export default function SeguroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-seguro-bg text-seguro-text">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 border-l-4 border-seguro-accent bg-seguro-bg/50 px-4 py-2">
          <h1 className="text-xl font-bold text-seguro-accent">
            Modo Seguro
          </h1>
          <p className="text-sm text-gray-400">
            Implementaci&oacute;n protegida bajo est&aacute;ndares OWASP
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}