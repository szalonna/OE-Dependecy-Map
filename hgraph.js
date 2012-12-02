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

var Prefs = {
	item: {
		font: "9px Arial",
		lineHeight: 12,
		maxTextLength: 120,
		padding: 3,
		margin: 2,
		height: 30,
		cornerRadius: 3,
	},
	column: {
		margin: 50
	},
	connection: {
		color: "rgba(0,0,0,.2)",
		width: 1
	},
	container: {
		fitHeight: true
	},
	colors: {
		"normal":     "#0268A6",
		"completted": "#79C900",
		"canjoin":    "#F69A21"
	},
	canvas: {
		padding: 10
	}
};

var GraphDrawer = function(container){
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

	var Drawer = function(ctx){
		this.roundRect = function(startPoint, size, radius) {
			if (typeof radius === "undefined") {
				radius = 5;
			}

			ctx.beginPath();
			ctx.moveTo(startPoint.x + radius, startPoint.y);
			ctx.lineTo(startPoint.x + size.width - radius, startPoint.y);
			ctx.quadraticCurveTo(startPoint.x + size.width, startPoint.y, startPoint.x + size.width, startPoint.y + radius);
			ctx.lineTo(startPoint.x + size.width, startPoint.y + size.height - radius);
			ctx.quadraticCurveTo(startPoint.x + size.width, startPoint.y + size.height, startPoint.x + size.width - radius, startPoint.y + size.height);
			ctx.lineTo(startPoint.x + radius, startPoint.y + size.height);
			ctx.quadraticCurveTo(startPoint.x, startPoint.y + size.height, startPoint.x, startPoint.y + size.height - radius);
			ctx.lineTo(startPoint.x, startPoint.y + radius);
			ctx.quadraticCurveTo(startPoint.x, startPoint.y, startPoint.x + radius, startPoint.y);
			ctx.closePath();
	   	}

		this.colorBrightness = function(color){
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
	}

	var ItemHandler = function(){
		var items       = new Array(),
			connections = new Array(),
			columns     = new Array(),
			base64      = new Base64Class();

		this.addItem = function(item){
			if(this.getItemById(item.id) != undefined){
				return;
			}

			if(columns[item.level] == undefined){
				columns[item.level] = {
					x: (item.level - 1)*(Prefs.item.maxTextLength + Prefs.column.margin + 2*Prefs.item.padding + Prefs.item.margin) + Prefs.item.margin + Prefs.canvas.padding,
					y: Prefs.item.margin + Prefs.canvas.padding
				};
			}

			item.properties = {
				status: "canjoin",
				highlight: false,
				hovered: false,
				position: {
					x: columns[item.level].x,
					y: columns[item.level].y
				},
				size: {
					width: Prefs.item.maxTextLength + 2*Prefs.item.padding,
					height: Prefs.item.height + 2*Prefs.item.padding
				}
			}
			items.push(item);

			columns[item.level].y += Prefs.item.margin + 2*Prefs.item.padding + Prefs.item.height;
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

		this.doRoots = function(item, func, content){
			var roots = this.getRoots(item)
			if(roots.length == 0){
				func(content, item);
			}else{
				for(var i = 0; i < follows.length; i++){
					this.doRoots(follows[i], func, content);
				}
				func(content, item);
			}
		}

		this.doFollows = function(item, func, content){
			var follows = this.getFollows(item);
			if(follows.length == 0){
				//func(content, item);
			}else{
				for(var i = 0; i < follows.length; i++){
					this.doFollows(follows[i], func, content);
				}
				//func(content, item);
			}
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
				width:	width + Prefs.item.maxTextLength + 2*Prefs.item.margin + Prefs.item.padding,
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
				this.getItemById(decoded[i]).properties.status = "completted";
			}
			EventBus.dispatch("redrawAll", this);
		}

		this.refresh = function(){
			for(var i = 0; i < items.length; i++){
				items[i].properties.status = this.getStatus(items[i].id);
			}
		}
	}

	var canvas = container.appendChild(document.createElement("canvas")),
		ctx	   = canvas.getContext("2d"),
		drawer = new Drawer(ctx);
		items  = new ItemHandler();

	container.style.overflow = "auto";

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

		items.getHoveredItem(mousePoint);
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

		drawer.roundRect(
			item.properties.position,
			item.properties.size,
			Prefs.item.cornerRadius
		);

		ctx.fillStyle = Prefs.colors[item.properties.status];
		ctx.fill();

		if(item.properties.hovered || item.properties.highlight){
			ctx.fillStyle = "rgba(255,255,255,.3)";
			ctx.fill();
			canvas.style.cursor = "pointer";
		}
		lingrad = ctx.createLinearGradient(
			item.properties.position.x,
			item.properties.position.y,
			item.properties.position.x,
			item.properties.position.y + item.properties.size.height);

		lingrad.addColorStop(  0, "rgba(255, 255, 255,.2)");
		lingrad.addColorStop( .3, "rgba(255, 255, 255, 0)");
		lingrad.addColorStop( .8, "rgba(0, 0, 0, 0)");
		lingrad.addColorStop(  1, "rgba(0, 0, 0,.1)");

		ctx.fillStyle = lingrad;
		ctx.fill();

		var words = item.name.split(" "),
			text = new Array(),
			t_text = "";

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

		ctx.font = Prefs.item.font;
		ctx.textAlign = "center";
		ctx.fillStyle = drawer.colorBrightness(Prefs.colors[item.properties.status]) > 100 ? "#222" : "#fff";
		for(var i = 0; i < text.length; i++){
			ctx.fillText(
				text[i],
				item.properties.position.x + item.properties.size.width / 2,
				item.properties.position.y + Prefs.item.padding + (i+1)*Prefs.item.lineHeight);
		}

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

		this.drawConnections();
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
	EventBus.addEventListener("publicClickEvent", function(e, item, eventarg){ this.click(item, eventarg); }, this);
	
	EventBus.addEventListener("redrawAll", function(){
		ctx.clearRect(0,0,canvas.width, canvas.height);
		items.refresh();
		this.draw();
	}, this);

	this.click = function(){};

	this.addJSON = function(data){
		if(data.items == undefined || data.items.length == 0){
			return;
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
}