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

CHESSBOARD.PlayHistory = function (playname, playnum, points, sequence, whowin){
    this.playName = playname;
    this.playNum = playnum;
    this.pointRecord = points;
    this.sequenceList = sequence;
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

CHESSBOARD.Board.prototype.Generate = function (name){
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
    var rowresult = findN(this.Rows);
    var colresult = findN(this.Columns);
    var diafresult = findN(this.DiagonalsF);
    var diabresult = findN(this.DiagonalsB);
    if (rowresult.five1st || rowresult.five2nd || rowresult.six1st ||
        rowresult.six2nd || rowresult.seven1st || rowresult.seven2nd ||
        rowresult.eight1st || rowresult.eight2nd || rowresult.nine1st ||
        rowresult.nine2nd){
        return rowresult.winner;
    }
    if (colresult.five1st || colresult.five2nd || colresult.six1st ||
        colresult.six2nd || colresult.seven1st || colresult.seven2nd ||
        colresult.eight1st || colresult.eight2nd || colresult.nine1st ||
        colresult.nine2nd){
        return colresult.winner;
    }
    if (diafresult.five1st || diafresult.five2nd || diafresult.six1st ||
        diafresult.six2nd || diafresult.seven1st || diafresult.seven2nd ||
        diafresult.eight1st || diafresult.eight2nd || diafresult.nine1st ||
        diafresult.nine2nd){
        return diafresult.winner;
    }
    if (diabresult.five1st || diabresult.five2nd || diabresult.six1st ||
        diabresult.six2nd || diabresult.seven1st || diabresult.seven2nd ||
        diabresult.eight1st || diabresult.eight2nd || diabresult.nine1st ||
        diabresult.nine2nd){
        return diabresult.winner;
    }
    return false;
}

function findN(array){
    var temp = [];
    for (var i = 0; i < array.length; i++){
        for (var j = 0; j<array[i].length; j++){
            var point = array[i][j];
            if (point.takenBy != CHESSBOARD.BlankState){
                var player = point.takenBy;
                var k = 1;
                while (array[i][j+k] && array[i][j+k].takenBy == player){
                    k++;
                }
                //do not collect 1 point
                if (k != 1){
                    var r = {player:player, amount:k}
                    temp.push(r);
                    j += k-1;
                }
            }
        }
    }
    var two2nd = two1st = three1st = three2nd = four1st = four2nd =
    five1st = five2nd = six1st = six2nd = seven1st = seven2nd =
    eight1st = eight2nd = nine1st = nine2nd = 0;
    var winneris = CHESSBOARD.BlankState;
    temp.forEach(function(e,i){
        if (e.amount == 2 && e.player == CHESSBOARD.Player1){
            two1st += 1;
        }
        if (e.amount == 3 && e.player == CHESSBOARD.Player1){
            three1st += 1;
        }
        if (e.amount == 4 && e.player == CHESSBOARD.Player1){
            four1st += 1;
        }
        if (e.amount == 5 && e.player == CHESSBOARD.Player1){
            five1st += 1;
            winneris = CHESSBOARD.Player1;
        }
        if (e.amount == 6 && e.player == CHESSBOARD.Player1){
            six1st += 1;
            winneris = CHESSBOARD.Player1;
        }
        if (e.amount == 7 && e.player == CHESSBOARD.Player1){
            seven1st += 1;
            winneris = CHESSBOARD.Player1;
        }
        if (e.amount == 8 && e.player == CHESSBOARD.Player1){
            eight1st += 1;
            winneris = CHESSBOARD.Player1;
        }
        if (e.amount == 9 && e.player == CHESSBOARD.Player1){
            nine1st += 1;
            winneris = CHESSBOARD.Player1;
        }
        if (e.amount == 2 && e.player == CHESSBOARD.Player2){
            two2nd += 1;
        }
        if (e.amount == 3 && e.player == CHESSBOARD.Player2){
            three2nd += 1;
        }
        if (e.amount == 4 && e.player == CHESSBOARD.Player2){
            four2nd += 1;
        }
        if (e.amount == 5 && e.player == CHESSBOARD.Player2){
            five2nd += 1;
            winneris = CHESSBOARD.Player2;
        }
        if (e.amount == 6 && e.player == CHESSBOARD.Player2){
            six2nd += 1;
            winneris = CHESSBOARD.Player2;
        }
        if (e.amount == 7 && e.player == CHESSBOARD.Player2){
            seven2nd += 1;
            winneris = CHESSBOARD.Player2;
        }
        if (e.amount == 8 && e.player == CHESSBOARD.Player2){
            eight2nd += 1;
            winneris = CHESSBOARD.Player2;
        }
        if (e.amount == 9 && e.player == CHESSBOARD.Player2){
            nine2nd += 1;
            winneris = CHESSBOARD.Player2;
        }
    })
    return {two1st:two1st, two2nd:two2nd, three1st:three1st, three2nd:three2nd, 
        four1st:four1st, four2nd:four2nd, five1st:five1st, five2nd:five2nd,
        six1st:six1st, six2nd:six2nd, seven1st:seven1st, seven2nd:seven2nd, eight1st:eight1st, 
        eight2nd:eight2nd, nine1st:nine1st, nine2nd:nine2nd, winner:winneris};

}

CHESSBOARD.Board.prototype.ReportGame = function (playname,playnum,whowin){
    //report individual board point state and sequence list as string 
    var currentpoints = JSON.stringify(this.Points);
    var sequencelist = reportSequenceAmount(this.Rows,this.Columns,this.DiagonalsF,this.DiagonalsB);
    var sequencestring = JSON.stringify(sequencelist);
    var astep = new CHESSBOARD.PlayHistory(playname,playnum,currentpoints,sequencestring,whowin)
    this.GameHistory.push(astep);
}

function reportSequenceAmount(row,col,diaf,diab){
    var rowresult = findN(row);
    var colresult = findN(col);
    var diafresult = findN(diaf);
    var diabresult = findN(diab);
    var two1st = rowresult.two1st + colresult.two1st + diafresult.two1st + diabresult.two1st;
    var two2nd = rowresult.two2nd + colresult.two2nd + diafresult.two2nd + diabresult.two2nd;
    var three2nd = rowresult.three2nd + colresult.three2nd + diafresult.three2nd + diabresult.three2nd;
    var three1st = rowresult.three1st + colresult.three1st + diafresult.three1st + diabresult.three1st;
    var four2nd = rowresult.four2nd + colresult.four2nd + diafresult.four2nd + diabresult.four2nd;
    var four1st = rowresult.four1st + colresult.four1st + diafresult.four1st + diabresult.four1st;
    var five2nd = rowresult.five2nd + colresult.five2nd + diafresult.five2nd + diabresult.five2nd;
    var five1st = rowresult.five1st + colresult.five1st + diafresult.five1st + diabresult.five1st;
    var six2nd = rowresult.six2nd + colresult.six2nd + diafresult.six2nd + diabresult.six2nd;
    var six1st = rowresult.six1st + colresult.six1st + diafresult.six1st + diabresult.six1st;
    var seven2nd = rowresult.seven2nd + colresult.seven2nd + diafresult.seven2nd + diabresult.seven2nd;
    var seven1st = rowresult.seven1st + colresult.seven1st + diafresult.seven1st + diabresult.seven1st;
    var eight2nd = rowresult.eight2nd + colresult.eight2nd + diafresult.eight2nd + diabresult.eight2nd;
    var eight1st = rowresult.eight1st + colresult.eight1st + diafresult.eight1st + diabresult.eight1st;
    var nine2nd = rowresult.nine2nd + colresult.nine2nd + diafresult.nine2nd + diabresult.nine2nd;
    var nine1st = rowresult.nine1st + colresult.nine1st + diafresult.nine1st + diabresult.nine1st;
    return {two1st:two1st, two2nd:two2nd, three1st:three1st, three2nd:three2nd, four1st:four1st, 
        four2nd:four2nd, five1st:five1st, five2nd:five2nd, six1st:six1st, six2nd:six2nd, seven1st:seven1st,
        seven2nd:seven2nd, eight1st:eight1st, nine1st:nine1st, nine2nd:nine2nd}
}

