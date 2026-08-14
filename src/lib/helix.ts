/*
  Geometry for an ideal right-handed alpha helix, the cartoon every biochemist
  reads as "protein" on sight.

  Why a ribbon and not another ball-and-stick model: E2D on the Proteins card is
  twelve atoms. An enzyme is thousands. Drawing one in the same visual language
  would say they are the same kind of object at the same scale, which is the
  sort of claim a protein chemist notices immediately. Cartoon representation is
  what the field actually uses for macromolecules, so switching is the honest
  choice, and it stops the two cards reading as the same picture twice.

  The numbers below are the textbook ideal helix, not invented for the drawing:

    3.6 residues per turn
    1.5 A rise per residue, so a 5.4 A pitch
    2.3 A from the helix axis to the Ca backbone

  `ribbonWidth` is the only figure here that is a drawing decision rather than a
  measurement. A cartoon ribbon has no single physical width; it stands in for
  the peptide planes, which are about this wide, and it is set here so it can be
  corrected in one place.

  Isolated from the renderer so the geometry can be reviewed on its own.
*/
export const ALPHA_HELIX = {
  /** Residues per full turn. */
  residuesPerTurn: 3.6,
  /** Angstroms of advance along the axis per residue. */
  risePerResidue: 1.5,
  /** Angstroms from the axis out to the backbone. */
  radius: 2.3,
  /** Drawn width of the cartoon ribbon, in the same units. */
  ribbonWidth: 2.6,
  /** Length of the modelled run: 20 residues is a little over five turns. */
  residues: 20,
} as const;

/** Ribbon face, lit side through to the side turned away. */
export const HELIX_STYLE = {
  near: "#34a86a",
  far: "#0d3d24",
  /** Outline along the ribbon edges, for definition against a pale card. */
  edge: "#0a2a1a",
} as const;
