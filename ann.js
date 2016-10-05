//ann-Artificial Neural Network

var ANN = ANN || {};



ANN.Layer = function (name){
    this.Name = name;
    this.Units = [];
}

ANN.Layer.prototype.length = function (){
    return this.Units.length;
}

ANN.Layer.prototype.addUnit = function (x){
    this.Units.push(x);
}

ANN.InputLayer = function (){
    ANN.Layer.call(this, "Input");
}

ANN.InputLayer.prototype = Object.create(ANN.Layer.prototype);
ANN.InputLayer.prototype.constructor = InputLayer;

ANN.HiddenLayer = function (name){
    ANN.Layer.call(this, name);
}

ANN.HiddenLayer.prototype = Object.creat(ANN.Layer.prototype);
ANN.HiddenLayer.prototype.constructor = HiddenLayer;

ANN.OutputLayer = function (){
    ANN.Layer.call(this, "Output");
}

ANN.OutputLayer.prototype  = Object.create(ANN.Layer.prototype);
Ann.OutputLayer.prototype.constructor = OutputLayer;

ANN.Perceptron = function (x, w){
    this.InputVector = x;
    this.WeightVector = w;
}

ANN.Perceptron.prototype.CapResult = function (){
    var cap = 0;
    for (var i =0; i<this.InputVector.length;i++){
        cap += this.InputVector[i]*this.WeightVector[i];
    }
    if (cap > 0){
        return 1;
    }
    else {
        return 0;
    }
}

ANN.Perceptron.prototype.SigmoidResult = function (){
    return ANN.Sigmoid(this.CapResult());
}

ANN.Sigmoid = function (t){
    return 1/(1+Math.exp(-t));
}