import { Component, type ReactNode } from 'react';

/** A failed route download should leave navigation and a recovery action usable. */
export default class PageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <section className="recruitment-page section-wrap" role="alert">
      <h1>This page couldn’t load.</h1>
      <p>Please try again.</p>
      <button className="button primary" onClick={() => window.location.reload()}>Reload page</button>
    </section>;
    return this.props.children;
  }
}
