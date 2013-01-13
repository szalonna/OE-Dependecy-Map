Hierarchical-dependency-graph
=============================

Displays hierarchical dependency graph.

# Dependency

* [krasimir's EventBus implementation][]

# Requirement

* HTML5 compatibile browser with Canvas support

# Syntaxt

## Create the graph drawer

Create a container div

	<div id="container"></div>

Includes the proper Javascript libs in the correct order

 	<script type="text/javascript" src="EventBus.js"></script>
	<script type="text/javascript" src="hgraph.js"></script>

Create GraphDrawer object

	var graph = new GraphDrawer(document.getElementById("container"))

## Adding items and connections

Minimal properties of item
* id - identifier
* name - what to display
* level - level of item

Any other properties can be added, but must differs from "properties".

### One-by-one

	graph.addItem({
		"id": "obj1".
		"name": "Obejct one",
		"level": 1
	});
	graph.addItem({
		"id": "obj2".
		"name": "Obejct two",
		"level": 2
	});
	graph.addConnection("obj2", "obj1");
	graph.draw();

addConnection detects if obj1 is at higher level and sets the proper way.

### From JSON
	
JSON syntax
	
	{
		"items": [
			{
				"id": "obj1a",
				"name": "Obejct one A",
				"level": 1
			},{
				"id": "obj1b",
				"name": "Obejct one B",
				"level": 1
			},{
				"id": "obj2",
				"name": "Obejct two",
				"level": 2
			},{
				"id": "obj3",
				"name": "Obejct three",
				"level": 2
			}
		],
		"connections": [
			{
				"item": "obj2",
				"needed": "obj1a"
			},{
				"item": "obj3",
				"needed": [
					"obj1a",
					"obj1b"
				]
			}
		]
	}

...and the Javascript code based on jQuery

	$.getJSON('items.json', function(data) {
		graph.addJSON(data);
		graph.draw();
	});

## Create hash code of settings

Example

	<textarea id="hash" readonly="readonly"></textarea>
	<input type="button" id="decode" value="Decode" />

Javascript

	graph.click = function(item, e){
		document.getElementById("hash").value = graph.serialize();
	}
	document.getElementById("decode").onclick = function(e){
		var data = document.getElementById("hash").value;
		if(data.length > 0){
			graph.unserialize(data);
		}
	}

## Prefrences

hgraph.js contains a Prefs object. Here you can set the items font, padding, margin, colors, column's margin, etc.

[krasimir's EventBus implementation]: https://github.com/krasimir/EventBus
