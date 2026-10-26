# Cartoon leopard gecko artwork

Created 26 October 2026 using the **built-in image generation tool**, then exported as transparent WebP assets for the website. The previous whole-body SVG illustrations and their screenshots are replaced in the current source. All 12 images together are approximately 1 MB. Raster appearance generation is separate from the genetics engine.

## Saved assets

`public/illustrations/` contains `normal.webp`, `snow.webp`, `super.webp`, `albino.webp`, `tangerine.webp`, `hypo.webp`, `melanistic.webp`, `blizzard.webp`, `pied.webp`, `super-pied.webp`, `stripe.webp`, and `jungle.webp`.

Every cutout has real transparency, a consistent three-quarter pose, a broad rounded head, visible eyelids, four short clawed legs, and a thick segmented tail. These are cartoons, not photographs of predicted hatchlings or reliable morph identification tests.

## Generation prompt

Use case: stylized-concept. Asset type: original website character illustration, transparent PNG cutout. Primary request: one immediately recognizable, charming cartoon leopard gecko (Eublepharis macularius), full body, in a relaxed natural standing pose, three-quarter side view looking toward the left. A polished editorial cartoon with clean dark brown contours, soft flat shading and a little tactile texture, friendly and expressive yet zoologically recognizable. Species features: broad rounded triangular blunt head, prominent gentle eyelids, large golden eye with a vertical slit pupil, small ear opening, plump low-slung torso, four short sturdy legs with small clawed toes without adhesive pads, and a conspicuously thick segmented fat-storage tail tapering to a softly curved tip. Warm golden-yellow body with irregular solid chocolate-brown leopard spots, a pale ivory belly, and a thick cream-and-brown banded tail. Slightly larger head for cartoon appeal, subtle natural smile. Horizontal composition, whole tail and all feet visible, clear margin around the animal, 3:2 canvas. Transparent background, no scenery, floor, props, frame, text, labels or watermark. Avoid a flat top-down lizard diagram, thin tail, insect-like legs, six limbs, frog toes, crested-gecko toe pads, horns, spikes, dragon features, photography, human teeth, detached spots or disconnected body parts.

## Variant prompt set

Each variant used the generated normal character as an edit target, with these invariant instructions: preserve anatomy, expression, eye position, four clawed legs, broad head, thick tapering tail, three-quarter left-facing pose, complete full-body framing, image proportions, outlined cartoon style and transparency. No added objects, text, limbs or background.

| Asset            | Required change in the edit prompt                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snow             | Pale ivory/cool cream body, some soft yellow, dark spots, cream/grey banded tail; golden slit eye.                                                             |
| Super Snow       | Ivory/white body with many small charcoal spots and a banded tail. Solid-eye appearance is applied by the separate eye renderer.                               |
| Albino           | Pale buttery cream/peach skin, cinnamon/pinkish-tan markings in place of dark spots, cream/cinnamon tail, copper eye.                                          |
| Tangerine        | Rich apricot/orange and golden body, dark spots, cream/brown tail with warmer base.                                                                            |
| Super Hypo       | Remove all dark torso and leg spots; retain head spots and banded tail. This is a pattern change, not spot recoloring.                                         |
| Melanistic       | Dark charcoal/brown skin, subtle darker markings and lighter slate belly; golden slit eye.                                                                     |
| Blizzard         | Remove every head/body spot and every tail band; pale ivory with a lavender blush.                                                                             |
| Pied             | Sharp irregular opaque white muzzle, neck, foot, flank and tail areas; no spots inside the white areas.                                                        |
| Super Pied guide | More extensive high-white unmarked areas, leaving disconnected islands of colored spotted skin. “Super” here is a trade description, not a modeled homozygote. |
| Bold Stripe      | Replace scattered dorsal spots with two long dark stripes along the back.                                                                                      |
| Jungle           | Replace regular spotting with asymmetric broken saddles, branching blotches and interrupted bands.                                                             |

## Independent feature mapping

- **Visible genotypes:** `appearanceFromGenotypes` reads allele counts directly. Recessive hets and possible hets cannot change the illustration. Outcome titles are never used to infer visible traits.
- **Eyes:** Eclipse produces the solid-eye guide; an albino/Eclipse combination uses red rather than black. Super Snow has its own solid-eye guide. Snake Eye has partial solid pigmentation; Marble Eye and NDBE use distinct marbling; Blue Amber Eye modifies the iris rather than the body. Eye overlays are clipped to the iris region and retain the outer eyelid.
- **Patterns:** Pied, high-white pied, stripes, jungle, reduced body spotting and full patternlessness select different artwork files. They do not share a single drawing with a palette change. Patternless recessives clear spots/tail bands while preserving any separately expressed eye trait.
- **Local features:** Baldy/white-face and carrot-tail descriptions use localized head/tail layers. They do not create Mendelian loci or expression percentages.
- **Color:** Color palettes are chosen separately. Warm-region tinting preserves light pied regions. A generic trade label with no verified appearance receives an explicit general-species-guide description.
- **Limits:** Eye expression, patch placement, spotting, intensity, age-related changes and interacting traits vary in real animals. An overlay or asset is a visual explanation, never a clinical or exact offspring prediction. Unknown line-bred expression is not assigned to a predicted hatchling merely because a parent has that ancestry.
