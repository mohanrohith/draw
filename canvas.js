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
  state:{
    paint:false,    
    draw:{
      clickX: [],
      clickY: [],
      clickDrag: [],
      clickColor:[],
      clickSize:[]      
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


DAP.bindEvents = function(){
  var canvas = this.getCanvas(),
  $this = this;
  
  canvas.onmousedown = function(e){
    var mouseX = e.pageX - this.offsetLeft,
    mouseY = e.pageY - this.offsetTop;
     
    Draw.state.paint = true;
    $this.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    $this.redraw();
  }
  
  canvas.onmousemove = function(e){
    if(Draw.state.paint){
      $this.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
      $this.redraw();
    }
  }
  
  canvas.onmouseup = function(e){
    Draw.state.paint = false;
    Draw.state.undo.push(Draw.state.draw.clickX.length);
  }
  
  canvas.onmouseout = function(e){
    if(Draw.state.paint){
      Draw.state.undo.push(Draw.state.draw.clickX.length);
    }
    Draw.state.paint = false;
    
  }
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
}

DAP.setStyle = function(property, value){
  Draw.property[property] = value;
}

DAP.getStyle = function(property){
  return Draw.property[property];
}

DAP.redraw = function(){
  Draw.canvas.canvas.width = Draw.canvas.canvas.width;
  
  Draw.canvas.context.lineJoin = "round";
  
  
  for(var i=0; i< Draw.state.draw.clickX.length; i++){
    Draw.canvas.context.beginPath();
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