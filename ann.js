//Artificial Neural Network

var ANN = ANN || {};

ANN.LEARNINGSTEP = 0.005;
ANN.TRAININGSTEPS = 1000;

ANN.NetWork = function (name){
    this.Name = name;
    this.HiddenLayers = [];
}

ANN.NetWork.prototype.AddLayer = function (layertype){
    var counter = 0;
    if (layertype == ANN.LayerTypeEnum.Input){
        this.InputLayer = new ANN.InputLayer("InputLayer");
    }
    if (layertype == ANN.LayerTypeEnum.Hidden){
        this.HiddenLayers.push(new ANN.HiddenLayer("HiddenLayer" + counter.toString()));
        counter++;
    }
    if (layertype == ANN.LayerTypeEnum.Output){
        this.OutputLayer = new ANN.OutputLayer("OutputLayer");
    }
}

ANN.NetWork.prototype.DeleteLayer = function (){
    //can only delete the outside hidden one
    this.HiddenLayers.pop();
}

ANN.NetWork.prototype.AddUnit = function (layername, unittype){
    if (layername == "OutputLayer"){
        this.OutputLayer.AddUnit(new ANN.Perceptron(layername,ANN.LayerTypeEnum.Output,unittype));
    }
    if (layername.indexOf("HiddenLayer") !== -1){
        var index = Number(layername.slice(11));
        this.HiddenLayers[index].AddUnit(new ANN.Perceptron(layername,ANN.LayerTypeEnum.Output,unittype));
    }
    if (layername == "InputLayer"){
        this.InputLayer.AddUnit(new ANN.InputObject());
    }
}

//Assume dataset is a list of key value pair
ANN.NetWork.prototype.Train = function (dataset){
    var inputlayer = this.InputLayer;
    var hiddenlayers = this.HiddenLayers;
    var outputlayer = this.OutputLayer;
    var counter = 1;
    //initial the input weight for all units
    this.InitializeWeight();
    
    //training routine
    do {
        dataset.forEach(function (e){
            var input = e.Key;
            var output = e.Value;
            //forward propergate to get results of each unit
            this.Feed(input, inputlayer, hiddenlayers, outputlayer);
            //back propergate to get error terms of each unit
            this.BackPropergateErrorTerm(output, inputlayer, hiddenlayers, outputlayer);
            //update input weight for all units
            this.UpdateInputWeight(hiddenlayers, outputlayer);
            //update output weight for all units
            this.OutputWeightCalc();
        })
        counter++;
    }
    while (counter <= ANN.TRAININGSTEPS);
}

ANN.NetWork.prototype.UpdateInputWeight = function (hiddenlayers, outputlayer){
    hiddenlayers.forEach(function(e){
        e.Units.forEach(function(f){
            f.UpdateInputWeight();
        })
    })
    outputlayer.Units.forEach(function(e){
        e.UpdateInputWeight();
    })    
}

ANN.NetWork.prototype.BackPropergateErrorTerm = function (output, inputlayer, hiddenlayers, outputlayer){
    var lasthiddenresult = hiddenlayers[hiddenlayers.length-1].Units.map(function(t){return t.Result});
    var outputunits = outputlayer.Units;
    //output layer error term
    outputunits.forEach(function(a,b){
        a.ErrorTerm = a.ErrorTermCalc(lasthiddenresult,a.InputWeight,a.OutputWeight,output);
    })
    //hiddenlayer error term
    for (i = hiddenlayers.length -1; i>=0; i--){
        var thislayer = hiddenlayers[i];
        var thislayerunits = thislayer.Units;
        var nextlayer, previouslayer;
        if (i == hiddenlayers.length-1){
           nextlayer = outputlayer;
        } else {
           nextlayer = hiddenlayers[i+1];
        }
        if (i== 0){
           previouslayer = inputlayer;
        } else {
           previouslayer = hiddenlayers[i-1];
        }
        var previouslayerresult = previouslayer.Units.map(function (a){return a.Result});
        thislayerunits.forEach(function (m,n){
            m.ErrorTerm = m.ErrorTermCalc(previouslayerresult,m.InputWeight,m.OutputWeight,output,nextlayer);
        })
    }
}

ANN.NetWork.prototype.Feed = function(input, inputlayer, hiddenlayers, outputlayer){
    input.forEach(function (h,j){
        inputlayer.Units[j].Result = h;
    })
    //feed hiddenlayer based on input and get output
    hiddenlayers.forEach(function (k,l){
        k.Units.forEach(function (m,n){
            if (l==0){
                m.Result = m.Output(input, m.InputWeight);    
            } else {
                var previouslayeroutput = hiddenlayers[l-1].Units.map(function (z){return z.Result});
                m.Result = m.Output(previouslayeroutput,m.InputWeight);
            }
        })
    })
    //get output layer result
    var lasthiddenresult = hiddenlayers[hiddenlayers.length-1].Units.map(function(t){return t.Result});
    outputlayer.forEach(function(o,p){
        o.Result = o.Output(lasthiddenresult,o.InputWeight);
    })
}

