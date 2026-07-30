export default function NotFound() {
  return (
    <main id="main">
      <section className="page-hero compact">
        <div className="container">
          <p className="eyebrow">404</p>
          <h1 className="display-medium">This page could not be found.</h1>
          <div className="btn-row" style={{ marginTop: 32 }}>
            <a className="btn btn-primary" href="/">Return Home <span className="arrow">↗</span></a>
          </div>
        </div>
      </section>
    </main>
  )
}
