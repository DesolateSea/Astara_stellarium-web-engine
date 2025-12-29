# Engine Internals

This document provides a deep dive into the C/C++ core engine implementation of Stellarium Web Engine, covering the object system, modules, rendering pipeline, and astronomical calculations.

## Table of Contents

- [Object System](#object-system)
- [Module Architecture](#module-architecture)
- [Core System](#core-system)
- [Rendering Pipeline](#rendering-pipeline)
- [Astronomical Calculations](#astronomical-calculations)
- [Coordinate Frames](#coordinate-frames)
- [Data Management](#data-management)
- [Memory Management](#memory-management)

## Object System

The engine uses a custom object-oriented system implemented in C, providing inheritance, polymorphism, and dynamic attributes.

### Base Object Structure

All objects inherit from `obj_t`:

```c
struct obj {
    obj_klass_t *klass;      // Class definition (vtable)
    int         ref;          // Reference counter
    const char  *id;          // Optional string ID
    char        type[4];      // Four-byte type identifier
    obj_t       *parent;      // Parent object
    obj_t       *children;    // First child
    obj_t       *prev, *next; // Sibling links
} __attribute__((aligned(8)));
```

**Key Files:**
- [`src/obj.h`](file:///d:/test/stellarium-web-engine-master/src/obj.h) - Object system interface
- [`src/obj.c`](file:///d:/test/stellarium-web-engine-master/src/obj.c) - Object system implementation

### Class Definition

Classes are defined using `obj_klass_t`:

```c
struct obj_klass {
    const char *id;              // Class name
    const char *model;           // Model name for data server
    size_t size;                 // Instance size
    uint32_t flags;              // OBJ_MODULE, OBJ_LISTABLE, etc.
    
    // Lifecycle methods
    int (*init)(obj_t *obj, json_value *args);
    void (*del)(obj_t *obj);
    
    // Sky object methods
    int (*get_info)(const obj_t *obj, const observer_t *obs, 
                    int info, void *out);
    int (*render)(obj_t *obj, const painter_t *painter);
    int (*post_render)(obj_t *obj, const painter_t *painter);
    
    // Module methods
    int (*update)(obj_t *module, double dt);
    int (*on_mouse)(obj_t *obj, int id, int state, 
                    double x, double y, int buttons);
    
    // Data methods
    void (*get_designations)(const obj_t *obj, void *user,
                             int (*f)(const obj_t *obj, void *user,
                                      const char *cat, const char *str));
    json_value *(*get_json_data)(const obj_t *obj);
    
    // Listing
    int (*list)(const obj_t *obj, double max_mag,
                uint64_t hint, const char *source, void *user,
                int (*f)(void *user, obj_t *obj));
    
    // Attributes
    attribute_t *attributes;
    
    // Ordering
    double render_order;
    double create_order;
};
```

### Inheritance Pattern

To create a derived class:

```c
typedef struct my_object {
    obj_t obj;  // MUST be first field
    // ... additional fields
    double my_data;
    int my_count;
} my_object_t;
```

This allows safe casting:
```c
obj_t *base = (obj_t*)my_obj;
my_object_t *derived = (my_object_t*)base;  // Safe if type matches
```

### Object Creation

**Method 1: Using obj_create**
```c
obj_t *obj = obj_create("stars", NULL);
```

**Method 2: Direct allocation (for modules)**
```c
static int stars_init(obj_t *obj, json_value *args) {
    stars_t *stars = (stars_t*)obj;
    // Initialize stars-specific data
    return 0;
}

static obj_klass_t stars_klass = {
    .id = "stars",
    .size = sizeof(stars_t),
    .flags = OBJ_MODULE | OBJ_LISTABLE,
    .init = stars_init,
    .render = stars_render,
    .update = stars_update,
    // ...
};

MODULE_REGISTER(stars_klass)
```

### Reference Counting

Objects use automatic reference counting:

```c
// Increment reference
obj_t *retained = obj_retain(obj);

// Decrement reference (deletes if count reaches 0)
obj_release(obj);
```

**Parent-Child Relationships:**
- Children are automatically retained by parent
- Children are released when parent is deleted
- Orphan objects must be manually released

### Attribute System

Attributes provide JavaScript-accessible properties and methods.

**Defining Attributes:**
```c
static attribute_t stars_attributes[] = {
    PROPERTY("visible", TYPE_BOOL, MEMBER(stars_t, visible)),
    PROPERTY("hints_mag_offset", TYPE_FLOAT, 
             MEMBER(stars_t, hints_mag_offset)),
    FUNCTION("list_sky_objects", .fn = stars_list),
    {}  // NULL terminator
};

static obj_klass_t stars_klass = {
    // ...
    .attributes = stars_attributes,
};
```

**Accessing Attributes:**
```c
// Get attribute
bool visible;
obj_get_attr(obj, "visible", &visible);

// Set attribute
obj_set_attr(obj, "visible", true);
```

**From JavaScript:**
```javascript
const visible = stel.stars.visible
stel.stars.visible = false
```

## Module Architecture

Modules are special objects that represent major subsystems (stars, planets, atmosphere, etc.).

### Module Registration

Modules are automatically registered at startup using GCC constructor attributes:

```c
MODULE_REGISTER(stars_klass)

// Expands to:
static void obj_register_stars_klass_(void) __attribute__((constructor));
static void obj_register_stars_klass_(void) { 
    obj_register_(&stars_klass); 
}
```

### Module Lifecycle

1. **Registration** - Constructor runs before `main()`
2. **Creation** - Modules created in `create_order`
3. **Initialization** - `init()` method called
4. **Update Loop** - `update()` called each frame
5. **Rendering** - `render()` called in `render_order`
6. **Cleanup** - `del()` called on shutdown

### Core Modules

| Module | File | Purpose |
|--------|------|---------|
| **stars** | [`stars.c`](file:///d:/test/stellarium-web-engine-master/src/modules/stars.c) | Render stars from HIP catalog using hierarchical tiles |
| **planets** | [`planets.c`](file:///d:/test/stellarium-web-engine-master/src/modules/planets.c) | Solar system bodies with ERFA ephemeris |
| **dso** | [`dso.c`](file:///d:/test/stellarium-web-engine-master/src/modules/dso.c) | Deep sky objects from EPH files |
| **satellites** | [`satellites.c`](file:///d:/test/stellarium-web-engine-master/src/modules/satellites.c) | Artificial satellites using SGP4 propagator |
| **constellations** | [`constellations.c`](file:///d:/test/stellarium-web-engine-master/src/modules/constellations.c) | Constellation lines, boundaries, and artwork |
| **atmosphere** | [`atmosphere.c`](file:///d:/test/stellarium-web-engine-master/src/modules/atmosphere.c) | Atmospheric scattering (Preetham model) |
| **milkyway** | [`milkyway.c`](file:///d:/test/stellarium-web-engine-master/src/modules/milkyway.c) | Milky Way texture rendering |
| **landscape** | [`landscape.c`](file:///d:/test/stellarium-web-engine-master/src/modules/landscape.c) | Ground and horizon rendering |
| **lines** | [`lines.c`](file:///d:/test/stellarium-web-engine-master/src/modules/lines.c) | Equatorial/azimuthal grids |
| **labels** | [`labels.c`](file:///d:/test/stellarium-web-engine-master/src/modules/labels.c) | Label management and collision avoidance |

### Module Example: Stars

**Structure:**
```c
typedef struct stars {
    obj_t obj;
    bool visible;
    double hints_mag_offset;
    fader_t visible_fader;
    hips_t *hips;  // HiPS survey for star tiles
    // ... more fields
} stars_t;
```

**Update Method:**
```c
static int stars_update(obj_t *obj, double dt) {
    stars_t *stars = (stars_t*)obj;
    fader_update(&stars->visible_fader, dt);
    return 0;
}
```

**Render Method:**
```c
static int stars_render(obj_t *obj, const painter_t *painter) {
    stars_t *stars = (stars_t*)obj;
    if (!stars->visible) return 0;
    
    // Render HiPS tiles containing stars
    hips_render(stars->hips, painter, stars_render_tile, stars);
    return 0;
}
```

## Core System

The core system ([`core.c`](file:///d:/test/stellarium-web-engine-master/src/core.c)) manages global state and coordinates all modules.

### Core Structure

```c
struct core {
    obj_t obj;
    observer_t *observer;      // Observer position and time
    double fov;                // Field of view (radians)
    
    // Rendering
    renderer_t *rend;
    int proj;                  // Projection type
    double win_size[2];
    double win_pixels_scale;
    
    // Selection
    obj_t *selection;
    
    // Time
    double clock;              // Real time clock (Unix time)
    double time_speed;         // Time multiplier
    
    // Visual parameters
    double star_linear_scale;
    double star_scale_screen_factor;
    int bortle_index;          // Light pollution (1-9)
    double display_limit_mag;
    
    // Tonemapping
    tonemapper_t tonemapper;
    double lwmax;              // Max luminance
    double lwsky_average;
    
    // Telescope
    telescope_t telescope;
    bool telescope_auto;
    
    // Input
    struct {
        struct {
            int id;
            double pos[2];
            bool down[2];
        } touches[2];
        bool keys[512];
        uint32_t chars[16];
    } inputs;
    
    // Animation
    struct {
        obj_t *lock;           // Locked object
        double src_q[4];       // Source quaternion
        double dst_q[4];       // Destination quaternion
        double src_time;
        double dst_time;
    } target;
    
    struct {
        double src_fov;
        double dst_fov;
        double src_time;
        double dst_time;
    } fov_animation;
    
    // Tasks
    task_t *tasks;
};
```

### Core Initialization

```c
void core_init(double win_w, double win_h, double pixel_scale) {
    core = (core_t*)obj_create("core", NULL);
    core->win_size[0] = win_w;
    core->win_size[1] = win_h;
    core->win_pixels_scale = pixel_scale;
    
    // Create observer
    core->observer = (observer_t*)obj_create("observer", NULL);
    
    // Initialize renderer
    core->rend = renderer_create();
    
    // Create all modules (in create_order)
    // ...
}
```

### Update Loop

```c
int core_update(void) {
    // Update real-time clock
    core->clock = sys_get_unix_time();
    
    // Run tasks
    task_t *task, *tmp;
    DL_FOREACH_SAFE(core->tasks, task, tmp) {
        if (task->fun(task, 0) != 0) {
            DL_DELETE(core->tasks, task);
            free(task);
        }
    }
    
    // Update observer time
    if (core->time_speed != 0) {
        double dt = core->time_speed * core->fps.dt;
        observer_update(core->observer, dt);
    }
    
    // Update animations
    update_fov_animation(core);
    update_target_animation(core);
    
    // Update all modules
    obj_t *module;
    DL_FOREACH(core->obj.children, module) {
        if (module->klass->update) {
            module->klass->update(module, core->fps.dt);
        }
    }
    
    return 0;
}
```

### Rendering Loop

```c
int core_render(double win_w, double win_h, double pixel_scale) {
    painter_t painter = {};
    
    // Setup painter
    paint_prepare(&painter, win_w, win_h, pixel_scale);
    painter.obs = core->observer;
    painter.rend = core->rend;
    
    // Get projection
    core_get_proj(&painter.proj);
    
    // Update clipping info
    painter_update_clip_info(&painter);
    
    // Render modules in render_order
    obj_t *module;
    DL_FOREACH(core->obj.children, module) {
        if (module->klass->render) {
            module->klass->render(module, &painter);
        }
    }
    
    // Post-render (UI elements)
    DL_FOREACH(core->obj.children, module) {
        if (module->klass->post_render) {
            module->klass->post_render(module, &painter);
        }
    }
    
    paint_finish(&painter);
    return 0;
}
```

## Rendering Pipeline

The rendering system uses a painter abstraction over OpenGL/WebGL.

### Painter Structure

```c
struct painter {
    renderer_t *rend;
    const observer_t *obs;
    const projection_t *proj;
    
    double color[4];           // Global color
    int fb_size[2];            // Framebuffer size
    double pixel_scale;
    int flags;                 // PAINTER_ADD, PAINTER_HIDE_BELOW_HORIZON, etc.
    
    double stars_limit_mag;
    double hints_limit_mag;
    double hard_limit_mag;
    
    // Textures
    struct {
        int type;
        texture_t *tex;
        double mat[3][3];
    } textures[2];
    
    // Clipping info per frame
    struct {
        double bounding_cap[4];
        double viewport_caps[4][4];
        int nb_viewport_caps;
        double sky_cap[4];
    } clip_info[FRAMES_NB];
    
    // Shader-specific data
    union {
        struct {  // Planet rendering
            double (*sun)[4];
            double (*light_emit)[3];
            int shadow_spheres_nb;
            double (*shadow_spheres)[4];
            texture_t *shadow_color_tex;
            float scale;
            float min_brightness;
        } planet;
        
        struct {  // Atmosphere rendering
            float p[12];  // Preetham model parameters
            float sun[3];
            float (*compute_lum)(void *user, const float pos[3]);
            void *user;
        } atm;
        
        struct {  // Line rendering
            float width;
            float glow;
            float dash_length;
            float dash_ratio;
            float fade_dist_min;
            float fade_dist_max;
        } lines;
    };
};
```

### Rendering Primitives

**Points:**
```c
int paint_2d_points(const painter_t *painter, int n, const point_t *points);
int paint_3d_points(const painter_t *painter, int n, const point_3d_t *points);
```

**Quads:**
```c
int paint_quad(const painter_t *painter,
               int frame,
               const uv_map_t *map,
               int grid_size);
```

**Lines:**
```c
int paint_line(const painter_t *painter,
               int frame,
               const double line[2][4],
               const uv_map_t *map,
               int split, int flags);
```

**Text:**
```c
int paint_text(const painter_t *painter,
               const char *text,
               const double win_pos[2],
               const double view_pos[3],
               int align, int effects,
               double size, double angle);
```

### Projection System

Projections transform 3D sphere coordinates to 2D screen coordinates.

**Projection Interface:**
```c
typedef struct projection {
    int type;  // PROJ_PERSPECTIVE, PROJ_STEREOGRAPHIC, etc.
    
    // Project 3D to screen
    bool (*project)(const projection_t *proj, int flags,
                    int out_dim, const double *v, double *out);
    
    // Check for discontinuities
    int (*intersect_discontinuity)(const projection_t *proj,
                                    double (*p)[3], int n);
    
    // Split projection at discontinuity
    void (*split)(const projection_t *proj, double k,
                  projection_t *out1, projection_t *out2);
    
    // Projection-specific data
    union {
        struct { double fov; } perspective;
        struct { double max_fov; } stereographic;
        // ...
    };
} projection_t;
```

**Supported Projections:**
- **Perspective** - Standard perspective projection
- **Stereographic** - Conformal projection
- **Mercator** - Cylindrical projection
- **Toast** - HiPS tile projection
- **Healpix** - Hierarchical Equal Area isoLatitude Pixelization

### Quad Rendering

Quads are rendered by mapping UV coordinates to 3D sphere positions:

```
UV Space (0-1) → Projection⁻¹ → 3D Sphere → Frames → View Space → Projection → Screen
```

**Example:**
```c
// Define UV mapping (e.g., Healpix tile)
uv_map_t map;
uv_map_init_healpix(&map, order, pix, true);

// Render quad
paint_quad(painter, FRAME_ICRF, &map, 32);
```

The `grid_size` parameter controls tessellation for curved projections.

### Clipping and Culling

**Fast Clipping Tests:**
```c
// Check if point is clipped
bool clipped = painter_is_point_clipped_fast(painter, frame, pos, true);

// Check if cap is clipped
bool clipped = painter_is_cap_clipped(painter, frame, cap);

// Check if HiPS tile is clipped
bool clipped = painter_is_healpix_clipped(painter, frame, order, pix);
```

**Clipping Caps:**
- **Bounding cap** - Encloses entire viewport
- **Viewport caps** - Four caps for viewport sides
- **Sky cap** - Separates above/below horizon

## Astronomical Calculations

The engine uses the ERFA library (Essential Routines for Fundamental Astronomy) for accurate calculations.

### ERFA Integration

**Key Files:**
- [`ext_src/erfa/`](file:///d:/test/stellarium-web-engine-master/ext_src/erfa/) - ERFA library source
- [`src/algos/`](file:///d:/test/stellarium-web-engine-master/src/algos/) - Additional algorithms

**ERFA Functions Used:**
- `eraEpv00` - Earth position/velocity
- `eraPlan94` - Planet positions
- `eraAtco13` - Coordinate transformations
- `eraAtic13` - Inverse transformations
- `eraRefco` - Refraction coefficients

### Observer

The observer ([`observer.c`](file:///d:/test/stellarium-web-engine-master/src/observer.c)) represents the viewing position and time.

```c
typedef struct observer {
    obj_t obj;
    
    // Position
    double elong;      // Longitude (radians)
    double phi;        // Latitude (radians)
    double hm;         // Height above sea level (meters)
    
    // Time
    double tt;         // Terrestrial Time (MJD)
    double ut1;        // UT1 (MJD)
    
    // Orientation
    double yaw;        // Rotation around vertical
    double pitch;      // Rotation around horizontal
    double roll;       // Rotation around view direction
    
    // Computed values
    double astrom;     // ERFA astrometry context
    double earth_pvh[2][3];  // Earth position/velocity (heliocentric)
    double earth_pvb[2][3];  // Earth position/velocity (barycentric)
    double sun_pvb[2][3];    // Sun position/velocity (barycentric)
    
    // Refraction
    bool refraction;
    double refa, refb; // Refraction coefficients
} observer_t;
```

**Update Observer:**
```c
void observer_update(observer_t *obs, bool fast) {
    // Compute Earth position
    eraEpv00(obs->tt, obs->ut1, obs->earth_pvh, obs->earth_pvb);
    
    // Compute refraction coefficients
    if (obs->refraction) {
        eraRefco(obs->pressure, obs->temperature, obs->humidity,
                 obs->wavelength, obs->phi, obs->hm,
                 &obs->refa, &obs->refb);
    }
    
    // Update astrometry context
    eraApco13(obs->tt, obs->ut1, obs->elong, obs->phi, obs->hm,
              0, 0, 0, 0, &obs->astrom, &obs->eo);
}
```

### Coordinate Frames

The engine uses multiple reference frames ([`frames.c`](file:///d:/test/stellarium-web-engine-master/src/frames.c)):

```c
enum {
    FRAME_ICRF,        // International Celestial Reference Frame (J2000)
    FRAME_OBSERVED,    // Observed coordinates (with aberration)
    FRAME_CIRS,        // Celestial Intermediate Reference System
    FRAME_VIEW,        // View coordinates (camera space)
    FRAME_MOUNT_ALTAZ, // Alt-azimuth mount
    FRAME_MOUNT_EQU,   // Equatorial mount
    FRAMES_NB
};
```

**Frame Conversions:**
```c
void convert_frame(const observer_t *obs,
                   int src_frame, int dst_frame,
                   bool at_inf,
                   const double src[3],
                   double dst[3]);
```

**Example:**
```c
double icrf_pos[3] = {1, 0, 0};
double view_pos[3];
convert_frame(obs, FRAME_ICRF, FRAME_VIEW, true, icrf_pos, view_pos);
```

### Satellite Propagation

Satellites use the SGP4 propagator ([`sgp4.cpp`](file:///d:/test/stellarium-web-engine-master/src/sgp4.cpp)):

```c
// Initialize SGP4 from TLE
sgp4_elsetrec satrec;
sgp4_twoline2rv(line1, line2, &satrec);

// Propagate to time
double tsince = (mjd - satrec.jdsatepoch) * 1440.0;  // minutes
double pos[3], vel[3];
sgp4(satrec, tsince, pos, vel);
```

## Data Management

### Asset System

All data files are compiled into the WebAssembly binary.

**Asset Compilation:**
```bash
python tools/make-assets.py
```

This generates [`src/assets/assets.inl`](file:///d:/test/stellarium-web-engine-master/src/assets/assets.inl) containing embedded data.

**Loading Assets:**
```c
const void *data;
int size, code;
asset_get_data("asset://stars/hip.dat", &size, &code);
```

**Asset URLs:**
- `asset://` - Embedded assets
- `http://` - Remote HTTP
- `file://` - Local files (desktop only)

### HiPS Surveys

HiPS (Hierarchical Progressive Surveys) provide multi-resolution sky imagery.

**HiPS Structure:**
```
hips/
├── Norder0/
│   └── Dir0/
│       └── Npix*.webp
├── Norder1/
│   └── Dir0/
│       └── Npix*.webp
└── properties
```

**Loading HiPS:**
```c
hips_t *hips = hips_create("http://example.com/hips", 0, NULL);
```

**Rendering HiPS:**
```c
int hips_render(hips_t *hips, const painter_t *painter,
                hips_render_callback_t callback, void *user);
```

### Data Formats

**Stars:**
- HIP catalog embedded in [`src/hip.inl`](file:///d:/test/stellarium-web-engine-master/src/hip.inl)
- Additional stars in HiPS tiles

**DSOs:**
- EPH binary format (custom)
- Extracted to JSON/CSV for processing

**Satellites:**
- TLE format (Two-Line Elements)
- Converted to JSONL
- Compressed to `.dat` format

## Memory Management

### Reference Counting

Objects use reference counting for automatic memory management:

```c
// Create object (ref = 1)
obj_t *obj = obj_create("stars", NULL);

// Retain (ref = 2)
obj_retain(obj);

// Release (ref = 1)
obj_release(obj);

// Release (ref = 0, object deleted)
obj_release(obj);
```

### Parent-Child Ownership

- Parent retains all children
- Children released when parent deleted
- Orphan objects must be manually released

### Memory Pools

Some modules use memory pools for frequently allocated objects:

```c
// Example from stars module
typedef struct star_pool {
    star_t *stars;
    int capacity;
    int count;
} star_pool_t;
```

### WebAssembly Memory

- **Initial memory**: 16MB
- **Growth**: Automatic (`ALLOW_MEMORY_GROWTH=1`)
- **Maximum**: Limited by browser (typically 2GB)

**Memory Allocation:**
```c
void *ptr = malloc(size);  // Uses Emscripten's malloc
free(ptr);
```

---

**Next Steps:**
- See [API Reference](API_REFERENCE.md) for public interfaces
- Check [Frontend Guide](FRONTEND_GUIDE.md) for JavaScript integration
- Read [Data Formats](DATA_FORMATS.md) for data processing
