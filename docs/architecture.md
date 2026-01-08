## Architecture Overview

VayuView is a mobile planetarium app built on the Stellarium Web Engine.
We wrap the engine with a Vue frontend and package it as an Android app using Capacitor.

```
┌────────────────────────────────────────────────────────────┐
│                    Native Mobile Runtime                   │
│                (Capacitor / Android Platform)              │
├────────────────────────────────────────────────────────────┤
│                    Web Application Layer                   │
│                     (Vue Frontend)                         │
├────────────────────────────────────────────────────────────┤
│                 Stellarium Web Engine Core                 │
│               (C / WebAssembly Computational Core)         │
└────────────────────────────────────────────────────────────┘
```

---

### Engine Layer

This is the Stellarium Web Engine core, compiled from C to WebAssembly.
It does all the heavy work: astronomical calculations, sky state, projections, and rendering logic.

Nothing in this layer is mobile-specific. It behaves exactly like upstream.

If you want to understand how the engine is structured internally, read
[doc/internals.md](../doc/internals.md).

### Web Application Layer

This is the JavaScript / Vue layer that sits on top of the engine.

It handles things like:

* Taking user and sensor input.
* Converting that into engine state updates.
* Keeping UI state separate from simulation state.

### Native Mobile Runtime

This is the Capacitor wrapper around the web app.

It mainly exists to provide the mobile shell: app manifest, permissions,
window flags, orientation handling, and platform integration.

Most native functionality is accessed through `@capacitor/*` plugins from
the JavaScript layer rather than custom Java / Kotlin code.

---

## Data and Control Flow

The system follows a strict unidirectional flow model:

```
  Native Sensors / OS Events
            ↓
    Web Application Layer
            ↓
    Engine State Updates
            ↓
  Engine Render / Simulation
            ↓
      Visual Output
```

User interaction follows the same pipeline, entering through the web layer and propagating downward into the engine core.

This model ensures:

* Isolation of deterministic simulation logic.
* Platform independence of the engine.
* Replaceability of the mobile runtime without modifying the computational core.
