Map {
  //background-color: @bg_light;
}

@bg: #fde7b9;
@bg_light: #fdf6e9;
@emerald: #4bc8b3;
@night_light: #545c8f;

@line : #bed6e2;
@op: 1;
@rOffset: -1.25;
@rWidth: 1.5;

#elhierro-lines {
  line-width: 1*@rWidth;
  line-color: @line;
  line-opacity: @op;
  
  ::line1 {
    line-offset: 2*@rOffset;
    line-width: .6*@rWidth;
    line-color: @line;
    line-opacity: @op;
   }
  
  ::line2 {
    line-offset: 4.5*@rOffset;
    line-width: .5*@rWidth;
    line-color: @line;
    line-opacity: @op;
   }
  
  ::line3 {
    line-offset: 7.5*@rOffset;
    line-width: .4*@rWidth;
    line-color: @line;    
    line-opacity: @op;
   }
    
  ::line4 {
    line-offset: 11*@rOffset;
    line-width: .3*@rWidth;
    line-color: @line;
    line-opacity: @op;
   }
  
  ::line5 {
    line-offset: 15*@rOffset;
    line-width: .2*@rWidth;
    line-color: @line;
    line-opacity: @op;
   }
  
  ::line6 {
    line-offset: 19.5*@rOffset;
    line-width: .1*@rWidth;
    line-color: @line;
    line-opacity: @op;
   }
 }

#elhierro-coasts {
  //polygon-fill: @bg_light;
}