console.log("Image Processing");

function invertColor(c){
	var diff = 255 - c;
	return diff;
}

function InvertFilter(pixel){
	return {
		r: invertColor(pixel.r),
		g: invertColor(pixel.g),
		b: invertColor(pixel.b),
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

console.color = function(color, inText){
	var cStr = toRGBAString(color);
	var iStr = toRGBAString(InvertFilter(color));
	var text = toRGBString(color);
	console.log('%c' + text, 'background: ' + cStr + '; color: ' + iStr + ';');
}

document.body.onload = function(){

	var img = document.getElementById('img');
	ctx.drawImage(img, 0, 0, 1000, 1000);
	var imgData = ctx.getImageData(0, 0, 1000, 1000).data;
	var rgb = Uint8ClampedArrayToRGBArray(imgData);
	var outData = rgb.map(pixel => {
		return InvertFilter(pixel);
	});
	for(var i = 0; i < 10; i++){
		var px = outData[i];
		console.color(px);
	}
	var newData = RGBArrayToUint8ClampedArray(outData);
	var canvasData = ctx.createImageData(canvas.width, canvas.height);
	for(var d = 0; d < canvasData.data.length; d++){
		canvasData.data[d] = newData[d];
	}
	ctx.putImageData(canvasData, 0, 0);

}
