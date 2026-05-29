# retrosix-resources glossary

This repo is a curated collection of retro gaming hardware designs, board scans, reference images, and associated documentation. It covers Game Boy, Game Boy Color, Game Boy Advance, Game Boy Advance SP, Game Gear, SNES, and PC Engine GT platforms.

## General

**RePCB**
A replica printed circuit board design intended to replace or modify an original retro gaming device's hardware. Stands for "replica PCB". Designs are created for repair, modification, or aesthetic purposes.
Avoid: replacement board, mod board, clone PCB.

**PCB**
Printed circuit board. The physical substrate that mechanically supports and electrically connects electronic components using conductive tracks, pads, and other features etched from copper sheets.
Avoid: circuit board, board.

**Schematic**
The electrical diagram of a circuit, showing components and their connections using standard symbols. In KiCad, schematics define the logical circuit design before layout.
Avoid: circuit diagram, wiring diagram, netlist.

**Layout**
The physical arrangement of components and copper traces on a PCB, as designed in a PCB editor. The layout determines the final physical dimensions and routing of the board.
Avoid: board layout, PCB design, routing.

**Board scan**
A high-resolution photograph of a physical PCB board (front or back), used as a reference for designing a replica or documenting hardware.
Avoid: photo, picture, board photo.

**Reference image**
A photograph or illustration of a retro gaming device, board, or component used as a visual guide during hardware design. Often included in board scan folders alongside front and back photos.
Avoid: photo, reference photo, picture.

## KiCad

**KiCad**
An open-source electronic design automation (EDA) suite for creating schematics and PCB layouts. This repo uses KiCad for all hardware designs.
Avoid: EDA tool, schematic tool, circuit design.

**Symbol**
The schematic representation of a component (resistor, capacitor, IC, etc.) with its pins and electrical properties. KiCad symbols are stored in library files (`.kicad_sym`).
Avoid: component symbol, schematic symbol, part.

**Footprint**
The physical pad layout on a PCB that a component occupies, defining how it is mounted and soldered. Each component symbol must be paired with a footprint.
Avoid: pad layout, mounting pattern, package.

**Library**
A KiCad file containing a collection of symbols and/or footprints for reusable components. The `KiCad/RetroSix Library` is a custom component library for retro gaming hardware parts.
Avoid: component library, parts list.

## Manufacturing

**Gerber**
A standard file format used to communicate PCB layer data to manufacturing facilities. Each Gerber file represents one layer of the PCB (copper, solder mask, silk screen, etc.). Files use extensions like `.GTL` (top copper), `.GBL` (bottom copper), `.GTS` (top solder mask).
Avoid: manufacturing file, PCB file, layer file.

**BOM**
Bill of Materials. A CSV file listing all components required to assemble a PCB, including part numbers, quantities, and values. Generated from the schematic during design.
Avoid: parts list, component list, material list.

**NC Drill**
Numerical control drill file. Specifies the location and size of all drilled holes in the PCB. Used by manufacturing equipment to drill vias and mounting holes. Files use extensions like `.TXT`, `.DRR`, `.LDP`.
Avoid: drill file, hole map, drill map.

**Assembly drawing**
A PDF document showing how components are placed and oriented on the assembled PCB. Used by manufacturers and builders to correctly populate the board.
Avoid: assembly guide, placement guide, build drawing.

**3D print**
A three-dimensional render of the PCB, useful for visualising the final assembled product or creating enclosures.
Avoid: 3D model, render, visualisation.

## Platform-specific

**Cartridge**
The physical game cartridge housing a Game Gear, Game Boy, or SNES game ROM. RePCB designs may replicate or modify the cartridge connector and PCB.

**PicoCIC**
A modification component for the SNES that replicates the original CIC (Chip ID Counter) authentication chip. Allows SNES games to be run on modified hardware or emulated setups.
Avoid: CIC chip, authentication chip, lockout chip.

**CIC**
Chip ID Counter. Nintendo's authentication chip used in the SNES and other consoles to prevent unauthorised cartridges from running. PicoCIC replicates this chip's behaviour for hardware modification purposes.
Avoid: lockout chip, security chip, authentication chip (in specific hardware contexts).

**GB RePCB**
The Game Boy replica PCB design. A KiCad project recreating the original Game Boy motherboard with potential modifications for repair or enhancement.
Avoid: Game Boy board, GB replica.

**AGB-E05-01**
The original hardware designation for the Game Boy Advance cartridge connector. The GBA Cartridge RePCB is a replica of this specific board.
Avoid: GBA board, GBA connector.

**OuterJob**
A KiCad manufacturing job file (`.OutJob`) that bundles multiple Gerber and drill files into a single manufacturing package.
Avoid: manufacturing job, gerber bundle, production file.
