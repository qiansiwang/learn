var CHESSBOARD = CHESSBOARD || {};

CHESSBOARD.Event = {};

CHESSBOARD.BlankState = "_";
CHESSBOARD.PlayStyle = 5;
CHESSBOARD.Player1 = "Circle";
CHESSBOARD.Player2 = "Cross";
CHESSBOARD.FirstStart = CHESSBOARD.Player1;
CHESSBOARD.SecondStart = CHESSBOARD.Player2;

CHESSBOARD.BoardPoint = function (x,y,c){
    this.pointX = x;
    this.pointY = y;
    this.takenBy = c;
}

CHESSBOARD.PlayHistory = function (playname, playnum, points, whowin){
    this.playName = playname;
    this.playNum = playnum;
    this.pointRecord = points;
    this.whoWin = whowin;
}

CHESSBOARD.Board = function (x, y){
    this.X = x;
    this.Y = y;
    this.Points = PopulateDefaultPoints(x,y);
    this.Rows = PopulateRows(x,y,this.Points);
    this.Columns = PopulateColumns(x,y,this.Points);
    this.DiagonalsF = PopulateDiagonalsF(x,y,this.Points);
    this.DiagonalsB = PopulateDiagonalsB(x,y,this.Points);
    this.GameHistory = [];
}

function PopulateDefaultPoints(x,y){
    var _points = {};
    for (var i = 0; i< x; i++){
        for (var j = 0; j<y; j++){
            var apoint = new CHESSBOARD.BoardPoint(i,j,CHESSBOARD.BlankState);
            _points[IndexMethod(i,j)] = apoint;
        }    
    }
    return _points;
}

function IndexMethod(x,y){
    return x.toString() + "," + y.toString();
}


CHESSBOARD.Board.prototype.Point = function (x, y){
    var index = IndexMethod(x,y);
    return this.Points[index];
}

function PopulateRows(x,y,points){
    var result = [];
    for (var i =0; i<y;i++){
        var pointlist = [];
        for (var j=0; j<x;j++){
            pointlist.push(points[IndexMethod(j,i)]);
        }
        result.push(pointlist);
    }
    return result;
}

function PopulateColumns(x,y,points){
    var result = [];
    for (var i =0; i<x;i++){
        var pointlist = [];
        for (var j=0; j<y;j++){
            pointlist.push(points[IndexMethod(i,j)]);
        }
        result.push(pointlist);
    }
    return result;
}

function PopulateDiagonalsF(x,y,points){
    var result = [];
    for (var n=0; n<2*x-1;n++){
        result.push([]);
    }
    for (var i =0; i<x; i++){
        for (var j=0; j<y; j++){
            if ((i+j) < y){
                result[i+j][i]=points[IndexMethod(i,j)];
            } else {
                result[i+j][y-j-1]=points[IndexMethod(i,j)];
            }
        }
    }
    return result;
}

function PopulateDiagonalsB(x,y,points){
    var result = [];
    for (var n=0; n<2*x-1;n++){
        result.push([]);
    }
    for (var i =0; i<x; i++){
        for (var j=y-1; j>=0; j--){
            if ((i+y-j-1) < x){
                result[i+y-j-1][i]=points[IndexMethod(i,j)];
            } else {
                result[i+y-j-1][x-i-1]=points[IndexMethod(i,j)];
            }
        }
    }
    return result;
}

CHESSBOARD.Board.prototype.Play = function (x,y,player){
    this.Point(x,y).takenBy = player;
}

CHESSBOARD.Board.prototype.Reset = function (){
    for (var prop in this.Points){
        if (this.Points.hasOwnProperty(prop)){
            this.Points[prop].takenBy = CHESSBOARD.BlankState;
        }
    }
}

CHESSBOARD.Board.prototype.Randomize = function (name){
    var playnum,xpo,ypo;
    var maxpos = this.X * this.Y;
    this.Reset();
    for (playnum = 0; playnum < maxpos; playnum++){
        //randomize position for each play, player alternates
        do {
            xpo = Math.floor(this.X * Math.random());
            ypo = Math.floor(this.Y * Math.random());
        }
        while (this.Point(xpo, ypo).takenBy != CHESSBOARD.BlankState);
        
        //check win condition after 9 plays, if winning report
        var winstate = this.CheckWin();
        if (playnum > 8 && winstate){
            this.ReportGame(name,playnum,winstate);    
            return;
        } 
        this.WhoPlay(playnum,xpo,ypo);
        this.ReportGame(name,playnum,winstate);
    }
}

CHESSBOARD.Board.prototype.WhoPlay = function (playnum, x,y){
    if (playnum % 2 == 0){
        this.Play(x,y,CHESSBOARD.FirstStart);
    } else {
        this.Play(x,y,CHESSBOARD.SecondStart);
    }
}

CHESSBOARD.Board.prototype.CheckWin = function (){
    //find 5 consecutive pieces along 4 possible directions
    var rowresult = findFive(this.Rows);
    var colresult = findFive(this.Columns);
    var diafresult = findFive(this.DiagonalsF);
    var diabresult = findFive(this.DiagonalsB);
    if (rowresult){
        return rowresult;
    }
    if (colresult){
        return colresult;
    }
    if (diabresult){
        return diabresult;
    }
    if (diafresult){
        return diafresult;
    }
    return false;
}

function findFive(array){
    for (var i = 0; i < array.length; i++){
        for (var j = 0; j<array[i].length - (CHESSBOARD.PlayStyle -1); j++){
            var point = array[i][j];
            if (point.takenBy != CHESSBOARD.BlankState){
                var player = point.takenBy;
                var temp = [];
                for (var k =1; k< CHESSBOARD.PlayStyle;k++){
                    if (array[i][j+k] && array[i][j+k].takenBy == player){
                        temp.push(true);
                    } else {
                        temp.push(false);
                    }
                }
                if (temp.every(function(e){
                    return e;
                })){
                    return player;
                }
                
            }
        }
    }
    return false;
}

CHESSBOARD.Board.prototype.ReportGame = function (playname,playnum,whowin){
    //report individual board state as string 
    var currentpoints = JSON.stringify(this.Points);
    var astep = new CHESSBOARD.PlayHistory(playname,playnum,currentpoints,whowin)
    this.GameHistory.push(astep);
}

