# GBA Cartridge RePCB (AGB-E05-01)

The most accurate reproduction of the AGB-E05-01 Game Boy Advance Cartridge PCB, without any restrictions.

The problem with the currently available reproduction PCBs of the AGB-E05-01 is:

- Inaccurate trace layout
- Inaccurate copper pours
- Inaccurate silkscreen (text re-made from simple image scan)
- Inaccurate board edge pins (solder resist)
- Authors claim to own Nintendo's IP and shames anyone using them (yes, even has a Hall of Shame... Lame)

To solve this, I spent a weekend remaking the PCB professionally, and not claiming rights to anything. This is fully open-source in the real meaning of the world.

- Highly accurate traces, copper pours, masks and silkscreens
- Overlaying the original PCB you cannot tell a difference in any aspect, so a perfect replacement
- No need read the license before downloading
- Do what you want with these files
- Make a living selling them, without any links, credits or pats on the back, without fear of being shamed

## How I Made It

The first step was to either strip down a copy of Emerald to scan in or use an open-source accurate scan already out there. I chose to use an accurate scan from https://archive.org/

Next up was to retrace the entire PCB outline, traces, vias and copper pours to re-make the PCB in KiCad 8 so anyone can open the files without paying.

As the rules, trace shapes, copper pours and silkscreens were all non-standard, I chose to manually re-draw every single pad, trace and detail carefully, without a schematic, just purely PCB drawn.

The silkscreen I made a complete TTF font for, so I could just type the font into the Text areas, and be 100% accurate in every detail.

The copper pours I remade in Affinity Designer using the Pen tool, then importing the graphics into KiCad.

The traces and Vias I redrew directly in KiCad using freeform paths, fillets and other technics.

## The Results

The end result was a very accurate reproduction.

<img src="./Resources/GBA E05-01 (Front).jpg" />
<img src="./Resources/AGB-E05-01 (Front) Preview.png" />
<img src="./Resources/GBA E05-01 (Back).jpg" />
<img src="./Resources/AGB-E05-01 (Back) Preview.png" />

## PCB Specification

The PCB should be 0.8mm thick.

Finish can be 1oz ENIG, however it is better if you ask for Hard Gold (used when there are gold edge connectors to make them more durable).

The solder resist should be PANTONE 556 C if possible (that will give close to original green color). If not choose any color solder resist you want.

Silkscreen is white.

## Ordering

You can download the Gerber directly and produce them wherever you like.

You can also order from:

- RetroSix [GBA Cartridge RePCB (AGB-E05-01) Reproduction (retrosix.co.uk)](https://retrosix.co.uk/GBA-Cartridge-RePCB-AGB-E05-01-Reproduction-p702693147)
- PCBWay [GBA Cartridge (AGB-E05-01) - Share Project - PCBWay](https://www.pcbway.com/project/shareproject/GBA_Cartridge_AGB_E05_01_d718e3bc.html)
- OSHPark [OSH Park ~ GBA Cartridge RePCB (AGB-E05-01)](https://oshpark.com/projects/IEm8bLtb/view_design)

Feel free to make and sell them yourself too. Happy repairing :D 

## BOM

| **Designator** |                           **Part**                           |
| :------------: | :----------------------------------------------------------: |
|  C1,C2,C3,C4   |              4x 100nF Ceramic Capacitor (0402)               |
|       C5       |           1x 4pF or 10pF Ceramic Capacitor (0402)            |
|    R1,R2,R3    |                          Do Not Fit                          |
|    R4,R5,R9    |                   10k Film Resistor (0402)                   |
|     R6,R7      |                  100k Film Resistor (0402)                   |
|       R8       |                   1k Film Resistor (0402)                    |
|      R10       | 2k Film Resistor (0603) / 1uF Ceramic Capacitor (0603) (seems to have no real purpose) |