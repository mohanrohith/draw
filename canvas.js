var Draw = Draw || {
  config:{
    width: window.innerWidth||document.documentElement.clientWidth||document.getElementsByTagName('body')[0].clientWidth,
    height: window.innerHeight|| document.documentElement.clientHeight||document.getElementsByTagName('body')[0].clientHeight,
    id:"canvas"
  },
  property:{
    strokeStyle :"#df4b26",
    lineJoin : "round",
    lineWidth : 5
  },
  mode:"freedraw",
  state:{
    paint:false,    
    draw:{
      clickX: [],
      clickY: [],
      clickDrag: [],
      clickColor:[],
      clickSize:[]      
    },
    line:{
      temp:{},
      lines:[],
      lineColor:[],
      lineWidth:[]
    },
    lineArrow:{
      temp:{},
      lines:[]
    },
    rect:{
      temp:{},
      boxes:[]
    },
    ellipsis:{
      temp:{},
      circles:[]
    },
    undo:[0]
  }, 
  canvas:{},
  App: function(){}
};



var DAP = Draw.App.prototype;

DAP.init =function(){
  this.create();
  this.bindEvents();
}

DAP.create = function(){
  var canvasDiv = document.getElementById("canvas_wrapper"),
  canvas = document.createElement("canvas");
  
  canvas.setAttribute("width", Draw.config.width);
  canvas.setAttribute("height", Draw.config.height);
  canvas.setAttribute("id", Draw.config.id);
  canvasDiv.appendChild(canvas);
  
  if(typeof G_vmlCanvasManager != 'undefined') {
    canvas = G_vmlCanvasManager.initElement(canvas);
  }
  
  Draw.canvas["canvas"] = canvas;
  Draw.canvas["context"] = canvas.getContext("2d");
}

DAP.getCanvas = function(){
  return document.getElementById(Draw.config.id);
}

DAP.width = function(){
  if(arguments.length >0 ){
    var canvas = document.getElementById(Draw.config.id);
    canvas.setAttribute("width", arguments[0]);
    Draw.config.width = arguments[0];    
  }else{
    return Draw.config.width;
  }
}

DAP.getPoints = function(x, y){
  var p = {
    x: 0,
    y:0
  }, canvas = this.getCanvas();
  p.x = x - canvas.offsetLeft; 
  p.y = y - canvas.offsetTop; 
  return p;
}

DAP.bindEvents = function(){
  var canvas = this.getCanvas(),
  $this = this;
  
  canvas.onmousedown = function(e){
    var p = $this.getPoints(e.clientX, e.clientY);
    Draw.state.paint = true;
    if(Draw.mode == "freedraw"  ){
      $this.addClick(p.x, p.y, false);
    }else if (Draw.mode == "line"){  
      $this.addLineTemp(p.x, p.y, false);
    }else if (Draw.mode == "arrowline"){  
      $this.addLineArrowTemp(p.x, p.y, false);
    }else if (Draw.mode == "circle"){ 
      $this.addCircleTemp(p.x,p.y, false);
    }else if (Draw.mode == "rectangle"){ 
      $this.addRectTemp(p.x,p.y, false);
    }
    $this.redraw();
  }
  
  canvas.onmousemove = function(e){
    var p = $this.getPoints(e.clientX, e.clientY);
    if(Draw.state.paint){
      if(Draw.mode == "freedraw"  ){
        $this.addClick(p.x, p.y, true);
      }else if (Draw.mode == "line"){  
        $this.addLineTemp(p.x, p.y, true);
      }else if (Draw.mode == "arrowline"){ 
        $this.addLineArrowTemp(p.x, p.y, true);
      }else if (Draw.mode == "circle"){ 
        $this.addCircleTemp(p.x,p.y, true);
      }else if (Draw.mode == "rectangle"){ 
        $this.addRectTemp(p.x,p.y, true);
      }
      $this.redraw();
    }
  }
  
  canvas.onmouseup = function(e){
    Draw.state.paint = false;
    //Draw.state.undo.push(Draw.state.draw.clickX.length);
    var p = $this.getPoints(e.clientX, e.clientY);
    if(Draw.mode == "line"){
      $this.addLine(p.x, p.y);
    }
    else if(Draw.mode == "arrowline"){
      $this.addArrowLine(p.x, p.y);
    }else if (Draw.mode == "rectangle"){ 
      $this.addRect(p.x,p.y);
    }else if (Draw.mode == "circle"){ 
      $this.addCircle(p.x,p.y, true);
    }
  }
  
//  canvas.onmouseout = function(e){
//    if(Draw.state.paint){
//    //      if(Draw.mode == "freedraw"  ){
//    //        Draw.state.undo.push(Draw.state.draw.clickX.length);
//    //      }
//    }
//    Draw.state.paint = false;    
//  }
}

