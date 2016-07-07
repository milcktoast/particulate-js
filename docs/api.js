YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AngleConstraint",
        "AxisConstraint",
        "BoundingPlaneConstraint",
        "BoxConstraint",
        "Collection",
        "Constraint",
        "DirectionalForce",
        "DistanceConstraint",
        "Force",
        "Math",
        "ParticleSystem",
        "Particulate",
        "PlaneConstraint",
        "PointConstraint",
        "PointForce",
        "Vec3"
    ],
    "modules": [
        "constraints",
        "forces",
        "math",
        "systems",
        "utils"
    ],
    "allModules": [
        {
            "displayName": "constraints",
            "name": "constraints",
            "description": "Constraints define relationships between multiple particles or\nbetween particles and geometric primitives."
        },
        {
            "displayName": "forces",
            "name": "forces",
            "description": "Forces are accumulated and applied to particles, affecting their\nacceleration and velocity in the system's integration step."
        },
        {
            "displayName": "math",
            "name": "math"
        },
        {
            "displayName": "systems",
            "name": "systems"
        },
        {
            "displayName": "utils",
            "name": "utils"
        }
    ],
    "elements": []
} };
});