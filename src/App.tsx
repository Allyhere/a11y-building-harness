function path(): string {
  return window.location.pathname;
}

export function App() {
  if (path() === "/broken") {
    return <BrokenPage />;
  }
  return <GoodPage />;
}

function GoodPage() {
  return (
    <>
      <header>
        <p>
          <a href="#main">Skip to content</a>
        </p>
        <nav aria-label="Demo">
          <a href="/">Good page</a>
          {" · "}
          <a href="/broken">Broken page</a>
        </nav>
      </header>
      <main id="main">
        <h1>Subscribe</h1>
        <p>Native form controls, a document language, and a labeled field.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <p>
            <label htmlFor="email">Email</label>
            <br />
            <input id="email" name="email" type="email" autoComplete="email" />
          </p>
          <button type="submit">Subscribe</button>
        </form>
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23005fcc'/%3E%3C/svg%3E"
          alt="Solid blue square used as a decorative logo"
          width={48}
          height={48}
        />
      </main>
    </>
  );
}

function BrokenPage() {
  return (
    <div className="broken">
      <div className="clickable-div" onClick={() => undefined}>
        Home
      </div>
      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23000'/%3E%3C/svg%3E"
        width={48}
        height={48}
      />
      <input type="text" />
    </div>
  );
}
