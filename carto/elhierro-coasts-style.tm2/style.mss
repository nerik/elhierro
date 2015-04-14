Map {
  background-color: #bccbff;
  }

@line : #0000FF;
@op: .8;
@rOffset: 2;
@rWidth: 2;

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
  polygon-fill: #fff;
}