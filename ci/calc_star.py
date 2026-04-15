import math

C = (100, 100)
R_out = 85
# For a classic 5-pointed star formed by lines intersecting:
# inner radius = R_out * (sin(18 deg) / sin(54 deg)) = R_out * 0.381966
R_in = R_out * 0.381966

def get_point(radius, angle_deg):
    a = math.radians(angle_deg)
    # Round to 1 decimal place
    x = round(C[0] + radius * math.cos(a), 1)
    y = round(C[1] + radius * math.sin(a), 1)
    return (x, y)

outer_angles = [-90, -18, 54, 126, 198]
inner_angles = [-54, 18, 90, 162, 234]

O = [get_point(R_out, a) for a in outer_angles]
I = [get_point(R_in, a) for a in inner_angles]

# Shards: C -> I_{k-1} -> O_k -> I_k -> C
# for k = 0, we use I_4 and I_0
print(f"O: {O}")
print(f"I: {I}")

for k in range(5):
    prev_i = (k - 1) % 5
    print(f"Shard {k+1}: d=\"M100 100 L{I[prev_i][0]} {I[prev_i][1]} L{O[k][0]} {O[k][1]} L{I[k][0]} {I[k][1]} Z\"")

# Spine lines from center to outer points
for k in range(5):
    print(f"Outer Spine {k+1}: <line class=\"ci-spine l-{k+1}a\" x1=\"100\" y1=\"100\" x2=\"{O[k][0]}\" y2=\"{O[k][1]}\" .../>")
for k in range(5):
    print(f"Inner Spine {k+1}: <line class=\"ci-spine l-{k+1}b\" x1=\"100\" y1=\"100\" x2=\"{I[k][0]}\" y2=\"{I[k][1]}\" .../>")

# Compute translate offsets for "exploded" puzzle form.
# A kite's centroid roughly indicates the direction to push it. 
# But let's just push it along the angle of its outer point (O[k]).
for k in range(5):
    push_dist = 12
    a = math.radians(outer_angles[k])
    tx = round(push_dist * math.cos(a), 1)
    ty = round(push_dist * math.sin(a), 1)
    print(f".ci-shard.s{k+1} {{ transform: translate({tx}px, {ty}px) scale(0.92); }}")
