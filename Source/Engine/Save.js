{
	let globalGridLoadState = {arr: [], y: -1};
	
	function loadWorldGridFromArray(arr, y){
		if (arr != undefined){
			globalGridLoadState = {arr: arr, y: y};
		} else{
			arr = globalGridLoadState.arr;
			y = globalGridLoadState.y;
		}
		
		if (y == -1 || y == undefined){
			y = arr[0][0][1];
			globalGridLoadState.y = y;
		}
		
		let didDrop = false;
		for (let i in arr[y]){
			dropAtomCall(arr[y][i][0], arr[y][i][1], arr[y][i][2]);
			
			didDrop = true;
		}
		
		globalGridLoadState.y++;
		
		if (globalGridLoadState.y < arr.length){
			let timeoutLength = (didDrop) ? 50 : 1;
			
			setTimeout(loadWorldGridFromArray, timeoutLength);
		}
	}
	
	function saveWorldGridAsArray(){
		let arr = [];
		
		for (let i in world.grid){
			arr[i] = [];
			for (let j in world.grid[i]){
				for (let k in world.grid[i][j]){
					if (world.grid[i][j][k].atom.visible){
						arr[i].push([Number(j), Number(i), Number(k)]);
					}
				}
			}
		}
		return arr;
	}
	
	function saveWorldGridToInput(isBottomOnly){
		if (isBottomOnly){
			document.getElementById("saveId").value = "[" + JSON.stringify(saveWorldGridAsArray()[0]) + "]";
		} else{
			document.getElementById("saveId").value = JSON.stringify(saveWorldGridAsArray());
		}
	}
	
	
	function copyWorldGridSave(){
		navigator.clipboard.writeText(document.getElementById("saveId").value);
	}
	
	
	function loadWorldGrid(){
		let arr = JSON.parse(document.getElementById("loadId").value); //parse never went wrong in the history of humanity
		
		loadWorldGridFromArray(arr);
	}
	
	
	
	
	function getFaceAsSortedText(v1, v2, v3, v4){
		let arr = [v1, v2, v3, v4];
		let textArr = [];
		
		for (let i in arr){
			textArr.push(arr[i][0] + "," + arr[i][1] + "," + arr[i][2])
		}
		
		textArr.sort((a, b) => a.localeCompare(b)); //https://stackoverflow.com/a/45544166/12777947
		
		return textArr;
	}
	
	
	function getWorldGridAsObjectFile(){
		let text = "";
		
		let arr = saveWorldGridAsArray();
		
		let faceVertexNums = [
			[0, 1, 2, 3],
			[4, 5, 6, 7],
			[0, 1, 4, 5],
			[2, 3, 6, 7],
			[0, 2, 4, 6],
			[1, 3, 5, 7]
		];
		
		let faces = [];
		let faceExistanceArr = {};
		
		for (let i in arr){
			for (let j in arr[i]){
				
				let vertices = [];
				
				for (let x = 0; x < 2; x++){
					for (let y = 0; y < 2; y++){
						for (let z = 0; z < 2; z++){
							vertices.push([arr[i][j][0] + x, arr[i][j][1] + y, arr[i][j][2] + z]);
						}
					}
				}
				
				for (let face of faceVertexNums){
					let faceText = getFaceAsSortedText(vertices[face[0]], vertices[face[1]], vertices[face[2]], vertices[face[3]]);
					
					if (faceExistanceArr[faceText] == undefined){
					
						faces.push([vertices[face[0]], vertices[face[1]], vertices[face[2]], vertices[face[3]]]);
						
						faceExistanceArr[faceText] = true;
					} else{
						faceExistanceArr[faceText] = false;
					}
				}
			}
		}
		
		
		
		let facesWithoutDuplicates = [];
		
		for (let face of faces){
			let faceText = getFaceAsSortedText(face[0], face[1], face[2], face[3]);
			
			if (faceExistanceArr[faceText]){
				facesWithoutDuplicates.push(face);
			}
		}
		
		
		
		let vertexNums = {};
		let sortedVertexNums = [];
		
		for (let face of facesWithoutDuplicates){
			for (let vertex of face){
				let vertexText = vertex[0] + "," + vertex[1] + "," + vertex[2];
				
				if (vertexNums[vertexText] == undefined){
					let vertexNum = Object.keys(vertexNums).length + 1;
					
					vertexNums[vertexText] = vertexNum;
					
					sortedVertexNums[vertexNum] = vertex;
				}
			}
		}
		
		
		let facesAsVertexNums = [];
		
		for (let face of facesWithoutDuplicates){
			let arr = [];
			
			for (let vertex of face){
				let vertexText = vertex[0] + "," + vertex[1] + "," + vertex[2];
				
				arr.push(vertexNums[vertexText]);
			}
			
			facesAsVertexNums.push(arr);
		}
		
		
		
		//Making the .obj file
		
		for (let vertex of sortedVertexNums){
			if (vertex != undefined){
				text += "v " + vertex[0] + " " + vertex[1] + " " + vertex[2] + "\n";
			}
		}
		
		for (let face of facesAsVertexNums){
			if (face != undefined){
				text += "f " + face[0] + " " + face[1] + " " + face[3] + " " + face[2] + "\n";
			}
		}
		
		return text;
	}
	
	
	async function download(filename, text) {
		let element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}
	
	function downloadObject(){
		download("SandPonder.obj", getWorldGridAsObjectFile());
	}
}