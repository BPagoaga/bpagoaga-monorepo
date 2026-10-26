const App = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
    <p className="text-body-s font-semibold uppercase tracking-widest text-accent-110">Bientôt</p>
    <h1 className="font-display text-title-xl text-foreground">Calisthenics</h1>
    <p className="max-w-md text-body-m text-muted">
      Tutoriels, récapitulatifs de performance et journal de séances. Les maquettes sont dans{' '}
      <code className="font-mono text-body-s">apps/mockups</code>.
    </p>
  </main>
);

export default App;