DAP.addCircleTemp = function(x, y, second){
  if(second){
    Draw.state.ellipsis.temp["x2"]   = x; 
    Draw.state.ellipsis.temp["y2"]   = y;  
  }
  else{
    Draw.state.ellipsis.temp["x1"]   = x; 
    Draw.state.ellipsis.temp["y1"]   = y; 
  }
}

DAP.addCircle = function(x, y){
  var box = {
    x1: Draw.state.ellipsis.temp["x1"],
    y1: Draw.state.ellipsis.temp["y1"],    
    x2: Draw.state.ellipsis.temp["x2"],
    y2: Draw.state.ellipsis.temp["y2"],    
    color: Draw.property.strokeStyle,
    lineWidth: Draw.property.lineWidth
  }
  Draw.state.ellipsis.circles.push(box);
}

DAP.addRectTemp = function(x, y, second){
  
  if(second){
    Draw.state.rect.temp["width"]   = x- Draw.state.rect.temp["x1"]; 
    Draw.state.rect.temp["height"]   = y -Draw.state.rect.temp["y1"]; 
  }
  else{
    Draw.state.rect.temp["x1"]   = x; 
    Draw.state.rect.temp["y1"]   = y; 
  }
}

DAP.addRect = function(x, y){
  var box = {
    x1: Draw.state.rect.temp["x1"],
    y1: Draw.state.rect.temp["y1"],
    width: x - Draw.state.rect.temp["x1"],
    height:y - Draw.state.rect.temp["y1"],
    color: Draw.property.strokeStyle,
    lineWidth: Draw.property.lineWidth
  }
  Draw.state.rect.boxes.push(box);
}

DAP.addLineTemp = function(x, y, second){
  if(second){
    Draw.state.line.temp["x2"]   = x; 
    Draw.state.line.temp["y2"]   = y; 
  }
  else{
    Draw.state.line.temp["x1"]   = x; 
    Draw.state.line.temp["y1"]   = y; 
  }
}

DAP.addLineArrowTemp = function(x, y, second){  
  if(second){
    Draw.state.lineArrow.temp["x2"]   = x; 
    Draw.state.lineArrow.temp["y2"]   = y; 
  }
  else{
    Draw.state.lineArrow.temp["x1"]   = x; 
    Draw.state.lineArrow.temp["y1"]   = y; 
  }
}
  
DAP.addLine = function(x, y){
  var line = {
    x1: Draw.state.line.temp.x1,
    y1: Draw.state.line.temp.y1,
    x2: Draw.state.line.temp.x2,
    y2: Draw.state.line.temp.y2,
    color: Draw.property.strokeStyle,
    lineWidth: Draw.property.lineWidth
  }
  Draw.state.line.lines.push(line);
}

DAP.addArrowLine = function(x, y){
  var line = {
    x1: Draw.state.lineArrow.temp.x1,
    y1: Draw.state.lineArrow.temp.y1,
    x2: Draw.state.lineArrow.temp.x2,
    y2: Draw.state.lineArrow.temp.y2,
    color: Draw.property.strokeStyle,
    lineWidth: Draw.property.lineWidth
  }
  Draw.state.lineArrow.lines.push(line);
}

DAP.addClick = function(x, y, dragging){
  Draw.state.draw.clickX.push(x);
  Draw.state.draw.clickY.push(y);
  Draw.state.draw.clickDrag.push(dragging);
  Draw.state.draw.clickColor.push(Draw.property.strokeStyle);
  Draw.state.draw.clickSize.push(Draw.property.lineWidth);
}

DAP.clear = function(){
  for(var arr in Draw.state.draw){
    Draw.state.draw[arr] =[];
  }
  for(var arr in Draw.state.line){
    Draw.state.line[arr] =[];
  }
  for(var arr in Draw.state.lineArrow){
    Draw.state.lineArrow[arr] =[];
  }
  for(var arr in Draw.state.rect){
    Draw.state.rect[arr] =[];
  }
  for(var arr in Draw.state.ellipsis){
    Draw.state.ellipsis[arr] =[];
  }
}

DAP.setStyle = function(property, value){
  Draw.property[property] = value;
}

DAP.getStyle = function(property){
  return Draw.property[property];
}

DAP.redraw = function(){
  Draw.canvas.canvas.width = Draw.canvas.canvas.width;  
  
  this.drawFree();
  
  this.drawLine();
  
  this.drawArrowLine();
  
  this.drawBox();
  
  this.drawCircle();
}

