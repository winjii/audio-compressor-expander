"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.CmpExper = void 0;
var CmpExperParam_1 = require("./CmpExperParam");
var util_1 = require("./util");
var util_2 = require("../util");
var CmpExper = /** @class */ (function (_super) {
    __extends(CmpExper, _super);
    function CmpExper(options) {
        var _this = _super.call(this) || this;
        // オフセット除去用の平滑化
        _this.smoothed1 = 0;
        _this.halfLife1 = sampleRate * (1 / 10);
        // 高周波除去用の平滑化
        _this.smoothed2 = 0;
        _this.halfLife2 = sampleRate * (1 / 40000);
        _this.gainDB = 0;
        _this.attackHL = sampleRate * (1 / 1000);
        _this.releaseHL = sampleRate * (10 / 1000);
        _this.cntProcess = 0;
        _this.desiredGainDB = function (lv) {
            var ts = _this.param.thresholdDB;
            if (lv <= ts)
                return 0;
            return (lv - ts) * _this.param.ratio + ts - lv;
        };
        _this.param = util_2.toRequired(CmpExperParam_1.defaultOptions)(options.processorOptions);
        console.log("CmpExper init!!!!!!!!!!");
        console.log(util_1.emaConst(_this.halfLife1), util_1.emaConst(_this.halfLife2));
        return _this;
    }
    CmpExper.prototype.process = function (inputs, outputs) {
        if (!(inputs[0] && inputs[0][0]))
            return true;
        var output = outputs[0][0];
        var input = inputs[0][0];
        // 移動平均(ローパスフィルタ)との差分を取ってオフセットを除く
        // → 振幅を取る
        for (var i = 0; i < input.length; i++) {
            var a = util_1.emaConst(this.halfLife1);
            this.smoothed1 = a * input[i] - (1 - a) * this.smoothed1;
            output[i] = input[i] - this.smoothed1;
            output[i] = Math.abs(output[i]);
        }
        // 音量計測のために振幅の高周波成分削る
        for (var i = 0; i < input.length; i++) {
            var a = util_1.emaConst(this.halfLife2);
            this.smoothed2 = a * output[i] - (1 - a) * this.smoothed2;
            output[i] = this.smoothed2;
        }
        for (var i = 0; i < input.length; i++) {
            if (output[i] == 0)
                continue;
            var trgDB = this.desiredGainDB(util_1.lin2dB(output[i]));
            var hl = Math.abs(this.gainDB) < Math.abs(trgDB)
                ? this.attackHL
                : this.releaseHL;
            var a = util_1.emaConst(hl);
            this.gainDB = a * trgDB + (1 - a) * this.gainDB;
            output[i] = input[i] * util_1.dB2lin(this.gainDB + this.param.postGainDB);
            // if (this.cntProcess % 100 == 0 && i == 0) {
            //   console.log(
            //     trgDB + this.param.postGainDB,
            //     this.gainDB + this.param.postGainDB,
            //     dB2lin(-200)
            //   );
            // }
        }
        // if (this.cntProcess % 100 == 0) {
        //   console.log(lin2dB(signalPeak(input)), "->", lin2dB(signalPeak(output)));
        // }
        this.cntProcess++;
        return true;
    };
    return CmpExper;
}(AudioWorkletProcessor));
exports.CmpExper = CmpExper;
registerProcessor("cmp-exper", CmpExper);
