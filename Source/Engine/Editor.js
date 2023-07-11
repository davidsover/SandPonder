//slightly more carefully constructed by davidsover :b
//{
	
	let editorCanvas;
	let editorCtx;
	
	let editorMousePos = {x: 0, y: 0};
	let editorMouseCollumn = "";
	
	let editorInputs = []; //ex: inputs.KeyW
	
	
	let editorBoxes = [];
	
	//let editorBounds = []; //todo and name it better
	
	
	let editorMargin = {x: 0.02, y: 0.0125}; //editorMargin.x is more like tab indent size
	
	let editorTextMarginX = 0.005;
	
	
	let editorArray = {data: [], code: []};
	
	let editorCamera = {data: {x: 0, y: 0}, code: {x: 0, y: 0}, tools: {x: 0, y: 0}};
	
	let editorWindows = {data: {x: 0, y: 0, w: 0.29, h: 1}, code: {x: 0.3, y: 0, w: 0.49, h: 1}, tools: {x: 0.8, y: 0, w: 0.19, h: 1}};
	
	
	let editorSelectedBox = {collumn: "", num: 0};
	
	
	let previousEditorElement = "";
	
	
	//these should be updated if SpaceTode gets more keywords:
	
	let emptyValues = ["", "{", "}", "(", ")"];
	
	let ruleSymbols = ["@", "_", "#", "x", "!", "?" ,"<" ,">", ".", "*", "$", "=", ">", " "];
	
	let symbolTexts = ["symbol", "given", "select", "change", "keep"];
	
	let properties = ["element", "colour", "emissive", "opacity", "visible", "hidden", "category", "pour", "default"]; //these get saved under 'data', everything else goes under 'code'
	
	
	
	{ //Editor Canvas
		
		function createEditorCanvas(){
			editorCanvas = document.getElementById("editorCanvasId");
			editorCtx = editorCanvas.getContext("2d");
			
			document.onkeydown = setEditorKeyDown;
			document.onkeyup = setEditorKeyUp;
			
			editorCanvas.addEventListener("mousedown", onEditorMouseDown);
			editorCanvas.addEventListener("mouseup", onEditorMouseUp);
			editorCanvas.addEventListener('mousemove',onEditorMouseMove);
			editorCanvas.addEventListener('wheel', onEditorMouseWheel, {passive: true});
		}
		
		function resizeEditor(){
			if (typeof editorCanvas !== "undefined"){
				editorCanvas.width = window.innerWidth;
				editorCanvas.height = window.innerHeight - 35;
				
				drawEditor();
			}
		}
	}
	
	{ //Hitbox
		
		function isVertexInRect(v, r){
			return (v.x >= r.x && v.x <= r.x + r.w &&
				v.y >= r.y && v.y <= r.y + r.h);
		}
	}
	
	
	{ //SpaceTode to Array
		
		{ //Regex Functions
			
			function getTextInsideBrackets(text){ //https://stackoverflow.com/a/1493071/12777947
				return text.match(/\[(.*?)\]/)[1];
			}
			
			function getTextInsideParentheses(text){ //https://stackoverflow.com/a/17779833/12777947
				return text.match(/\(([^)]+)\)/)[1];
			}
		}
		
		
		function isTextRule(text, additionalSymbols){
			if (additionalSymbols != undefined){
				ruleSymbols = ruleSymbols.concat(additionalSymbols);
			}
			
			
			let isTextRule = true;
			
			for (let letter of text){
				if (!ruleSymbols.includes(letter)){
					isTextRule = false;
				}
			}
			return isTextRule;
		}
		
		
		function getSelectedElementSourceArray(){
			//before this you should turn maybe(1/100) @=>@ into maybe(1/100){/n @=>@ /n}, same with all(xyz.directions) and action words
			//and element DReg any(xyz.directions){ }
			
			//also: 'if's and stuff like 'self.stickyInit = true' should be treated as value only (in element: Sticky)
			
			let sourceText = UI.selectedElement.source;
			
			let lines = sourceText.split(/([\n{}])/);
			
			lines = lines.filter(e => e != "\n" && e != "\t"); //removes singlular '\n's and '\t's
			
			let elementName = UI.selectedElement().element.name;
			
			let sourceArray = [];
			
			let blockNum = -1;
			
			let isRule = false;
			
			let currentSymbols = [];
			
			
			let scopedValues = {currentSymbols: []};
			
			
			for (let i = 0; i < lines.length - 0; i++){
				let text = lines[i];
				
				
				let lineData = {type: "", value: "", leadingText: ""};
				
				
				let leadingSpaces = "";
				
				while (text.length > 0 && (text[0] == "\t" || text[0] == " ")){
					lineData.leadingText += text[0];
					
					text = text.substring(1);
					
					
					if (text[0] == " "){
						leadingSpaces += text[0];
					} else if (text[0] == "\t"){
						leadingSpaces = "";
					}
				}
				
				
				if (text.includes("=>")){
					isRule = isTextRule(text, currentSymbols);
				} else{
					if (isRule){
						if (!isTextRule(text, currentSymbols) || text == ""){
							isRule = false;
						}
					} else{
						if (text != ""){
							isRule = isTextRule(text, currentSymbols);
						}
					}
				}
				
				if (!isRule){
					let words = text.split(" ");
					
					for (let i in words){
						if (lineData.type == ""){
							lineData.type = words[i];
						} else{
							if (lineData.type == "prop" || lineData.type == "arg"){
								lineData.type += " " + words[i];
							} else{
								if (lineData.value != ""){
									lineData.value += " ";
								} else{
									if (symbolTexts.includes(lineData.type)){
										currentSymbols.push(words[i]);
										
										scopedValues.currentSymbols.push({blockNum: blockNum, index: currentSymbols.length - 1});
									}
								}
								lineData.value += words[i];
							}
						}
					}
				} else{
					lineData.type = "ruleText";
					
					lineData.value = leadingSpaces + text;
				}
				
				
				if (lineData.type == "{"){
					blockNum++;
				}
				if (lineData.type == "}"){
					blockNum--;
				}
				
				for (let j in scopedValues){
					for (let k = scopedValues[j].length - 1; k >= 0; k--){
						if (j == "currentSymbols"){
							if (scopedValues[j][k].blockNum > blockNum){
								currentSymbols.splice(scopedValues[j][k].index, 1);
								
								scopedValues[j].splice(k, 1);
							}
						}
					}
				}
				
				lineData.blockNum = blockNum;
				
				sourceArray.push(lineData);
			}
			return sourceArray;
		}
		
		
		
		function getRuleTextArrowPos(textArr){
			let arrowPos = -1;
			
			for (let line of textArr){
				if (line.includes("=>")){
					arrowPos = line.indexOf("=>");
				}
			}
			return arrowPos;
		}
		
		function getRuleTextRuleSides(textArr){
			let ruleSides = [[],[]];
			
			let arrowPos = getRuleTextArrowPos(textArr);
			
			for (let line of textArr){
				let sides = ["", ""];
				
				for (let letterNum in line){
					let letter = line[letterNum];
					
					if (letterNum < arrowPos){
						sides[0] += letter;
					} else if (letterNum > arrowPos + 1){
						sides[1] += letter;
					}
				}
				
				ruleSides[0].push(sides[0]);
				ruleSides[1].push(sides[1]);
			}
			return ruleSides;
		}
		
		function getRuleTextAsArray(textArr){
			let arr = [];
			
			let ruleSides = getRuleTextRuleSides(textArr);
			
			
			for (let i in ruleSides){
				let rulePos = {left: -1, right: -1};
				
				for (let line of ruleSides[i]){
					for (let letterNum = 0; letterNum < line.length; letterNum++){
						let letter = line[letterNum];
						
						if (letter != " "){
							
							for (let side in rulePos){
								if (rulePos[side] == -1){
									rulePos[side] = letterNum;
								} else{
									
									if (side == "left"){
										if (rulePos[side] > letterNum){
											rulePos[side] = letterNum;
										}
									} else{
										if (rulePos[side] < letterNum){
											rulePos[side] = letterNum;
										}
									}
								}
							}
						}
					}
				}
				
				
				for (let lineNum in ruleSides[i]){
					ruleSides[i][lineNum] = ruleSides[i][lineNum].slice(rulePos.left, rulePos.right + 1);
					
					
					while (ruleSides[i][lineNum].length < (rulePos.right - rulePos.left + 1)){
						ruleSides[i][lineNum] += " ";
					}
				}
			}
			
			return ruleSides;
		}
	}
	
	
	{ //Editor Array
	
		function getEditorArrayFromSourceArray(){
			let sourceArray = getSelectedElementSourceArray();
			
			let editorArray = {data: [], code: []};
			
			let propertyBlockNum = -1;
			
			let lastRuleNum = 0;
			
			
			for (let i = 0; i < sourceArray.length; i++){ 			//sounds like sorcery
				if (!emptyValues.includes(sourceArray[i].type)){
					
					if (editorArray.code.length == 0 && (properties.includes(sourceArray[i].type) || sourceArray[i].type.includes("prop ") || sourceArray[i].type.includes("arg "))){
						
						if (i + 1 < sourceArray.length){
							editorArray.data.push(sourceArray[i]);
							
							if (sourceArray[i].value.includes("=>") && sourceArray[i].blockNum < sourceArray[i + 1].blockNum){
								propertyBlockNum = sourceArray[i].blockNum;
								
								editorArray.data[editorArray.data.length - 1].block = [];
							} else{
								propertyBlockNum = -1;
							}
						}
					} else{
						if (propertyBlockNum != -1){
							if (propertyBlockNum >= sourceArray[i].blockNum){
								propertyBlockNum = -1;
							}
						}
						
						if (propertyBlockNum != -1){
							
							editorArray.data[editorArray.data.length - 1].block.push(sourceArray[i]);
							
						} else{
							//isn't a property
							
							
							if (sourceArray[i].type == "ruleText"){
								let isNewRule = true;
								
								if (i > 0){
									if (sourceArray[i - 1].type == "ruleText"){
										isNewRule = false;
									}
								}
								
								if (isNewRule){
									let codeArr = {type: "ruleText", value: [], blockNum: sourceArray[i].blockNum};
									
									editorArray.code.push(codeArr);
									
									lastRuleNum = editorArray.code.length - 1;
								}
								
								editorArray.code[lastRuleNum].value.push(sourceArray[i].value);
							} else{
							
								editorArray.code.push(sourceArray[i]);
							}
						}
					}
				}
			}
			
			
			return editorArray;
		}
	}
	
	
	
	{ //Editor Boxes
		
		let blockArr;
		let boxY;
		
		function getBoxWidthFromLabel(label){
			return label.length * 0.004585 + editorTextMarginX * 2;
		}
		
		
		function getEditorBoxDefaultPos(i){
			let previousBoxBottomY = 0;
			
			if (editorBoxes[i].length > 0){
				previousBoxBottomY = editorBoxes[i][editorBoxes[i].length - 1].y + editorBoxes[i][editorBoxes[i].length - 1].h;
			}
			
			return {x: 0, y: previousBoxBottomY + editorMargin.y, w: 0.1, h: 0.025};
		}
		
		function getBoxPos(i, valueArr, parentBox){
			let pos = getEditorBoxDefaultPos(i);
			
			pos.y += boxY;
			
			pos.x += blockArr.blockNum * editorMargin.x;
			
			
			if (valueArr != undefined){
				if (valueArr.length == 1){
					pos.y -= pos.h + editorMargin.y;
				} else{
					pos.x = editorMargin.x;
				}
			}
			
			if (parentBox != undefined){
				pos.x += getBoxWidthFromLabel(parentBox.label);
			}
			
			return pos;
		}
		
		function getBox(i, data, valueArr, parentBox){
			let box = getBoxPos(i, valueArr, parentBox);
			
			for (let i in data){
				box[i] = data[i];
			}
			
			
			return box;
		}
		
		function getEditorBoxesAndValues(i, j){
			let boxes = [];
			
			if (boxY == undefined){
				boxY = 0;
			}
			
			
			let box = getBox(i, {label: blockArr.type, type: "text", id: {boxNum: j, valueNum: -1}});
			
			boxes.push(box);
			
			boxY += box.h + editorMargin.y;
			
			
			
			let valueArr = blockArr.value;
			
			if (!Array.isArray(valueArr)){
				valueArr = [blockArr.value];
			}
			
			if (box.label == "ruleText"){
				let ruleArr = getRuleTextAsArray(valueArr);
				
				let valueBoxPos = getBoxPos(i, valueArr, box);
				
				let width = getBoxWidthFromLabel(" ");
				
				let sideWidth = ruleArr[0][0].length * width * 1.1;
				
				
				let arrowBox = {...valueBoxPos};
				
				arrowBox.x += sideWidth * 1.5 - width/2 - width * 0.0485;
				
				arrowBox.label = "▶";
				arrowBox.type = "text";
				arrowBox.id = {boxNum: j, valueNum: -1};
				
				boxes.push(arrowBox);
				
				
				for (let sideNum in ruleArr){
					for (let heightNum in ruleArr[sideNum]){
						for (let k in ruleArr[sideNum][heightNum]){
							
							let letter = ruleArr[sideNum][heightNum][k];
							
							let valueBox = {...valueBoxPos};
							
							
							valueBox.x += k * width * 1.1;
							
							if (sideNum > 0){
								valueBox.x += sideWidth * 2;
							}
							
							valueBox.y += heightNum * valueBox.h * 1.1;
							
							
							valueBox.label = letter;
							valueBox.type = "ruleLetter";
							valueBox.id = {boxNum: j, valueNum: {side: sideNum, height: heightNum, num: k}};
							
							
							boxes.push(valueBox);
						}
					}
				}
			} else{
				for (let valueNum in valueArr){
					if (valueArr[valueNum] != "" && blockArr.block == undefined){
						
						let valueBox = getBox(i, {label: valueArr[valueNum], type: "value", id: {boxNum: j, valueNum: valueNum}}, valueArr, box);
						
						boxes.push(valueBox);
						
						boxY += valueBox.h + editorMargin.y;
						
					} else{
						if (blockArr.block != undefined){
							
							let currentBlockArr = blockArr.block;
							
							for (let blockNum in currentBlockArr){
								
								let currentBoxY = boxY;
								
								blockArr = currentBlockArr[blockNum];
								
								let blockBoxes = getEditorBoxesAndValues(i, j);
								
								for (let blockBox of blockBoxes){
									boxes.push(blockBox);
									
									currentBoxY += editorMargin.y;
									
									boxY = currentBoxY;
								}
							}
						}
					}
				}
			}
			return boxes;
		}
		
		
		function refreshEditorBoxes(){
			editorArray = getEditorArrayFromSourceArray();
			
			editorBoxes = {data: [], code: []};
			
			
			for (let i in editorArray){
				for (let j = 0; j < editorArray[i].length; j++){
					
					boxY = 0;
					
					blockArr = editorArray[i][j];
					
					let boxes = getEditorBoxesAndValues(i, j);
					
					for (let box of boxes){
						box.x += editorWindows[i].x;
						box.y += editorWindows[i].y;
						
						editorBoxes[i].push(box);
					}
				}
			}
			
			
			for (let i in editorCamera){
				editorCamera[i].x = 0;
				editorCamera[i].y = 0;
			}
		}
	}
	
	{ //Draw
		
		function drawScaledRectangle(r, collumn){
			let cameraPos = {x: 0, y: 0};
			
			if (collumn != undefined){
				cameraPos = {
					x: editorCamera[collumn].x,
					y: editorCamera[collumn].y
				}
			}
			
			editorCtx.fillRect(
				(r.x - cameraPos.x) * editorCanvas.width,
				(r.y - cameraPos.y) * editorCanvas.height,
				r.w * editorCanvas.width,
				r.h * editorCanvas.height
			);
		}
		
		function drawScaledText(text, x, y, collumn){
			editorCtx.fillText(text, (x - editorCamera[collumn].x) * editorCanvas.width, (y - editorCamera[collumn].y) * editorCanvas.height);
		}
		
		
		function drawEditorBoxes(){
			if (previousEditorElement != UI.selectedElement().element.name){
				refreshEditorBoxes();
				
				previousEditorElement = UI.selectedElement().element.name
			}
			
			for (let collumn in editorBoxes){
				editorCtx.fillStyle = "#222222";
				
				drawScaledRectangle(editorWindows[collumn]);
				
				for (let i in editorBoxes[collumn]){
					let box = editorBoxes[collumn][i];
					
					if (i > 1 || collumn == "code"){
						
						box.w = getBoxWidthFromLabel(box.label);
						
						
						editorCtx.fillStyle = (box.type == "text") ? "#484848" : "#181818";
						
						if (collumn == editorSelectedBox.collumn && i == editorSelectedBox.num){
							editorCtx.fillStyle = "#B818B8";
						}
						
						drawScaledRectangle(box, collumn);
						
						
						editorCtx.fillStyle = "#F8F8F8";
						
						drawScaledText(box.label, box.x + editorTextMarginX, box.y + box.h - 0.0075, collumn);
					}
				}
			}
			
			//this will happen in the for loop later
			editorCtx.fillStyle = "#383838";
			
			drawScaledRectangle(editorWindows.tools);
		}
		
		function drawEditor(){
			editorCtx.fillStyle = "#333333";
			editorCtx.fillRect(0, 0, editorCanvas.width, editorCanvas.height);
			
			editorCtx.font = (editorCanvas.width / 120) + "px Consolas";
			
			drawEditorBoxes();
			
			
			editorCtx.fillStyle = "#D8D8D8";
			editorCtx.fillText("*Work In Progess* [Element Name: " + UI.selectedElement().element.name + "]", 0, 32);
		}
	}
	
	
	function toggleEditor(){
		
		if (editorCanvas == undefined){
			createEditorCanvas();
		}
		
		if (isEditorEnabled){
			document.getElementById("editorCanvasId").style.display = "inline-block";
			
			resizeEditor();
			
			drawEditor();
			
			paused = true;
			
		} else{
			document.getElementById("editorCanvasId").style.display = "none";
			
			paused = false;
		}
	}
	
	
	{ //Editor Listeners
		
		{ //Keyboard
			
			function setEditorKeyDown(e){
				if (isEditorEnabled){
					e = e || window.event;
					editorInputs[e.code] = true;
				}
			}
			
			function setEditorKeyUp(e){
				e = e || window.event;
				editorInputs[e.code] = false;
			}
		}
		
		{ //Mouse
			
			function onEditorMouseDown(event){
				if (isEditorEnabled){
					setEditorMousePos(canvas, event);
					
					
					editorSelectedBox = {collumn: "", num: 0};
					
					for (let i in editorBoxes[editorMouseCollumn]){
						if (isVertexInRect(editorMousePos, editorBoxes[editorMouseCollumn][i])){
							editorSelectedBox = {collumn: editorMouseCollumn, num: i};
						}
					}
					
					drawEditor();
				}
			}
			
			function onEditorMouseUp(event){
				if (isEditorEnabled){
					setEditorMousePos(canvas, event);
				}
			}
			
			function onEditorMouseMove(event){
				if (isEditorEnabled){
					setEditorMousePos(canvas, event);
				}
			}
			
			
			function onEditorMouseWheel(event){
				if (isEditorEnabled){
					setEditorMousePos(canvas, event);
					
					if (editorCamera[editorMouseCollumn] != undefined){
						editorCamera[editorMouseCollumn].y += event.deltaY/2500;
						
						drawEditor();
					}
				}
			}
			
			
			function setEditorMousePos(canvas, event) {
				let rect = canvas.getBoundingClientRect();
				
				editorMousePos = {
					x: (event.clientX - rect.left) / editorCanvas.width,
					y: (event.clientY - rect.top - 35) / editorCanvas.height
				};
				
				
				
				editorMouseCollumn = "";
				
				for (let i in editorWindows){
					if (isVertexInRect(editorMousePos, editorWindows[i])){
						editorMouseCollumn = i;
					}
				}
				
				if (editorMouseCollumn != ""){
					editorMousePos.x += editorCamera[editorMouseCollumn].x;
					editorMousePos.y += editorCamera[editorMouseCollumn].y;
				}
			}
		}
	}
//}