ANN.NetWork.prototype.InitializeWeight = function (hiddenlayers, outputlayer){
    //set initial input weight for output layer units
    var outputunits = outputlayer.Units;
    outputunits.forEach(function(e){
        var hiddenlayerlength = hiddenlayers.length;
        var lasthiddenlength = hiddenlayers[hiddenlayerlength-1].Length;
        for (var i =0;i<lasthiddenlength;i++){
            e.InputWeight.push((Math.random()-0.5)/10);
        }
    })
    //set initial input weight for hidden layer units
    for (var i=hiddenlayers.length-1;i>=0;i--){
        var hiddenlayer = hiddenlayers[i];
        var hiddenlayerunits = hiddenlayer.Units;
        var insidelayer, insidelayerlength;
        if (i != 0){
            insidelayer = hiddenlayers[i-1];
        } else {
            insidelayer = this.InputLayer;
        }
        insidelayerlength = insidelayer.Length;
        hiddenlayerunits.forEach(function (e){
            for (var j =0; j<insidelayerlength;j++){
                e.InputWeight.push((Math.random()-0.5)/10);
            }
        })
    }
    this.OutputWeightCalc();
}

ANN.NetWork.prototype.OutputWeightCalc = function (){
    var inputunits = this.InputLayer.Units;
    inputunits.forEach(function(e,j){
        var outputweightarray = hiddenlayers[0].Units.map(function(h){return h.InputWeight[j]});
        e.OutputWeight = outputweightarray;
    })
    var hiddenlayers = this.HiddenLayers;
    hiddenlayers.forEach(function(e,k){
        var nextlayer;
        if (k == hiddenlayers.length-1){
            nextlayer = outputlayer; 
        } else {
            nextlayer = hiddenlayers[k+1]; 
        }
        var thislayerunits = e.Units;
        thislayerunits.forEach(function(m,n){
            m.OutputWeight = nextlayer.Units.map(function(o){return o.InputWeight[n]});
        })
    })
}

ANN.Layer = function (type, name){
    this.Type = type;
    this.Name = name;
    this.Units = [];
}

ANN.LayerTypeEnum = {Input:"Input", Hidden:"Hidden", Output:"Output"};

ANN.Layer.prototype.Length = function (){
    return this.Units.length;
}

ANN.Layer.prototype.AddUnit = function (x){
    this.Units.push(x);
}

ANN.Layer.prototype.DeleteUnit = function (){
    this.Units.pop();
}

ANN.InputLayer = function (name){
    ANN.Layer.call(this, ANN.LayerTypeEnum.Input, name);
}

ANN.InputLayer.prototype = Object.create(ANN.Layer.prototype);
ANN.InputLayer.prototype.constructor = InputLayer;


ANN.HiddenLayer = function (name){
    ANN.Layer.call(this, ANN.LayerTypeEnum.Hidden, name);
}

ANN.HiddenLayer.prototype = Object.creat(ANN.Layer.prototype);
ANN.HiddenLayer.prototype.constructor = HiddenLayer;

ANN.OutputLayer = function (name){
    ANN.Layer.call(this, ANN.LayerTypeEnum.Output, name);
}

ANN.OutputLayer.prototype  = Object.create(ANN.Layer.prototype);
Ann.OutputLayer.prototype.constructor = OutputLayer;

ANN.InputObject = function (){this.X=0}

ANN.PercepTronTypeEnum = {Sig:"S", Per:"P"}

ANN.Perceptron = function (layername,layertype, p){
    this.LayerName = layername;
    this.LayerType = layertype;
    this.PerceptronType = p;
    this.InputWeight = [];
    this.OutputWeight = [];
}

ANN.Perceptron.prototype.Output = function (x, win){
    var cap = 0;
    for (var i =0; i<x.length;i++){
            cap += x[i]*w[i];
    }
    if (this.PerceptronType == ANN.PercepTronTypeEnum.Per){
        if (cap > 0){
            return 1;
        }
        else {
            return 0;
        }
    }
    if (this.PercepTronType == ANN.PercepTronTypeEnum.Sig){
        return ANN.Sigmoid(cap);
    }
}

ANN.Sigmoid = function (t){
    return 1/(1+Math.exp(-t));
}

ANN.Perceptron.prototype.ErrorTermCalc = function (x,win,wout,t,nextlayer){
    var result, output, term;
    output = this.Output(x,win);
    term = output*(1-output);
    if (this.LayerType == ANN.LayerTypeEnum.Output){
        result = term*(t - output);
    }
    else {
        result = term*(this.HiddenLayerErrorTerm(wout,nextlayer));
    }
}

ANN.Perceptron.prototype.HiddenLayerErrorTerm = function (w,n){
    var temp = n.Units;
    var errorterm, weight,result;
    temp.forEach(function (e,i){
        errorterm = e.ErrorTerm;
        weight = w[i];
        result += errorterm*weight;
    })
    return result;
}

ANN.Perceptron.prototype.UpdateInputWeight = function (){
    var step = ANN.LEARNINGSTEP * this.ErrorTerm * this.Result;
    this.InputWeight.forEach(function (e){
      e += step;  
    })
}
