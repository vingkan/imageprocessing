function invertColor(c){
	var diff = 255 - c;
	return diff;
}

function InvertFilter(pixel){
	return {
		r: invertColor(pixel.r),
		g: invertColor(pixel.g),
		b: invertColor(pixel.b)
	};
}

function toRGBString(c){
	return 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
}

function toRGBAString(c){
	return 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 255)';
}

function Uint8ClampedArrayToRGBArray(arr){
	var rgb = [];
	var end = arr.length;
	for(var p = 0; p < end; p += 4){
		var r = arr[p];
		var g = arr[p+1];
		var b = arr[p+2];
		rgb.push({
			r: r,
			g: g,
			b: b
		});
	}
	return rgb;
}

function RGBArrayToUint8ClampedArray(arr){
	var clamped = [];
	for(var p = 0; p < arr.length; p++){
		var pixel = arr[p];
		clamped.push(pixel.r);
		clamped.push(pixel.g);
		clamped.push(pixel.b);
		clamped.push(255);
	}
	return clamped;
}

function distanceFromBlack(p){
	return Math.sqrt(Math.pow(p.r, 2) + Math.pow(p.g, 2) + Math.pow(p.b, 2));
}

function percentageBlack(p){
	return distanceFromBlack(p) / distanceFromBlack({r: 255, g: 255, b: 255});
}

console.color = function(color, inText){
	var cStr = toRGBAString(color);
	var iStr = toRGBAString(InvertFilter(color));
	var text = inText || toRGBString(color);
	console.log('%c' + text, 'background: ' + cStr + '; color: ' + iStr + ';');
}

function DepthFilter(pixel, threshold){
	var pBlack = percentageBlack(pixel);
	if(pBlack < threshold){
		return {
			r: 0,
			g: 0,
			b: 0
		};
	}
	else{
		return {
			r: 255,
			g: 255,
			b: 255
		};
	}
}

function DisplayDepthFilter(threshold){
	var img = document.getElementById('img');
	ctx.drawImage(img, 0, 0, 1000, 1000);
	var imgData = ctx.getImageData(0, 0, 1000, 1000).data;
	var rgb = Uint8ClampedArrayToRGBArray(imgData);
	var outData = rgb.map(pixel => {
		return DepthFilter(pixel, threshold);
	});
	/*for(var i = 0; i < 10; i++){
		var px = rgb[i];
		var pBlack = percentageBlack(px);
		console.color(px, pBlack.toFixed(3));
	}*/
	var newData = RGBArrayToUint8ClampedArray(outData);
	var canvasData = ctx.createImageData(canvas.width, canvas.height);
	for(var d = 0; d < canvasData.data.length; d++){
		canvasData.data[d] = newData[d];
	}
	ctx.putImageData(canvasData, 0, 0);
}

function Uint8ClampedArrayToRGBMatrix(arr){
	var matrix = [];
	var size = Math.sqrt(arr.length/4);
	for(var s = 0; s < size; s++){
		var row = [];
		for(var ss = 0; ss < size; ss++){
			row.push({r: 0, g: 0, b: 0});
		}
		matrix.push(row);
	}
	var end = arr.length;
	for(var p = 0; p < end; p += 4){
		var x = (p / 4) % size;
		var y = Math.floor((p / 4) / size);
		var r = arr[p];
		var g = arr[p+1];
		var b = arr[p+2];
		matrix[x][y] = {
			r: r,
			g: g,
			b: b
		}
	}
	return matrix;
}

function RGBMatrixToUint8ClampedArray(matrix){
	var arr = [];
	for(var x = 0; x < matrix.length; x++){
		for(var y = 0; y < matrix.length; y++){
			var p = matrix[y][x]; // Reversed, not sure why LOL
			arr.push(p.r);
			arr.push(p.g);
			arr.push(p.b);
			arr.push(255);
		}
	}
	return arr;
}

function getPointsInKernel(ix, iy, matrix, radius){
	var points = [];
	for(var x = ix + (-1 * radius); x < ix + radius; x++){
		for(var y = iy + (-1 * radius); y < iy + radius; y++){
			if(matrix[x]){
				if(matrix[x][y]){
					points.push(matrix[x][y]);
				}
			}
		}
	}
	return points;
}

function MedianSmoothingFilter(imgData, radius){
	var start = Date.now();
	var matrix = Uint8ClampedArrayToRGBMatrix(imgData);
	var newMatrix = Uint8ClampedArrayToRGBMatrix(imgData);
	console.log((Date.now()-start)/1000, 'secs: convert');
	for(var x = 0; x < matrix.length; x++){
		for(var y = 0; y < matrix.length; y++){
			var points = getPointsInKernel(x, y, matrix, radius);
			points.sort((a, b) => {
				return percentageBlack(a) - percentageBlack(b);
			});
			var idx = Math.floor(points.length / 2);
			var median = points[idx];
			newMatrix[x][y] = median;
		}
		/*if(x%10===0){
			console.log(x);
		}*/
	}
	console.log((Date.now()-start)/1000, 'secs: filter');
	var newData = RGBMatrixToUint8ClampedArray(newMatrix);
	return newData;
}

function KernelSmoothingFilter(imgData, kernel){
	var matrix = Uint8ClampedArrayToRGBMatrix(imgData);
	for(var x = 0; x < matrix.length + kernel.width; x++){
		for(var y = 0; y < matrix.length + kernel.height; y++){
			for(var xt = 0; xt < kernel.width; xt++){
				for(var yt = 0; yt < kernel.height; yt++){
					var xp = x - xt;
					var yp = y - yt;
					if(matrix[xp]){
						if(matrix[xp][yp]){
							var p = matrix[xp][yp];
							var w = kernel.weight(xt, yt);
							var nw = {
								r: p.r * w,
								g: p.g * w,
								b: p.b * w
							}
							matrix[xp][yp].r = nw.r;
							matrix[xp][yp].g = nw.g;
							matrix[xp][yp].b = nw.b;
						}
					}
				}
			}
		}
	}
	var arr = RGBMatrixToUint8ClampedArray(matrix);
	return arr;
}

document.body.onload = function(){

	RunDepthFilter();
	//RunSmoothingFilters();

}

function RunDepthFilter(){
	document.body.onload = function(){
		DisplayDepthFilter(0.5);
	}
	document.getElementById('img-p').addEventListener('change', event => {
		var value = parseFloat(event.target.value, 10);
		document.getElementById('img-d').innerText = value.toFixed(2);
		DisplayDepthFilter(value);
	});
}

function RunSmoothingFilters(){
	var img = document.getElementById('img');
	ctx.drawImage(img, 0, 0, 1000, 1000);
	var imgData = ctx.getImageData(0, 0, 1000, 1000).data;
	var start = Date.now();
	
	imgData = [];
	for(var i = 0; i < Math.pow(1000, 2); i++){
		imgData.push(i%100);
		imgData.push(i%255);
		imgData.push(i%150);
		imgData.push(255);
	}

	//var newData = MedianSmoothingFilter(imgData, 1);
	var newData = KernelSmoothingFilter(imgData, {
		width: 1,
		height: 1,
		weight: (x, y) => {
			return 0.25;
		}
	});

	console.log((Date.now()-start)/1000, 'secs: filtered');
	var canvasData = ctx.createImageData(canvas.width, canvas.height);
	for(var d = 0; d < canvasData.data.length; d++){
		canvasData.data[d] = newData[d];
	}
	ctx.putImageData(canvasData, 0, 0);
}