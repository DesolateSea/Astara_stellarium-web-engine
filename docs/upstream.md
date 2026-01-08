# Upstream Relationship

VayuView is a fork of [Stellarium Web Engine](https://github.com/Stellarium/stellarium-web-engine).

The upstream project is a browser-based planetarium. We took it and turned it
into a native Android app with sensor integration.

---

## Why Fork?

The upstream engine is designed mainly as a desktop browser demo. It assumes
constant network access, mouse-driven interaction, and a short-lived session
model.

We wanted something different:

- A real native mobile app, not just a PWA.
- Gyroscope-based “point your phone at the sky” interaction.
- AR camera overlay.
- Touch-first UI behavior.
- Full offline usage with bundled data.
- A build pipeline that produces a production-grade Android application.

These goals require platform integration and assumptions that do not belong in
the upstream web project.

---

## What Stays Upstream

The astronomical engine itself is treated as upstream-owned code. By default we
do not change:

- Astronomical simulation logic.
- Rendering and projection system.
- Object model and module structure.
- Asset loading model and ephemeris algorithms.

These parts are expected to remain functionally equivalent to upstream.

For details about how the C / WebAssembly engine is structured internally, see  
[doc/internals.md](../doc/internals.md).

---

## What We Changed

Most of the work in VayuView happens outside the core engine, but some practical
changes exist across all layers in order to make the engine usable as a real
mobile application.

This includes:

- A mobile-oriented application shell built with Capacitor.
- A frontend that treats touch input and device motion as first-class inputs.
- Sensor and camera integration paths that do not exist in the upstream web app.
- Full offline operation with sky data bundled locally.
- Support for arbitrary observer locations without relying on external APIs.
- Much larger bundled datasets, including additional deep sky objects and landscapes.
- Build tooling that produces a standalone Android app rather than a demo site.

These changes are not meant to redefine how the Stellarium engine works.  
They exist to bridge the gap between a browser planetarium and a usable mobile
application.
