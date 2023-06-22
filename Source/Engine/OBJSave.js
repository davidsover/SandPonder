{
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
							vertices.push([arr[i][j][0] + x, Number(i) + y, arr[i][j][1] + z]);
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
		
		for (let face of facesWithoutDuplicates){ //this is very slow, please fix
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