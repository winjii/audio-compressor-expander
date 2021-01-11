import * as CmpExperParam from "./AudioWorkletProcessor/CmpExperParam";

const fs = document.getElementById("file-selector");
const ratio = document.getElementById("ratio");
const ratioV = document.getElementById("ratio-value");
const threshold = document.getElementById("threshold");
const thresholdV = document.getElementById("threshold-value");
const offset = document.getElementById("offset");
const offsetV = document.getElementById("offset-value");

ratio.addEventListener("input", (v) => {
  ratioV.innerText = ratio.value;
});
threshold.addEventListener("input", (v) => {
  thresholdV.innerText = threshold.value;
});
offset.addEventListener("input", (v) => {
  offsetV.innerText = offset.value;
});

fs.addEventListener("change", (e) => {
  let promise = Promise.resolve();
  if (!window.ctx) {
    window.ctx = new AudioContext();
    promise = window.ctx.audioWorklet.addModule("./CmpExper.js");
  }
  promise.then(() => {
    console.log(e.target.files[0]);
    const blob = e.target.files[0];
    const objectUrl = URL.createObjectURL(blob); // Blob URLを作成
    const audio = document.querySelector("audio");
    audio.src = objectUrl;
    const source = window.ctx.createMediaElementSource(audio);
  
    const compressorOptions = {
      ratio: Number(ratio.value),
      thresholdDB: Number(threshold.value),
      postGainDB: -30,
    };
    const compressor = new AudioWorkletNode(window.ctx, "cmp-exper", {
      processorOptions: compressorOptions,
    });
  
    source.connect(compressor);
    compressor.connect(window.ctx.destination);
  })
});