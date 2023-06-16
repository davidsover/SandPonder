<img align="right" height="100" src="Media/Images/favicon.png">

# SandPonder
SandPonder is a fork of SandPond [SandPond Link](https://github.com/TodePond/SandPond) [Support SandPond](https://patreon.com/TodePond).<br>

SandPonder is an almost 1 to 1 copy of SandPond, except for a few changes which makes it a 1.1 to 1 copy.

## Changes
SandPonder introduces a save and load mechanic, that allows you to save geometry of the terrain, it doesn't save the element types so it uses the active one.

It also makes you able to download what you made as a .obj file, that you can later use in a 3D software such as Blender.
	Note: Half of the normals are rotated the wrong way, to fix this: 
		-Import it into Blender (File > Import > Wavefront (.obj))
		-Go to Edit mode (Tab key)
		-Select every vertex (A key)
		-Recalculate Normals (Shift + N) (You should see all the faces being blue when you toggle the Face Orientation in the Viewport Overlays tab (that arrow next to that double circle button in the top right))
	
	Also note: If you want to make your object smoother:
		-Go to the Modifier Properties tab on the right (wrench icon)
		-Add the LaplacianSmooth modifier to it (Add Modifier > Deform > Smooth Laplacian)
		-Turn up the Repeat to 200 and the Lambda Factor to about 0.02 - 0.1 depending on how smooth you want it (you can see the changes by going back to Object Mode by pressing tab again)
		(I recommend applying to modifier once you're satisfied to increase preformance (click the arrow above the modifier and press Apply while you're in Object Mode))
		
		-To make it even smoother, you can click on the Sculpting tab up top and select the Smooth brush on the right (or by pressing Shift+S)
		-(You should probably reduce the strenght to about 0.3 or lower, and increase the radius to whatever you'd like, I chose 220 px but this depends on how zoomed in you are) (You can find these sliders up top)
		-((Side note for new Blender users: you can move around by holding down Shift and the Middle Mouse Button and dragging the mouse, and you can rotate your view by doing the same thing without holding down shift))
		
		-If you notice some holes due to the modifier, you can merge the vertices by going back to Edit Mode (back in the Layout tab)
		-Select every vertex (A key)
		-Merge by distance (M > By Distance)
		-And turn the Merge Distance up to like 0.5 m or maybe a little less than that
		-Additionally, you can even turn the Merge Distance up to 1 m, which will reduce the amount of polygons but it will probably make it look better if you're fine with that
## Smaller changes

SandPonder removed light mode, you can't ponder while you're being flashed.