(function() {

	var canvas, ctx, drag=null, dPoint;
	var points = new Array(1);
	
	function drawPoint(x, y, radius){
		
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
		ctx.fillStyle = '#ff0000';
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
	}
	
	function drawLine(x1, y1, x2, y2){
		
		ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = $( "#change_line_width" ).slider( "value" );
        ctx.strokeStyle = '#0000ff';
        ctx.stroke();
	}
	
	function drawCanvas(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 1; i < points.length; i++){
			drawPoint(points[i].x, points[i].y, $( "#change_control_point_radius" ).slider( "value" ));
		}
		
		if($('input[name=show_lines]').is(':checked')){
			for(var i = 1; i < points.length - 1; i++){
				drawLine(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
			}
		}
		
		if($('input[name=show_spline]').is(':checked')){
			if(points.length > 4){
				for(var i = 2; i < points.length - 2; i++){
					catmullrom(i);
				}	
			}	
		}
	}
	
	// start dragging
	function dragStart(e) {
		e = MousePos(e);
		var dx, dy;
		for (var i = 1; i < points.length; i++) {
			dx = points[i].x -e.x;
			dy = points[i].y - e.y;	
			if ((dx * dx) + (dy * dy) < 100) {
				drag = i;
				dPoint = e;
				canvas.style.cursor = "move";
				return;
			}
		}
	}
	
	// dragging
	function dragging(e) {
		if (drag) {
			e = MousePos(e);
			points[drag].x += e.x - dPoint.x;
			points[drag].y += e.y - dPoint.y;
			dPoint = e;
			drawCanvas();
		}
	}
	
	// end dragging
	function dragEnd(e) {
		drag = null;
		canvas.style.cursor = "default";
		drawCanvas();
	}
	
	// event parser
	function MousePos(event) {
		event = (event ? event : window.event);
		return {
			x: event.pageX - canvas.offsetLeft,
			y: event.pageY - canvas.offsetTop
		}
	}
	//catmull-rom function
	function catmullrom(key){
		
		var p0 = points[key-1];
		var p1 = points[key];
		var p2 = points[key+1];
		var p3 = points[key+2];
		
		for(var x = 0; x <= 1; x+=0.005){
		
		//case when t = 0.5	
		//var xx=0.5*((2*p1.x)+(p2.x-p0.x)*x+(2*p0.x-5*p1.x+4*p2.x-p3.x)*x*x+(3*p1.x-p0.x-3*p2.x+p3.x)*x*x*x);
   		//var yy=0.5*((2*p1.y)+(p2.y-p0.y)*x+(2*p0.y-5*p1.y+4*p2.y-p3.y)*x*x+(3*p1.y-p0.y-3*p2.y+p3.y)*x*x*x);
   		
   		//case  0 <= t <= 1
   		var t = $( "#change_t" ).slider( "value" );
   		var xx=((p1.x)+(t*p2.x-t*p0.x)*x+(2*t*p0.x+(t-3)*p1.x+(3- 2*t)*p2.x-t*p3.x)*x*x+((2-t)*p1.x-t*p0.x+(t-2)*p2.x+t*p3.x)*x*x*x);
   		var yy=((p1.y)+(t*p2.y-t*p0.y)*x+(2*t*p0.y+(t-3)*p1.y+(3- 2*t)*p2.y-t*p3.y)*x*x+((2-t)*p1.y-t*p0.y+(t-2)*p2.y+t*p3.y)*x*x*x);
   		
   		drawPoint(xx,yy, $( "#change_spline_width" ).slider( "value" ));
		}
	}
	
	//start canvas
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	// event handlers
	canvas.onmousedown = dragStart;
	canvas.onmousemove = dragging;
	canvas.onmouseup = canvas.onmouseout = dragEnd;
	
	//draw a point on click event	
	$('#canvas').dblclick(function(e){
		
		//get the position of mouse relative to the canvas element
		var x = e.pageX - $('#canvas').offset().left;
		var y = e.pageY - $("#canvas").offset().top;
		
		//create a new point object and insert it to points array
		var point 	= new Object;
			point.x = x;
			point.y = y;
			points.push(point);
		
		drawPoint(x, y, 10);
		drawCanvas();
	});
	
	//show hide spline 
	$('input[name=show_spline]').click(function(){
		drawCanvas();
	});
	//show hide lines
	$('input[name=show_lines]').click(function(){
		drawCanvas();
	});
	
	//clear canvas
	$('input[name=clear]').click(function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		points = new Array(1);
	});
	
	//change t slider	
	$( "#change_t" ).slider({
				range: "min",
				value:	0.5,
				min: 0,
				max: 1,
				step: 0.05,
				slide: function( event, ui ) {
					$('#t_value').html('t = ' + parseFloat(ui.value).toFixed(2));
					drawCanvas();
				}
			});
	//change line width slider		
	$( "#change_line_width" ).slider({
				range: "min",
				value:	1,
				min: 0.2,
				max: 3,
				step: 0.2,
				slide: function( event, ui ) {
					$('#line_width_value').html('lineWidth = ' + parseFloat(ui.value).toFixed(1));
					drawCanvas();
				}
			});
	//change spline width slider		
	$( "#change_spline_width" ).slider({
				range: "min",
				value:	0.7,
				min: 0.1,
				max: 2,
				step: 0.1,
				slide: function( event, ui ) {
					$('#spline_width_value').html('splineWidth = ' + parseFloat(ui.value).toFixed(1));
					drawCanvas();
				}
			});
	//change control points radius		
	$( "#change_control_point_radius" ).slider({
				range: "min",
				value:	10,
				min: 3,
				max: 15,
				step: 1,
				slide: function( event, ui ) {
					$('#control_point_radius_value').html('radius = ' + parseFloat(ui.value).toFixed(1));
					drawCanvas();
				}
			});		
})();