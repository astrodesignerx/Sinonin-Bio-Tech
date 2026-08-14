/*
  Molecular geometry for the hero renderer.

  IMPORTANT: these coordinates are an idealised, stylised layout, not output
  from a conformer generator. Connectivity (which atom bonds to which, and bond
  order) is chemically correct and is the part that would read as wrong to a
  chemist; the exact bond lengths and angles are drawn for legibility at hero
  scale. Have Dr Cheison confirm before this ships, and adjust `ATOMS` here if
  the conformation needs to be truer.

  E2D: trans-4,5-epoxy-(E)-2-decenal, C10H16O2. The molecule that signals a
  fresh kill to a predator, and the subject of The Friday Conversation No. 2.
  Hydrogens are omitted, as is normal for a ball-and-stick at this scale.

    O1
    ‖
    C1 - C2 = C3 - C4 - C5 - C6 - C7 - C8 - C9 - C10
                        \   /
                         O2                (epoxide across C4-C5)
*/

export type Element = "C" | "O";

export type Atom = {
  /** Label used only for review and for the accessible description. */
  id: string;
  el: Element;
  x: number;
  y: number;
  z: number;
};

export type Bond = {
  a: number;
  b: number;
  /** 1 = single, 2 = double. Doubles render as a parallel pair. */
  order: 1 | 2;
};

/** Zig-zag chain in x/y; the epoxide oxygen sits out of plane in +z. */
export const E2D_ATOMS: Atom[] = [
  { id: "C1", el: "C", x: -3.9, y: 0.25, z: 0 },
  { id: "O1", el: "O", x: -4.65, y: 1.08, z: 0 },
  { id: "C2", el: "C", x: -3.0, y: -0.25, z: 0 },
  { id: "C3", el: "C", x: -2.1, y: 0.25, z: 0 },
  { id: "C4", el: "C", x: -1.2, y: -0.25, z: 0 },
  { id: "C5", el: "C", x: -0.3, y: 0.25, z: 0 },
  { id: "O2", el: "O", x: -0.75, y: 0.0, z: 0.85 },
  { id: "C6", el: "C", x: 0.6, y: -0.25, z: 0 },
  { id: "C7", el: "C", x: 1.5, y: 0.25, z: 0 },
  { id: "C8", el: "C", x: 2.4, y: -0.25, z: 0 },
  { id: "C9", el: "C", x: 3.3, y: 0.25, z: 0 },
  { id: "C10", el: "C", x: 4.2, y: -0.25, z: 0 },
];

export const E2D_BONDS: Bond[] = [
  { a: 0, b: 1, order: 2 }, // C1=O1  aldehyde
  { a: 0, b: 2, order: 1 },
  { a: 2, b: 3, order: 2 }, // C2=C3  trans alkene
  { a: 3, b: 4, order: 1 },
  { a: 4, b: 5, order: 1 }, // C4-C5  epoxide edge
  { a: 4, b: 6, order: 1 }, // C4-O2  epoxide
  { a: 5, b: 6, order: 1 }, // C5-O2  epoxide
  { a: 5, b: 7, order: 1 },
  { a: 7, b: 8, order: 1 },
  { a: 8, b: 9, order: 1 },
  { a: 9, b: 10, order: 1 },
  { a: 10, b: 11, order: 1 },
];

/** Radius and colour per element, in the site palette rather than CPK. */
export const ELEMENT_STYLE: Record<Element, { r: number; core: string; rim: string }> = {
  // Carbon reads as the structure itself, so it takes `ink`.
  C: { r: 0.34, core: "#2b3d5c", rim: "#0b1526" },
  // Oxygen is the reactive part of this molecule, so it takes `leaf` to draw
  // the eye to the aldehyde and the epoxide.
  O: { r: 0.38, core: "#2f9e5c", rim: "#0a5a2c" },
};
