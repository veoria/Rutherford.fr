# Blender 4.3: "the whole press" 3D guide for the console check, in the style of
# colorloop.ai zoom-1..4 (dark pressroom, charcoal rounded units, cyan screens,
# yellow floor lines, blue rim light). Camera at eye level (1.6 m) dollies back
# from the console until console + printing units fill the frame.
import bpy, math, sys, os
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1]
FRAMES = 62

bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
scn.render.engine = 'BLENDER_EEVEE_NEXT'
scn.render.resolution_x, scn.render.resolution_y = 600, 800
scn.render.fps = 24
scn.frame_start, scn.frame_end = 1, FRAMES
scn.render.image_settings.file_format = 'PNG'
scn.render.filepath = os.path.join(OUT, 'f_')
scn.view_settings.view_transform = 'AgX'
scn.view_settings.look = 'AgX - Base Contrast'
scn.eevee.taa_render_samples = 32
try:
    scn.eevee.use_shadows = True
except Exception:
    pass

# World: near black with a hint of navy
w = bpy.data.worlds.new('w'); scn.world = w; w.use_nodes = True
bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.004, 0.006, 0.012, 1); bg.inputs[1].default_value = 1.0

def mat(name, rgb, rough=0.55, metal=0.0, emit=None, strength=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*rgb, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    if emit:
        p.inputs['Emission Color'].default_value = (*emit, 1)
        p.inputs['Emission Strength'].default_value = strength
    return m

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

M = {
    'body': mat('body', srgb('#3a3f47'), 0.5),
    'dark': mat('dark', srgb('#1c1f24'), 0.6),
    'hood': mat('hood', srgb('#454b54'), 0.45),
    'glass': mat('glass', srgb('#5d7a86'), 0.15),
    'floor': mat('floor', srgb('#0c1018'), 0.85),
    'line': mat('line', srgb('#c99a12'), 0.5, emit=srgb('#c99a12'), strength=0.6),
    'paper': mat('paper', srgb('#f2f2f0'), 0.6),
    'cyan': mat('cyan', srgb('#4fb6e6'), 0.3, emit=srgb('#4fb6e6'), strength=1.2),
    'red': mat('red', srgb('#e01818'), 0.3, emit=srgb('#e01818'), strength=2.0),
    'green': mat('green', srgb('#2fbf4a'), 0.3, emit=srgb('#2fbf4a'), strength=2.0),
    'amber': mat('amber', srgb('#f29a12'), 0.3, emit=srgb('#f29a12'), strength=2.0),
    'sheet': mat('sheet', srgb('#2a3f8f'), 0.5),
    'screen': mat('screen', srgb('#f4f6f8'), 0.3, emit=srgb('#f4f6f8'), strength=1.6),
    'trim': mat('trim', srgb('#e8edf2'), 0.4),
    'lightbar': mat('lightbar', srgb('#ffffff'), 0.2, emit=srgb('#ffffff'), strength=6.0),
}

def box(name, loc, size, m, bevel=0.04):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.active_object; o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = o.modifiers.new('b', 'BEVEL'); b.width = bevel; b.segments = 3
    o.data.materials.append(M[m])
    bpy.ops.object.shade_smooth()
    return o

def cyl(name, loc, r, depth, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=32)
    o = bpy.context.active_object; o.name = name; o.data.materials.append(M[m])
    bpy.ops.object.shade_smooth()
    return o

# Floor and the yellow walkway lines (parallel to the press)
box('floor', (4, -4, -0.05), (60, 60, 0.1), 'floor', 0)
for y in (-2.05, -5.6):
    box('line', (4, y, 0.002), (30, 0.06, 0.004), 'line', 0)

# Press runs along +X, front face toward -Y. Feeder, 4 units, coater gap, delivery.
X0 = 0.0
# Feeder
box('feeder', (X0 - 1.55, 0, 0.75), (1.3, 1.9, 1.5), 'body')
box('feeder_hood', (X0 - 1.55, 0, 1.6), (1.35, 1.95, 0.22), 'hood', 0.08)
box('feeder_pile', (X0 - 1.55, -0.65, 0.42), (1.0, 0.9, 0.7), 'paper', 0.01)
# Printing units
UW = 1.15
for k in range(4):
    x = X0 + k * (UW + 0.1)
    box(f'unit{k}', (x, 0, 0.8), (UW, 1.9, 1.6), 'body')
    box(f'unit{k}_glass', (x, -0.951, 1.05), (UW - 0.18, 0.02, 0.32), 'glass', 0.01)
    cyl(f'unit{k}_roll_a', (x - 0.26, -0.15, 1.68), 0.2, 1.7, 'hood', (math.radians(90), 0, 0))
    cyl(f'unit{k}_roll_b', (x + 0.26, -0.15, 1.68), 0.2, 1.7, 'hood', (math.radians(90), 0, 0))
    box(f'unit{k}_scr', (x, -0.955, 0.62), (0.26, 0.02, 0.18), 'cyan', 0.01)
    box(f'unit{k}_btn', (x, -0.955, 0.42), (0.06, 0.02, 0.06), 'red', 0.005)
    box(f'unit{k}_edge', (x + UW / 2 + 0.05, -0.955, 0.8), (0.025, 0.02, 1.5), 'trim', 0)
# Walkway step along the front
box('step', (X0 + 1.9, -1.25, 0.18), (6.6, 0.45, 0.08), 'dark', 0.01)
for k in range(7):
    box(f'leg{k}', (X0 - 1.1 + k * 1.0, -1.25, 0.07), (0.05, 0.05, 0.14), 'dark', 0)
# Delivery: open frame with a white pile inside
DX = X0 + 4 * (UW + 0.1) + 0.55
box('del_top', (DX, 0, 1.55), (1.5, 1.95, 0.35), 'hood', 0.1)
box('del_l', (DX - 0.68, 0, 0.75), (0.14, 1.95, 1.5), 'body')
box('del_r', (DX + 0.68, 0, 0.75), (0.14, 1.95, 1.5), 'body')
box('del_base', (DX, 0, 0.12), (1.5, 1.95, 0.24), 'dark')
box('del_pile', (DX, -0.1, 0.5), (1.1, 1.3, 0.5), 'paper', 0.01)

# Console in front of the delivery, facing the operator (-Y)
CX, CY = DX + 0.9, -3.4
box('cons_base', (CX, CY, 0.45), (2.1, 0.9, 0.9), 'body', 0.05)
desk = box('cons_desk', (CX, CY - 0.05, 0.98), (2.2, 1.0, 0.1), 'dark', 0.02)

sheet = box('cons_sheet', (CX, CY - 0.05, 1.04), (1.7, 0.75, 0.01), 'sheet', 0)

for i in range(3):
    for j in range(2):
        s = box(f'mark{i}{j}', (CX - 0.55 + i * 0.55, CY - 0.2 + j * 0.3, 1.06), (0.32, 0.04, 0.005), 'trim', 0)
for i in range(16):
    box(f'key{i}', (CX - 0.9 + i * 0.12, CY - 0.53, 0.93), (0.07, 0.04, 0.03), 'amber', 0.005)
for sx in (-1.0, 1.0):
    box(f'post{sx}', (CX + sx, CY + 0.35, 1.45), (0.06, 0.06, 1.1), 'dark', 0)
box('canopy', (CX, CY + 0.05, 2.02), (2.3, 0.8, 0.08), 'hood', 0.03)
box('lightbar', (CX, CY - 0.1, 1.975), (2.0, 0.05, 0.02), 'lightbar', 0)
box('monitor', (CX, CY + 0.3, 1.55), (0.75, 0.04, 0.45), 'screen', 0.01)
for i, (m, wdt) in enumerate((('cyan', 0.55), ('red', 0.5), ('sheet', 0.58), ('amber', 0.45))):
    box(f'monline{i}', (CX - 0.02, CY + 0.275, 1.68 - i * 0.08), (wdt, 0.01, 0.025), m, 0)
for i, m in enumerate(('green', 'amber', 'red')):
    cyl(f'tower{i}', (CX - 0.8, CY + 0.32, 1.25 + i * 0.12), 0.05, 0.1, m)
box('measure_a', (CX + 0.55, CY + 0.15, 1.15), (0.28, 0.2, 0.14), 'paper', 0.03)
box('measure_b', (CX + 0.85, CY + 0.15, 1.15), (0.16, 0.2, 0.14), 'paper', 0.03)

# Lights: soft key from the front left, blue rim from the right, top fill
def area(name, loc, rot, size, energy, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.active_object; l.name = name
    l.data.size = size; l.data.energy = energy; l.data.color = color
    return l
area('key', (1, -7, 5), (math.radians(55), 0, math.radians(-20)), 6, 900, (1, 0.97, 0.92))
area('rim', (12, -2, 3), (math.radians(80), 0, math.radians(75)), 6, 1500, (0.35, 0.55, 1.0))
area('top', (4, 0, 6), (0, 0, 0), 10, 500, (0.85, 0.9, 1.0))

# Camera: eye level, dolly back from the console to the wide shot
bpy.ops.object.camera_add()
cam = bpy.context.active_object; scn.camera = cam
cam.data.lens = 24
cam.data.sensor_width = 36
tgt = bpy.data.objects.new('tgt', None); scn.collection.objects.link(tgt)
c = cam.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'

start_cam, end_cam = Vector((CX + 0.1, CY - 1.8, 1.6)), Vector((CX + 0.9, CY - 5.8, 1.6))
start_tgt, end_tgt = Vector((CX, CY + 0.1, 1.1)), Vector((X0 + 3.0, -0.6, 1.5))
def ease(t):
    return t * t * (3 - 2 * t)
HOLD = 10  # frames still at the end, like the other clips landing on their spot
for f in range(1, FRAMES + 1):
    t = ease(min(1.0, (f - 1) / (FRAMES - HOLD - 1)))
    cam.location = start_cam.lerp(end_cam, t); cam.keyframe_insert('location', frame=f)
    tgt.location = start_tgt.lerp(end_tgt, t); tgt.keyframe_insert('location', frame=f)

if 'test' in sys.argv:
    for f in (1, 30, FRAMES):
        scn.frame_set(f); scn.render.filepath = os.path.join(OUT, f't_{f:02d}.png'); bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