DAP.drawFree = function(){
  for(var i=0; i< Draw.state.draw.clickX.length; i++){
    Draw.canvas.context.beginPath();
    Draw.canvas.context.lineJoin = "round";
    if(Draw.state.draw.clickDrag[i] && i){
      Draw.canvas.context.moveTo(Draw.state.draw.clickX[i-1], Draw.state.draw.clickY[i-1]);
    }else{
      Draw.canvas.context.moveTo(Draw.state.draw.clickX[i]-1, Draw.state.draw.clickY[i]);
    }
    Draw.canvas.context.lineTo(Draw.state.draw.clickX[i], Draw.state.draw.clickY[i])
    Draw.canvas.context.closePath();
    Draw.canvas.context.lineWidth = Draw.state.draw.clickSize[i];
    Draw.canvas.context.strokeStyle = Draw.state.draw.clickColor[i];
    Draw.canvas.context.stroke();
  }
}

DAP.drawLine = function(){
  
  for(var i = 0; i < Draw.state.line.lines.length; i++){
    Draw.canvas.context.beginPath();
    Draw.canvas.context.moveTo(Draw.state.line.lines[i].x1, Draw.state.line.lines[i].y1);
    Draw.canvas.context.lineTo(Draw.state.line.lines[i].x2, Draw.state.line.lines[i].y2);
    Draw.canvas.context.lineWidth = Draw.state.line.lines[i].lineWidth;
    Draw.canvas.context.strokeStyle = Draw.state.line.lines[i].color;
    Draw.canvas.context.stroke();
    Draw.canvas.context.closePath();
  }
  //draw line
  if(Draw.state.paint){
    Draw.canvas.context.beginPath();
    Draw.canvas.context.moveTo(Draw.state.line.temp.x1, Draw.state.line.temp.y1);
    Draw.canvas.context.lineTo(Draw.state.line.temp.x2, Draw.state.line.temp.y2);
    Draw.canvas.context.lineWidth = Draw.property.lineWidth;
    Draw.canvas.context.strokeStyle = Draw.property.strokeStyle;
    Draw.canvas.context.stroke();
    Draw.canvas.context.closePath();
  }
}

DAP.drawArrowLine = function(){
  
  for(var i = 0; i < Draw.state.lineArrow.lines.length; i++){
    Draw.canvas.context.beginPath();
    Draw.canvas.context.moveTo(Draw.state.lineArrow.lines[i].x1, Draw.state.lineArrow.lines[i].y1);
    Draw.canvas.context.lineTo(Draw.state.lineArrow.lines[i].x2, Draw.state.lineArrow.lines[i].y2);
    Draw.canvas.context.lineWidth = Draw.state.lineArrow.lines[i].lineWidth;
    Draw.canvas.context.strokeStyle = Draw.state.lineArrow.lines[i].color;
    Draw.canvas.context.lineCap = "round";
    Draw.canvas.context.stroke();
    Draw.canvas.context.closePath();
    this.drawArrowHead(Draw.state.lineArrow.lines[i], Draw.state.lineArrow.lines[i].color);
  }
  //draw line
  if(Draw.state.paint){
    Draw.canvas.context.beginPath();
    Draw.canvas.context.moveTo(Draw.state.lineArrow.temp.x1, Draw.state.lineArrow.temp.y1);
    Draw.canvas.context.lineTo(Draw.state.lineArrow.temp.x2, Draw.state.lineArrow.temp.y2);
    Draw.canvas.context.lineWidth = Draw.property.lineWidth;
    Draw.canvas.context.strokeStyle = Draw.property.strokeStyle;
    Draw.canvas.context.lineCap = "round";
    Draw.canvas.context.stroke();
    Draw.canvas.context.closePath();
    this.drawArrowHead(Draw.state.lineArrow.temp, Draw.property.strokeStyle);
  }
}

DAP.drawArrowHead = function(p, color){
  var angle = ((Math.atan2(p.x1 - p.x2, p.y1 - p.y2))*180/Math.PI)-90,
  barb_length=40,
  barb_angle_degrees = 20,
  x1 = p.x2 + (barb_length * Math.cos(degToRad(-angle - barb_angle_degrees))),
  y1 = p.y2 + (barb_length * Math.sin(degToRad(-angle - barb_angle_degrees))),
  x2 = p.x2 + (barb_length * Math.cos(degToRad(-angle + barb_angle_degrees))),
  y2 = p.y2 + (barb_length * Math.sin(degToRad(-angle + barb_angle_degrees)));
	

  Draw.canvas.context.beginPath();
  Draw.canvas.context.moveTo(x1,y1);
  Draw.canvas.context.lineTo(p.x2,p.y2);
  Draw.canvas.context.lineTo(x2,y2);
  Draw.canvas.context.fillStyle = color;
  Draw.canvas.context.lineCap = "round";  
  Draw.canvas.context.fill();
  Draw.canvas.context.closePath();
}

