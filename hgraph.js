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
 */

var GraphDrawer = function(container){

	// Beállítások
	var Prefs = {
		item: {
			font: "bold 10px Arial",
			lineHeight: 12,
			maxTextLength: 100,
			padding: 5,
			margin: 5,
			height: 56,
			cornerRadius: 5,
		},
		column: {
			margin: 20
		},
		connection: {
			color: "rgba(0,0,0,0.1)",
			width: 1
		},
		container: {
			fitHeight: true
		},
		colors: {
			"normal":     "#478aa2",
			"completted": "#a34854",
			"canjoin":    "#79C900",
			"highlight":  "#FFFFFF",
			"hovered":    "#c43108"
		},
		canvas: {
			padding: 10
		}
	};

	// Hash kódoló és dekódoló
	var Base64Class = function(){
		var keyStr = "HZALONEUMBCDFGSv" +
	            	 "VQRTWXY0cdfIJrPt" +
	                 "szaloneu+g7hijkpq" +
	                 "wxyb123456m89/=" +
	                 "K";
	  	this.encode = function(input) {
	    	input = escape(input);
	    	var output = "";
	    	var chr1, chr2, chr3 = "";
	    	var enc1, enc2, enc3, enc4 = "";
	    	var i = 0;

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

	// Rajzolást végző osztály
	var Drawer = function(ctx){
		this.roundRect = function(startPoint, size, radius, offset) {
			if (typeof radius === "undefined") {
				radius = 5;
			}
			if(typeof offset == "undefined"){
				offset = 0;
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

		this.colorBrightness = function(color){
			if(color.length == 4){
				color = "#"+color[1]+color[1]+color[2]+color[2]+color[3]+color[3];
			}

			var r = parseInt(color.substr(1, 2), 16),
		        g = parseInt(color.substr(3, 2), 16),
	    	    b = parseInt(color.substr(5, 2), 16);
	    	return (0.2126*r) + (0.7152*g) + (0.0722*b);
		}

		this.drawConnection = function(startPoint, stopPoint, leveldiff){
			ctx.strokeStyle = Prefs.connection.color;
			ctx.lineWidth = Prefs.connection.width;
			ctx.beginPath();
			ctx.moveTo(
				startPoint.x,
				startPoint.y
			);

			if(leveldiff != 0){
				ctx.bezierCurveTo(
					startPoint.x + Math.abs((stopPoint.x - startPoint.x) / 2),
					startPoint.y,
					startPoint.x + Math.abs((stopPoint.x - startPoint.x) / 2),
					stopPoint.y,
					stopPoint.x,
					stopPoint.y
				);
			}else{
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

		this.measureText = function(text, fontStyle){
			ctx.font = fontStyle;
			return ctx.measureText(text).width;
		}

		this.hex2rgba = function(hex, opacity){
			if(hex[0] == "#"){
				hex = hex.substring(1,7);
			}

			if(hex.length == 3){
				hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
			}

			var red   = parseInt(hex.substring(0,2),16),
				green = parseInt(hex.substring(2,4),16),
				blue  = parseInt(hex.substring(4,6),16);
			return "rgba("+red+","+green+","+blue+","+opacity+")";
		}
	}

	// Elemek kezelése
	var ItemHandler = function(){
		var items       = new Array(),
			connections = new Array(),
			columns     = new Array(),
			base64      = new Base64Class();

		this.addItem = function(item){
			if(this.getItemById(item.id) != undefined){
				return;
			}

			var words = item.name.split(" "),
				text = new Array(),
				t_text = "";

			ctx.font = Prefs.item.font;

			for(var i = 0; i < words.length; i++){
				if(drawer.measureText(t_text + words[i]) <= Prefs.item.maxTextLength || i == 0){
					if(t_text.length > 0){
						t_text += " ";
					}
					t_text += words[i];
				}else{
					text.push(t_text);
					t_text = words[i];
				}
			}
			text.push(t_text);
			var calcheight = (text.length + 1) * 14;

			if(columns[item.level] == undefined){
				columns[item.level] = {
					x: (item.level - 1)*(Prefs.item.maxTextLength + Prefs.column.margin + 2*Prefs.item.padding + Prefs.item.margin) + Prefs.item.margin + Prefs.canvas.padding,
					y: Prefs.canvas.padding
				};
			}

			item.properties = {
				status: "canjoin",
				highlight: false,
				hovered: false,
				text: text,
				position: {
					x: columns[item.level].x,
					y: columns[item.level].y
				},
				size: {
					width: Prefs.item.maxTextLength + 2*Prefs.item.padding,
					height: calcheight + 2*Prefs.item.padding
				}
			}
			items.push(item);

			columns[item.level].y += Prefs.item.margin + item.properties.size.height;
		}

		this.addConnection = function(id1, id2){
			var item1 = this.getItemById(id1),
				item2 = this.getItemById(id2);

			if(item1 != undefined && item2 != undefined){
				if(item1.level < item2.level){
					t = item1;
					item1 = item2;
					item2 = t;
				}

				if(connections[item1.id] ==  undefined){
					connections[item1.id] = new Array();
					item1.properties.status = "normal";
				}
				if(connections[item1.id].indexOf(item2.id) == -1){
					connections[item1.id].push(item2.id);
				}
			}
		}

		this.getItems = function(){

			return items;
		}

		this.getConnections = function(){

			return connections;
		}

		this.getItemById = function(id){
			for (var i = 0; i < items.length; i++) {
				if(items[i].id == id){
					return items[i];
				}
			}
			return undefined;
		}

		this.getConnectionPoints = function(){
			var points = new Array();
			for(var i = 0; i < items.length; i++){
				if(connections[items[i].id] != undefined){
					startPoint = items[i].properties.position;
					for(var j = 0; j < connections[items[i].id].length; j++){
						points.push({
							startPoint: startPoint,
							endPoint:   this.getItemById(connections[items[i].id]).properties.position
						})
					}
				}
			}
			return points;
		}

		this.getRoots = function(id){
			var roots = new Array();
			if(connections[id] != undefined){
				for (var j = 0; j < connections[id].length; j++) {
					roots.push(this.getItemById(connections[id][j]));
				};
			}
			return roots;
		}

		this.getFollows = function(id){
			var follows = new Array();
			for (var i = 0; i < items.length; i++) {
				if(connections[items[i].id] != undefined && connections[items[i].id].indexOf(id) > -1){
					follows.push(items[i]);
				}
			};
			return follows;
		}

		this.getHoveredItem = function(mouse){
			var item = undefined;
			for(var i = 0; i < items.length; i++){
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

		this.getStatus = function(id){
			if(this.getItemById(id).properties.status == "completted"){
				return "completted";
			}

			roots = this.getRoots(id);
			for(var i = 0; i < roots.length; i++){
				if(roots[i].properties.status != "completted"){
					return "normal";
				}
			}

			return "canjoin";
		}

		this.clearHover = function(){
			for(var i = 0; i < items.length; i++){
				if(items[i].properties.hovered){
					items[i].properties.hovered = false;
					return;
				}
			}
		}

		this.getGraphSize = function(){
			var width = 0,
				height = 0;
			for(var i = 0; i < columns.length; i++){
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

		this.serialize = function(){
			var toserialize = new Array();

			for(var i = 0; i < items.length; i++){
				if(items[i].properties.status == "completted"){
					toserialize.push(items[i]);
				}
			}

			for(var j, x, i = toserialize.length; i; j = parseInt(Math.random() * i), x = toserialize[--i], toserialize[i] = toserialize[j], toserialize[j] = x);

			var seri = "";
			for(var i = 0; i < toserialize.length; i++){
				if(seri.length > 1){
					seri += "|";
				}
				seri += toserialize[i].id;
			}
			return base64.encode(seri);
		}

		this.unserialize = function(data){
			var decoded = base64.decode(data).split("|");

			for(var i = 0; i < decoded.length; i++){
				if(this.getItemById(decoded[i]) == undefined) return;
			}

			for(var i = 0; i < decoded.length; i++){
				this.getItemById(decoded[i]).properties.status = "completted";
			}
			EventBus.dispatch("redrawAll", this);
		}

		this.refresh = function(){
			for(var i = 0; i < items.length; i++){
				items[i].properties.status = this.getStatus(items[i].id);
			}
		}

		this.clear = function(){
			items = [];
			connections = [];
			columns = [];
		}

		this.clearSelection = function(){
			for(var i = 0; i < items.length; i++){
				items[i].properties.status = "normal";
			}
			for(var i = 0; i < items.length; i++){
				items[i].properties.status = this.getStatus(items[i].id);
			}
		}
	}

	// Alap változók
	var canvas = container.appendChild(document.createElement("canvas")),
		ctx	   = canvas.getContext("2d"),
		drawer = new Drawer(ctx),
		items  = new ItemHandler(),
		coder  = new Base64Class();

	container.style.overflow = "auto";

	if(typeof(ctx.mozImageSmoothingEnabled) == "boolean"){
		ctx.mozImageSmoothingEnabled = true;
	}

	canvas.onmousemove = function(e){
		e.stopPropagation();

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
		var follows = items.getFollows(clicked.id);

		if(clicked.properties.status == "canjoin"){
			clicked.properties.status = "completted";
			EventBus.dispatch("redrawItem", this, clicked.id);

			for(var i = 0; i < follows.length; i++){
				follows[i].properties.status = items.getStatus(follows[i].id);
				EventBus.dispatch("redrawItem", this, follows[i].id);
			}
		}else if(clicked.properties.status == "completted"){
			EventBus.dispatch("clearFollows", this, clicked.id);
			clicked.properties.status = "canjoin";
			EventBus.dispatch("redrawItem", this, clicked.id);
		}

		var clone = JSON.parse(JSON.stringify(clicked));
		delete clone.properties;
		clone.selected = clicked.properties.status == "completted" ? true : false;
		EventBus.dispatch("publicClickEvent", this, clone, e);
	}

	this.addItem = function(itemDesc){
	
		items.addItem(itemDesc);
	}

	this.addConnection = function(id1, id2){

		items.addConnection(id1, id2);
	}

	this.getItem = function(id){
	
		return items.getItemById(id);
	}

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
			bgcolor = Prefs.colors["hovered"];
			canvas.style.cursor = "pointer";
		} else if(item.properties.highlight){
			bgcolor = Prefs.colors["highlight"];
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

		drawer.roundRect(
			item.properties.position,
			item.properties.size,
			Prefs.item.cornerRadius
		);

		lingrad = ctx.createLinearGradient(
			item.properties.position.x,
			item.properties.position.y,
			item.properties.position.x,
			item.properties.position.y + item.properties.size.height);

		var bottommargin = 5;

		lingrad.addColorStop(  0, "rgba(255, 255, 255,  0)");
		lingrad.addColorStop( 1 - (bottommargin / item.properties.size.height), "rgba(255, 255, 255, .05)");
		lingrad.addColorStop( 1 - (bottommargin / item.properties.size.height), "rgba(0, 0, 0, .1)");
		lingrad.addColorStop(  1, "rgba(255, 255, 255, .0)");

		ctx.fillStyle = lingrad;
		ctx.fill();

		ctx.font = Prefs.item.font;
		ctx.textAlign = "center";

		var fontMainColor, fontBgColor, offset;

		if(drawer.colorBrightness(bgcolor) > 128){
			fontMainColor = "#222";
			fontBgColor = "rgba(255,255,255,.5)";
			offset = 1;
		}else{
			fontMainColor = "#fff";
			fontBgColor = "rgba(0,0,0,.5)";
			offset = -1;
		}

		var drawText = function(color, offset){
			ctx.fillStyle = color;
			for(var i = 0; i < item.properties.text.length; i++){
				ctx.fillText(
					item.properties.text[i],
					item.properties.position.x + item.properties.size.width / 2,
					item.properties.position.y + offset + Prefs.item.padding + (i+1)*Prefs.item.lineHeight);
			}
			ctx.fillText(item.kredit + " kredit",
						 item.properties.position.x + item.properties.size.width / 2,
						 item.properties.position.y + offset + item.properties.size.height - 10);
		}

		drawText(fontBgColor, offset);
		drawText(fontMainColor, 0);

		if(item.properties.hovered){
			roots = items.getRoots(item.id);

			for(var i = 0; i < roots.length; i++){
				roots[i].properties.highlight = true;
				EventBus.dispatch("redrawItem", this, roots[i].id);
			}
		}

	}

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

	this.drawItems = function(){
		var itemlist = items.getItems();
		for(var i = 0; i < itemlist.length; i++){
			this.drawItem(itemlist[i].id);
		}
	}

	this.drawConnections = function(){
		var itemList = items.getItems();
		var conns = items.getConnections();

		for(var i = 0; i < itemList.length; i++){
			if(conns[itemList[i].id] != undefined){
				for(var j = 0; j < conns[itemList[i].id].length; j++){
					this.drawConnection(itemList[i].id, conns[itemList[i].id][j]);
				}
			}
		}

		eval(coder.decode("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FTF1BTBLBTXABTXAGlcnFoFwFyWnFoF2FaWxVyObSAWxVyJxBTBLFTW1BTXOBTBLBTXASLOnFoFwGlMnFoF4FAWxVyO2FxWxVys2BTBLFTcbBTXOBTBLBTXASTMnFoFwGlWnFoF5SAWxVyO2FxWxVyo4BTBLFTcyBTXOBTXOBTM5BTGAfxWxSLOwFaWxVyO1GAWxVxW1VaW1VlOwFaWxVyO1GAWxVyOwGxWxVyO1FxWxVyOwSAWxVyObSAW1QAWxVxW1VlOwSAWxVyObFxWxVyOwSRWxVyObGAWxVyOwSRWxVyObFRW1QAWxVxW1VlOwSAWxVyOyGxWxVyOwGxWxVyOyGAWxVyOwGxWxVyOyGAW1QAW1QAWxSRWyVeinFlswFyFnFoFwGysnFoFnGWMnGWMwFyFnFoFwGysnFoFwFlsnFoFwGyVnFoFwFlHnFoFwGyOnGWVnFoFnGWMwFTOnFoFwGlsnFoFwFTMnFoFwGlJnFoFwFLsnFoFwGlcnGWVnFoFnGWMwFLVnFoFwGlWnFoFwFLMnFoFwGlWnFoF5SRWxVyO2GAW1QAWxVxW1Vlo1BTBLFTcxBTBLSTMnFoFwGTonFoF5FxWxVyO1GaW1QAWxVxW1VlobBTBLFTWyBTBLSTJnFoFwGTHnFoFwFLWnFoFwGTMnGWVnFoFnGWMwFTMnFoFwGTWnFoFwFlOnFoFwGTsnFoFwFlsnFoFwGlHnGWVnFoFnGWMwFyWnFoFwGlMnFoFwFyonFoFwGlFnFoFwGLMnFoFwGlcnGWVnFoFnGWMwGLWnFoFwGlonFoFwGLcnFoFwGyOnFoFwGLcnFoFwGyOnGWVnGWVnFlonFbBhBTM4SLcnFoFwGlVnFoFnGWMnGWM4GaWxVyO2GAWxVysbBTBLFTc4BTBLSTHnFoFwGyOnGWVnFoFnGWM5GRWxVyO3GAWxVyOqFaWxVyO3GxWxVyOqFxWxVyO3SAW1QAWxVxW1VlOqFxWxVyO3SAWxVyOqFxWxVyO3SAWxVyOqFxWxVyO3SAW1QAW1QAWxSRWyVeinFls5SRWxVyJ4BTBLBTXABTXASTonFoF3SAWxVyOqFRWxVyJ4BTBLFTHyBTBLGysnGWVnFoFnGWMwFLWnFoF3SRWxVyOqGxWxVysqBTBLFTH5BTBLGyonGWVnFoFnGWMwFTHnFoF3SRWxVyOwFaWxVyJ4BTBLFTOyBTBLGycnGWVnFoFnGWMwFTFnFoF3GAWxVyOwFaWxVyJbBTBLFTOxBTBLGyVnGWVnFoFnGWMwFTMnFoF3GAWxVyOwFRWxVyJxBTBLFTH3BTBLGyMnGWVnFoFnGWMwFLFnFoF3FaWxVyOqFxWxVyJyBTBLFTHwBTBLGyVnGWVnFoFnGWM5SRWxVyJ1BTBLSTonFoF3SAWxVyo5BTBLGysnGWVnGWVnFoGbJuXnBTM5BTGAfxWxSLOqGAWxVyJ1BTBLBTXABTXAFTHyBTBLGyWnFoFwFLFnFoF3GaWxVyOqGAWxVyJ2BTXOBTBLBTXAFTHbBTBLGyJnFoFwFLcnFoF3GxWxVyOqGaWxVyJ2BTXOBTBLBTXAFTH2BTBLGyWnFoFwFLVnFoF3GRWxVyOqGAWxVyJ1BTXOBTXOBTBLrUB1dRWxSRWyVeinFlswFLHnFoFwFLOnFoFnGWMnGWMwFLHnFoFwFLOnFoF5SAWxVyo3BTBLSTsnFoF5GAW1QAWxVxW1Vlo4BTBLSTMnFoF5GaWxVys4BTBLSTcnFoF4GRW1QAWxVxW1Vlo2BTBLSLFnFoF5GaWxVyJ2BTBLSTcnFoF3GaW1QAW1QAWxSRWyVeinFlswFLcnFoF3FaWxVxW1VaW1VlOqSAWxVyJyBTBLFTH5BTBLGyWnFoFwFLsnFoF3GaW1QAWxVxW1VlOqSAWxVyJ3BTBLFTH3BTBLGysnFoFwFLJnFoF3SRW1QAWxVxW1VlOqGaWxVyJ5BTBLFTH2BTBLGyonFoFwFLcnFoF3SRW1QAW1QAWxSRWyVeinFlswFLMnFoF3GAWxVxW1VaW1VlOqFaWxVyJbBTBLFTHwBTBLGyWnFoFwFLOnFoF3GaW1QAWxVxW1VlOqFRWxVyJ3BTBLFTHxBTBLGysnFoFwFLMnFoF3SAW1QAW1QAWxSRWyVeinFlswFTHnFoFwFlMnFoFnGWMnGWMwFTHnFoFwFlMnFoFwFTWnFoFwFTWnFoFwFTsnFoFwFLsnGWVnFoFnGWMwFlHnFoFwFLOnFoFwFlOnFoF5GaWxVyOxFAWxVys4BTXOBTBLBTXAFTMqBTBLGyonFoFwFlHnFoF3GxWxVyOxFAWxVyJ1BTXOBTBLBTXAFTMqBTBLGyFnFoFwFlOnFoF3FaWxVyOxFRWxVyc5BTXOBTBLBTXAFTMwBTBLGlcnFoFwFTonFoFbGAWxVyOwSRWxVyVbBTXOBTXOBTM5BTGAfxWxSLOxFAWxVyJbBTBLBTXABTXAFTMqBTBLGyVnFoFwFTJnFoF3FaWxVyOwGRWxVyJwBTXOBTBLBTXAFTOxBTBLGyHnFoFwFLJnFoF3FAWxVyOqFxWxVyJwBTXOBTBLBTXASTonFoF3FRWxVyo4BTBLGyWnFoF5SAWxVyJ1BTXOBTBLBTXASTsnFoF3GRWxVyo4BTBLGyOnFoFwFLHnFoF3FAW1QAWxVxW1VlOqFaWxVyc5BTBLFTHbBTBLGlJnFoFwFLsnFoF2GxW1QAWxVxW1VlOwFaWxVyc3BTBLFTOxBTBLGlcnFoFwFTWnFoF2GaW1QAWxVxW1VlOwSAWxVyc3BTBLFTMwBTBLGlonFoFwFlOnFoF2SRW1QAW1QAWxSRWyVeinFls3GxWxVyJ4BTBLBTXABTXAGyJnFoF3SAWxVyJ1BTBLGycnFoF3GAWxVyJ1BTXOBTBLBTXAGyMnFoF3GAWxVyJwBTBLGyFnFoF2GaWxVyJyBTXOBTBLBTXAGlOnFoF3FxWxVyW3BTBLGysnFoF1GxWxVyJ4BTXOBTBLBTXAGTJnFoF3SAWxVycqBTBLGysnFoF2FaWxVyJ5BTXOBTBLBTXAGlVnFoF4FRWxVyc1BTBLSLOnFoF2GxWxVyswBTXOBTBLBTXAGyHnFoF4FRWxVyJ3BTBLGysnFoF3GxWxVyJ4BTXOBTXOBTBLrUB1dRWxSRWyVeinFls2GRWxVyJyBTBLBTXABTXAGlWnFoF3FxWxVycyBTBLGyWnFoF2GAWxVyJ3BTXOBTBLBTXAGlVnFoF3SRWxVyc1BTBLSLHnFoF2GxWxVysqBTXOBTBLBTXAGlonFoF4FAWxVyJwBTBLGyonFoF3FRWxVyJ3BTXOBTBLBTXAGyMnFoF3GRWxVyc5BTBLGyFnFoF2SRWxVyJyBTXOBTXOBTM5BTGAfxWxSLc3BTBLGycnFoFnGWMnGWM2GaWxVyJ2BTBLGlcnFoF3GxWxVyc2BTBLGyJnGWVnFoFnGWM2GxWxVyJ4BTBLGlsnFoF3SAWxVyc4BTBLGyJnGWVnFoFnGWM2SRWxVyJ1BTBLGlJnFoF3GaWxVyc3BTBLGycnGWVnGWVnFoGbJuXnBTM5BTGAfxWxSLV2BTBLGyFnFoFnGWMnGWMbGaWxVyJyBTBLGLsnFoF3GRWxVyWwBTBLGyWnGWVnFoFnGWM1FxWxVyJbBTBLGlMnFoF2SRWxVyc2BTBLGlonGWVnFoFnGWM3FAWxVyc5BTBLGyFnFoF2SAWxVyJ3BTBLGlonGWVnFoFnGWM4FAWxVyJwBTBLSLVnFoF3FxWxVysbBTBLGyFnGWVnFoFnGWM4GAWxVyJyBTBLSLcnFoF2SRWxVysbBTBLGlsnGWVnFoFnGWM4FRWxVyc2BTBLGyOnFoF2FaWxVycbBTBLGlWnGWVnFoFnGWM1GxWxVyc3BTBLGTFnFoF2SRWxVyWqBTBLGyOnGWVnFoFnGWMbSAWxVyJxBTBLGLcnFoF3FxWxVyV2BTBLGyFnGWVnGWVnFoGbJuXnBTM5BTGAfxWxSLF1BTBLGTVnFoFnGWMnGWMyGRWxVyWbBTBLFyWnFoF1GRWxVyF1BTBLGlFnGWVnFoFnGWMyGAWxVyJxBTBLFyVnFoF5FRWxVyF2BTBLFTHxBTXOBTBLBTXAFyJnFoFwFTFnFoFbGAWxVyOxFaWxVyWqBTBLFTFxBTXOBTBLBTXAGTcnFoFwGLOnFoF1GaWxVyOyGaWxVyW5BTBLFTF2BTXOBTBLBTXAGlMnFoFwFyWnFoF2FRWxVyOyFxWxVycwBTBLFTM4BTXOBTBLBTXAGlMnFoFwFlFnFoF2FaWxVyOwSAWxVycxBTBLFTO4BTXOBTBLBTXAGlMnFoFwFTsnFoF2GAWxVyOxFAWxVycbBTBLFTMyBTXOBTBLBTXAGlVnFoFwFlWnFoF2FaWxVyOxSRWxVycbBTBLFTFwBTXOBTBLBTXAGlWnFoFwFyVnFoF2GaWxVyOyGaWxVyc2BTBLFTF2BTXOBTXOBTM5BTGAfxWxSLM3BTBLGlMnFoFnGWMnGWMxGxWxVycxBTBLFyOnFoF3FxWxVyFwBTBLGyonGWVnFoFnGWMyFaWxVys2BTBLFyHnFoF5SAWxVyFyBTBLFTH3BTXOBTBLBTXAFyWnFoFwFTcnFoFbFaWxVyOyFxWxVyWqBTBLFTVwBTXOBTBLBTXAGTJnFoFwGLonFoF1GaWxVyO1FAWxVycbBTBLFTWbBTXOBTBLBTXAGyMnFoFwGTonFoF3GaWxVyO1SRWxVyJ2BTBLFTW5BTXOBTXOBTM5BTGAfxWxSLOwGxWxVyOqGxWxVxW1VaW1VlOwGxWxVyOqGxWxVyOwGRWxVyOxFAWxVyOwGAWxVyOxFaW1QAWxVxW1VlOwFxWxVyOxGAWxVyOwFxWxVyOxGAWxVyOwFxWxVyOxGAW1QAW1QAWxSRWyVeinFlsxGaWxVycqBTBLBTXABTXAFlcnFoF2FAWxVyMyBTBLGlVnFoFxFxWxVyc4BTXOBTBLBTXAFlVnFoF3FRWxVyM1BTBLGyMnFoFxGRWxVyJ1BTXOBTBLBTXAFlWnFoF3GxWxVyM1BTBLSLHnFoFxGaWxVysyBTXOBTBLBTXAFlJnFoF4GxWxVyM3BTBLSTHnFoFxSRWxVyowBTXOBTBLBTXAFyHnFoF5FxWxVyFwBTBLSTFnFoFyFRWxVyoyBTXOBTXOBTM5BTGAfxWxSLM3BTBLGlonFoFnGWMnGWMxGxWxVyc5BTBLFlWnFoF3FaWxVyM1BTBLGyVnGWVnFoFnGWMxGRWxVyJ2BTBLFlJnFoF4FRWxVyM3BTBLSLOnGWVnGWVnFlonFbBhBTM4FTV2BTBLSTsnFoFnGWMnGWMwGLcnFoF5SAWxVyObGaWxVyOqFaWxVyObGxWxVyOqFaW1QAWxVxW1VlObGxWxVyOqFxWxVyO1FAWxVyOqGAWxVyO1FAWxVyOqGRW1QAWxVxW1VlO1FRWxVyOqGxWxVyO1FaWxVyOqSRWxVyO1FxWxVyOqSRW1QAWxVxW1VlO1GRWxVyOqSRWxVyO1GaWxVyOqSAWxVyO1SAWxVyOqGaW1QAWxVxW1VlO2FAWxVyOqGAWxVyO2FRWxVyOqGRWxVyO2FaWxVyOqGAW1QAWxVxW1VlO2FaWxVyOqFxWxVyO2FaWxVyOqFRWxVyO2FaWxVyOqFRW1QAW1QAWxSRWyVeinFlswGLOnFoFwFLVnFoFnGWMnGWMwGLOnFoFwFLVnFoFwGLWnFoFwFTOnFoFwGTFnFoFwFTOnGWVnFoFnGWMwGlOnFoFwFTOnFoFwGlcnFoFwFLJnFoFwGlcnFoFwFLJnGWVnFoFnGWMwGlcnFoFwFLJnFoFwGyHnFoFwFTFnFoFwGlonFoFwFlHnGWVnFoFnGWMwGlonFoFwFlcnFoFwGlJnFoFwFlWnFoFwGlJnFoFwFlWnGWVnGWVnFlonFbBhBTM4FTJyBTBLFTVwBTBLBTXABTXAFTJyBTBLFTVwBTBLFTJwBTBLFTF5BTBLFTJwBTBLFTF5BTXOBTBLBTXAFTJwBTBLFTF3BTBLFTJqBTBLFTFbBTBLFTJqBTBLFTFyBTXOBTBLBTXAFTJqBTBLFTFxBTBLFTJqBTBLFTFxBTBLFTc5BTBLFTFqBTXOBTBLBTXAFTc4BTBLFTM5BTBLFTc4BTBLFTM5BTBLFTc4BTBLFTM4BTXOBTBLBTXAFTc4BTBLFTM3BTBLFTc4BTBLFTM1BTBLFTc3BTBLFTM1BTXOBTBLBTXAFTc3BTBLFTM1BTBLFTc1BTBLFTM3BTBLFTc1BTBLFTM3BTXOBTBLBTXAFTc1BTBLFTM3BTBLFTc2BTBLFTM4BTBLFTc2BTBLFTM5BTXOBTBLBTXAFTc2BTBLFTM5BTBLFTcbBTBLFTFwBTBLFTcyBTBLFTFwBTXOBTBLBTXAFTcyBTBLFTFxBTBLFTcbBTBLFTFyBTBLFTcyBTBLFTFbBTXOBTBLBTXAFTcxBTBLFTF1BTBLFTW5BTBLFTVqBTBLFTV5BTBLFTVqBTXOBTBLBTXAFTF5BTBLFTVqBTBLFTF1BTBLFTF3BTBLFTFqBTBLFTFxBTXOBTBLBTXAFTM1BTBLFTM3BTBLFTM2BTBLFTMqBTBLFTM4BTBLFTO2BTXOBTBLBTXAFTFqBTBLFTOwBTBLFTVwBTBLFTHbBTBLFTVwBTBLFTHbBTXOBTXOBTM5BTGAJAWxSLObFRWxVyOqGAWxSRWyVuHnFlswGLOnFoFwFLVnFlonFbBiBTM4BTM5BTGAfxWxSLo2BTBLFTcwBTBLBTXABTXASTcnFoFwGlOnFoFwFLOnFoFwGlFnFoFwFLFnFoFwGlHnGWVnFoFnGWMwFLVnFoFwGTsnFoFwFLMnFoFwGTVnFoFwFLMnFoFwGTVnGWVnGWVnFlonFbBhBTM4FTc1BTBLFTFwBTBLBTXABTXAFTc1BTBLFTFwBTBLFTc1BTBLFTFxBTBLFTc2BTBLFTFxBTXOBTBLBTXAFTc3BTBLFTFxBTBLFTc4BTBLFTFwBTBLFTc4BTBLFTFqBTXOBTBLBTXAFTc4BTBLFTFqBTBLFTc4BTBLFTM5BTBLFTc4BTBLFTM5BTXOBTXOBTM5BTGAfxWxSLO2FxWxVyOyGAWxVxW1VaW1VlO2FxWxVyOyGAWxVyO2FRWxVyObFRWxVyO1FaWxVyObFaW1QAWxVxW1VlObFaWxVyObGAWxVyObFRWxVyObFaWxVyOySAWxVyObFRW1QAWxVxW1VlOyGRWxVyOySRWxVyOyFaWxVyOyGAWxVyOyFaWxVyOyGAW1QAW1QAWxSRWyVeinFlswGyHnFoFwFyFnFoFnGWMnGWMwGyHnFoFwFyFnFoFwGyWnFoFwFyWnFoFwGycnFoFwFyJnGWVnFoFnGWMwGyJnFoFwFyonFoFwSLOnFoFwGLMnFoFwSLOnFoFwGLMnGWVnGWVnFlonFbBhBTM4SLsnFoFwGlsnFoFnGWMnGWM4SAWxVyO2SAWxVyowBTBLFTc5BTBLSTOnFoFwGlsnGWVnFoFnGWM5FaWxVyO2GxWxVyoyBTBLFTc2BTBLSTFnFoFwGlWnGWVnFoFnGWM5FxWxVyO2GRWxVyoyBTBLFTc1BTBLSTFnFoFwGlWnGWVnGWVnFlonFbBhBTM4FTF2BTBLFTF5BTBLBTXABTXAFTF2BTBLFTF5BTBLFTF2BTBLFTVxBTBLFTF2BTBLFTVyBTXOBTBLBTXAFTF2BTBLFTVbBTBLFTF2BTBLFTV1BTBLFTF2BTBLFTV1BTXOBTBLBTXAFTF1BTBLFTV1BTBLFTFbBTBLFTV2BTBLFTFbBTBLFTV2BTXOBTXOBTM5BTGAfxWxSLOyGaWxVyObGRWxVxW1VaW1VlOyGaWxVyObGRWxVyOyGaWxVyObGxWxVyOyGRWxVyO1FAW1QAWxVxW1VlOyGRWxVyO1FaWxVyOyFxWxVyO1FxWxVyOyFxWxVyO1FxW1QAW1QAWxSRWyVeinFlswFyOnFoFwFyFnFoFnGWMnGWMwFyOnFoFwFyFnFoFwFyHnFoFwFyJnFoFwFyHnFoFwFysnGWVnFoFnGWMwFyHnFoFwFysnFoFwFyHnFoFwFyonFoFwFyOnFoFwFyonGWVnFoFnGWMwFyMnFoFwGLHnFoFwFyFnFoFwFyonFoFwFyFnFoFwFyonGWVnGWVnFlonFbBhBTM4FTFqBTBLFTF4BTBLBTXABTXAFTFqBTBLFTF4BTBLFTM5BTBLFTVqBTBLFTM5BTBLFTVwBTXOBTBLBTXAFTM4BTBLFTVwBTBLFTM4BTBLFTVyBTBLFTM5BTBLFTVyBTXOBTBLBTXAFTFqBTBLFTVbBTBLFTFqBTBLFTVbBTBLFTFqBTBLFTVbBTXOBTXOBTM5BTGAfxWxSLOxSAWxVyObFxWxVxW1VaW1VlOxSAWxVyObFxWxVyOxSAWxVyObGAWxVyOxGxWxVyObGaW1QAWxVxW1VlOxGxWxVyObSAWxVyOxGxWxVyO1FAWxVyOxGxWxVyO1FAW1QAW1QAWxSRWyVeinFlswFlJnFoFwGLsnFoFnGWMnGWMwFlJnFoFwGLsnFoFwFlVnFoFwGTOnFoFwFlcnFoFwGTFnGWVnFoFnGWMwFlJnFoFwGTWnFoFwFlsnFoFwGTcnFoFwFyHnFoFwGTcnGWVnFoFnGWMwFyMnFoFwGTcnFoFwFyJnFoFwGTcnFoFwFysnFoFwGTcnGWVnFoFnGWMwFyonFoFwGTcnFoFwGLMnFoFwGTWnFoFwGLFnFoFwGTWnGWVnFoFnGWMwGLWnFoFwGTcnFoFwGLcnFoFwGTcnFoFwGLsnFoFwGTcnGWVnFoFnGWMwGLonFoFwGTcnFoFwGTVnFoFwGTWnFoFwGTcnFoFwGTWnGWVnFoFnGWMwGTsnFoFwGTWnFoFwGlMnFoFwGTVnFoFwGlWnFoFwGTWnGWVnFoFnGWMwGlsnFoFwGTcnFoFwGyMnFoFwGTonFoFwGyMnFoFwGTonGWVnGWVnFlonFbBhBTM4FTF2BTBLFTV2BTBLBTXABTXAFTF2BTBLFTV2BTBLFTF3BTBLFTV1BTBLFTF5BTBLFTV3BTXOBTBLBTXAFTVwBTBLFTV4BTBLFTVxBTBLFTV5BTBLFTVxBTBLFTWqBTXOBTBLBTXAFTVxBTBLFTWxBTBLFTVxBTBLFTWxBTBLFTVxBTBLFTWxBTXOBTXOBTM5BTGAfxWxSLOySAWxVyObGaWxVxW1VaW1VlOySAWxVyObGaWxVyOySAWxVyObGAWxVyOySAWxVyObGAW1QAWxVxW1VlOySRWxVyObFxWxVyOySRWxVyObFxWxVyOySRWxVyObFxW1QAW1QAWxSRWyVeinFlswFlsnFoFwGLFnFoFnGWMnGWMwFlsnFoFwGLFnFoFwFlFnFoFwGLHnFoFwFlMnFoFwFysnGWVnFoFnGWMwFlMnFoFwFyJnFoFwFlFnFoFwFyWnFoFwFlFnFoFwFyFnGWVnFoFnGWMwFlVnFoFwFyOnFoFwFlFnFoFwFyOnFoFwFlVnFoFwFyHnGWVnFoFnGWMwFlWnFoFwFlonFoFwFlWnFoFwFlonFoFwFlWnFoFwFlsnGWVnFoFnGWMwFlcnFoFwFlcnFoFwFlcnFoFwFlVnFoFwFlcnFoFwFlVnGWVnGWVnFlonFbBhBTM4FTM4BTBLFTF4BTBLBTXABTXAFTM4BTBLFTF4BTBLFTM5BTBLFTF4BTBLFTFqBTBLFTF3BTXOBTBLBTXAFTFqBTBLFTF2BTBLFTFqBTBLFTF2BTBLFTFqBTBLFTF2BTXOBTXOBTM5BTGAfxWxSLOySAWxVyOqGAWxVxW1VaW1VlOySAWxVyOqGAWxVyOySAWxVyOqFxWxVyOySAWxVyOqFaW1QAWxVxW1VlOySRWxVyOqFAWxVyOySRWxVyOqFAWxVyOySRWxVyOqFAW1QAW1QAWxSRWyVeinFlswGlJnFoFwFLsnFoFnGWMnGWMwGlJnFoFwFLsnFoFwGlonFoFwFLsnFoFwGlonFoFwFLJnGWVnFoFnGWMwGlonFoFwFLWnFoFwGlsnFoFwFLVnFoFwGlsnFoFwFLVnGWVnGWVnFlonFbBhBTM4FTFbBTBLFTH4BTBLBTXABTXAFTFbBTBLFTH4BTBLFTFwBTBLFTH1BTBLFTFwBTBLFTHxBTXOBTBLBTXAFTFqBTBLSTonFoFwFyOnFoFwFLOnFoFwFlonFoF5GxW1QAWxVxW1VlOxSAWxVyobBTBLFTM3BTBLSTOnFoFwFlJnFoF4GxW1QAWxVxW1VlOxGxWxVysyBTBLFTM3BTBLSLMnFoFwFlJnFoF3SRW1QAWxVxW1VlOxGxWxVyJ2BTBLFTM2BTBLGyVnFoFwFlJnFoF2GxW1QAWxVxW1VlOxSAWxVycqBTBLFTM4BTBLGTWnFoFwFlsnFoF1GRW1QAW1QAWxSRWyVeinFlswGlonFoFwFTcnFoFnGWMnGWMwGlonFoFwFTcnFoFwGyFnFoFwFTWnFoFwGyJnFoFwFTHnGWVnFoFnGWMwSLOnFoFwFLWnFoFwSLOnFoFwFLcnFoFwSLFnFoFwFLOnGWVnFoFnGWMwSLVnFoF5GaWxVyO4GRWxVyoxBTBLFTs3BTBLSTHnGWVnFoFnGWMwSLsnFoF4SAWxVyO4SAWxVys4BTBLFTs4BTBLSLsnGWVnFoFnGWMwSLsnFoF4SAWxVyO5FAWxVys4BTBLFTowBTBLSLcnGWVnFoFnGWMwSTMnFoF4GRWxVyO5FaWxVysbBTBLFToxBTBLSLMnGWVnFoFnGWMwSTFnFoF4FAWxVyO5GAWxVyJ4BTBLFTobBTBLGysnGWVnGWVnFlonFbBqBTM4FTobBTBLGyJnFlonFbBiBTM4BTM5BTGAfxWxSLO2GAWxVysxBTBLBTXABTXAFTcbBTBLSLMnFoFwGlcnFoF4FaWxVyO2SAWxVysyBTXOBTBLBTXAFTc5BTBLSLFnFoFwGyOnFoF4GAWxVyO3FaWxVysbBTXOBTBLBTXAFTJyBTBLSLVnFoFwGyWnFoF4GAWxVyO3GaWxVysyBTXOBTBLBTXAFTJ3BTBLSLFnFoFwGyJnFoF4FaWxVyO3GxWxVysxBTXOBTBLBTXAFTJ3BTBLSLMnFoFwGycnFoF4FRWxVyO3GRWxVysqBTXOBTBLBTXAFTJbBTBLSLHnFoFwGyMnFoF4FAWxVyO2SRWxVysqBTXOBTBLBTXAFTc3BTBLSLHnFoFwGlVnFoF4FaWxVyO2GAWxVysxBTXOBTXOBTBLrUB1dRWxSRWyVeinFlswFyWnFoF3SAWxVxW1VaW1VlOyGRWxVyJ4BTBLFTF3BTBLSLHnFoFwFyonFoF4FAW1QAWxVxW1VlObFRWxVyswBTBLFTVyBTBLSLHnFoFwGLWnFoF4FAW1QAWxVxW1VlObGaWxVyswBTBLFTV5BTBLSLOnFoFwGLonFoF4FRW1QAWxVxW1VlObSRWxVyswBTBLFTV5BTBLGyonFoFwGLcnFoF3SAW1QAWxVxW1VlObFxWxVyJ2BTBLFTVyBTBLGycnFoFwGLHnFoF3GaW1QAWxVxW1VlOyGxWxVyJ2BTBLFTF1BTBLGysnFoFwFyWnFoF3SAW1QAW1QAWxV3QxrYWnFlonFbBhBTM4FTJwBTBLSLHnFoFnGWMnGWMwGyOnFoF4FAWxVyO3FRWxVyswBTBLFTJxBTBLSLOnGWVnFoFnGWMwGyMnFoF4FRWxVyO3FxWxVysqBTBLFTJyBTBLSLHnGWVnGWVnFlonFbBhBTM4FTc5BTBLSLHnFoFnGWMnGWMwGlonFoF4FaWxVyO3FAWxVysxBTBLFTJqBTBLSLMnGWVnFoFnGWMwGyOnFoF4FxWxVyO3FxWxVysyBTBLFTJbBTBLSLMnGWVnFoFnGWMwGyWnFoF4FAWxVyO3GRWxVysqBTBLFTJ1BTBLSLHnGWVnGWVnFlonFbBhBTM4FTVxBTBLGycnFoFnGWMnGWMwGLMnFoF3GaWxVyObFRWxVyJ3BTBLFTVxBTBLGyJnGWVnFoFnGWMwGLFnFoF3SAWxVyObFxWxVyJ4BTBLFTVyBTBLGysnGWVnFoFnGWMwGLVnFoF3GxWxVyObGAWxVyJ3BTBLFTVbBTBLGyJnGWVnGWVnFlonFbBhBTM4FTVqBTBLGycnFoFnGWMnGWMwGLHnFoF3GaWxVyOySRWxVyJ4BTBLFTVqBTBLGyonGWVnFoFnGWMwGLMnFoF4FAWxVyObFxWxVysqBTBLFTVbBTBLGyonGWVnFoFnGWMwGLcnFoF3SAWxVyObGaWxVyJ4BTBLFTV2BTBLGysnGWVnGWVnFlonFbBhBTM4FTcqBTBLSLsnFoFnGWMnGWMwGlHnFoF4SAWxVyO1SRWxVysbBTBLFTcxBTBLSLMnGWVnFoFnGWMwGlWnFoF4FRWxVyO2GRWxVysqBTBLFTc4BTBLGyonGWVnFoFnGWMwGyHnFoF3SRWxVyO3GAWxVyJ4BTBLFTJ2BTBLGysnGWVnFoFnGWMwGysnFoF3SAWxVyO3SRWxVyJ4BTBLFTswBTBLGysnGWVnFoFnGWMwSLMnFoF3GxWxVyO4GaWxVyJ4BTBLFTs2BTBLGysnGWVnGWVnFlonFbBhBTM4FTcbBTBLSLOnFoFnGWMnGWMwGlVnFoF4FRWxVyO2GRWxVyJ4BTBLFTc4BTBLGysnGWVnFoFnGWMwGyHnFoF3GxWxVyO3FRWxVyJ4BTBLFTJyBTBLGyJnGWVnFoFnGWMwGyVnFoF3GaWxVyO3GAWxVyJ2BTBLFTJ2BTBLGycnGWVnFoFnGWMwGysnFoF3GRWxVyO4FRWxVyJ2BTBLFTsxBTBLGycnGWVnFoFnGWMwSLFnFoF3GRWxVyO4GaWxVyJ1BTBLFTs2BTBLGyWnGWVnGWVnFlonFbBqBTM4FTs2BTBLGyJnFlonFbBiBTM4BTM5BTGAfxWxSLO1FRWxVys1BTBLBTXABTXAFTWwBTBLSLWnFoFwGTMnFoF4FaWxVyO1FAWxVysqBTXOBTBLBTXAFTV4BTBLGyJnFoFwGLHnFoF3GRWxVyOySAWxVyJbBTXOBTBLBTXAFTF3BTBLGyFnFoFwFyHnFoF3FaWxVyOyFAWxVyJxBTXOBTXOBTM5BTGAJAWxSLOyFAWxVyJqBTM5BTGAJRWxSLOyFAWxVyJqBTBLFTF3BTBLGyOnFoFwGLHnFoF3FaWxSRWyVuOnFlswGLMnFoF3FxWxVyObGRWxVyJ1BTBLFTV2BTBLGyWnFlonFbBwBTM4FTV3BTBLGycnFoFwGLonFoF3GaWxVyObSRWxVyJ2BTM5BTGAJRWxSLObSRWxVyJ3BTBLFTWqBTBLGyonFoFwGTHnFoF3SRWxSRWyVeqnFlsnFlonFbBhBTM4FTV3BTBLFTO4BTBLBTXABTXAFTVxBTBLFTO3BTBLFTVwBTBLFTMqBTBLFTVyBTBLFTMyBTXOBTBLBTXAFTV1BTBLFTM1BTBLFTV5BTBLFTM1BTBLFTWwBTBLFTMyBTXOBTBLBTXAFTWyBTBLFTMwBTBLFTWxBTBLFTMqBTBLFTWqBTBLFTO4BTXOBTBLBTXAFTV4BTBLFTO3BTBLFTV3BTBLFTO4BTBLFTV3BTBLFTO4BTXOBTXOBTBLrUB1dRWxSRWyVeinFlswGLWnFoFwFlVnFoFnGWMnGWMwGLWnFoFwFlVnFoFwGLFnFoFwFlMnFoFwGLVnFoFwFlOnGWVnFoFnGWMwGLcnFoFwFTonFoFwGTHnFoFwFTsnFoFwGTHnFoFwFTsnGWVnGWVnFlonFbBhBTM4FTcxBTBLFTF1BTBLBTXABTXAFTcxBTBLFTF1BTBLFTW3BTBLFTVqBTBLFTW2BTBLFTVwBTXOBTBLBTXAFTW1BTBLFTVyBTBLFTWbBTBLFTV3BTBLFTWyBTBLFTV4BTXOBTBLBTXAFTWwBTBLFTV5BTBLFTWwBTBLFTV5BTBLFTWwBTBLFTV5BTXOBTXOBTM5BTGAJAWxSLO1FRWxVyObSRWxSRWyVeqnFlsnFlonFbBhBTM4FToqBTBLSLHnFoFnGWMnGWMwSTHnFoF4FAWxVyO5FAWxVyJyBTBLFToqBTBLGlonGWVnFoFnGWMwSTOnFoF2GaWxVyO5FaWxVycyBTBLFToxBTBLGlOnGWVnFoFnGWMwSTOnFoF1SRWxVyO5FAWxVyW1BTBLFTs3BTBLGTVnGWVnFoFnGWMwSLFnFoF1GAWxVyO4FxWxVyWbBTBLFTsyBTBLGTVnGWVnGWVnFlonFbBhBTM4FTM4BTBLGTWnFoFnGWMnGWMwFlsnFoF1GRWxVyOxGxWxVyWwBTBLFTFqBTBLGLsnGWVnFoFnGWMwFyVnFoFbGRWxVyOySRWxVyVbBTBLFTF5BTBLGLVnGWVnFoFnGWMwFyonFoFbGAWxVyOyGaWxVyV1BTBLFTF1BTBLGLFnGWVnFoFnGWMwFyVnFoFbFRWxVyOyFRWxVyF1BTBLFTF2BTBLFyonGWVnFoFnGWMwGLOnFoFbFaWxVyObFRWxVyVyBTBLFTVyBTBLGLMnGWVnFoFnGWMwGLWnFoFbFaWxVyObGRWxVyVxBTBLFTV1BTBLGLMnGWVnGWVnFlonFbBhBTM4FTVxBTBLGLHnFoFnGWMnGWMwGLMnFoFbFAWxVyObGRWxVyF3BTBLFTV4BTBLFyJnGWVnFoFnGWMwGTMnFoFySAWxVyO1FaWxVyVqBTBLFTW1BTBLGLHnGWVnFoFnGWMwGTsnFoFbFAWxVyO2FRWxVyF5BTBLFTcwBTBLFyonGWVnFoFnGWMwGlOnFoFySRWxVyO1SRWxVyVxBTBLFTc1BTBLGLFnGWVnFoFnGWMwGyHnFoFbGAWxVyO3FxWxVyV1BTBLFTJbBTBLGLFnGWVnFoFnGWMwGycnFoFbFRWxVyO3FxWxVyV2BTBLFTJ4BTBLGLWnGWVnFoFnGWMwSLFnFoFbGAWxVyO4GaWxVyVbBTBLFTsbBTBLGLJnGWVnFoFnGWMwSLOnFoF1FAWxVyO5FaWxVyV1BTBLFTs3BTBLGLonGWVnFoFnGWMwSLMnFoF1FxWxVyO4SAWxVyWxBTBLFTs4BTBLGTMnGWVnGWVnFlonFbBqBTM4FTsbBTBLGTFnFlonFbBiBTM4BTM5BTGAfxWxSLOxGxWxVyJ5BTBLBTXABTXAFTM3BTBLGyonFoFwFlWnFoF3GaWxVyOxGRWxVyJyBTXOBTBLBTXAFTM1BTBLGyHnFoFwFlcnFoF2SRWxVyOxGaWxVyc1BTXOBTBLBTXAFTM2BTBLGlMnFoFwFlWnFoF2FAWxVyOxGaWxVyW3BTXOBTBLBTXAFTM2BTBLGTFnFoFwFlcnFoFbSAWxVyOxGaWxVyV1BTXOBTBLBTXAFTM3BTBLGLMnFoFwFlJnFoFySRWxVyOxSAWxVyF1BTXOBTBLBTXAFTM5BTBLFyMnFoFwFlonFoFxSRWxVyOxSRWxVyM5BTXOBTXOBTM5BTGAJAWxSLOyFRWxVyM5BTM5BTGAJRWxSLOyFRWxVyM5BTBLFTFyBTBLFyMnFoFwFyWnFoFyFxWxSRWyVuOnFlswFysnFoFyFxWxVyObGaWxVyFbBTBLFTWqBTBLFyFnFlonFbBwBTM4FTWbBTBLFyMnFoFwGTWnFoFxSRWxVyO1SAWxVyM2BTM5BTGAJRWxSLO2FAWxVyMyBTBLFTcxBTBLFlOnFoFwGlVnFoFxFRWxSRWyVuOnFlswGlcnFoFxFaWxVyO2GxWxVyMbBTBLFTc4BTBLFlcnFlonFbBwBTM4FTc4BTBLFlsnFoFwGlsnFoFyFxWxVyO3GAWxVyF2BTM5BTGAJRWxSLO4FAWxVyF5BTBLFTsyBTBLGLHnFoFwSLcnFoFbFAWxSRWyVuOnFlswSTHnFoFbFAWxVyO5FAWxVyVqBTBLFToyBTBLFyonFlonFbBwBTM4FTo1BTBLFysnFoFwSTsnFoFyGAWxVyO5SAWxVyFbBTM5BTGAJAWxSLO5SAWxVyF4BTM5BTGAIAWxSAWxSRWyVeinFlswSTOnFoF3SRWxVxW1VaW1VlO5FRWxVyJ5BTBLFToxBTBLGyonFoFwSTFnFoF3GxW1QAWxVxW1VlO5GAWxVyJ1BTBLFToyBTBLGyFnFoFwSTVnFoF3FRW1QAWxVxW1VlO5GRWxVyJqBTBLFTo3BTBLGlsnFoFwSTJnFoF2GRW1QAWxVxW1VlO5GxWxVycxBTBLFTo2BTBLGlVnFoFwSTJnFoF2FRW1QAWxVxW1VlO5SAWxVyW4BTBLFTo5BTBLGlHnFoFwSTonFoF1GaW1QAWxVxW1VlO5SAWxVyWxBTBLFTo3BTBLGTHnFoFwSTsnFoFbGxW1QAWxVxW1VlO5SRWxVyVbBTBLFlHqBTBLGLVnFoFwSTonFoFbFRW1QAWxVxW1VlO5SRWxVyF5BTBLFTo3BTBLFyJnFoFwSTJnFoFyGxW1QAW1QAWxSRWyVe+nFlswSTonFoFxGAWxVxW1VaW1VlO5SRWxVyVqBTXOBTXOBTM5BTGAfxWxSLO2GRWxVyO4BTBLBTXABTXAFTc1BTBLFTsnFoFwGlJnFoFxFAWxVyO2SRWxVyO4BTXOBTBLBTXAFTJxBTBLFTJnFoFwGyVnFoFwGxWxVyO3SAWxVyO3BTXOBTBLBTXAFTswBTBLFTJnFoFwSLWnFoFwGxWxVyO5FAWxVyO5BTXOBTBLBTXAFTo2BTBLFlOnFoFwSTonFoFxGAWxVyO5SRWxVyMbBTXOBTXOBTM5BTGAfxWxSLOxSRWxVyM5BTBLBTXABTXAFTM5BTBLFlonFoFwFlonFoFxGAWxVyOyFAWxVyMwBTXOBTBLBTXAFTFqBTBLFTsnFoFwFyHnFoFwGRWxVyOyFxWxVyO1BTXOBTBLBTXAFTF2BTBLFTWnFoFwFycnFoFwFxWxVyObGRWxVyOyBTXOBTBLBTXAFTWbBTBLFTFnFoFwGTFnFoFwGAWxVyO1GxWxVyO2BTXOBTBLBTXAFTcxBTBLFTsnFoFwGlWnFoFwSAWxVyO2GRWxVyO4BTXOBTXOBTM5BTGAfxWxSLObGRWxVyO1BTBLBTXABTXAFTV1BTBLFTWnFoFwFysnFoFwFxWxVyOyGRWxVyO3BTXOBTBLBTXAFTFwBTBLFlHnFoFwFyMnFoFwSRWxVyOyFRWxVyMyBTXOBTBLBTXAFTFwBTBLFlJnFoFwFyMnFoFxSAWxVyOyGRWxVyFqBTXOBTBLBTXAFTF3BTBLFyMnFoFwGLsnFoFyFxWxVyO1FRWxVyFwBTXOBTBLBTXAFTW1BTBLFlsnFoFwGTonFoFxGAWxVyO1SRWxVyMqBTXOBTBLBTXAFTW5BTBLFTJnFoFwGTJnFoFwGaWxVyO1FxWxVyO2BTXOBTBLBTXAFTWqBTBLFTWnFoFwGLWnFoFwGRWxVyObGRWxVyO1BTXOBTXOBTBLrUB1dRWxSRWyVeinFlswSLVnFoFwSRWxVxW1VaW1VlO4GAWxVyO5BTBLFTowBTBLFlHnFoFwSTVnFoFxFxW1QAWxVxW1VlO5GxWxVyM3BTBLFTo3BTBLFlonFoFwSTcnFoFyFxW1QAWxVxW1VlO5GRWxVyF3BTBLFToyBTBLFyonFoFwSLFnFoFyGxW1QAWxVxW1VlO3FaWxVyFbBTBLFTJwBTBLFyFnFoFwGlonFoFxSAW1QAWxVxW1VlO2SAWxVyMyBTBLFTc4BTBLFlHnFoFwGyMnFoFwSRW1QAWxVxW1VlO3GRWxVyO4BTBLFTsbBTBLFTonFoFwSLVnFoFwSRW1QAW1QAWxSRWyVeinFlswGLMnFoFwFaWxVxW1VaW1VlObFaWxVyOxBTBLFTV4BTBLSRWxVyO1FaWxVyOqBTXOBTBLBTXAFTW3BTBLFTMnFoFwGTcnFoF4BTBLFTW5BTBLSAW1QAWxVxW1VlO2FaWxVyonFoFwGlMnFoFwFaWxVyO2GaWxVyOxBTXOBTBLBTXAFTJwBTBLFTFnFoFwGyWnFoFwFRWxVyO3SAWxVyOxBTXOBTBLBTXAFTsxBTBLFTFnFoFwSLVnFoFwFaWxVyO4GaWxVyObBTXOBTBLBTXAFTs3BTBLFTcnFoFwSLsnFoFwSRWxVyO4SAWxVyO5BTXOBTXOBTM5BTGAfxWxSLO5SAWxVyOxGRWxVxW1VaW1VlO5SAWxVyOxGRWxVyO5FaWxVyOwFRWxVyO5FaWxVyo3BTXOBTBLBTXAFToxBTBLSLVnFoFwSTcnFoF3GRWxVyMqFAWxVyJyBTXOBTBLBTXAFlHbBTBLGyMnFoFxFLJnFoF3FaWxVyMqGxWxVyJxBTXOBTBLBTXAFlH3BTBLGyMnFoFwSTonFoF3GRWxVyO5GxWxVysxBTXOBTBLBTXAFTo1BTBLSLsnFoFwSTWnFoFwFLOnFoFwSTJnFoFwFLonGWVnFoFnGWMwSTonFoFwFTJnFoFxFLHnFoFwFlVnFoFxFLHnFoFwFlVnGWVnGWVnFoGbJuXnBTM5BTGAfxWxSLMqGaWxVyJxBTBLBTXABTXAFlH2BTBLGyMnFoFxFTMnFoF3FRWxVyMwSAWxVyJ1BTXOBTBLBTXAFlMyBTBLGysnFoFxFlFnFoF3SAWxVyMxFxWxVyJ4BTXOBTXOBTM5BTGAfxWxSLO3SAWxVyOxFAWxVxW1VaW1VlO3SAWxVyOxFAWxVyO4FRWxVyOwGxWxVyO4FaWxVyOwFaW1QAWxVxW1VlO4FxWxVyOqSAWxVyO4FaWxVyOqGaWxVyO4FaWxVyOqGaW1QAW1QAWxSRWyVeinFlswSLHnFoFwGLHnFoFnGWMnGWMwSLHnFoFwGLHnFoFwSLFnFoFwGLMnFoFwSLFnFoFwGLHnGWVnFoFnGWMwSLMnFoFwFyonFoFwSLOnFoFwFycnFoFwSLMnFoFwFycnGWVnFoFnGWMwSLVnFoFwFyJnFoFwSLsnFoFwFyonFoFwSLcnFoFwFyJnGWVnFoFnGWMwSLWnFoFwFyVnFoFwSLMnFoFwFyHnFoFwSLWnFoFwFyMnGWVnFoFnGWMwSLsnFoFwFyFnFoFwSTHnFoFwFyVnFoFwSLonFoFwFyMnGWVnFoFnGWMwSLonFoFwFyHnFoFwSLsnFoFwFlsnFoFwSTHnFoFwFlonGWVnFoFnGWMwSTOnFoFwFyOnFoFwSTVnFoFwFyHnFoFwSTFnFoFwFlonGWVnFoFnGWMwSTOnFoFwFlJnFoFwSTMnFoFwFlcnFoFwSTFnFoFwFlsnGWVnFoFnGWMwSTWnFoFwFlonFoFwSTcnFoFwFlonFoFwSTWnFoFwFlcnGWVnFoFnGWMwSTVnFoFwFlVnFoFwSTWnFoFwFlVnFoFwSTcnFoFwFlWnGWVnFoFnGWMwSTsnFoFwFlJnFoFxFLOnFoFwFlcnFoFwSTonFoFwFlVnGWVnFoFnGWMwSTJnFoFwFlOnFoFwSTcnFoFwFlHnFoFxFLHnFoFwFlMnGWVnFoFnGWMxFLVnFoFwFlFnFoFxFLVnFoFwFlOnFoFxFLMnFoFwFTonGWVnFoFnGWMxFLHnFoFwFTcnFoFxFLOnFoFwFTMnFoFxFLFnFoFwFTcnGWVnFoFnGWMxFLVnFoFwFTonFoFxFLonFoFwFTcnFoFxFLcnFoFwFTFnGWVnFoFnGWMxFLFnFoFwFLonFoFxFLFnFoFwFLJnFoFxFLcnFoFwFLonGWVnFoFnGWMxFLsnFoFwFTOnFoFxFLonFoFwFLonFoFxFLsnFoFwFLcnGWVnFoFnGWMxFLJnFoFwFLVnFoFxFLcnFoFwFLMnFoFxFLsnFoFwFLFnGWVnFoFnGWMxFTOnFoFwFLVnFoFxFTMnFoFwFLVnFoFxFTOnFoFwFLMnGWVnFoFnGWMxFLonFoFwFLOnFoFxFTHnFoF5SRWxVyMwFaWxVyOqFAW1QAWxVxW1VlMwFxWxVyOqFaWxVyMwGAWxVyOqFRWxVyMwFxWxVyo5BTXOBTBLBTXAFlOxBTBLSTcnFoFxFTVnFoF5GAWxVyMwGRWxVyo1BTXOBTBLBTXAFlO3BTBLSTJnFoFxFTonFoF5GAWxVyMwSRWxVyoyBTXOBTBLBTXAFlO4BTBLSTOnFoFxFTsnFoF4SAWxVyMxFAWxVys4BTXOBTBLBTXAFlMxBTBLSLsnFoFxFlMnFoF4SRWxVyMxGAWxVys4BTXOBTBLBTXAFlM2BTBLSLJnFoFxFyOnFoF4GaWxVyMxGxWxVysbBTXOBTBLBTXAFlMxBTBLSLFnFoFxFlFnFoF4FaWxVyMxGAWxVyswBTXOBTBLBTXAFlM2BTBLSLHnFoFxFlsnFoF3GxWxVyMxGRWxVyJ4BTXOBTBLBTXAFlMxBTBLSLHnFoFxFlFnFoF3GxWxVyMxGRWxVyJ2BTXOBTBLBTXAFlM4BTBLGyWnFoFxFlcnFoF3FxWxVyMxGAWxVyJ1BTXOBTBLBTXAFlMwBTBLGyJnFoFxFTonFoF3GaWxVyMxFRWxVyJ1BTXOBTBLBTXAFlMxBTBLGyFnFoFxFlHnFoF3FaWxVyMxFAWxVyJbBTXOBTBLBTXAFlO5BTBLGyJnFoFxFTonFoF3GaWxVyMwSRWxVyJ2BTXOBTXOBTM5BTGAfxWxSLOxFAWxVyo3BTBLBTXABTXAFTMqBTBLSTJnFoFwFlMnFoF5GAWxVyOxGAWxVyobBTXOBTBLBTXAFTM3BTBLSTFnFoFwFlsnFoF5FxWxVyOxSAWxVyoyBTXOBTXOBTM5BTGAfxWxSLOxFAWxVyo5BTBLBTXABTXAFTMqBTBLSTonFoFwFlVnFoF5SRWxVyOxGxWxVyOqFAW1QAWxVxW1VlOxSRWxVyOqFAWxVyOyFAWxVyOqFRWxVyOyFAWxVyOqFRW1QAW1QAWxSRWyVe+nFlswGlsnFoFwGTJnFoFnGWMnGWMwGyMnFoFwGyMnGWVnGWVnFlonFbBhBTM4FyOnFoF5SAWxVxW1VaW1VlFwBTBLSTsnFoFxGaWxVyOqFAWxVyMxBTBLFTHbBTXOBTBLBTXAFTonFoFwFLsnFoFwGxWxVyOwSRWxVyO3BTBLFTO5BTXOBTXOBTM5BTGAfaWxSLMxBTBLFTHbBTBLBTXABTXAFTVnFoFwFLonGWVnGWVnFlonFbBhBTM4FyonFoFwFlcnFoFnGWMnGWMySRWxVyOxGaWxVyV3BTBLFTVxBTBLGTHnFoFwGLcnGWVnFoFnGWM1FxWxVyO1FRWxVycbBTBLFTW5BTBLGlsnFoFwGlWnGWVnFoFnGWM3FaWxVyO3FAWxVyJyBTBLFTJyBTBLGyFnFoFwGyFnGWVnFoFnGWM3FxWxVyO3FxWxVyJ2BTBLFTc3BTBLGyJnFoFwGlWnGWVnFoFnGWM3SAWxVyO2FxWxVyJ5BTBLFTcwBTBLGyonFoFwGlOnGWVnGWVnFlonFbBhBTM4FysnFoFwGTHnFoFnGWMnGWMySRWxVyO1FAWxVyWwBTBLFTV5BTBLGTOnFoFwGLonGWVnFoFnGWM1FRWxVyObSRWxVyW1BTBLFTWxBTBLGTWnFoFwGTVnGWVnFoFnGWM1GAWxVyO1GaWxVyWqBTBLFTW4BTBLGTWnFoFwGlOnGWVnFoFnGWM1SRWxVyO2GAWxVyc5BTBLFTc4BTBLGlonFoFwGlsnGWVnGWVnFlonFbBhBTM4FlJnFoF1SRWxVxW1VaW1VlMbBTBLGTcnFoFxGRWxVyW2BTBLFlcnFoF1FaW1QAWxVxW1VlM2BTBLGLsnFoFxFxWxVyVbBTBLFlVnFoFbFaW1QAWxVxW1VlM1BTBLGLOnFoFxFRWxVyF4BTBLFlFnFoFyFxW1QAWxVxW1VlM2BTBLFlsnFoFxGAWxVyM2BTBLFlsnFoFxFAW1QAWxVxW1VlFyBTBLFTFnFoFySRWxVycnFoFySRWxVycnGWVnGWVnFlonFbBqBTM4GLOnFoFyBTM5BTGAIAWxSAWxSRWyVeinFlswFlOnFoF2FAWxVxW1VaW1VlOxFAWxVyW5BTBLFTMxBTBLGTonFoFwFlMnFoF1FxW1QAWxVxW1VlOxFaWxVyV2BTBLFTMbBTBLGLonFoFwFlVnFoFbFxW1QAWxVxW1VlOxGRWxVyF4BTBLFTM3BTBLFycnFoFwFlWnFoFyFAW1QAWxVxW1VlOxFaWxVyM1BTBLFTMyBTBLFTonFoFwFlHnFoFwGaW1QAWxVxW1VlOwGxWxVyOxBTBLFTOxBTBLSAWxVyOwFAWxVyWnGWVnFoFnGWMwFLJnFoFwBTBLFTHbBTBLFAWxVyOqGAWxVyHnGWVnGWVnFlonFbBhBTM4GLFnFoFbSRWxVxW1VaW1VlVyBTBLGLonFoFyGaWxVyWwBTBLFyWnFoF1GAW1QAWxVxW1VlFyBTBLGTcnFoFyFxWxVyW2BTBLFyFnFoF1GaW1QAW1QAWxSRWyVeinFls1GaWxVyMqBTBLBTXABTXAGTcnFoFxFAWxVycbBTBLFTonFoF2SRWxVyMxBTXOBTBLBTXAGyVnFoFxGRWxVyJ2BTBLFlFnFoF4FAWxVyM1BTXOBTBLBTXASLVnFoFxGxWxVys3BTBLFlOnFoF4GaWxVyFwBTXOBTBLBTXASLWnFoFbFAWxVysyBTBLGLFnFoF4FxWxVyVyBTXOBTXOBTM5BTGAJAWxSLsyBTBLGLFnFlonFbBiBTM4BTM5BTGAfxWxSLs4BTBLFlJnFoFnGWMnGWM4SAWxVyM3BTBLSTOnFoFxSRWxVyowBTBLFyMnGWVnFoFnGWM5FRWxVyF1BTBLSTHnFoFySRWxVyoqBTBLGLMnGWVnFoFnGWM4SRWxVyV2BTBLSTOnFoF1FRWxVyowBTBLGTOnGWVnGWVnFlonFbBhBTM4STMnFoFxSRWxVxW1VaW1VloxBTBLFlonFoF5FxWxVyF1BTBLSTWnFoFySAW1QAWxVxW1Vlo2BTBLGLMnFoFwFLHnFoFbSAWxVyOqFAWxVyV4BTXOBTXOBTM5BTGAfxWxSLo2BTBLFyOnFoFnGWMnGWM5GaWxVyFwBTBLFTHwBTBLFyMnFoFwFLFnFoFyGaW1QAWxVxW1VlOqGRWxVyVqBTBLFTHbBTBLGLWnFoFwFLVnFoFbGRW1QAW1QAWxSRWyVeinFlswFLWnFoFySAWxVxW1VaW1VlOqGRWxVyF4BTBLFTOqBTBLFysnFoFwFLonFoFbFRW1QAWxVxW1VlOqSAWxVyV1BTBLFTH1BTBLGLonFoFwFLJnFoF1FRW1QAWxVxW1VlOwFAWxVyWyBTBLFTObBTBLGTVnFoFwFTVnFoF1GAW1QAW1QAWxSRWyVeinFlswFTHnFoFbFaWxVxW1VaW1VlOwFAWxVyVxBTBLFTOxBTBLGLVnFoFwFTMnFoFbGxW1QAWxVxW1VlOwFaWxVyV5BTBLFTOxBTBLGLonFoFwFTMnFoFbSRW1QAW1QAWxSRWyVeinFlswFTFnFoFbGAWxVxW1VaW1VlOwFxWxVyVbBTBLFTObBTBLGLsnFoFwFTcnFoFbSRW1QAWxVxW1VlOwSAWxVyV5BTBLFTMqBTBLGTHnFoFwFlHnFoF1FAW1QAW1QAWxSRWyVeinFls1GAWxVyMqBTBLBTXABTXAGTVnFoFxFAWxVyV5BTBLFlMnFoF1FAWxVyM2BTXOBTBLBTXAGTOnFoFyFAWxVyWqBTBLFyMnFoF1FAWxVyFxBTXOBTXOBTM5BTGAfxWxSLV4BTBLFlVnFoFnGWMnGWMbSAWxVyMbBTBLGLWnFoFxFaWxVyV2BTBLFlcnGWVnFoFnGWMbGaWxVyFqBTBLGTMnFoFyFaWxVyWqBTBLFycnGWVnFoFnGWMbSRWxVyVqBTBLGLJnFoFbFRWxVyV3BTBLGLOnGWVnGWVnFlonFbBhBTM4GLFnFoFxSRWxVxW1VaW1VlVyBTBLFlonFoFySRWxVyFxBTBLFyonFoFyGAW1QAWxVxW1VlVqBTBLFycnFoFbGAWxVyF3BTBLGLMnFoFySRW1QAWxVxW1VlF5BTBLGLOnFoFyGaWxVyVxBTBLFycnFoFbFaW1QAW1QAWxSRWyVe8nFlsnFlonGbQzDewgIeXLc0HnFbVnFlrxI3XkdAWxGxWyVeOkIEnkdWgpfY4nFbVnFlrxI3XkdAWxGxWyVeOkIYnbd0BFfY1grAWyQLOqBTGAcR5ifY5nX2norEsnFbV1BTGAcR5yrUBpf2XTrUnidRWyQAWxGxWxF2dedededaWxGxWyVeWnFlsnFlonFbBzDewgIeX0fYQbfAWyQLOnFbBzDuGbJe9hdXGbPYwnBTGOBTM3BTMyFLHqFLHqBTM3BTGAdRWxSAWxSRWyVeVkdeniINGbPYwnBTGOBTM3BTMyFLHqFLHqBTM3BTGAdA5efYwiXEX4rAWxSAWxG1G6cYwpIe5zBTMqBWW5JxWxFOGgc2OnFlJnFoFxGLHnFoFbGTHnFlonFbBoDeQxc0rBIYNudRWxSEFnFoFxFAWxVyM5FAWxSRWyVaW3QAW3QAWxSRWxSEGbPAWxSVKK"));
	}

	this.draw = function(){
		var size = items.getGraphSize();
		canvas.width = size.width;
		canvas.height = size.height;
		canvas.style.width = size.width+"px";
		canvas.style.height = size.height+"px";

		if(Prefs.container.fitHeight){
			container.style.height = (size.height + 30)+"px";
		}

		// this.drawConnections();
		this.drawItems();
		
	}

	this.clearFollows = function(id){
		var follows = items.getFollows(id);

		for(var i = 0; i < follows.length; i++){
			if(follows[i].properties.status != "normal"){
				EventBus.dispatch("clearFollows", this, follows[i].id);
			}
		}
		var item = items.getItemById(id);
		item.properties.status = "normal";
		EventBus.dispatch("redrawItem", this, id);
	}

	this.redrawEventHandler = function(eventarg, arg){
		this.drawItem(arg);
	}

	this.clearCursorEventHandler = function(){
		canvas.style.cursor = "default";
		EventBus.dispatch("clearHighlights", this);
	}

	this.clearHighlightsEventHandler = function(){
		var itemList = items.getItems();
		for(var i = 0; i < itemList.length; i++){
			if(itemList[i].properties.highlight){
				itemList[i].properties.highlight = false;
				EventBus.dispatch("redrawItem", this, itemList[i].id);
			}
		}
	}

	this.serialize = function(){
		return items.serialize();
	}

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

	this.click = function(){};
	this.hovered = function(){};

	this.addJSON = function(data, clear){
		if(data.items == undefined || data.items.length == 0){
			return;
		}

		if(clear == true){
			items.clear();
		}

		for(var i = 0; i < data.items.length; i++){
			items.addItem(data.items[i]);
		}

		for(var i = 0; i < data.connections.length; i++){
			if(data.connections[i].needed instanceof Array){
				for(var j = 0; j < data.connections[i].needed.length; j++){
					items.addConnection(data.connections[i].item, data.connections[i].needed[j]);
				}
			}else{
				items.addConnection(data.connections[i].item, data.connections[i].needed);
			}
		}
	}

	this.getItems = function(){
		var itemList = items.getItems(),
			returnList = new Array();

		for(var i = 0; i < itemList.length; i++){
			var clone = JSON.parse(JSON.stringify(itemList[i]));
			clone.active = itemList[i].properties.status == "completted" ? true : false;
			delete clone.properties;

			returnList.push(clone);
		}

		return returnList;
	}

	this.clearSelection = function(){
		items.clearSelection();
	}

}