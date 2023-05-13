;--------------------------------------------------------
; File Created by SDCC : free open source ISO C Compiler 
; Version 4.2.2 #13350 (MINGW64)
;--------------------------------------------------------
	.module main
	.optsdcc -msm83
	
;--------------------------------------------------------
; Public variables in this module
;--------------------------------------------------------
	.globl _main
	.globl _puts
	.globl _printf
	.globl _joypad
;--------------------------------------------------------
; special function registers
;--------------------------------------------------------
;--------------------------------------------------------
; ram data
;--------------------------------------------------------
	.area _DATA
;--------------------------------------------------------
; ram data
;--------------------------------------------------------
	.area _INITIALIZED
;--------------------------------------------------------
; absolute external ram data
;--------------------------------------------------------
	.area _DABS (ABS)
;--------------------------------------------------------
; global & static initialisations
;--------------------------------------------------------
	.area _HOME
	.area _GSINIT
	.area _GSFINAL
	.area _GSINIT
;--------------------------------------------------------
; Home
;--------------------------------------------------------
	.area _HOME
	.area _HOME
;--------------------------------------------------------
; code
;--------------------------------------------------------
	.area _CODE
;..\with-space\main.c:4: void main()
;	---------------------------------
; Function main
; ---------------------------------
_main::
;..\with-space\main.c:8: printf("Press any button...");
	ld	de, #___str_0
	push	de
	call	_printf
	pop	hl
;..\with-space\main.c:10: while (1)
00121$:
;..\with-space\main.c:12: mButtons = joypad();
	call	_joypad
	ld	c, a
;..\with-space\main.c:14: if (mButtons & J_A)
	bit	4, c
	jr	Z, 00102$
;..\with-space\main.c:15: printf("A ");
	push	bc
	ld	de, #___str_1
	push	de
	call	_printf
	pop	hl
	pop	bc
00102$:
;..\with-space\main.c:16: if (mButtons & J_B)
	bit	5, c
	jr	Z, 00104$
;..\with-space\main.c:17: printf("B ");
	push	bc
	ld	de, #___str_2
	push	de
	call	_printf
	pop	hl
	pop	bc
00104$:
;..\with-space\main.c:18: if (mButtons & J_UP)
	bit	2, c
	jr	Z, 00106$
;..\with-space\main.c:19: printf("U ");
	push	bc
	ld	de, #___str_3
	push	de
	call	_printf
	pop	hl
	pop	bc
00106$:
;..\with-space\main.c:20: if (mButtons & J_DOWN)
	bit	3, c
	jr	Z, 00108$
;..\with-space\main.c:21: printf("D ");
	push	bc
	ld	de, #___str_4
	push	de
	call	_printf
	pop	hl
	pop	bc
00108$:
;..\with-space\main.c:22: if (mButtons & J_LEFT)
	bit	1, c
	jr	Z, 00110$
;..\with-space\main.c:23: printf("L ");
	push	bc
	ld	de, #___str_5
	push	de
	call	_printf
	pop	hl
	pop	bc
00110$:
;..\with-space\main.c:24: if (mButtons & J_RIGHT)
	bit	0, c
	jr	Z, 00112$
;..\with-space\main.c:25: printf("R ");
	push	bc
	ld	de, #___str_6
	push	de
	call	_printf
	pop	hl
	pop	bc
00112$:
;..\with-space\main.c:26: if (mButtons & J_START)
	bit	7, c
	jr	Z, 00114$
;..\with-space\main.c:27: printf("+ ");
	push	bc
	ld	de, #___str_7
	push	de
	call	_printf
	pop	hl
	pop	bc
00114$:
;..\with-space\main.c:28: if (mButtons & J_SELECT)
	bit	6, c
	jr	Z, 00116$
;..\with-space\main.c:29: printf("- ");
	push	bc
	ld	de, #___str_8
	push	de
	call	_printf
	pop	hl
	pop	bc
00116$:
;..\with-space\main.c:31: printf("\n");
	push	bc
	ld	de, #___str_10
	call	_puts
	pop	bc
;..\with-space\main.c:33: while (mButtons == joypad());
00117$:
	call	_joypad
	ld	b, a
	ld	a, c
	sub	a, b
	jr	Z, 00117$
;..\with-space\main.c:35: }
	jp	00121$
___str_0:
	.ascii "Press any button..."
	.db 0x00
___str_1:
	.ascii "A "
	.db 0x00
___str_2:
	.ascii "B "
	.db 0x00
___str_3:
	.ascii "U "
	.db 0x00
___str_4:
	.ascii "D "
	.db 0x00
___str_5:
	.ascii "L "
	.db 0x00
___str_6:
	.ascii "R "
	.db 0x00
___str_7:
	.ascii "+ "
	.db 0x00
___str_8:
	.ascii "- "
	.db 0x00
___str_10:
	.db 0x00
	.area _CODE
	.area _INITIALIZER
	.area _CABS (ABS)