DAP.drawBox = function(){
  for(var i = 0; i < Draw.state.rect.boxes.length; i++){
    Draw.canvas.context.beginPath();
    Draw.canvas.context.moveTo(Draw.state.rect.boxes[i].x1, Draw.state.rect.boxes[i].y1);
    Draw.canvas.context.rect(Draw.state.rect.boxes[i].x1,Draw.state.rect.boxes[i].y1,Draw.state.rect.boxes[i].width,Draw.state.rect.boxes[i].height);
    Draw.canvas.context.lineWidth = Draw.state.rect.boxes[i].lineWidth;
    Draw.canvas.context.strokeStyle = Draw.state.rect.boxes[i].color;
    Draw.canvas.context.stroke();
    Draw.canvas.context.closePath();
  }
  if(Draw.state.paint){
    Draw.canvas.context.beginPath();
    Draw.canvas.context.moveTo(Draw.state.rect.temp.x1, Draw.state.rect.temp.y1);
    Draw.canvas.context.rect(Draw.state.rect.temp.x1,Draw.state.rect.temp.y1,Draw.state.rect.temp.width,Draw.state.rect.temp.height);
    Draw.canvas.context.lineWidth = Draw.property.lineWidth;
    Draw.canvas.context.strokeStyle = Draw.property.strokeStyle;
    Draw.canvas.context.stroke();
    Draw.canvas.context.closePath();
  }
}

DAP.drawCircle = function(){
  for(var i = 0; i < Draw.state.ellipsis.circles.length; i++){
    var KAPPA = 4 * ((Math.sqrt(2) -1) / 3),
    rx = (Draw.state.ellipsis.circles[i].x2-Draw.state.ellipsis.circles[i].x1)/2,
    ry = (Draw.state.ellipsis.circles[i].y2-Draw.state.ellipsis.circles[i].y1)/2,
    cx = Draw.state.ellipsis.circles[i].x1+rx,
    cy = Draw.state.ellipsis.circles[i].y1+ry;
    Draw.canvas.context.beginPath();
    Draw.canvas.context.moveTo(cx, cy - ry);
    Draw.canvas.context.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
    Draw.canvas.context.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
    Draw.canvas.context.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
    Draw.canvas.context.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);  
    Draw.canvas.context.lineWidth = Draw.state.ellipsis.circles[i].lineWidth;
    Draw.canvas.context.strokeStyle = Draw.state.ellipsis.circles[i].color;
    Draw.canvas.context.stroke();
    Draw.canvas.context.closePath();
  }
  if(Draw.state.paint){
    var KAPPA = 4 * ((Math.sqrt(2) -1) / 3),
    rx = (Draw.state.ellipsis.temp.x2-Draw.state.ellipsis.temp.x1)/2,
    ry = (Draw.state.ellipsis.temp.y2-Draw.state.ellipsis.temp.y1)/2,
    cx = Draw.state.ellipsis.temp.x1+rx,
    cy = Draw.state.ellipsis.temp.y1+ry;
    Draw.canvas.context.beginPath();
    Draw.canvas.context.moveTo(cx, cy - ry);
    Draw.canvas.context.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
    Draw.canvas.context.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
    Draw.canvas.context.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
    Draw.canvas.context.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);  
    Draw.canvas.context.lineWidth = Draw.property.lineWidth;
    Draw.canvas.context.strokeStyle = Draw.property.strokeStyle;
    Draw.canvas.context.stroke();
    Draw.canvas.context.closePath();
  }
}

DAP.saveAsImage = function(){
  return Draw.canvas.canvas.toDataURL();
}

DAP.undo = function(){
  var index = Draw.state.undo.length,
  num = Draw.state.undo[index-1] - Draw.state.undo[index-2];
  
  if(Draw.state.draw.clickX.length >0){
    for(var arr in Draw.state.draw){
      Draw.state.draw[arr].splice(Draw.state.undo[index-2],num);
    }
  
    Draw.state.undo.pop();
    this.redraw();
  }
}

DAP.changeMode = function(mode){
  Draw.mode = mode;
}

DAP.getMode = function(){
  return Draw.mode;
}

function degToRad(angle_degrees){
  return angle_degrees/180*Math.PI;
}