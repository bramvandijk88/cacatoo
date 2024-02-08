
// This file contains all dependencies for Cacatoo

// 1) FPSMeter          (FPS / ms display)
// 2) Dygraphs          (interactive plots)
// 3) Filesave          (saving canvas to PNG by download request)
// 4) Mersenne twister  (fast and high quality random number generator)

/*! FPSMeter 0.3.1 - 9th May 2013 | https://github.com/Darsain/fpsmeter */
(function(m,j){function s(a,e){for(var g in e)try{a.style[g]=e[g]}catch(j){}return a}function H(a){return null==a?String(a):"object"===typeof a||"function"===typeof a?Object.prototype.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase()||"object":typeof a}function R(a,e){if("array"!==H(e))return-1;if(e.indexOf)return e.indexOf(a);for(var g=0,j=e.length;g<j;g++)if(e[g]===a)return g;return-1}function I(){var a=arguments,e;for(e in a[1])if(a[1].hasOwnProperty(e))switch(H(a[1][e])){case "object":a[0][e]=
I({},a[0][e],a[1][e]);break;case "array":a[0][e]=a[1][e].slice(0);break;default:a[0][e]=a[1][e]}return 2<a.length?I.apply(null,[a[0]].concat(Array.prototype.slice.call(a,2))):a[0]}function N(a){a=Math.round(255*a).toString(16);return 1===a.length?"0"+a:a}function S(a,e,g,j){if(a.addEventListener)a[j?"removeEventListener":"addEventListener"](e,g,!1);else if(a.attachEvent)a[j?"detachEvent":"attachEvent"]("on"+e,g)}function D(a,e){function g(a,b,d,c){return y[0|a][Math.round(Math.min((b-d)/(c-d)*J,J))]}
function r(){f.legend.fps!==q&&(f.legend.fps=q,f.legend[T]=q?"FPS":"ms");K=q?b.fps:b.duration;f.count[T]=999<K?"999+":K.toFixed(99<K?0:d.decimals)}function m(){z=A();L<z-d.threshold&&(b.fps-=b.fps/Math.max(1,60*d.smoothing/d.interval),b.duration=1E3/b.fps);for(c=d.history;c--;)E[c]=0===c?b.fps:E[c-1],F[c]=0===c?b.duration:F[c-1];r();if(d.heat){if(w.length)for(c=w.length;c--;)w[c].el.style[h[w[c].name].heatOn]=q?g(h[w[c].name].heatmap,b.fps,0,d.maxFps):g(h[w[c].name].heatmap,b.duration,d.threshold,
0);if(f.graph&&h.column.heatOn)for(c=u.length;c--;)u[c].style[h.column.heatOn]=q?g(h.column.heatmap,E[c],0,d.maxFps):g(h.column.heatmap,F[c],d.threshold,0)}if(f.graph)for(p=0;p<d.history;p++)u[p].style.height=(q?E[p]?Math.round(O/d.maxFps*Math.min(E[p],d.maxFps)):0:F[p]?Math.round(O/d.threshold*Math.min(F[p],d.threshold)):0)+"px"}function k(){20>d.interval?(x=M(k),m()):(x=setTimeout(k,d.interval),P=M(m))}function G(a){a=a||window.event;a.preventDefault?(a.preventDefault(),a.stopPropagation()):(a.returnValue=
!1,a.cancelBubble=!0);b.toggle()}function U(){d.toggleOn&&S(f.container,d.toggleOn,G,1);a.removeChild(f.container)}function V(){f.container&&U();h=D.theme[d.theme];y=h.compiledHeatmaps||[];if(!y.length&&h.heatmaps.length){for(p=0;p<h.heatmaps.length;p++){y[p]=[];for(c=0;c<=J;c++){var b=y[p],e=c,g;g=0.33/J*c;var j=h.heatmaps[p].saturation,m=h.heatmaps[p].lightness,n=void 0,k=void 0,l=void 0,t=l=void 0,v=n=k=void 0,v=void 0,l=0.5>=m?m*(1+j):m+j-m*j;0===l?g="#000":(t=2*m-l,k=(l-t)/l,g*=6,n=Math.floor(g),
v=g-n,v*=l*k,0===n||6===n?(n=l,k=t+v,l=t):1===n?(n=l-v,k=l,l=t):2===n?(n=t,k=l,l=t+v):3===n?(n=t,k=l-v):4===n?(n=t+v,k=t):(n=l,k=t,l-=v),g="#"+N(n)+N(k)+N(l));b[e]=g}}h.compiledHeatmaps=y}f.container=s(document.createElement("div"),h.container);f.count=f.container.appendChild(s(document.createElement("div"),h.count));f.legend=f.container.appendChild(s(document.createElement("div"),h.legend));f.graph=d.graph?f.container.appendChild(s(document.createElement("div"),h.graph)):0;w.length=0;for(var q in f)f[q]&&
h[q].heatOn&&w.push({name:q,el:f[q]});u.length=0;if(f.graph){f.graph.style.width=d.history*h.column.width+(d.history-1)*h.column.spacing+"px";for(c=0;c<d.history;c++)u[c]=f.graph.appendChild(s(document.createElement("div"),h.column)),u[c].style.position="absolute",u[c].style.bottom=0,u[c].style.right=c*h.column.width+c*h.column.spacing+"px",u[c].style.width=h.column.width+"px",u[c].style.height="0px"}s(f.container,d);r();a.appendChild(f.container);f.graph&&(O=f.graph.clientHeight);d.toggleOn&&("click"===
d.toggleOn&&(f.container.style.cursor="pointer"),S(f.container,d.toggleOn,G))}"object"===H(a)&&a.nodeType===j&&(e=a,a=document.body);a||(a=document.body);var b=this,d=I({},D.defaults,e||{}),f={},u=[],h,y,J=100,w=[],W=0,B=d.threshold,Q=0,L=A()-B,z,E=[],F=[],x,P,q="fps"===d.show,O,K,c,p;b.options=d;b.fps=0;b.duration=0;b.isPaused=0;b.tickStart=function(){Q=A()};b.tick=function(){z=A();W=z-L;B+=(W-B)/d.smoothing;b.fps=1E3/B;b.duration=Q<L?B:z-Q;L=z};b.pause=function(){x&&(b.isPaused=1,clearTimeout(x),
C(x),C(P),x=P=0);return b};b.resume=function(){x||(b.isPaused=0,k());return b};b.set=function(a,c){d[a]=c;q="fps"===d.show;-1!==R(a,X)&&V();-1!==R(a,Y)&&s(f.container,d);return b};b.showDuration=function(){b.set("show","ms");return b};b.showFps=function(){b.set("show","fps");return b};b.toggle=function(){b.set("show",q?"ms":"fps");return b};b.hide=function(){b.pause();f.container.style.display="none";return b};b.show=function(){b.resume();f.container.style.display="block";return b};b.destroy=function(){b.pause();
U();b.tick=b.tickStart=function(){}};V();k()}var A,r=m.performance;A=r&&(r.now||r.webkitNow)?r[r.now?"now":"webkitNow"].bind(r):function(){return+new Date};for(var C=m.cancelAnimationFrame||m.cancelRequestAnimationFrame,M=m.requestAnimationFrame,r=["moz","webkit","o"],G=0,k=0,Z=r.length;k<Z&&!C;++k)M=(C=m[r[k]+"CancelAnimationFrame"]||m[r[k]+"CancelRequestAnimationFrame"])&&m[r[k]+"RequestAnimationFrame"];C||(M=function(a){var e=A(),g=Math.max(0,16-(e-G));G=e+g;return m.setTimeout(function(){a(e+
g)},g)},C=function(a){clearTimeout(a)});var T="string"===H(document.createElement("div").textContent)?"textContent":"innerText";D.extend=I;window.FPSMeter=D;D.defaults={interval:100,smoothing:10,show:"fps",toggleOn:"click",decimals:1,maxFps:60,threshold:100,position:"absolute",zIndex:10,left:"5px",top:"5px",right:"auto",bottom:"auto",margin:"0 0 0 0",theme:"dark",heat:0,graph:0,history:20};var X=["toggleOn","theme","heat","graph","history"],Y="position zIndex left top right bottom margin".split(" ")})(window);(function(m,j){j.theme={};var s=j.theme.base={heatmaps:[],container:{heatOn:null,heatmap:null,padding:"5px",minWidth:"95px",height:"30px",lineHeight:"30px",textAlign:"right",textShadow:"none"},count:{heatOn:null,heatmap:null,position:"absolute",top:0,right:0,padding:"5px 10px",height:"30px",fontSize:"24px",fontFamily:"Consolas, Andale Mono, monospace",zIndex:2},legend:{heatOn:null,heatmap:null,position:"absolute",top:0,left:0,padding:"5px 10px",height:"30px",fontSize:"12px",lineHeight:"32px",fontFamily:"sans-serif",
textAlign:"left",zIndex:2},graph:{heatOn:null,heatmap:null,position:"relative",boxSizing:"padding-box",MozBoxSizing:"padding-box",height:"100%",zIndex:1},column:{width:4,spacing:1,heatOn:null,heatmap:null}};j.theme.dark=j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.8}],container:{background:"#222",color:"#fff",border:"1px solid #1a1a1a",textShadow:"1px 1px 0 #222"},count:{heatOn:"color"},column:{background:"#3f3f3f"}});j.theme.light=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.5}],
container:{color:"#666",background:"#fff",textShadow:"1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},count:{heatOn:"color"},column:{background:"#eaeaea"}});j.theme.colorful=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.6}],container:{heatOn:"backgroundColor",background:"#888",color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.2)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},column:{background:"#777",backgroundColor:"rgba(0,0,0,.2)"}});j.theme.transparent=
j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.5}],container:{padding:0,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.5)"},count:{padding:"0 5px",height:"40px",lineHeight:"40px"},legend:{padding:"0 5px",height:"40px",lineHeight:"42px"},graph:{height:"40px"},column:{width:5,background:"#999",heatOn:"backgroundColor",opacity:0.5}})})(window,FPSMeter);

/*! @license Copyright 2011 Dan Vanderkam (danvdk@gmail.com) MIT-licensed (http://opensource.org/licenses/MIT) */
Date.ext={};Date.ext.util={};Date.ext.util.xPad=function(a,c,b){if(typeof(b)=="undefined"){b=10}for(;parseInt(a,10)<b&&b>1;b/=10){a=c.toString()+a}return a.toString()};Date.prototype.locale="en-GB";if(document.getElementsByTagName("html")&&document.getElementsByTagName("html")[0].lang){Date.prototype.locale=document.getElementsByTagName("html")[0].lang}Date.ext.locales={};Date.ext.locales.en={a:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],A:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],b:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],B:["January","February","March","April","May","June","July","August","September","October","November","December"],c:"%a %d %b %Y %T %Z",p:["AM","PM"],P:["am","pm"],x:"%d/%m/%y",X:"%T"};Date.ext.locales["en-US"]=Date.ext.locales.en;Date.ext.locales["en-US"].c="%a %d %b %Y %r %Z";Date.ext.locales["en-US"].x="%D";Date.ext.locales["en-US"].X="%r";Date.ext.locales["en-GB"]=Date.ext.locales.en;Date.ext.locales["en-AU"]=Date.ext.locales["en-GB"];Date.ext.formats={a:function(a){return Date.ext.locales[a.locale].a[a.getDay()]},A:function(a){return Date.ext.locales[a.locale].A[a.getDay()]},b:function(a){return Date.ext.locales[a.locale].b[a.getMonth()]},B:function(a){return Date.ext.locales[a.locale].B[a.getMonth()]},c:"toLocaleString",C:function(a){return Date.ext.util.xPad(parseInt(a.getFullYear()/100,10),0)},d:["getDate","0"],e:["getDate"," "],g:function(a){return Date.ext.util.xPad(parseInt(Date.ext.util.G(a)/100,10),0)},G:function(c){var e=c.getFullYear();var b=parseInt(Date.ext.formats.V(c),10);var a=parseInt(Date.ext.formats.W(c),10);if(a>b){e++}else{if(a===0&&b>=52){e--}}return e},H:["getHours","0"],I:function(b){var a=b.getHours()%12;return Date.ext.util.xPad(a===0?12:a,0)},j:function(c){var a=c-new Date(""+c.getFullYear()+"/1/1 GMT");a+=c.getTimezoneOffset()*60000;var b=parseInt(a/60000/60/24,10)+1;return Date.ext.util.xPad(b,0,100)},m:function(a){return Date.ext.util.xPad(a.getMonth()+1,0)},M:["getMinutes","0"],p:function(a){return Date.ext.locales[a.locale].p[a.getHours()>=12?1:0]},P:function(a){return Date.ext.locales[a.locale].P[a.getHours()>=12?1:0]},S:["getSeconds","0"],u:function(a){var b=a.getDay();return b===0?7:b},U:function(e){var a=parseInt(Date.ext.formats.j(e),10);var c=6-e.getDay();var b=parseInt((a+c)/7,10);return Date.ext.util.xPad(b,0)},V:function(e){var c=parseInt(Date.ext.formats.W(e),10);var a=(new Date(""+e.getFullYear()+"/1/1")).getDay();var b=c+(a>4||a<=1?0:1);if(b==53&&(new Date(""+e.getFullYear()+"/12/31")).getDay()<4){b=1}else{if(b===0){b=Date.ext.formats.V(new Date(""+(e.getFullYear()-1)+"/12/31"))}}return Date.ext.util.xPad(b,0)},w:"getDay",W:function(e){var a=parseInt(Date.ext.formats.j(e),10);var c=7-Date.ext.formats.u(e);var b=parseInt((a+c)/7,10);return Date.ext.util.xPad(b,0,10)},y:function(a){return Date.ext.util.xPad(a.getFullYear()%100,0)},Y:"getFullYear",z:function(c){var b=c.getTimezoneOffset();var a=Date.ext.util.xPad(parseInt(Math.abs(b/60),10),0);var e=Date.ext.util.xPad(b%60,0);return(b>0?"-":"+")+a+e},Z:function(a){return a.toString().replace(/^.*\(([^)]+)\)$/,"$1")},"%":function(a){return"%"}};Date.ext.aggregates={c:"locale",D:"%m/%d/%y",h:"%b",n:"\n",r:"%I:%M:%S %p",R:"%H:%M",t:"\t",T:"%H:%M:%S",x:"locale",X:"locale"};Date.ext.aggregates.z=Date.ext.formats.z(new Date());Date.ext.aggregates.Z=Date.ext.formats.Z(new Date());Date.ext.unsupported={};Date.prototype.strftime=function(a){if(!(this.locale in Date.ext.locales)){if(this.locale.replace(/-[a-zA-Z]+$/,"") in Date.ext.locales){this.locale=this.locale.replace(/-[a-zA-Z]+$/,"")}else{this.locale="en-GB"}}var c=this;while(a.match(/%[cDhnrRtTxXzZ]/)){a=a.replace(/%([cDhnrRtTxXzZ])/g,function(e,d){var g=Date.ext.aggregates[d];return(g=="locale"?Date.ext.locales[c.locale][d]:g)})}var b=a.replace(/%([aAbBCdegGHIjmMpPSuUVwWyY%])/g,function(e,d){var g=Date.ext.formats[d];if(typeof(g)=="string"){return c[g]()}else{if(typeof(g)=="function"){return g.call(c,c)}else{if(typeof(g)=="object"&&typeof(g[0])=="string"){return Date.ext.util.xPad(c[g[0]](),g[1])}else{return d}}}});c=null;return b};"use strict";function RGBColorParser(f){this.ok=false;if(f.charAt(0)=="#"){f=f.substr(1,6)}f=f.replace(/ /g,"");f=f.toLowerCase();var b={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"00ffff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000000",blanchedalmond:"ffebcd",blue:"0000ff",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"00ffff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dodgerblue:"1e90ff",feldspar:"d19275",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"ff00ff",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgrey:"d3d3d3",lightgreen:"90ee90",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslateblue:"8470ff",lightslategray:"778899",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"00ff00",limegreen:"32cd32",linen:"faf0e6",magenta:"ff00ff",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370d8",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"d87093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"ff0000",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",violetred:"d02090",wheat:"f5deb3",white:"ffffff",whitesmoke:"f5f5f5",yellow:"ffff00",yellowgreen:"9acd32"};for(var g in b){if(f==g){f=b[g]}}var e=[{re:/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,example:["rgb(123, 234, 45)","rgb(255,234,245)"],process:function(i){return[parseInt(i[1]),parseInt(i[2]),parseInt(i[3])]}},{re:/^(\w{2})(\w{2})(\w{2})$/,example:["#00ff00","336699"],process:function(i){return[parseInt(i[1],16),parseInt(i[2],16),parseInt(i[3],16)]}},{re:/^(\w{1})(\w{1})(\w{1})$/,example:["#fb0","f0f"],process:function(i){return[parseInt(i[1]+i[1],16),parseInt(i[2]+i[2],16),parseInt(i[3]+i[3],16)]}}];for(var c=0;c<e.length;c++){var j=e[c].re;var a=e[c].process;var h=j.exec(f);if(h){var d=a(h);this.r=d[0];this.g=d[1];this.b=d[2];this.ok=true}}this.r=(this.r<0||isNaN(this.r))?0:((this.r>255)?255:this.r);this.g=(this.g<0||isNaN(this.g))?0:((this.g>255)?255:this.g);this.b=(this.b<0||isNaN(this.b))?0:((this.b>255)?255:this.b);this.toRGB=function(){return"rgb("+this.r+", "+this.g+", "+this.b+")"};this.toHex=function(){var l=this.r.toString(16);var k=this.g.toString(16);var i=this.b.toString(16);if(l.length==1){l="0"+l}if(k.length==1){k="0"+k}if(i.length==1){i="0"+i}return"#"+l+k+i}}function printStackTrace(b){b=b||{guess:true};var c=b.e||null,e=!!b.guess;var d=new printStackTrace.implementation(),a=d.run(c);return(e)?d.guessAnonymousFunctions(a):a}printStackTrace.implementation=function(){};printStackTrace.implementation.prototype={run:function(a,b){a=a||this.createException();b=b||this.mode(a);if(b==="other"){return this.other(arguments.callee)}else{return this[b](a)}},createException:function(){try{this.undef()}catch(a){return a}},mode:function(a){if(a["arguments"]&&a.stack){return"chrome"}else{if(typeof a.message==="string"&&typeof window!=="undefined"&&window.opera){if(!a.stacktrace){return"opera9"}if(a.message.indexOf("\n")>-1&&a.message.split("\n").length>a.stacktrace.split("\n").length){return"opera9"}if(!a.stack){return"opera10a"}if(a.stacktrace.indexOf("called from line")<0){return"opera10b"}return"opera11"}else{if(a.stack){return"firefox"}}}return"other"},instrumentFunction:function(b,d,e){b=b||window;var a=b[d];b[d]=function c(){e.call(this,printStackTrace().slice(4));return b[d]._instrumented.apply(this,arguments)};b[d]._instrumented=a},deinstrumentFunction:function(a,b){if(a[b].constructor===Function&&a[b]._instrumented&&a[b]._instrumented.constructor===Function){a[b]=a[b]._instrumented}},chrome:function(b){var a=(b.stack+"\n").replace(/^\S[^\(]+?[\n$]/gm,"").replace(/^\s+at\s+/gm,"").replace(/^([^\(]+?)([\n$])/gm,"{anonymous}()@$1$2").replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm,"{anonymous}()@$1").split("\n");a.pop();return a},firefox:function(a){return a.stack.replace(/(?:\n@:0)?\s+$/m,"").replace(/^\(/gm,"{anonymous}(").split("\n")},opera11:function(g){var a="{anonymous}",h=/^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;var k=g.stacktrace.split("\n"),l=[];for(var c=0,f=k.length;c<f;c+=2){var d=h.exec(k[c]);if(d){var j=d[4]+":"+d[1]+":"+d[2];var b=d[3]||"global code";b=b.replace(/<anonymous function: (\S+)>/,"$1").replace(/<anonymous function>/,a);l.push(b+"@"+j+" -- "+k[c+1].replace(/^\s+/,""))}}return l},opera10b:function(g){var a="{anonymous}",h=/^(.*)@(.+):(\d+)$/;var j=g.stacktrace.split("\n"),k=[];for(var c=0,f=j.length;c<f;c++){var d=h.exec(j[c]);if(d){var b=d[1]?(d[1]+"()"):"global code";k.push(b+"@"+d[2]+":"+d[3])}}return k},opera10a:function(g){var a="{anonymous}",h=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;var j=g.stacktrace.split("\n"),k=[];for(var c=0,f=j.length;c<f;c+=2){var d=h.exec(j[c]);if(d){var b=d[3]||a;k.push(b+"()@"+d[2]+":"+d[1]+" -- "+j[c+1].replace(/^\s+/,""))}}return k},opera9:function(j){var d="{anonymous}",h=/Line (\d+).*script (?:in )?(\S+)/i;var c=j.message.split("\n"),b=[];for(var g=2,a=c.length;g<a;g+=2){var f=h.exec(c[g]);if(f){b.push(d+"()@"+f[2]+":"+f[1]+" -- "+c[g+1].replace(/^\s+/,""))}}return b},other:function(g){var b="{anonymous}",f=/function\s*([\w\-$]+)?\s*\(/i,a=[],d,c,e=10;while(g&&a.length<e){d=f.test(g.toString())?RegExp.$1||b:b;c=Array.prototype.slice.call(g["arguments"]||[]);a[a.length]=d+"("+this.stringifyArguments(c)+")";g=g.caller}return a},stringifyArguments:function(c){var b=[];var e=Array.prototype.slice;for(var d=0;d<c.length;++d){var a=c[d];if(a===undefined){b[d]="undefined"}else{if(a===null){b[d]="null"}else{if(a.constructor){if(a.constructor===Array){if(a.length<3){b[d]="["+this.stringifyArguments(a)+"]"}else{b[d]="["+this.stringifyArguments(e.call(a,0,1))+"..."+this.stringifyArguments(e.call(a,-1))+"]"}}else{if(a.constructor===Object){b[d]="#object"}else{if(a.constructor===Function){b[d]="#function"}else{if(a.constructor===String){b[d]='"'+a+'"'}else{if(a.constructor===Number){b[d]=a}}}}}}}}}return b.join(",")},sourceCache:{},ajax:function(a){var b=this.createXMLHTTPObject();if(b){try{b.open("GET",a,false);b.send(null);return b.responseText}catch(c){}}return""},createXMLHTTPObject:function(){var c,a=[function(){return new XMLHttpRequest()},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];for(var b=0;b<a.length;b++){try{c=a[b]();this.createXMLHTTPObject=a[b];return c}catch(d){}}},isSameDomain:function(a){return a.indexOf(location.hostname)!==-1},getSource:function(a){if(!(a in this.sourceCache)){this.sourceCache[a]=this.ajax(a).split("\n")}return this.sourceCache[a]},guessAnonymousFunctions:function(k){for(var g=0;g<k.length;++g){var f=/\{anonymous\}\(.*\)@(.*)/,l=/^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,b=k[g],c=f.exec(b);if(c){var e=l.exec(c[1]),d=e[1],a=e[2],j=e[3]||0;if(d&&this.isSameDomain(d)&&a){var h=this.guessAnonymousFunction(d,a,j);k[g]=b.replace("{anonymous}",h)}}}return k},guessAnonymousFunction:function(c,f,a){var b;try{b=this.findFunctionName(this.getSource(c),f)}catch(d){b="getSource failed with url: "+c+", exception: "+d.toString()}return b},findFunctionName:function(a,e){var g=/function\s+([^(]*?)\s*\(([^)]*)\)/;var k=/['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/;var h=/['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/;var b="",l,j=Math.min(e,20),d,c;for(var f=0;f<j;++f){l=a[e-f-1];c=l.indexOf("//");if(c>=0){l=l.substr(0,c)}if(l){b=l+b;d=k.exec(b);if(d&&d[1]){return d[1]}d=g.exec(b);if(d&&d[1]){return d[1]}d=h.exec(b);if(d&&d[1]){return d[1]}}}return"(?)"}};CanvasRenderingContext2D.prototype.installPattern=function(e){if(typeof(this.isPatternInstalled)!=="undefined"){throw"Must un-install old line pattern before installing a new one."}this.isPatternInstalled=true;var g=[0,0];var b=[];var f=this.beginPath;var d=this.lineTo;var c=this.moveTo;var a=this.stroke;this.uninstallPattern=function(){this.beginPath=f;this.lineTo=d;this.moveTo=c;this.stroke=a;this.uninstallPattern=undefined;this.isPatternInstalled=undefined};this.beginPath=function(){b=[];f.call(this)};this.moveTo=function(h,i){b.push([[h,i]]);c.call(this,h,i)};this.lineTo=function(h,j){var i=b[b.length-1];i.push([h,j])};this.stroke=function(){if(b.length===0){a.call(this);return}for(var p=0;p<b.length;p++){var o=b[p];var l=o[0][0],u=o[0][1];for(var n=1;n<o.length;n++){var h=o[n][0],s=o[n][1];this.save();var w=(h-l);var v=(s-u);var r=Math.sqrt(w*w+v*v);var k=Math.atan2(v,w);this.translate(l,u);c.call(this,0,0);this.rotate(k);var m=g[0];var t=0;while(r>t){var q=e[m];if(g[1]){t+=g[1]}else{t+=q}if(t>r){g=[m,t-r];t=r}else{g=[(m+1)%e.length,0]}if(m%2===0){d.call(this,t,0)}else{c.call(this,t,0)}m=(m+1)%e.length}this.restore();l=h,u=s}}a.call(this);b=[]}};CanvasRenderingContext2D.prototype.uninstallPattern=function(){throw"Must install a line pattern before uninstalling it."};var DygraphOptions=(function(){var a=function(b){this.dygraph_=b;this.yAxes_=[];this.xAxis_={};this.series_={};this.global_=this.dygraph_.attrs_;this.user_=this.dygraph_.user_attrs_||{};this.labels_=[];this.highlightSeries_=this.get("highlightSeriesOpts")||{};this.reparseSeries()};a.AXIS_STRING_MAPPINGS_={y:0,Y:0,y1:0,Y1:0,y2:1,Y2:1};a.axisToIndex_=function(b){if(typeof(b)=="string"){if(a.AXIS_STRING_MAPPINGS_.hasOwnProperty(b)){return a.AXIS_STRING_MAPPINGS_[b]}throw"Unknown axis : "+b}if(typeof(b)=="number"){if(b===0||b===1){return b}throw"Dygraphs only supports two y-axes, indexed from 0-1."}if(b){throw"Unknown axis : "+b}return 0};a.prototype.reparseSeries=function(){var g=this.get("labels");if(!g){return}this.labels_=g.slice(1);this.yAxes_=[{series:[],options:{}}];this.xAxis_={options:{}};this.series_={};var h=!this.user_.series;if(h){var c=0;for(var j=0;j<this.labels_.length;j++){var i=this.labels_[j];var e=this.user_[i]||{};var b=0;var d=e.axis;if(typeof(d)=="object"){b=++c;this.yAxes_[b]={series:[i],options:d}}if(!d){this.yAxes_[0].series.push(i)}this.series_[i]={idx:j,yAxis:b,options:e}}for(var j=0;j<this.labels_.length;j++){var i=this.labels_[j];var e=this.series_[i]["options"];var d=e.axis;if(typeof(d)=="string"){if(!this.series_.hasOwnProperty(d)){Dygraph.error("Series "+i+" wants to share a y-axis with series "+d+", which does not define its own axis.");return}var b=this.series_[d].yAxis;this.series_[i].yAxis=b;this.yAxes_[b].series.push(i)}}}else{for(var j=0;j<this.labels_.length;j++){var i=this.labels_[j];var e=this.user_.series[i]||{};var b=a.axisToIndex_(e.axis);this.series_[i]={idx:j,yAxis:b,options:e};if(!this.yAxes_[b]){this.yAxes_[b]={series:[i],options:{}}}else{this.yAxes_[b].series.push(i)}}}var f=this.user_.axes||{};Dygraph.update(this.yAxes_[0].options,f.y||{});if(this.yAxes_.length>1){Dygraph.update(this.yAxes_[1].options,f.y2||{})}Dygraph.update(this.xAxis_.options,f.x||{})};a.prototype.get=function(c){var b=this.getGlobalUser_(c);if(b!==null){return b}return this.getGlobalDefault_(c)};a.prototype.getGlobalUser_=function(b){if(this.user_.hasOwnProperty(b)){return this.user_[b]}return null};a.prototype.getGlobalDefault_=function(b){if(this.global_.hasOwnProperty(b)){return this.global_[b]}if(Dygraph.DEFAULT_ATTRS.hasOwnProperty(b)){return Dygraph.DEFAULT_ATTRS[b]}return null};a.prototype.getForAxis=function(d,e){var f;var i;if(typeof(e)=="number"){f=e;i=f===0?"y":"y2"}else{if(e=="y1"){e="y"}if(e=="y"){f=0}else{if(e=="y2"){f=1}else{if(e=="x"){f=-1}else{throw"Unknown axis "+e}}}i=e}var g=(f==-1)?this.xAxis_:this.yAxes_[f];if(g){var h=g.options;if(h.hasOwnProperty(d)){return h[d]}}var c=this.getGlobalUser_(d);if(c!==null){return c}var b=Dygraph.DEFAULT_ATTRS.axes[i];if(b.hasOwnProperty(d)){return b[d]}return this.getGlobalDefault_(d)};a.prototype.getForSeries=function(c,e){if(e===this.dygraph_.getHighlightSeries()){if(this.highlightSeries_.hasOwnProperty(c)){return this.highlightSeries_[c]}}if(!this.series_.hasOwnProperty(e)){throw"Unknown series: "+e}var d=this.series_[e];var b=d.options;if(b.hasOwnProperty(c)){return b[c]}return this.getForAxis(c,d.yAxis)};a.prototype.numAxes=function(){return this.yAxes_.length};a.prototype.axisForSeries=function(b){return this.series_[b].yAxis};a.prototype.axisOptions=function(b){return this.yAxes_[b].options};a.prototype.seriesForAxis=function(b){return this.yAxes_[b].series};a.prototype.seriesNames=function(){return this.labels_};return a})();"use strict";var DygraphLayout=function(a){this.dygraph_=a;this.points=[];this.setNames=[];this.annotations=[];this.yAxes_=null;this.xTicks_=null;this.yTicks_=null};DygraphLayout.prototype.attr_=function(a){return this.dygraph_.attr_(a)};DygraphLayout.prototype.addDataset=function(a,b){this.points.push(b);this.setNames.push(a)};DygraphLayout.prototype.getPlotArea=function(){return this.area_};DygraphLayout.prototype.computePlotArea=function(){var a={x:0,y:0};a.w=this.dygraph_.width_-a.x-this.attr_("rightGap");a.h=this.dygraph_.height_;var b={chart_div:this.dygraph_.graphDiv,reserveSpaceLeft:function(c){var d={x:a.x,y:a.y,w:c,h:a.h};a.x+=c;a.w-=c;return d},reserveSpaceRight:function(c){var d={x:a.x+a.w-c,y:a.y,w:c,h:a.h};a.w-=c;return d},reserveSpaceTop:function(c){var d={x:a.x,y:a.y,w:a.w,h:c};a.y+=c;a.h-=c;return d},reserveSpaceBottom:function(c){var d={x:a.x,y:a.y+a.h-c,w:a.w,h:c};a.h-=c;return d},chartRect:function(){return{x:a.x,y:a.y,w:a.w,h:a.h}}};this.dygraph_.cascadeEvents_("layout",b);this.area_=a};DygraphLayout.prototype.setAnnotations=function(d){this.annotations=[];var e=this.attr_("xValueParser")||function(a){return a};for(var c=0;c<d.length;c++){var b={};if(!d[c].xval&&d[c].x===undefined){this.dygraph_.error("Annotations must have an 'x' property");return}if(d[c].icon&&!(d[c].hasOwnProperty("width")&&d[c].hasOwnProperty("height"))){this.dygraph_.error("Must set width and height when setting annotation.icon property");return}Dygraph.update(b,d[c]);if(!b.xval){b.xval=e(b.x)}this.annotations.push(b)}};DygraphLayout.prototype.setXTicks=function(a){this.xTicks_=a};DygraphLayout.prototype.setYAxes=function(a){this.yAxes_=a};DygraphLayout.prototype.evaluate=function(){this._evaluateLimits();this._evaluateLineCharts();this._evaluateLineTicks();this._evaluateAnnotations()};DygraphLayout.prototype._evaluateLimits=function(){var a=this.dygraph_.xAxisRange();this.minxval=a[0];this.maxxval=a[1];var d=a[1]-a[0];this.xscale=(d!==0?1/d:1);for(var b=0;b<this.yAxes_.length;b++){var c=this.yAxes_[b];c.minyval=c.computedValueRange[0];c.maxyval=c.computedValueRange[1];c.yrange=c.maxyval-c.minyval;c.yscale=(c.yrange!==0?1/c.yrange:1);if(c.g.attr_("logscale")){c.ylogrange=Dygraph.log10(c.maxyval)-Dygraph.log10(c.minyval);c.ylogscale=(c.ylogrange!==0?1/c.ylogrange:1);if(!isFinite(c.ylogrange)||isNaN(c.ylogrange)){c.g.error("axis "+b+" of graph at "+c.g+" can't be displayed in log scale for range ["+c.minyval+" - "+c.maxyval+"]")}}}};DygraphLayout._calcYNormal=function(b,c,a){if(a){return 1-((Dygraph.log10(c)-Dygraph.log10(b.minyval))*b.ylogscale)}else{return 1-((c-b.minyval)*b.yscale)}};DygraphLayout.prototype._evaluateLineCharts=function(){var c=this.attr_("connectSeparatedPoints");var k=this.attr_("stackedGraph");var e=this.attr_("errorBars")||this.attr_("customBars");for(var a=0;a<this.points.length;a++){var l=this.points[a];var f=this.setNames[a];var b=this.dygraph_.axisPropertiesForSeries(f);var g=this.dygraph_.attributes_.getForSeries("logscale",f);for(var d=0;d<l.length;d++){var i=l[d];i.x=(i.xval-this.minxval)*this.xscale;var h=i.yval;if(k){i.y_stacked=DygraphLayout._calcYNormal(b,i.yval_stacked,g);if(h!==null&&!isNaN(h)){h=i.yval_stacked}}if(h===null){h=NaN;if(!c){i.yval=NaN}}i.y=DygraphLayout._calcYNormal(b,h,g);if(e){i.y_top=DygraphLayout._calcYNormal(b,h-i.yval_minus,g);i.y_bottom=DygraphLayout._calcYNormal(b,h+i.yval_plus,g)}}}};DygraphLayout.parseFloat_=function(a){if(a===null){return NaN}return a};DygraphLayout.prototype._evaluateLineTicks=function(){var d,c,b,f;this.xticks=[];for(d=0;d<this.xTicks_.length;d++){c=this.xTicks_[d];b=c.label;f=this.xscale*(c.v-this.minxval);if((f>=0)&&(f<=1)){this.xticks.push([f,b])}}this.yticks=[];for(d=0;d<this.yAxes_.length;d++){var e=this.yAxes_[d];for(var a=0;a<e.ticks.length;a++){c=e.ticks[a];b=c.label;f=this.dygraph_.toPercentYCoord(c.v,d);if((f>=0)&&(f<=1)){this.yticks.push([d,f,b])}}}};DygraphLayout.prototype._evaluateAnnotations=function(){var d;var g={};for(d=0;d<this.annotations.length;d++){var b=this.annotations[d];g[b.xval+","+b.series]=b}this.annotated_points=[];if(!this.annotations||!this.annotations.length){return}for(var h=0;h<this.points.length;h++){var e=this.points[h];for(d=0;d<e.length;d++){var f=e[d];var c=f.xval+","+f.name;if(c in g){f.annotation=g[c];this.annotated_points.push(f)}}}};DygraphLayout.prototype.removeAllDatasets=function(){delete this.points;delete this.setNames;delete this.setPointsLengths;delete this.setPointsOffsets;this.points=[];this.setNames=[];this.setPointsLengths=[];this.setPointsOffsets=[]};"use strict";var DygraphCanvasRenderer=function(d,c,b,e){this.dygraph_=d;this.layout=e;this.element=c;this.elementContext=b;this.container=this.element.parentNode;this.height=this.element.height;this.width=this.element.width;if(!this.isIE&&!(DygraphCanvasRenderer.isSupported(this.element))){throw"Canvas is not supported."}this.area=e.getPlotArea();this.container.style.position="relative";this.container.style.width=this.width+"px";if(this.dygraph_.isUsingExcanvas_){this._createIEClipArea()}else{if(!Dygraph.isAndroid()){var a=this.dygraph_.canvas_ctx_;a.beginPath();a.rect(this.area.x,this.area.y,this.area.w,this.area.h);a.clip();a=this.dygraph_.hidden_ctx_;a.beginPath();a.rect(this.area.x,this.area.y,this.area.w,this.area.h);a.clip()}}};DygraphCanvasRenderer.prototype.attr_=function(a,b){return this.dygraph_.attr_(a,b)};DygraphCanvasRenderer.prototype.clear=function(){var a;if(this.isIE){try{if(this.clearDelay){this.clearDelay.cancel();this.clearDelay=null}a=this.elementContext}catch(b){return}}a=this.elementContext;a.clearRect(0,0,this.width,this.height)};DygraphCanvasRenderer.isSupported=function(f){var b=null;try{if(typeof(f)=="undefined"||f===null){b=document.createElement("canvas")}else{b=f}b.getContext("2d")}catch(c){var d=navigator.appVersion.match(/MSIE (\d\.\d)/);var a=(navigator.userAgent.toLowerCase().indexOf("opera")!=-1);if((!d)||(d[1]<6)||(a)){return false}return true}return true};DygraphCanvasRenderer.prototype.render=function(){this._updatePoints();this._renderLineChart()};DygraphCanvasRenderer.prototype._createIEClipArea=function(){var g="dygraph-clip-div";var f=this.dygraph_.graphDiv;for(var e=f.childNodes.length-1;e>=0;e--){if(f.childNodes[e].className==g){f.removeChild(f.childNodes[e])}}var c=document.bgColor;var d=this.dygraph_.graphDiv;while(d!=document){var a=d.currentStyle.backgroundColor;if(a&&a!="transparent"){c=a;break}d=d.parentNode}function b(j){if(j.w===0||j.h===0){return}var i=document.createElement("div");i.className=g;i.style.backgroundColor=c;i.style.position="absolute";i.style.left=j.x+"px";i.style.top=j.y+"px";i.style.width=j.w+"px";i.style.height=j.h+"px";f.appendChild(i)}var h=this.area;b({x:0,y:0,w:h.x,h:this.height});b({x:h.x,y:0,w:this.width-h.x,h:h.y});b({x:h.x+h.w,y:0,w:this.width-h.x-h.w,h:this.height});b({x:h.x,y:h.y+h.h,w:this.width-h.x,h:this.height-h.h-h.y})};DygraphCanvasRenderer._getIteratorPredicate=function(a){return a?DygraphCanvasRenderer._predicateThatSkipsEmptyPoints:null};DygraphCanvasRenderer._predicateThatSkipsEmptyPoints=function(b,a){return b[a].yval!==null};DygraphCanvasRenderer._drawStyledLine=function(i,a,m,q,f,n,d){var h=i.dygraph;var c=h.getOption("stepPlot",i.setName);if(!Dygraph.isArrayLike(q)){q=null}var l=h.getOption("drawGapEdgePoints",i.setName);var o=i.points;var k=Dygraph.createIterator(o,0,o.length,DygraphCanvasRenderer._getIteratorPredicate(h.getOption("connectSeparatedPoints")));var j=q&&(q.length>=2);var p=i.drawingContext;p.save();if(j){p.installPattern(q)}var b=DygraphCanvasRenderer._drawSeries(i,k,m,d,f,l,c,a);DygraphCanvasRenderer._drawPointsOnLine(i,b,n,a,d);if(j){p.uninstallPattern()}p.restore()};DygraphCanvasRenderer._drawSeries=function(v,t,m,h,p,s,g,q){var b=null;var w=null;var k=null;var j;var o;var l=[];var f=true;var n=v.drawingContext;n.beginPath();n.strokeStyle=q;n.lineWidth=m;var c=t.array_;var u=t.end_;var a=t.predicate_;for(var r=t.start_;r<u;r++){o=c[r];if(a){while(r<u&&!a(c,r)){r++}if(r==u){break}o=c[r]}if(o.canvasy===null||o.canvasy!=o.canvasy){if(g&&b!==null){n.moveTo(b,w);n.lineTo(o.canvasx,w)}b=w=null}else{j=false;if(s||!b){t.nextIdx_=r;t.next();k=t.hasNext?t.peek.canvasy:null;var d=k===null||k!=k;j=(!b&&d);if(s){if((!f&&!b)||(t.hasNext&&d)){j=true}}}if(b!==null){if(m){if(g){n.moveTo(b,w);n.lineTo(o.canvasx,w)}n.lineTo(o.canvasx,o.canvasy)}}else{n.moveTo(o.canvasx,o.canvasy)}if(p||j){l.push([o.canvasx,o.canvasy,o.idx])}b=o.canvasx;w=o.canvasy}f=false}n.stroke();return l};DygraphCanvasRenderer._drawPointsOnLine=function(h,i,f,d,g){var c=h.drawingContext;for(var b=0;b<i.length;b++){var a=i[b];c.save();f(h.dygraph,h.setName,c,a[0],a[1],d,g,a[2]);c.restore()}};DygraphCanvasRenderer.prototype._updatePoints=function(){var e=this.layout.points;for(var c=e.length;c--;){var d=e[c];for(var b=d.length;b--;){var a=d[b];a.canvasx=this.area.w*a.x+this.area.x;a.canvasy=this.area.h*a.y+this.area.y}}};DygraphCanvasRenderer.prototype._renderLineChart=function(g,u){var h=u||this.elementContext;var n;var a=this.layout.points;var s=this.layout.setNames;var b;this.colors=this.dygraph_.colorsMap_;var o=this.attr_("plotter");var f=o;if(!Dygraph.isArrayLike(f)){f=[f]}var c={};for(n=0;n<s.length;n++){b=s[n];var t=this.attr_("plotter",b);if(t==o){continue}c[b]=t}for(n=0;n<f.length;n++){var r=f[n];var q=(n==f.length-1);for(var l=0;l<a.length;l++){b=s[l];if(g&&b!=g){continue}var m=a[l];var e=r;if(b in c){if(q){e=c[b]}else{continue}}var k=this.colors[b];var d=this.dygraph_.getOption("strokeWidth",b);h.save();h.strokeStyle=k;h.lineWidth=d;e({points:m,setName:b,drawingContext:h,color:k,strokeWidth:d,dygraph:this.dygraph_,axis:this.dygraph_.axisPropertiesForSeries(b),plotArea:this.area,seriesIndex:l,seriesCount:a.length,singleSeriesName:g,allSeriesPoints:a});h.restore()}}};DygraphCanvasRenderer._Plotters={linePlotter:function(a){DygraphCanvasRenderer._linePlotter(a)},fillPlotter:function(a){DygraphCanvasRenderer._fillPlotter(a)},errorPlotter:function(a){DygraphCanvasRenderer._errorPlotter(a)}};DygraphCanvasRenderer._linePlotter=function(f){var d=f.dygraph;var h=f.setName;var i=f.strokeWidth;var a=d.getOption("strokeBorderWidth",h);var j=d.getOption("drawPointCallback",h)||Dygraph.Circles.DEFAULT;var k=d.getOption("strokePattern",h);var c=d.getOption("drawPoints",h);var b=d.getOption("pointSize",h);if(a&&i){DygraphCanvasRenderer._drawStyledLine(f,d.getOption("strokeBorderColor",h),i+2*a,k,c,j,b)}DygraphCanvasRenderer._drawStyledLine(f,f.color,i,k,c,j,b)};DygraphCanvasRenderer._errorPlotter=function(s){var r=s.dygraph;var f=s.setName;var t=r.getOption("errorBars")||r.getOption("customBars");if(!t){return}var k=r.getOption("fillGraph",f);if(k){r.warn("Can't use fillGraph option with error bars")}var m=s.drawingContext;var n=s.color;var o=r.getOption("fillAlpha",f);var i=r.getOption("stepPlot",f);var p=s.points;var q=Dygraph.createIterator(p,0,p.length,DygraphCanvasRenderer._getIteratorPredicate(r.getOption("connectSeparatedPoints")));var j;var h=NaN;var c=NaN;var d=[-1,-1];var a=new RGBColorParser(n);var u="rgba("+a.r+","+a.g+","+a.b+","+o+")";m.fillStyle=u;m.beginPath();var b=function(e){return(e===null||e===undefined||isNaN(e))};while(q.hasNext){var l=q.next();if((!i&&b(l.y))||(i&&!isNaN(c)&&b(c))){h=NaN;continue}if(i){j=[l.y_bottom,l.y_top];c=l.y}else{j=[l.y_bottom,l.y_top]}j[0]=s.plotArea.h*j[0]+s.plotArea.y;j[1]=s.plotArea.h*j[1]+s.plotArea.y;if(!isNaN(h)){if(i){m.moveTo(h,d[0]);m.lineTo(l.canvasx,d[0]);m.lineTo(l.canvasx,d[1])}else{m.moveTo(h,d[0]);m.lineTo(l.canvasx,j[0]);m.lineTo(l.canvasx,j[1])}m.lineTo(h,d[1]);m.closePath()}d=j;h=l.canvasx}m.fill()};DygraphCanvasRenderer._fillPlotter=function(F){if(F.singleSeriesName){return}if(F.seriesIndex!==0){return}var D=F.dygraph;var I=D.getLabels().slice(1);for(var C=I.length;C>=0;C--){if(!D.visibility()[C]){I.splice(C,1)}}var h=(function(){for(var e=0;e<I.length;e++){if(D.getOption("fillGraph",I[e])){return true}}return false})();if(!h){return}var w=F.drawingContext;var E=F.plotArea;var c=F.allSeriesPoints;var z=c.length;var y=D.getOption("fillAlpha");var k=D.getOption("stackedGraph");var q=D.getColors();var s={};var a;var r;for(var u=z-1;u>=0;u--){var n=I[u];if(!D.getOption("fillGraph",n)){continue}var p=D.getOption("stepPlot",n);var x=q[u];var f=D.axisPropertiesForSeries(n);var d=1+f.minyval*f.yscale;if(d<0){d=0}else{if(d>1){d=1}}d=E.h*d+E.y;var B=c[u];var A=Dygraph.createIterator(B,0,B.length,DygraphCanvasRenderer._getIteratorPredicate(D.getOption("connectSeparatedPoints")));var m=NaN;var l=[-1,-1];var t;var b=new RGBColorParser(x);var H="rgba("+b.r+","+b.g+","+b.b+","+y+")";w.fillStyle=H;w.beginPath();var j,G=true;while(A.hasNext){var v=A.next();if(!Dygraph.isOK(v.y)){m=NaN;if(v.y_stacked!==null&&!isNaN(v.y_stacked)){s[v.canvasx]=E.h*v.y_stacked+E.y}continue}if(k){if(!G&&j==v.xval){continue}else{G=false;j=v.xval}a=s[v.canvasx];var o;if(a===undefined){o=d}else{if(r){o=a[0]}else{o=a}}t=[v.canvasy,o];if(p){if(l[0]===-1){s[v.canvasx]=[v.canvasy,d]}else{s[v.canvasx]=[v.canvasy,l[0]]}}else{s[v.canvasx]=v.canvasy}}else{t=[v.canvasy,d]}if(!isNaN(m)){w.moveTo(m,l[0]);if(p){w.lineTo(v.canvasx,l[0])}else{w.lineTo(v.canvasx,t[0])}if(r&&a){w.lineTo(v.canvasx,a[1])}else{w.lineTo(v.canvasx,t[1])}w.lineTo(m,l[1]);w.closePath()}l=t;m=v.canvasx}r=p;w.fill()}};"use strict";var Dygraph=function(d,c,b,a){this.is_initial_draw_=true;this.readyFns_=[];if(a!==undefined){this.warn("Using deprecated four-argument dygraph constructor");this.__old_init__(d,c,b,a)}else{this.__init__(d,c,b)}};Dygraph.NAME="Dygraph";Dygraph.VERSION="1.0.1";Dygraph.__repr__=function(){return"["+this.NAME+" "+this.VERSION+"]"};Dygraph.toString=function(){return this.__repr__()};Dygraph.DEFAULT_ROLL_PERIOD=1;Dygraph.DEFAULT_WIDTH=480;Dygraph.DEFAULT_HEIGHT=320;Dygraph.ANIMATION_STEPS=12;Dygraph.ANIMATION_DURATION=200;Dygraph.KMB_LABELS=["K","M","B","T","Q"];Dygraph.KMG2_BIG_LABELS=["k","M","G","T","P","E","Z","Y"];Dygraph.KMG2_SMALL_LABELS=["m","u","n","p","f","a","z","y"];Dygraph.numberValueFormatter=function(s,a,u,l){var e=a("sigFigs");if(e!==null){return Dygraph.floatFormat(s,e)}var c=a("digitsAfterDecimal");var o=a("maxNumberWidth");var b=a("labelsKMB");var r=a("labelsKMG2");var q;if(s!==0&&(Math.abs(s)>=Math.pow(10,o)||Math.abs(s)<Math.pow(10,-c))){q=s.toExponential(c)}else{q=""+Dygraph.round_(s,c)}if(b||r){var f;var t=[];var m=[];if(b){f=1000;t=Dygraph.KMB_LABELS}if(r){if(b){Dygraph.warn("Setting both labelsKMB and labelsKMG2. Pick one!")}f=1024;t=Dygraph.KMG2_BIG_LABELS;m=Dygraph.KMG2_SMALL_LABELS}var p=Math.abs(s);var d=Dygraph.pow(f,t.length);for(var h=t.length-1;h>=0;h--,d/=f){if(p>=d){q=Dygraph.round_(s/d,c)+t[h];break}}if(r){var i=String(s.toExponential()).split("e-");if(i.length===2&&i[1]>=3&&i[1]<=24){if(i[1]%3>0){q=Dygraph.round_(i[0]/Dygraph.pow(10,(i[1]%3)),c)}else{q=Number(i[0]).toFixed(2)}q+=m[Math.floor(i[1]/3)-1]}}}return q};Dygraph.numberAxisLabelFormatter=function(a,d,c,b){return Dygraph.numberValueFormatter(a,c,b)};Dygraph.dateString_=function(e){var i=Dygraph.zeropad;var h=new Date(e);var f=""+h.getFullYear();var g=i(h.getMonth()+1);var a=i(h.getDate());var c="";var b=h.getHours()*3600+h.getMinutes()*60+h.getSeconds();if(b){c=" "+Dygraph.hmsString_(e)}return f+"/"+g+"/"+a+c};Dygraph.dateAxisFormatter=function(b,c){if(c>=Dygraph.DECADAL){return b.strftime("%Y")}else{if(c>=Dygraph.MONTHLY){return b.strftime("%b %y")}else{var a=b.getHours()*3600+b.getMinutes()*60+b.getSeconds()+b.getMilliseconds();if(a===0||c>=Dygraph.DAILY){return new Date(b.getTime()+3600*1000).strftime("%d%b")}else{return Dygraph.hmsString_(b.getTime())}}}};Dygraph.Plotters=DygraphCanvasRenderer._Plotters;Dygraph.DEFAULT_ATTRS={highlightCircleSize:3,highlightSeriesOpts:null,highlightSeriesBackgroundAlpha:0.5,labelsDivWidth:250,labelsDivStyles:{},labelsSeparateLines:false,labelsShowZeroValues:true,labelsKMB:false,labelsKMG2:false,showLabelsOnHighlight:true,digitsAfterDecimal:2,maxNumberWidth:6,sigFigs:null,strokeWidth:1,strokeBorderWidth:0,strokeBorderColor:"white",axisTickSize:3,axisLabelFontSize:14,xAxisLabelWidth:50,yAxisLabelWidth:50,rightGap:5,showRoller:false,xValueParser:Dygraph.dateParser,delimiter:",",sigma:2,errorBars:false,fractions:false,wilsonInterval:true,customBars:false,fillGraph:false,fillAlpha:0.15,connectSeparatedPoints:false,stackedGraph:false,stackedGraphNaNFill:"all",hideOverlayOnMouseOut:true,legend:"onmouseover",stepPlot:false,avoidMinZero:false,xRangePad:0,yRangePad:null,drawAxesAtZero:false,titleHeight:28,xLabelHeight:18,yLabelWidth:18,drawXAxis:true,drawYAxis:true,axisLineColor:"black",axisLineWidth:0.3,gridLineWidth:0.3,axisLabelColor:"black",axisLabelFont:"Arial",axisLabelWidth:50,drawYGrid:true,drawXGrid:true,gridLineColor:"rgb(128,128,128)",interactionModel:null,animatedZooms:false,showRangeSelector:false,rangeSelectorHeight:40,rangeSelectorPlotStrokeColor:"#808FAB",rangeSelectorPlotFillColor:"#A7B1C4",plotter:[Dygraph.Plotters.fillPlotter,Dygraph.Plotters.errorPlotter,Dygraph.Plotters.linePlotter],plugins:[],axes:{x:{pixelsPerLabel:60,axisLabelFormatter:Dygraph.dateAxisFormatter,valueFormatter:Dygraph.dateString_,drawGrid:true,independentTicks:true,ticker:null},y:{pixelsPerLabel:30,valueFormatter:Dygraph.numberValueFormatter,axisLabelFormatter:Dygraph.numberAxisLabelFormatter,drawGrid:true,independentTicks:true,ticker:null},y2:{pixelsPerLabel:30,valueFormatter:Dygraph.numberValueFormatter,axisLabelFormatter:Dygraph.numberAxisLabelFormatter,drawGrid:false,independentTicks:false,ticker:null}}};Dygraph.HORIZONTAL=1;Dygraph.VERTICAL=2;Dygraph.PLUGINS=[];Dygraph.addedAnnotationCSS=false;Dygraph.prototype.__old_init__=function(f,d,e,b){if(e!==null){var a=["Date"];for(var c=0;c<e.length;c++){a.push(e[c])}Dygraph.update(b,{labels:a})}this.__init__(f,d,b)};Dygraph.prototype.__init__=function(a,c,l){if(/MSIE/.test(navigator.userAgent)&&!window.opera&&typeof(G_vmlCanvasManager)!="undefined"&&document.readyState!="complete"){var o=this;setTimeout(function(){o.__init__(a,c,l)},100);return}if(l===null||l===undefined){l={}}l=Dygraph.mapLegacyOptions_(l);if(typeof(a)=="string"){a=document.getElementById(a)}if(!a){Dygraph.error("Constructing dygraph with a non-existent div!");return}this.isUsingExcanvas_=typeof(G_vmlCanvasManager)!="undefined";this.maindiv_=a;this.file_=c;this.rollPeriod_=l.rollPeriod||Dygraph.DEFAULT_ROLL_PERIOD;this.previousVerticalX_=-1;this.fractions_=l.fractions||false;this.dateWindow_=l.dateWindow||null;this.annotations_=[];this.zoomed_x_=false;this.zoomed_y_=false;a.innerHTML="";if(a.style.width===""&&l.width){a.style.width=l.width+"px"}if(a.style.height===""&&l.height){a.style.height=l.height+"px"}if(a.style.height===""&&a.clientHeight===0){a.style.height=Dygraph.DEFAULT_HEIGHT+"px";if(a.style.width===""){a.style.width=Dygraph.DEFAULT_WIDTH+"px"}}this.width_=a.clientWidth||l.width||0;this.height_=a.clientHeight||l.height||0;if(l.stackedGraph){l.fillGraph=true}this.user_attrs_={};Dygraph.update(this.user_attrs_,l);this.attrs_={};Dygraph.updateDeep(this.attrs_,Dygraph.DEFAULT_ATTRS);this.boundaryIds_=[];this.setIndexByName_={};this.datasetIndex_=[];this.registeredEvents_=[];this.eventListeners_={};this.attributes_=new DygraphOptions(this);this.createInterface_();this.plugins_=[];var d=Dygraph.PLUGINS.concat(this.getOption("plugins"));for(var g=0;g<d.length;g++){var k=d[g];var f=new k();var j={plugin:f,events:{},options:{},pluginOptions:{}};var b=f.activate(this);for(var h in b){j.events[h]=b[h]}this.plugins_.push(j)}for(var g=0;g<this.plugins_.length;g++){var n=this.plugins_[g];for(var h in n.events){if(!n.events.hasOwnProperty(h)){continue}var m=n.events[h];var e=[n.plugin,m];if(!(h in this.eventListeners_)){this.eventListeners_[h]=[e]}else{this.eventListeners_[h].push(e)}}}this.createDragInterface_();this.start_()};Dygraph.prototype.cascadeEvents_=function(c,b){if(!(c in this.eventListeners_)){return true}var g={dygraph:this,cancelable:false,defaultPrevented:false,preventDefault:function(){if(!g.cancelable){throw"Cannot call preventDefault on non-cancelable event."}g.defaultPrevented=true},propagationStopped:false,stopPropagation:function(){g.propagationStopped=true}};Dygraph.update(g,b);var a=this.eventListeners_[c];if(a){for(var d=a.length-1;d>=0;d--){var f=a[d][0];var h=a[d][1];h.call(f,g);if(g.propagationStopped){break}}}return g.defaultPrevented};Dygraph.prototype.isZoomed=function(a){if(a===null||a===undefined){return this.zoomed_x_||this.zoomed_y_}if(a==="x"){return this.zoomed_x_}if(a==="y"){return this.zoomed_y_}throw"axis parameter is ["+a+"] must be null, 'x' or 'y'."};Dygraph.prototype.toString=function(){var a=this.maindiv_;var b=(a&&a.id)?a.id:a;return"[Dygraph "+b+"]"};Dygraph.prototype.attr_=function(b,a){return a?this.attributes_.getForSeries(b,a):this.attributes_.get(b)};Dygraph.prototype.getOption=function(a,b){return this.attr_(a,b)};Dygraph.prototype.getOptionForAxis=function(a,b){return this.attributes_.getForAxis(a,b)};Dygraph.prototype.optionsViewForAxis_=function(b){var a=this;return function(c){var d=a.user_attrs_.axes;if(d&&d[b]&&d[b].hasOwnProperty(c)){return d[b][c]}if(typeof(a.user_attrs_[c])!="undefined"){return a.user_attrs_[c]}d=a.attrs_.axes;if(d&&d[b]&&d[b].hasOwnProperty(c)){return d[b][c]}if(b=="y"&&a.axes_[0].hasOwnProperty(c)){return a.axes_[0][c]}else{if(b=="y2"&&a.axes_[1].hasOwnProperty(c)){return a.axes_[1][c]}}return a.attr_(c)}};Dygraph.prototype.rollPeriod=function(){return this.rollPeriod_};Dygraph.prototype.xAxisRange=function(){return this.dateWindow_?this.dateWindow_:this.xAxisExtremes()};Dygraph.prototype.xAxisExtremes=function(){var d=this.attr_("xRangePad")/this.plotter_.area.w;if(this.numRows()===0){return[0-d,1+d]}var c=this.rawData_[0][0];var b=this.rawData_[this.rawData_.length-1][0];if(d){var a=b-c;c-=a*d;b+=a*d}return[c,b]};Dygraph.prototype.yAxisRange=function(a){if(typeof(a)=="undefined"){a=0}if(a<0||a>=this.axes_.length){return null}var b=this.axes_[a];return[b.computedValueRange[0],b.computedValueRange[1]]};Dygraph.prototype.yAxisRanges=function(){var a=[];for(var b=0;b<this.axes_.length;b++){a.push(this.yAxisRange(b))}return a};Dygraph.prototype.toDomCoords=function(a,c,b){return[this.toDomXCoord(a),this.toDomYCoord(c,b)]};Dygraph.prototype.toDomXCoord=function(b){if(b===null){return null}var c=this.plotter_.area;var a=this.xAxisRange();return c.x+(b-a[0])/(a[1]-a[0])*c.w};Dygraph.prototype.toDomYCoord=function(d,a){var c=this.toPercentYCoord(d,a);if(c===null){return null}var b=this.plotter_.area;return b.y+c*b.h};Dygraph.prototype.toDataCoords=function(a,c,b){return[this.toDataXCoord(a),this.toDataYCoord(c,b)]};Dygraph.prototype.toDataXCoord=function(b){if(b===null){return null}var c=this.plotter_.area;var a=this.xAxisRange();return a[0]+(b-c.x)/c.w*(a[1]-a[0])};Dygraph.prototype.toDataYCoord=function(h,b){if(h===null){return null}var c=this.plotter_.area;var g=this.yAxisRange(b);if(typeof(b)=="undefined"){b=0}if(!this.attributes_.getForAxis("logscale",b)){return g[0]+(c.y+c.h-h)/c.h*(g[1]-g[0])}else{var f=(h-c.y)/c.h;var a=Dygraph.log10(g[1]);var e=a-(f*(a-Dygraph.log10(g[0])));var d=Math.pow(Dygraph.LOG_SCALE,e);return d}};Dygraph.prototype.toPercentYCoord=function(f,c){if(f===null){return null}if(typeof(c)=="undefined"){c=0}var e=this.yAxisRange(c);var d;var b=this.attributes_.getForAxis("logscale",c);if(!b){d=(e[1]-f)/(e[1]-e[0])}else{var a=Dygraph.log10(e[1]);d=(a-Dygraph.log10(f))/(a-Dygraph.log10(e[0]))}return d};Dygraph.prototype.toPercentXCoord=function(b){if(b===null){return null}var a=this.xAxisRange();return(b-a[0])/(a[1]-a[0])};Dygraph.prototype.numColumns=function(){if(!this.rawData_){return 0}return this.rawData_[0]?this.rawData_[0].length:this.attr_("labels").length};Dygraph.prototype.numRows=function(){if(!this.rawData_){return 0}return this.rawData_.length};Dygraph.prototype.getValue=function(b,a){if(b<0||b>this.rawData_.length){return null}if(a<0||a>this.rawData_[b].length){return null}return this.rawData_[b][a]};Dygraph.prototype.createInterface_=function(){var a=this.maindiv_;this.graphDiv=document.createElement("div");this.graphDiv.style.textAlign="left";a.appendChild(this.graphDiv);this.canvas_=Dygraph.createCanvas();this.canvas_.style.position="absolute";this.hidden_=this.createPlotKitCanvas_(this.canvas_);this.resizeElements_();this.canvas_ctx_=Dygraph.getContext(this.canvas_);this.hidden_ctx_=Dygraph.getContext(this.hidden_);this.graphDiv.appendChild(this.hidden_);this.graphDiv.appendChild(this.canvas_);this.mouseEventElement_=this.createMouseEventElement_();this.layout_=new DygraphLayout(this);var b=this;this.mouseMoveHandler_=function(c){b.mouseMove_(c)};this.mouseOutHandler_=function(f){var d=f.target||f.fromElement;var c=f.relatedTarget||f.toElement;if(Dygraph.isNodeContainedBy(d,b.graphDiv)&&!Dygraph.isNodeContainedBy(c,b.graphDiv)){b.mouseOut_(f)}};this.addAndTrackEvent(window,"mouseout",this.mouseOutHandler_);this.addAndTrackEvent(this.mouseEventElement_,"mousemove",this.mouseMoveHandler_);if(!this.resizeHandler_){this.resizeHandler_=function(c){b.resize()};this.addAndTrackEvent(window,"resize",this.resizeHandler_)}};Dygraph.prototype.resizeElements_=function(){this.graphDiv.style.width=this.width_+"px";this.graphDiv.style.height=this.height_+"px";this.canvas_.width=this.width_;this.canvas_.height=this.height_;this.canvas_.style.width=this.width_+"px";this.canvas_.style.height=this.height_+"px";this.hidden_.width=this.width_;this.hidden_.height=this.height_;this.hidden_.style.width=this.width_+"px";this.hidden_.style.height=this.height_+"px"};Dygraph.prototype.destroy=function(){this.canvas_ctx_.restore();this.hidden_ctx_.restore();var a=function(c){while(c.hasChildNodes()){a(c.firstChild);c.removeChild(c.firstChild)}};this.removeTrackedEvents_();Dygraph.removeEvent(window,"mouseout",this.mouseOutHandler_);Dygraph.removeEvent(this.mouseEventElement_,"mousemove",this.mouseMoveHandler_);Dygraph.removeEvent(window,"resize",this.resizeHandler_);this.resizeHandler_=null;a(this.maindiv_);var b=function(c){for(var d in c){if(typeof(c[d])==="object"){c[d]=null}}};b(this.layout_);b(this.plotter_);b(this)};Dygraph.prototype.createPlotKitCanvas_=function(a){var b=Dygraph.createCanvas();b.style.position="absolute";b.style.top=a.style.top;b.style.left=a.style.left;b.width=this.width_;b.height=this.height_;b.style.width=this.width_+"px";b.style.height=this.height_+"px";return b};Dygraph.prototype.createMouseEventElement_=function(){if(this.isUsingExcanvas_){var a=document.createElement("div");a.style.position="absolute";a.style.backgroundColor="white";a.style.filter="alpha(opacity=0)";a.style.width=this.width_+"px";a.style.height=this.height_+"px";this.graphDiv.appendChild(a);return a}else{return this.canvas_}};Dygraph.prototype.setColors_=function(){var g=this.getLabels();var e=g.length-1;this.colors_=[];this.colorsMap_={};var a=this.attr_("colors");var d;if(!a){var c=this.attr_("colorSaturation")||1;var b=this.attr_("colorValue")||0.5;var k=Math.ceil(e/2);for(d=1;d<=e;d++){if(!this.visibility()[d-1]){continue}var h=d%2?Math.ceil(d/2):(k+d/2);var f=(1*h/(1+e));var j=Dygraph.hsvToRGB(f,c,b);this.colors_.push(j);this.colorsMap_[g[d]]=j}}else{for(d=0;d<e;d++){if(!this.visibility()[d]){continue}var j=a[d%a.length];this.colors_.push(j);this.colorsMap_[g[1+d]]=j}}};Dygraph.prototype.getColors=function(){return this.colors_};Dygraph.prototype.getPropertiesForSeries=function(c){var a=-1;var d=this.getLabels();for(var b=1;b<d.length;b++){if(d[b]==c){a=b;break}}if(a==-1){return null}return{name:c,column:a,visible:this.visibility()[a-1],color:this.colorsMap_[c],axis:1+this.attributes_.axisForSeries(c)}};Dygraph.prototype.createRollInterface_=function(){if(!this.roller_){this.roller_=document.createElement("input");this.roller_.type="text";this.roller_.style.display="none";this.graphDiv.appendChild(this.roller_)}var e=this.attr_("showRoller")?"block":"none";var d=this.plotter_.area;var b={position:"absolute",zIndex:10,top:(d.y+d.h-25)+"px",left:(d.x+1)+"px",display:e};this.roller_.size="2";this.roller_.value=this.rollPeriod_;for(var a in b){if(b.hasOwnProperty(a)){this.roller_.style[a]=b[a]}}var c=this;this.roller_.onchange=function(){c.adjustRoll(c.roller_.value)}};Dygraph.prototype.dragGetX_=function(b,a){return Dygraph.pageX(b)-a.px};Dygraph.prototype.dragGetY_=function(b,a){return Dygraph.pageY(b)-a.py};Dygraph.prototype.createDragInterface_=function(){var c={isZooming:false,isPanning:false,is2DPan:false,dragStartX:null,dragStartY:null,dragEndX:null,dragEndY:null,dragDirection:null,prevEndX:null,prevEndY:null,prevDragDirection:null,cancelNextDblclick:false,initialLeftmostDate:null,xUnitsPerPixel:null,dateRange:null,px:0,py:0,boundedDates:null,boundedValues:null,tarp:new Dygraph.IFrameTarp(),initializeMouseDown:function(j,i,h){if(j.preventDefault){j.preventDefault()}else{j.returnValue=false;j.cancelBubble=true}h.px=Dygraph.findPosX(i.canvas_);h.py=Dygraph.findPosY(i.canvas_);h.dragStartX=i.dragGetX_(j,h);h.dragStartY=i.dragGetY_(j,h);h.cancelNextDblclick=false;h.tarp.cover()}};var f=this.attr_("interactionModel");var b=this;var e=function(g){return function(h){g(h,b,c)}};for(var a in f){if(!f.hasOwnProperty(a)){continue}this.addAndTrackEvent(this.mouseEventElement_,a,e(f[a]))}var d=function(h){if(c.isZooming||c.isPanning){c.isZooming=false;c.dragStartX=null;c.dragStartY=null}if(c.isPanning){c.isPanning=false;c.draggingDate=null;c.dateRange=null;for(var g=0;g<b.axes_.length;g++){delete b.axes_[g].draggingValue;delete b.axes_[g].dragValueRange}}c.tarp.uncover()};this.addAndTrackEvent(document,"mouseup",d)};Dygraph.prototype.drawZoomRect_=function(e,c,i,b,g,a,f,d){var h=this.canvas_ctx_;if(a==Dygraph.HORIZONTAL){h.clearRect(Math.min(c,f),this.layout_.getPlotArea().y,Math.abs(c-f),this.layout_.getPlotArea().h)}else{if(a==Dygraph.VERTICAL){h.clearRect(this.layout_.getPlotArea().x,Math.min(b,d),this.layout_.getPlotArea().w,Math.abs(b-d))}}if(e==Dygraph.HORIZONTAL){if(i&&c){h.fillStyle="rgba(128,128,128,0.33)";h.fillRect(Math.min(c,i),this.layout_.getPlotArea().y,Math.abs(i-c),this.layout_.getPlotArea().h)}}else{if(e==Dygraph.VERTICAL){if(g&&b){h.fillStyle="rgba(128,128,128,0.33)";h.fillRect(this.layout_.getPlotArea().x,Math.min(b,g),this.layout_.getPlotArea().w,Math.abs(g-b))}}}if(this.isUsingExcanvas_){this.currentZoomRectArgs_=[e,c,i,b,g,0,0,0]}};Dygraph.prototype.clearZoomRect_=function(){this.currentZoomRectArgs_=null;this.canvas_ctx_.clearRect(0,0,this.canvas_.width,this.canvas_.height)};Dygraph.prototype.doZoomX_=function(c,a){this.currentZoomRectArgs_=null;var b=this.toDataXCoord(c);var d=this.toDataXCoord(a);this.doZoomXDates_(b,d)};Dygraph.zoomAnimationFunction=function(c,b){var a=1.5;return(1-Math.pow(a,-c))/(1-Math.pow(a,-b))};Dygraph.prototype.doZoomXDates_=function(c,e){var a=this.xAxisRange();var d=[c,e];this.zoomed_x_=true;var b=this;this.doAnimatedZoom(a,d,null,null,function(){if(b.attr_("zoomCallback")){b.attr_("zoomCallback")(c,e,b.yAxisRanges())}})};Dygraph.prototype.doZoomY_=function(h,f){this.currentZoomRectArgs_=null;var c=this.yAxisRanges();var b=[];for(var e=0;e<this.axes_.length;e++){var d=this.toDataYCoord(h,e);var a=this.toDataYCoord(f,e);b.push([a,d])}this.zoomed_y_=true;var g=this;this.doAnimatedZoom(null,null,c,b,function(){if(g.attr_("zoomCallback")){var i=g.xAxisRange();g.attr_("zoomCallback")(i[0],i[1],g.yAxisRanges())}})};Dygraph.prototype.resetZoom=function(){var c=false,d=false,a=false;if(this.dateWindow_!==null){c=true;d=true}for(var g=0;g<this.axes_.length;g++){if(typeof(this.axes_[g].valueWindow)!=="undefined"&&this.axes_[g].valueWindow!==null){c=true;a=true}}this.clearSelection();if(c){this.zoomed_x_=false;this.zoomed_y_=false;var f=this.rawData_[0][0];var b=this.rawData_[this.rawData_.length-1][0];if(!this.attr_("animatedZooms")){this.dateWindow_=null;for(g=0;g<this.axes_.length;g++){if(this.axes_[g].valueWindow!==null){delete this.axes_[g].valueWindow}}this.drawGraph_();if(this.attr_("zoomCallback")){this.attr_("zoomCallback")(f,b,this.yAxisRanges())}return}var l=null,m=null,k=null,h=null;if(d){l=this.xAxisRange();m=[f,b]}if(a){k=this.yAxisRanges();var n=this.gatherDatasets_(this.rolledSeries_,null);var o=n.extremes;this.computeYAxisRanges_(o);h=[];for(g=0;g<this.axes_.length;g++){var e=this.axes_[g];h.push((e.valueRange!==null&&e.valueRange!==undefined)?e.valueRange:e.extremeRange)}}var j=this;this.doAnimatedZoom(l,m,k,h,function(){j.dateWindow_=null;for(var p=0;p<j.axes_.length;p++){if(j.axes_[p].valueWindow!==null){delete j.axes_[p].valueWindow}}if(j.attr_("zoomCallback")){j.attr_("zoomCallback")(f,b,j.yAxisRanges())}})}};Dygraph.prototype.doAnimatedZoom=function(a,e,b,c,m){var i=this.attr_("animatedZooms")?Dygraph.ANIMATION_STEPS:1;var l=[];var k=[];var f,d;if(a!==null&&e!==null){for(f=1;f<=i;f++){d=Dygraph.zoomAnimationFunction(f,i);l[f-1]=[a[0]*(1-d)+d*e[0],a[1]*(1-d)+d*e[1]]}}if(b!==null&&c!==null){for(f=1;f<=i;f++){d=Dygraph.zoomAnimationFunction(f,i);var n=[];for(var g=0;g<this.axes_.length;g++){n.push([b[g][0]*(1-d)+d*c[g][0],b[g][1]*(1-d)+d*c[g][1]])}k[f-1]=n}}var h=this;Dygraph.repeatAndCleanup(function(p){if(k.length){for(var o=0;o<h.axes_.length;o++){var j=k[p][o];h.axes_[o].valueWindow=[j[0],j[1]]}}if(l.length){h.dateWindow_=l[p]}h.drawGraph_()},i,Dygraph.ANIMATION_DURATION/i,m)};Dygraph.prototype.getArea=function(){return this.plotter_.area};Dygraph.prototype.eventToDomCoords=function(c){if(c.offsetX&&c.offsetY){return[c.offsetX,c.offsetY]}else{var b=Dygraph.pageX(c)-Dygraph.findPosX(this.mouseEventElement_);var a=Dygraph.pageY(c)-Dygraph.findPosY(this.mouseEventElement_);return[b,a]}};Dygraph.prototype.findClosestRow=function(a){var g=Infinity;var h=-1;var e=this.layout_.points;for(var c=0;c<e.length;c++){var l=e[c];var d=l.length;for(var b=0;b<d;b++){var k=l[b];if(!Dygraph.isValidPoint(k,true)){continue}var f=Math.abs(k.canvasx-a);if(f<g){g=f;h=k.idx}}}return h};Dygraph.prototype.findClosestPoint=function(f,e){var k=Infinity;var h,o,n,l,d,c,j;for(var b=this.layout_.points.length-1;b>=0;--b){var m=this.layout_.points[b];for(var g=0;g<m.length;++g){l=m[g];if(!Dygraph.isValidPoint(l)){continue}o=l.canvasx-f;n=l.canvasy-e;h=o*o+n*n;if(h<k){k=h;d=l;c=b;j=l.idx}}}var a=this.layout_.setNames[c];return{row:j,seriesName:a,point:d}};Dygraph.prototype.findStackedPoint=function(i,h){var p=this.findClosestRow(i);var f,c;for(var d=0;d<this.layout_.points.length;++d){var g=this.getLeftBoundary_(d);var e=p-g;var l=this.layout_.points[d];if(e>=l.length){continue}var m=l[e];if(!Dygraph.isValidPoint(m)){continue}var j=m.canvasy;if(i>m.canvasx&&e+1<l.length){var k=l[e+1];if(Dygraph.isValidPoint(k)){var o=k.canvasx-m.canvasx;if(o>0){var a=(i-m.canvasx)/o;j+=a*(k.canvasy-m.canvasy)}}}else{if(i<m.canvasx&&e>0){var n=l[e-1];if(Dygraph.isValidPoint(n)){var o=m.canvasx-n.canvasx;if(o>0){var a=(m.canvasx-i)/o;j+=a*(n.canvasy-m.canvasy)}}}}if(d===0||j<h){f=m;c=d}}var b=this.layout_.setNames[c];return{row:p,seriesName:b,point:f}};Dygraph.prototype.mouseMove_=function(b){var h=this.layout_.points;if(h===undefined||h===null){return}var e=this.eventToDomCoords(b);var a=e[0];var j=e[1];var f=this.attr_("highlightSeriesOpts");var d=false;if(f&&!this.isSeriesLocked()){var c;if(this.attr_("stackedGraph")){c=this.findStackedPoint(a,j)}else{c=this.findClosestPoint(a,j)}d=this.setSelection(c.row,c.seriesName)}else{var g=this.findClosestRow(a);d=this.setSelection(g)}var i=this.attr_("highlightCallback");if(i&&d){i(b,this.lastx_,this.selPoints_,this.lastRow_,this.highlightSet_)}};Dygraph.prototype.getLeftBoundary_=function(b){if(this.boundaryIds_[b]){return this.boundaryIds_[b][0]}else{for(var a=0;a<this.boundaryIds_.length;a++){if(this.boundaryIds_[a]!==undefined){return this.boundaryIds_[a][0]}}return 0}};Dygraph.prototype.animateSelection_=function(f){var e=10;var c=30;if(this.fadeLevel===undefined){this.fadeLevel=0}if(this.animateId===undefined){this.animateId=0}var g=this.fadeLevel;var b=f<0?g:e-g;if(b<=0){if(this.fadeLevel){this.updateSelection_(1)}return}var a=++this.animateId;var d=this;Dygraph.repeatAndCleanup(function(h){if(d.animateId!=a){return}d.fadeLevel+=f;if(d.fadeLevel===0){d.clearSelection()}else{d.updateSelection_(d.fadeLevel/e)}},b,c,function(){})};Dygraph.prototype.updateSelection_=function(d){this.cascadeEvents_("select",{selectedX:this.lastx_,selectedPoints:this.selPoints_});var h;var n=this.canvas_ctx_;if(this.attr_("highlightSeriesOpts")){n.clearRect(0,0,this.width_,this.height_);var f=1-this.attr_("highlightSeriesBackgroundAlpha");if(f){var g=true;if(g){if(d===undefined){this.animateSelection_(1);return}f*=d}n.fillStyle="rgba(255,255,255,"+f+")";n.fillRect(0,0,this.width_,this.height_)}this.plotter_._renderLineChart(this.highlightSet_,n)}else{if(this.previousVerticalX_>=0){var j=0;var k=this.attr_("labels");for(h=1;h<k.length;h++){var c=this.attr_("highlightCircleSize",k[h]);if(c>j){j=c}}var l=this.previousVerticalX_;n.clearRect(l-j-1,0,2*j+2,this.height_)}}if(this.isUsingExcanvas_&&this.currentZoomRectArgs_){Dygraph.prototype.drawZoomRect_.apply(this,this.currentZoomRectArgs_)}if(this.selPoints_.length>0){var b=this.selPoints_[0].canvasx;n.save();for(h=0;h<this.selPoints_.length;h++){var o=this.selPoints_[h];if(!Dygraph.isOK(o.canvasy)){continue}var a=this.attr_("highlightCircleSize",o.name);var m=this.attr_("drawHighlightPointCallback",o.name);var e=this.plotter_.colors[o.name];if(!m){m=Dygraph.Circles.DEFAULT}n.lineWidth=this.attr_("strokeWidth",o.name);n.strokeStyle=e;n.fillStyle=e;m(this.g,o.name,n,b,o.canvasy,e,a,o.idx)}n.restore();this.previousVerticalX_=b}};Dygraph.prototype.setSelection=function(f,h,g){this.selPoints_=[];var e=false;if(f!==false&&f>=0){if(f!=this.lastRow_){e=true}this.lastRow_=f;for(var d=0;d<this.layout_.points.length;++d){var b=this.layout_.points[d];var c=f-this.getLeftBoundary_(d);if(c<b.length){var a=b[c];if(a.yval!==null){this.selPoints_.push(a)}}}}else{if(this.lastRow_>=0){e=true}this.lastRow_=-1}if(this.selPoints_.length){this.lastx_=this.selPoints_[0].xval}else{this.lastx_=-1}if(h!==undefined){if(this.highlightSet_!==h){e=true}this.highlightSet_=h}if(g!==undefined){this.lockedSet_=g}if(e){this.updateSelection_(undefined)}return e};Dygraph.prototype.mouseOut_=function(a){if(this.attr_("unhighlightCallback")){this.attr_("unhighlightCallback")(a)}if(this.attr_("hideOverlayOnMouseOut")&&!this.lockedSet_){this.clearSelection()}};Dygraph.prototype.clearSelection=function(){this.cascadeEvents_("deselect",{});this.lockedSet_=false;if(this.fadeLevel){this.animateSelection_(-1);return}this.canvas_ctx_.clearRect(0,0,this.width_,this.height_);this.fadeLevel=0;this.selPoints_=[];this.lastx_=-1;this.lastRow_=-1;this.highlightSet_=null};Dygraph.prototype.getSelection=function(){if(!this.selPoints_||this.selPoints_.length<1){return -1}for(var c=0;c<this.layout_.points.length;c++){var a=this.layout_.points[c];for(var b=0;b<a.length;b++){if(a[b].x==this.selPoints_[0].x){return a[b].idx}}}return -1};Dygraph.prototype.getHighlightSeries=function(){return this.highlightSet_};Dygraph.prototype.isSeriesLocked=function(){return this.lockedSet_};Dygraph.prototype.loadedEvent_=function(a){this.rawData_=this.parseCSV_(a);this.predraw_()};Dygraph.prototype.addXTicks_=function(){var a;if(this.dateWindow_){a=[this.dateWindow_[0],this.dateWindow_[1]]}else{a=this.xAxisExtremes()}var c=this.optionsViewForAxis_("x");var b=c("ticker")(a[0],a[1],this.width_,c,this);this.layout_.setXTicks(b)};Dygraph.prototype.extremeValues_=function(d){var h=null,f=null,c,g;var b=this.attr_("errorBars")||this.attr_("customBars");if(b){for(c=0;c<d.length;c++){g=d[c][1][0];if(g===null||isNaN(g)){continue}var a=g-d[c][1][1];var e=g+d[c][1][2];if(a>g){a=g}if(e<g){e=g}if(f===null||e>f){f=e}if(h===null||a<h){h=a}}}else{for(c=0;c<d.length;c++){g=d[c][1];if(g===null||isNaN(g)){continue}if(f===null||g>f){f=g}if(h===null||g<h){h=g}}}return[h,f]};Dygraph.prototype.predraw_=function(){var e=new Date();this.layout_.computePlotArea();this.computeYAxes_();if(this.plotter_){this.cascadeEvents_("clearChart");this.plotter_.clear()}if(!this.is_initial_draw_){this.canvas_ctx_.restore();this.hidden_ctx_.restore()}this.canvas_ctx_.save();this.hidden_ctx_.save();this.plotter_=new DygraphCanvasRenderer(this,this.hidden_,this.hidden_ctx_,this.layout_);this.createRollInterface_();this.cascadeEvents_("predraw");this.rolledSeries_=[null];for(var c=1;c<this.numColumns();c++){var d=this.attr_("logscale");var b=this.extractSeries_(this.rawData_,c,d);b=this.rollingAverage(b,this.rollPeriod_);this.rolledSeries_.push(b)}this.drawGraph_();var a=new Date();this.drawingTimeMs_=(a-e)};Dygraph.PointType=undefined;Dygraph.seriesToPoints_=function(b,j,d,f){var h=[];for(var c=0;c<b.length;++c){var k=b[c];var a=j?k[1][0]:k[1];var e=a===null?null:DygraphLayout.parseFloat_(a);var g={x:NaN,y:NaN,xval:DygraphLayout.parseFloat_(k[0]),yval:e,name:d,idx:c+f};if(j){g.y_top=NaN;g.y_bottom=NaN;g.yval_minus=DygraphLayout.parseFloat_(k[1][1]);g.yval_plus=DygraphLayout.parseFloat_(k[1][2])}h.push(g)}return h};Dygraph.stackPoints_=function(m,l,o,f){var h=null;var d=null;var g=null;var c=-1;var k=function(i){if(c>=i){return}for(var p=i;p<m.length;++p){g=null;if(!isNaN(m[p].yval)&&m[p].yval!==null){c=p;g=m[p];break}}};for(var b=0;b<m.length;++b){var j=m[b];var n=j.xval;if(l[n]===undefined){l[n]=0}var e=j.yval;if(isNaN(e)||e===null){k(b);if(d&&g&&f!="none"){e=d.yval+(g.yval-d.yval)*((n-d.xval)/(g.xval-d.xval))}else{if(d&&f=="all"){e=d.yval}else{if(g&&f=="all"){e=g.yval}else{e=0}}}}else{d=j}var a=l[n];if(h!=n){a+=e;l[n]=a}h=n;j.yval_stacked=a;if(a>o[1]){o[1]=a}if(a<o[0]){o[0]=a}}};Dygraph.prototype.gatherDatasets_=function(w,f){var s=[];var t=[];var q=[];var a={};var u,r;var x=this.attr_("errorBars");var h=this.attr_("customBars");var p=x||h;var b=function(i){if(!p){return i[1]===null}else{return h?i[1][1]===null:x?i[1][0]===null:false}};var n=w.length-1;var l;for(u=n;u>=1;u--){if(!this.visibility()[u-1]){continue}if(f){l=w[u];var z=f[0];var j=f[1];var g=null,y=null;for(r=0;r<l.length;r++){if(l[r][0]>=z&&g===null){g=r}if(l[r][0]<=j){y=r}}if(g===null){g=0}var e=g;var d=true;while(d&&e>0){e--;d=b(l[e])}if(y===null){y=l.length-1}var c=y;d=true;while(d&&c<l.length-1){c++;d=b(l[c])}if(e!==g){g=e}if(c!==y){y=c}s[u-1]=[g,y];l=l.slice(g,y+1)}else{l=w[u];s[u-1]=[0,l.length-1]}var v=this.attr_("labels")[u];var o=this.extremeValues_(l);var m=Dygraph.seriesToPoints_(l,p,v,s[u-1][0]);if(this.attr_("stackedGraph")){Dygraph.stackPoints_(m,q,o,this.attr_("stackedGraphNaNFill"))}a[v]=o;t[u]=m}return{points:t,extremes:a,boundaryIds:s}};Dygraph.prototype.drawGraph_=function(){var a=new Date();var d=this.is_initial_draw_;this.is_initial_draw_=false;this.layout_.removeAllDatasets();this.setColors_();this.attrs_.pointSize=0.5*this.attr_("highlightCircleSize");var j=this.gatherDatasets_(this.rolledSeries_,this.dateWindow_);var h=j.points;var k=j.extremes;this.boundaryIds_=j.boundaryIds;this.setIndexByName_={};var g=this.attr_("labels");if(g.length>0){this.setIndexByName_[g[0]]=0}var e=0;for(var f=1;f<h.length;f++){this.setIndexByName_[g[f]]=f;if(!this.visibility()[f-1]){continue}this.layout_.addDataset(g[f],h[f]);this.datasetIndex_[f]=e++}this.computeYAxisRanges_(k);this.layout_.setYAxes(this.axes_);this.addXTicks_();var b=this.zoomed_x_;this.zoomed_x_=b;this.layout_.evaluate();this.renderGraph_(d);if(this.attr_("timingName")){var c=new Date();Dygraph.info(this.attr_("timingName")+" - drawGraph: "+(c-a)+"ms")}};Dygraph.prototype.renderGraph_=function(b){this.cascadeEvents_("clearChart");this.plotter_.clear();if(this.attr_("underlayCallback")){this.attr_("underlayCallback")(this.hidden_ctx_,this.layout_.getPlotArea(),this,this)}var c={canvas:this.hidden_,drawingContext:this.hidden_ctx_};this.cascadeEvents_("willDrawChart",c);this.plotter_.render();this.cascadeEvents_("didDrawChart",c);this.lastRow_=-1;this.canvas_.getContext("2d").clearRect(0,0,this.canvas_.width,this.canvas_.height);if(this.attr_("drawCallback")!==null){this.attr_("drawCallback")(this,b)}if(b){this.readyFired_=true;while(this.readyFns_.length>0){var a=this.readyFns_.pop();a(this)}}};Dygraph.prototype.computeYAxes_=function(){var b,d,c,f,a;if(this.axes_!==undefined&&this.user_attrs_.hasOwnProperty("valueRange")===false){b=[];for(c=0;c<this.axes_.length;c++){b.push(this.axes_[c].valueWindow)}}this.axes_=[];for(d=0;d<this.attributes_.numAxes();d++){f={g:this};Dygraph.update(f,this.attributes_.axisOptions(d));this.axes_[d]=f}a=this.attr_("valueRange");if(a){this.axes_[0].valueRange=a}if(b!==undefined){var e=Math.min(b.length,this.axes_.length);for(c=0;c<e;c++){this.axes_[c].valueWindow=b[c]}}for(d=0;d<this.axes_.length;d++){if(d===0){f=this.optionsViewForAxis_("y"+(d?"2":""));a=f("valueRange");if(a){this.axes_[d].valueRange=a}}else{var g=this.user_attrs_.axes;if(g&&g.y2){a=g.y2.valueRange;if(a){this.axes_[d].valueRange=a}}}}};Dygraph.prototype.numAxes=function(){return this.attributes_.numAxes()};Dygraph.prototype.axisPropertiesForSeries=function(a){return this.axes_[this.attributes_.axisForSeries(a)]};Dygraph.prototype.computeYAxisRanges_=function(a){var g=function(i){return isNaN(parseFloat(i))};var q=this.attributes_.numAxes();var b,x,o,B;var p;for(var y=0;y<q;y++){var c=this.axes_[y];var C=this.attributes_.getForAxis("logscale",y);var G=this.attributes_.getForAxis("includeZero",y);var l=this.attributes_.getForAxis("independentTicks",y);o=this.attributes_.seriesForAxis(y);b=true;B=0.1;if(this.attr_("yRangePad")!==null){b=false;B=this.attr_("yRangePad")/this.plotter_.area.h}if(o.length===0){c.extremeRange=[0,1]}else{var D=Infinity;var A=-Infinity;var t,s;for(var w=0;w<o.length;w++){if(!a.hasOwnProperty(o[w])){continue}t=a[o[w]][0];if(t!==null){D=Math.min(t,D)}s=a[o[w]][1];if(s!==null){A=Math.max(s,A)}}if(G&&!C){if(D>0){D=0}if(A<0){A=0}}if(D==Infinity){D=0}if(A==-Infinity){A=1}x=A-D;if(x===0){if(A!==0){x=Math.abs(A)}else{A=1;x=1}}var h,H;if(C){if(b){h=A+B*x;H=D}else{var E=Math.exp(Math.log(x)*B);h=A*E;H=D/E}}else{h=A+B*x;H=D-B*x;if(b&&!this.attr_("avoidMinZero")){if(H<0&&D>=0){H=0}if(h>0&&A<=0){h=0}}}c.extremeRange=[H,h]}if(c.valueWindow){c.computedValueRange=[c.valueWindow[0],c.valueWindow[1]]}else{if(c.valueRange){var e=g(c.valueRange[0])?c.extremeRange[0]:c.valueRange[0];var d=g(c.valueRange[1])?c.extremeRange[1]:c.valueRange[1];if(!b){if(c.logscale){var E=Math.exp(Math.log(x)*B);e*=E;d/=E}else{x=d-e;e-=x*B;d+=x*B}}c.computedValueRange=[e,d]}else{c.computedValueRange=c.extremeRange}}if(l){c.independentTicks=l;var r=this.optionsViewForAxis_("y"+(y?"2":""));var F=r("ticker");c.ticks=F(c.computedValueRange[0],c.computedValueRange[1],this.height_,r,this);if(!p){p=c}}}if(p===undefined){throw ('Configuration Error: At least one axis has to have the "independentTicks" option activated.')}for(var y=0;y<q;y++){var c=this.axes_[y];if(!c.independentTicks){var r=this.optionsViewForAxis_("y"+(y?"2":""));var F=r("ticker");var m=p.ticks;var n=p.computedValueRange[1]-p.computedValueRange[0];var I=c.computedValueRange[1]-c.computedValueRange[0];var f=[];for(var v=0;v<m.length;v++){var u=(m[v].v-p.computedValueRange[0])/n;var z=c.computedValueRange[0]+u*I;f.push(z)}c.ticks=F(c.computedValueRange[0],c.computedValueRange[1],this.height_,r,this,f)}}};Dygraph.prototype.extractSeries_=function(a,f,c){var g=[];var h=this.attr_("errorBars");var e=this.attr_("customBars");for(var d=0;d<a.length;d++){var l=a[d][0];var m=a[d][f];if(c){if(h||e){for(var b=0;b<m.length;b++){if(m[b]<=0){m=null;break}}}else{if(m<=0){m=null}}}if(m!==null){g.push([l,m])}else{g.push([l,h?[null,null]:e?[null,null,null]:m])}}return g};Dygraph.prototype.rollingAverage=function(l,d){d=Math.min(d,l.length);var b=[];var t=this.attr_("sigma");var G,o,z,x,m,c,F,A;if(this.fractions_){var k=0;var h=0;var e=100;for(z=0;z<l.length;z++){k+=l[z][1][0];h+=l[z][1][1];if(z-d>=0){k-=l[z-d][1][0];h-=l[z-d][1][1]}var C=l[z][0];var w=h?k/h:0;if(this.attr_("errorBars")){if(this.attr_("wilsonInterval")){if(h){var s=w<0?0:w,u=h;var B=t*Math.sqrt(s*(1-s)/u+t*t/(4*u*u));var a=1+t*t/h;G=(s+t*t/(2*h)-B)/a;o=(s+t*t/(2*h)+B)/a;b[z]=[C,[s*e,(s-G)*e,(o-s)*e]]}else{b[z]=[C,[0,0,0]]}}else{A=h?t*Math.sqrt(w*(1-w)/h):1;b[z]=[C,[e*w,e*A,e*A]]}}else{b[z]=[C,e*w]}}}else{if(this.attr_("customBars")){G=0;var D=0;o=0;var g=0;for(z=0;z<l.length;z++){var E=l[z][1];m=E[1];b[z]=[l[z][0],[m,m-E[0],E[2]-m]];if(m!==null&&!isNaN(m)){G+=E[0];D+=m;o+=E[2];g+=1}if(z-d>=0){var r=l[z-d];if(r[1][1]!==null&&!isNaN(r[1][1])){G-=r[1][0];D-=r[1][1];o-=r[1][2];g-=1}}if(g){b[z]=[l[z][0],[1*D/g,1*(D-G)/g,1*(o-D)/g]]}else{b[z]=[l[z][0],[null,null,null]]}}}else{if(!this.attr_("errorBars")){if(d==1){return l}for(z=0;z<l.length;z++){c=0;F=0;for(x=Math.max(0,z-d+1);x<z+1;x++){m=l[x][1];if(m===null||isNaN(m)){continue}F++;c+=l[x][1]}if(F){b[z]=[l[z][0],c/F]}else{b[z]=[l[z][0],null]}}}else{for(z=0;z<l.length;z++){c=0;var f=0;F=0;for(x=Math.max(0,z-d+1);x<z+1;x++){m=l[x][1][0];if(m===null||isNaN(m)){continue}F++;c+=l[x][1][0];f+=Math.pow(l[x][1][1],2)}if(F){A=Math.sqrt(f)/F;b[z]=[l[z][0],[c/F,t*A,t*A]]}else{var q=(d==1)?l[z][1][0]:null;b[z]=[l[z][0],[q,q,q]]}}}}}return b};Dygraph.prototype.detectTypeFromString_=function(b){var a=false;var c=b.indexOf("-");if((c>0&&(b[c-1]!="e"&&b[c-1]!="E"))||b.indexOf("/")>=0||isNaN(parseFloat(b))){a=true}else{if(b.length==8&&b>"19700101"&&b<"20371231"){a=true}}this.setXAxisOptions_(a)};Dygraph.prototype.setXAxisOptions_=function(a){if(a){this.attrs_.xValueParser=Dygraph.dateParser;this.attrs_.axes.x.valueFormatter=Dygraph.dateString_;this.attrs_.axes.x.ticker=Dygraph.dateTicker;this.attrs_.axes.x.axisLabelFormatter=Dygraph.dateAxisFormatter}else{this.attrs_.xValueParser=function(b){return parseFloat(b)};this.attrs_.axes.x.valueFormatter=function(b){return b};this.attrs_.axes.x.ticker=Dygraph.numericLinearTicks;this.attrs_.axes.x.axisLabelFormatter=this.attrs_.axes.x.valueFormatter}};Dygraph.prototype.parseFloat_=function(a,c,b){var e=parseFloat(a);if(!isNaN(e)){return e}if(/^ *$/.test(a)){return null}if(/^ *nan *$/i.test(a)){return NaN}var d="Unable to parse '"+a+"' as a number";if(b!==null&&c!==null){d+=" on line "+(1+c)+" ('"+b+"') of CSV."}this.error(d);return null};Dygraph.prototype.parseCSV_=function(t){var r=[];var s=Dygraph.detectLineDelimiter(t);var a=t.split(s||"\n");var g,k;var p=this.attr_("delimiter");if(a[0].indexOf(p)==-1&&a[0].indexOf("\t")>=0){p="\t"}var b=0;if(!("labels" in this.user_attrs_)){b=1;this.attrs_.labels=a[0].split(p);this.attributes_.reparseSeries()}var o=0;var m;var q=false;var c=this.attr_("labels").length;var f=false;for(var l=b;l<a.length;l++){var e=a[l];o=l;if(e.length===0){continue}if(e[0]=="#"){continue}var d=e.split(p);if(d.length<2){continue}var h=[];if(!q){this.detectTypeFromString_(d[0]);m=this.attr_("xValueParser");q=true}h[0]=m(d[0],this);if(this.fractions_){for(k=1;k<d.length;k++){g=d[k].split("/");if(g.length!=2){this.error('Expected fractional "num/den" values in CSV data but found a value \''+d[k]+"' on line "+(1+l)+" ('"+e+"') which is not of this form.");h[k]=[0,0]}else{h[k]=[this.parseFloat_(g[0],l,e),this.parseFloat_(g[1],l,e)]}}}else{if(this.attr_("errorBars")){if(d.length%2!=1){this.error("Expected alternating (value, stdev.) pairs in CSV data but line "+(1+l)+" has an odd number of values ("+(d.length-1)+"): '"+e+"'")}for(k=1;k<d.length;k+=2){h[(k+1)/2]=[this.parseFloat_(d[k],l,e),this.parseFloat_(d[k+1],l,e)]}}else{if(this.attr_("customBars")){for(k=1;k<d.length;k++){var u=d[k];if(/^ *$/.test(u)){h[k]=[null,null,null]}else{g=u.split(";");if(g.length==3){h[k]=[this.parseFloat_(g[0],l,e),this.parseFloat_(g[1],l,e),this.parseFloat_(g[2],l,e)]}else{this.warn('When using customBars, values must be either blank or "low;center;high" tuples (got "'+u+'" on line '+(1+l))}}}}else{for(k=1;k<d.length;k++){h[k]=this.parseFloat_(d[k],l,e)}}}}if(r.length>0&&h[0]<r[r.length-1][0]){f=true}if(h.length!=c){this.error("Number of columns in line "+l+" ("+h.length+") does not agree with number of labels ("+c+") "+e)}if(l===0&&this.attr_("labels")){var n=true;for(k=0;n&&k<h.length;k++){if(h[k]){n=false}}if(n){this.warn("The dygraphs 'labels' option is set, but the first row of CSV data ('"+e+"') appears to also contain labels. Will drop the CSV labels and use the option labels.");continue}}r.push(h)}if(f){this.warn("CSV is out of order; order it correctly to speed loading.");r.sort(function(j,i){return j[0]-i[0]})}return r};Dygraph.prototype.parseArray_=function(c){if(c.length===0){this.error("Can't plot empty data set");return null}if(c[0].length===0){this.error("Data set cannot contain an empty row");return null}var a;if(this.attr_("labels")===null){this.warn("Using default labels. Set labels explicitly via 'labels' in the options parameter");this.attrs_.labels=["X"];for(a=1;a<c[0].length;a++){this.attrs_.labels.push("Y"+a)}this.attributes_.reparseSeries()}else{var b=this.attr_("labels");if(b.length!=c[0].length){this.error("Mismatch between number of labels ("+b+") and number of columns in array ("+c[0].length+")");return null}}if(Dygraph.isDateLike(c[0][0])){this.attrs_.axes.x.valueFormatter=Dygraph.dateString_;this.attrs_.axes.x.ticker=Dygraph.dateTicker;this.attrs_.axes.x.axisLabelFormatter=Dygraph.dateAxisFormatter;var d=Dygraph.clone(c);for(a=0;a<c.length;a++){if(d[a].length===0){this.error("Row "+(1+a)+" of data is empty");return null}if(d[a][0]===null||typeof(d[a][0].getTime)!="function"||isNaN(d[a][0].getTime())){this.error("x value in row "+(1+a)+" is not a Date");return null}d[a][0]=d[a][0].getTime()}return d}else{this.attrs_.axes.x.valueFormatter=function(e){return e};this.attrs_.axes.x.ticker=Dygraph.numericLinearTicks;this.attrs_.axes.x.axisLabelFormatter=Dygraph.numberAxisLabelFormatter;return c}};Dygraph.prototype.parseDataTable_=function(w){var d=function(i){var j=String.fromCharCode(65+i%26);i=Math.floor(i/26);while(i>0){j=String.fromCharCode(65+(i-1)%26)+j.toLowerCase();i=Math.floor((i-1)/26)}return j};var h=w.getNumberOfColumns();var g=w.getNumberOfRows();var f=w.getColumnType(0);if(f=="date"||f=="datetime"){this.attrs_.xValueParser=Dygraph.dateParser;this.attrs_.axes.x.valueFormatter=Dygraph.dateString_;this.attrs_.axes.x.ticker=Dygraph.dateTicker;this.attrs_.axes.x.axisLabelFormatter=Dygraph.dateAxisFormatter}else{if(f=="number"){this.attrs_.xValueParser=function(i){return parseFloat(i)};this.attrs_.axes.x.valueFormatter=function(i){return i};this.attrs_.axes.x.ticker=Dygraph.numericLinearTicks;this.attrs_.axes.x.axisLabelFormatter=this.attrs_.axes.x.valueFormatter}else{this.error("only 'date', 'datetime' and 'number' types are supported for column 1 of DataTable input (Got '"+f+"')");return null}}var m=[];var t={};var s=false;var q,o;for(q=1;q<h;q++){var b=w.getColumnType(q);if(b=="number"){m.push(q)}else{if(b=="string"&&this.attr_("displayAnnotations")){var r=m[m.length-1];if(!t.hasOwnProperty(r)){t[r]=[q]}else{t[r].push(q)}s=true}else{this.error("Only 'number' is supported as a dependent type with Gviz. 'string' is only supported if displayAnnotations is true")}}}var u=[w.getColumnLabel(0)];for(q=0;q<m.length;q++){u.push(w.getColumnLabel(m[q]));if(this.attr_("errorBars")){q+=1}}this.attrs_.labels=u;h=u.length;var v=[];var l=false;var a=[];for(q=0;q<g;q++){var e=[];if(typeof(w.getValue(q,0))==="undefined"||w.getValue(q,0)===null){this.warn("Ignoring row "+q+" of DataTable because of undefined or null first column.");continue}if(f=="date"||f=="datetime"){e.push(w.getValue(q,0).getTime())}else{e.push(w.getValue(q,0))}if(!this.attr_("errorBars")){for(o=0;o<m.length;o++){var c=m[o];e.push(w.getValue(q,c));if(s&&t.hasOwnProperty(c)&&w.getValue(q,t[c][0])!==null){var p={};p.series=w.getColumnLabel(c);p.xval=e[0];p.shortText=d(a.length);p.text="";for(var n=0;n<t[c].length;n++){if(n){p.text+="\n"}p.text+=w.getValue(q,t[c][n])}a.push(p)}}for(o=0;o<e.length;o++){if(!isFinite(e[o])){e[o]=null}}}else{for(o=0;o<h-1;o++){e.push([w.getValue(q,1+2*o),w.getValue(q,2+2*o)])}}if(v.length>0&&e[0]<v[v.length-1][0]){l=true}v.push(e)}if(l){this.warn("DataTable is out of order; order it correctly to speed loading.");v.sort(function(j,i){return j[0]-i[0]})}this.rawData_=v;if(a.length>0){this.setAnnotations(a,true)}this.attributes_.reparseSeries()};Dygraph.prototype.start_=function(){var d=this.file_;if(typeof d=="function"){d=d()}if(Dygraph.isArrayLike(d)){this.rawData_=this.parseArray_(d);this.predraw_()}else{if(typeof d=="object"&&typeof d.getColumnRange=="function"){this.parseDataTable_(d);this.predraw_()}else{if(typeof d=="string"){var c=Dygraph.detectLineDelimiter(d);if(c){this.loadedEvent_(d)}else{var b;if(window.XMLHttpRequest){b=new XMLHttpRequest()}else{b=new ActiveXObject("Microsoft.XMLHTTP")}var a=this;b.onreadystatechange=function(){if(b.readyState==4){if(b.status===200||b.status===0){a.loadedEvent_(b.responseText)}}};b.open("GET",d,true);b.send(null)}}else{this.error("Unknown data format: "+(typeof d))}}}};Dygraph.prototype.updateOptions=function(e,b){if(typeof(b)=="undefined"){b=false}var d=e.file;var c=Dygraph.mapLegacyOptions_(e);if("rollPeriod" in c){this.rollPeriod_=c.rollPeriod}if("dateWindow" in c){this.dateWindow_=c.dateWindow;if(!("isZoomedIgnoreProgrammaticZoom" in c)){this.zoomed_x_=(c.dateWindow!==null)}}if("valueRange" in c&&!("isZoomedIgnoreProgrammaticZoom" in c)){this.zoomed_y_=(c.valueRange!==null)}var a=Dygraph.isPixelChangingOptionList(this.attr_("labels"),c);Dygraph.updateDeep(this.user_attrs_,c);this.attributes_.reparseSeries();if(d){this.file_=d;if(!b){this.start_()}}else{if(!b){if(a){this.predraw_()}else{this.renderGraph_(false)}}}};Dygraph.mapLegacyOptions_=function(c){var a={};for(var b in c){if(b=="file"){continue}if(c.hasOwnProperty(b)){a[b]=c[b]}}var e=function(g,f,h){if(!a.axes){a.axes={}}if(!a.axes[g]){a.axes[g]={}}a.axes[g][f]=h};var d=function(f,g,h){if(typeof(c[f])!="undefined"){Dygraph.warn("Option "+f+" is deprecated. Use the "+h+" option for the "+g+" axis instead. (e.g. { axes : { "+g+" : { "+h+" : ... } } } (see http://dygraphs.com/per-axis.html for more information.");e(g,h,c[f]);delete a[f]}};d("xValueFormatter","x","valueFormatter");d("pixelsPerXLabel","x","pixelsPerLabel");d("xAxisLabelFormatter","x","axisLabelFormatter");d("xTicker","x","ticker");d("yValueFormatter","y","valueFormatter");d("pixelsPerYLabel","y","pixelsPerLabel");d("yAxisLabelFormatter","y","axisLabelFormatter");d("yTicker","y","ticker");return a};Dygraph.prototype.resize=function(d,b){if(this.resize_lock){return}this.resize_lock=true;if((d===null)!=(b===null)){this.warn("Dygraph.resize() should be called with zero parameters or two non-NULL parameters. Pretending it was zero.");d=b=null}var a=this.width_;var c=this.height_;if(d){this.maindiv_.style.width=d+"px";this.maindiv_.style.height=b+"px";this.width_=d;this.height_=b}else{this.width_=this.maindiv_.clientWidth;this.height_=this.maindiv_.clientHeight}if(a!=this.width_||c!=this.height_){this.resizeElements_();this.predraw_()}this.resize_lock=false};Dygraph.prototype.adjustRoll=function(a){this.rollPeriod_=a;this.predraw_()};Dygraph.prototype.visibility=function(){if(!this.attr_("visibility")){this.attrs_.visibility=[]}while(this.attr_("visibility").length<this.numColumns()-1){this.attrs_.visibility.push(true)}return this.attr_("visibility")};Dygraph.prototype.setVisibility=function(b,c){var a=this.visibility();if(b<0||b>=a.length){this.warn("invalid series number in setVisibility: "+b)}else{a[b]=c;this.predraw_()}};Dygraph.prototype.size=function(){return{width:this.width_,height:this.height_}};Dygraph.prototype.setAnnotations=function(b,a){Dygraph.addAnnotationRule();this.annotations_=b;if(!this.layout_){this.warn("Tried to setAnnotations before dygraph was ready. Try setting them in a ready() block. See dygraphs.com/tests/annotation.html");return}this.layout_.setAnnotations(this.annotations_);if(!a){this.predraw_()}};Dygraph.prototype.annotations=function(){return this.annotations_};Dygraph.prototype.getLabels=function(){var a=this.attr_("labels");return a?a.slice():null};Dygraph.prototype.indexFromSetName=function(a){return this.setIndexByName_[a]};Dygraph.prototype.ready=function(a){if(this.is_initial_draw_){this.readyFns_.push(a)}else{a(this)}};Dygraph.addAnnotationRule=function(){if(Dygraph.addedAnnotationCSS){return}var f="border: 1px solid black; background-color: white; text-align: center;";var e=document.createElement("style");e.type="text/css";document.getElementsByTagName("head")[0].appendChild(e);for(var b=0;b<document.styleSheets.length;b++){if(document.styleSheets[b].disabled){continue}var d=document.styleSheets[b];try{if(d.insertRule){var a=d.cssRules?d.cssRules.length:0;d.insertRule(".dygraphDefaultAnnotation { "+f+" }",a)}else{if(d.addRule){d.addRule(".dygraphDefaultAnnotation",f)}}Dygraph.addedAnnotationCSS=true;return}catch(c){}}this.warn("Unable to add default annotation CSS rule; display may be off.")};var DateGraph=Dygraph;"use strict";Dygraph.LOG_SCALE=10;Dygraph.LN_TEN=Math.log(Dygraph.LOG_SCALE);Dygraph.log10=function(a){return Math.log(a)/Dygraph.LN_TEN};Dygraph.DEBUG=1;Dygraph.INFO=2;Dygraph.WARNING=3;Dygraph.ERROR=3;Dygraph.LOG_STACK_TRACES=false;Dygraph.DOTTED_LINE=[2,2];Dygraph.DASHED_LINE=[7,3];Dygraph.DOT_DASH_LINE=[7,2,2,2];Dygraph.log=function(c,g){var b;if(typeof(printStackTrace)!="undefined"){try{b=printStackTrace({guess:false});while(b[0].indexOf("stacktrace")!=-1){b.splice(0,1)}b.splice(0,2);for(var d=0;d<b.length;d++){b[d]=b[d].replace(/\([^)]*\/(.*)\)/,"@$1").replace(/\@.*\/([^\/]*)/,"@$1").replace("[object Object].","")}var j=b.splice(0,1)[0];g+=" ("+j.replace(/^.*@ ?/,"")+")"}catch(h){}}if(typeof(window.console)!="undefined"){var a=window.console;var f=function(e,k,i){if(k&&typeof(k)=="function"){k.call(e,i)}else{e.log(i)}};switch(c){case Dygraph.DEBUG:f(a,a.debug,"dygraphs: "+g);break;case Dygraph.INFO:f(a,a.info,"dygraphs: "+g);break;case Dygraph.WARNING:f(a,a.warn,"dygraphs: "+g);break;case Dygraph.ERROR:f(a,a.error,"dygraphs: "+g);break}}if(Dygraph.LOG_STACK_TRACES){window.console.log(b.join("\n"))}};Dygraph.info=function(a){Dygraph.log(Dygraph.INFO,a)};Dygraph.prototype.info=Dygraph.info;Dygraph.warn=function(a){Dygraph.log(Dygraph.WARNING,a)};Dygraph.prototype.warn=Dygraph.warn;Dygraph.error=function(a){Dygraph.log(Dygraph.ERROR,a)};Dygraph.prototype.error=Dygraph.error;Dygraph.getContext=function(a){return(a.getContext("2d"))};Dygraph.addEvent=function addEvent(c,b,a){if(c.addEventListener){c.addEventListener(b,a,false)}else{c[b+a]=function(){a(window.event)};c.attachEvent("on"+b,c[b+a])}};Dygraph.prototype.addAndTrackEvent=function(c,b,a){Dygraph.addEvent(c,b,a);this.registeredEvents_.push({elem:c,type:b,fn:a})};Dygraph.removeEvent=function(c,b,a){if(c.removeEventListener){c.removeEventListener(b,a,false)}else{try{c.detachEvent("on"+b,c[b+a])}catch(d){}c[b+a]=null}};Dygraph.prototype.removeTrackedEvents_=function(){if(this.registeredEvents_){for(var a=0;a<this.registeredEvents_.length;a++){var b=this.registeredEvents_[a];Dygraph.removeEvent(b.elem,b.type,b.fn)}}this.registeredEvents_=[]};Dygraph.cancelEvent=function(a){a=a?a:window.event;if(a.stopPropagation){a.stopPropagation()}if(a.preventDefault){a.preventDefault()}a.cancelBubble=true;a.cancel=true;a.returnValue=false;return false};Dygraph.hsvToRGB=function(h,g,k){var c;var d;var l;if(g===0){c=k;d=k;l=k}else{var e=Math.floor(h*6);var j=(h*6)-e;var b=k*(1-g);var a=k*(1-(g*j));var m=k*(1-(g*(1-j)));switch(e){case 1:c=a;d=k;l=b;break;case 2:c=b;d=k;l=m;break;case 3:c=b;d=a;l=k;break;case 4:c=m;d=b;l=k;break;case 5:c=k;d=b;l=a;break;case 6:case 0:c=k;d=m;l=b;break}}c=Math.floor(255*c+0.5);d=Math.floor(255*d+0.5);l=Math.floor(255*l+0.5);return"rgb("+c+","+d+","+l+")"};Dygraph.findPosX=function(c){var d=0;if(c.offsetParent){var a=c;while(1){var b="0";if(window.getComputedStyle){b=window.getComputedStyle(a,null).borderLeft||"0"}d+=parseInt(b,10);d+=a.offsetLeft;if(!a.offsetParent){break}a=a.offsetParent}}else{if(c.x){d+=c.x}}while(c&&c!=document.body){d-=c.scrollLeft;c=c.parentNode}return d};Dygraph.findPosY=function(c){var b=0;if(c.offsetParent){var a=c;while(1){var d="0";if(window.getComputedStyle){d=window.getComputedStyle(a,null).borderTop||"0"}b+=parseInt(d,10);b+=a.offsetTop;if(!a.offsetParent){break}a=a.offsetParent}}else{if(c.y){b+=c.y}}while(c&&c!=document.body){b-=c.scrollTop;c=c.parentNode}return b};Dygraph.pageX=function(c){if(c.pageX){return(!c.pageX||c.pageX<0)?0:c.pageX}else{var d=document.documentElement;var a=document.body;return c.clientX+(d.scrollLeft||a.scrollLeft)-(d.clientLeft||0)}};Dygraph.pageY=function(c){if(c.pageY){return(!c.pageY||c.pageY<0)?0:c.pageY}else{var d=document.documentElement;var a=document.body;return c.clientY+(d.scrollTop||a.scrollTop)-(d.clientTop||0)}};Dygraph.isOK=function(a){return !!a&&!isNaN(a)};Dygraph.isValidPoint=function(b,a){if(!b){return false}if(b.yval===null){return false}if(b.x===null||b.x===undefined){return false}if(b.y===null||b.y===undefined){return false}if(isNaN(b.x)||(!a&&isNaN(b.y))){return false}return true};Dygraph.floatFormat=function(a,b){var c=Math.min(Math.max(1,b||2),21);return(Math.abs(a)<0.001&&a!==0)?a.toExponential(c-1):a.toPrecision(c)};Dygraph.zeropad=function(a){if(a<10){return"0"+a}else{return""+a}};Dygraph.hmsString_=function(a){var c=Dygraph.zeropad;var b=new Date(a);if(b.getSeconds()){return c(b.getHours())+":"+c(b.getMinutes())+":"+c(b.getSeconds())}else{return c(b.getHours())+":"+c(b.getMinutes())}};Dygraph.round_=function(c,b){var a=Math.pow(10,b);return Math.round(c*a)/a};Dygraph.binarySearch=function(a,d,i,e,b){if(e===null||e===undefined||b===null||b===undefined){e=0;b=d.length-1}if(e>b){return -1}if(i===null||i===undefined){i=0}var h=function(j){return j>=0&&j<d.length};var g=parseInt((e+b)/2,10);var c=d[g];var f;if(c==a){return g}else{if(c>a){if(i>0){f=g-1;if(h(f)&&d[f]<a){return g}}return Dygraph.binarySearch(a,d,i,e,g-1)}else{if(c<a){if(i<0){f=g+1;if(h(f)&&d[f]>a){return g}}return Dygraph.binarySearch(a,d,i,g+1,b)}}}return -1};Dygraph.dateParser=function(a){var b;var c;if(a.search("-")==-1||a.search("T")!=-1||a.search("Z")!=-1){c=Dygraph.dateStrToMillis(a);if(c&&!isNaN(c)){return c}}if(a.search("-")!=-1){b=a.replace("-","/","g");while(b.search("-")!=-1){b=b.replace("-","/")}c=Dygraph.dateStrToMillis(b)}else{if(a.length==8){b=a.substr(0,4)+"/"+a.substr(4,2)+"/"+a.substr(6,2);c=Dygraph.dateStrToMillis(b)}else{c=Dygraph.dateStrToMillis(a)}}if(!c||isNaN(c)){Dygraph.error("Couldn't parse "+a+" as a date")}return c};Dygraph.dateStrToMillis=function(a){return new Date(a).getTime()};Dygraph.update=function(b,c){if(typeof(c)!="undefined"&&c!==null){for(var a in c){if(c.hasOwnProperty(a)){b[a]=c[a]}}}return b};Dygraph.updateDeep=function(b,d){function c(e){return(typeof Node==="object"?e instanceof Node:typeof e==="object"&&typeof e.nodeType==="number"&&typeof e.nodeName==="string")}if(typeof(d)!="undefined"&&d!==null){for(var a in d){if(d.hasOwnProperty(a)){if(d[a]===null){b[a]=null}else{if(Dygraph.isArrayLike(d[a])){b[a]=d[a].slice()}else{if(c(d[a])){b[a]=d[a]}else{if(typeof(d[a])=="object"){if(typeof(b[a])!="object"||b[a]===null){b[a]={}}Dygraph.updateDeep(b[a],d[a])}else{b[a]=d[a]}}}}}}}return b};Dygraph.isArrayLike=function(b){var a=typeof(b);if((a!="object"&&!(a=="function"&&typeof(b.item)=="function"))||b===null||typeof(b.length)!="number"||b.nodeType===3){return false}return true};Dygraph.isDateLike=function(a){if(typeof(a)!="object"||a===null||typeof(a.getTime)!="function"){return false}return true};Dygraph.clone=function(c){var b=[];for(var a=0;a<c.length;a++){if(Dygraph.isArrayLike(c[a])){b.push(Dygraph.clone(c[a]))}else{b.push(c[a])}}return b};Dygraph.createCanvas=function(){var a=document.createElement("canvas");var b=(/MSIE/.test(navigator.userAgent)&&!window.opera);if(b&&(typeof(G_vmlCanvasManager)!="undefined")){a=G_vmlCanvasManager.initElement((a))}return a};Dygraph.isAndroid=function(){return(/Android/).test(navigator.userAgent)};Dygraph.Iterator=function(d,c,b,a){c=c||0;b=b||d.length;this.hasNext=true;this.peek=null;this.start_=c;this.array_=d;this.predicate_=a;this.end_=Math.min(d.length,c+b);this.nextIdx_=c-1;this.next()};Dygraph.Iterator.prototype.next=function(){if(!this.hasNext){return null}var c=this.peek;var b=this.nextIdx_+1;var a=false;while(b<this.end_){if(!this.predicate_||this.predicate_(this.array_,b)){this.peek=this.array_[b];a=true;break}b++}this.nextIdx_=b;if(!a){this.hasNext=false;this.peek=null}return c};Dygraph.createIterator=function(d,c,b,a){return new Dygraph.Iterator(d,c,b,a)};Dygraph.requestAnimFrame=(function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1000/60)}})();Dygraph.repeatAndCleanup=function(h,g,f,a){var i=0;var d;var b=new Date().getTime();h(i);if(g==1){a();return}var e=g-1;(function c(){if(i>=g){return}Dygraph.requestAnimFrame.call(window,function(){var l=new Date().getTime();var j=l-b;d=i;i=Math.floor(j/f);var k=i-d;var m=(i+k)>e;if(m||(i>=e)){h(e);a()}else{if(k!==0){h(i)}c()}})})()};Dygraph.isPixelChangingOptionList=function(h,e){var d={annotationClickHandler:true,annotationDblClickHandler:true,annotationMouseOutHandler:true,annotationMouseOverHandler:true,axisLabelColor:true,axisLineColor:true,axisLineWidth:true,clickCallback:true,digitsAfterDecimal:true,drawCallback:true,drawHighlightPointCallback:true,drawPoints:true,drawPointCallback:true,drawXGrid:true,drawYGrid:true,fillAlpha:true,gridLineColor:true,gridLineWidth:true,hideOverlayOnMouseOut:true,highlightCallback:true,highlightCircleSize:true,interactionModel:true,isZoomedIgnoreProgrammaticZoom:true,labelsDiv:true,labelsDivStyles:true,labelsDivWidth:true,labelsKMB:true,labelsKMG2:true,labelsSeparateLines:true,labelsShowZeroValues:true,legend:true,maxNumberWidth:true,panEdgeFraction:true,pixelsPerYLabel:true,pointClickCallback:true,pointSize:true,rangeSelectorPlotFillColor:true,rangeSelectorPlotStrokeColor:true,showLabelsOnHighlight:true,showRoller:true,sigFigs:true,strokeWidth:true,underlayCallback:true,unhighlightCallback:true,xAxisLabelFormatter:true,xTicker:true,xValueFormatter:true,yAxisLabelFormatter:true,yValueFormatter:true,zoomCallback:true};var a=false;var b={};if(h){for(var f=1;f<h.length;f++){b[h[f]]=true}}for(var g in e){if(a){break}if(e.hasOwnProperty(g)){if(b[g]){for(var c in e[g]){if(a){break}if(e[g].hasOwnProperty(c)&&!d[c]){a=true}}}else{if(!d[g]){a=true}}}}return a};Dygraph.compareArrays=function(c,b){if(!Dygraph.isArrayLike(c)||!Dygraph.isArrayLike(b)){return false}if(c.length!==b.length){return false}for(var a=0;a<c.length;a++){if(c[a]!==b[a]){return false}}return true};Dygraph.regularShape_=function(o,c,i,f,e,a,n){a=a||0;n=n||Math.PI*2/c;o.beginPath();var g=a;var d=g;var h=function(){var p=f+(Math.sin(d)*i);var q=e+(-Math.cos(d)*i);return[p,q]};var b=h();var l=b[0];var j=b[1];o.moveTo(l,j);for(var m=0;m<c;m++){d=(m==c-1)?g:(d+n);var k=h();o.lineTo(k[0],k[1])}o.fill();o.stroke()};Dygraph.shapeFunction_=function(b,a,c){return function(j,i,f,e,k,h,d){f.strokeStyle=h;f.fillStyle="white";Dygraph.regularShape_(f,b,d,e,k,a,c)}};Dygraph.Circles={DEFAULT:function(h,f,b,e,d,c,a){b.beginPath();b.fillStyle=c;b.arc(e,d,a,0,2*Math.PI,false);b.fill()},TRIANGLE:Dygraph.shapeFunction_(3),SQUARE:Dygraph.shapeFunction_(4,Math.PI/4),DIAMOND:Dygraph.shapeFunction_(4),PENTAGON:Dygraph.shapeFunction_(5),HEXAGON:Dygraph.shapeFunction_(6),CIRCLE:function(f,e,c,b,h,d,a){c.beginPath();c.strokeStyle=d;c.fillStyle="white";c.arc(b,h,a,0,2*Math.PI,false);c.fill();c.stroke()},STAR:Dygraph.shapeFunction_(5,0,4*Math.PI/5),PLUS:function(f,e,c,b,h,d,a){c.strokeStyle=d;c.beginPath();c.moveTo(b+a,h);c.lineTo(b-a,h);c.closePath();c.stroke();c.beginPath();c.moveTo(b,h+a);c.lineTo(b,h-a);c.closePath();c.stroke()},EX:function(f,e,c,b,h,d,a){c.strokeStyle=d;c.beginPath();c.moveTo(b+a,h+a);c.lineTo(b-a,h-a);c.closePath();c.stroke();c.beginPath();c.moveTo(b+a,h-a);c.lineTo(b-a,h+a);c.closePath();c.stroke()}};Dygraph.IFrameTarp=function(){this.tarps=[]};Dygraph.IFrameTarp.prototype.cover=function(){var f=document.getElementsByTagName("iframe");for(var c=0;c<f.length;c++){var e=f[c];var b=Dygraph.findPosX(e),h=Dygraph.findPosY(e),d=e.offsetWidth,a=e.offsetHeight;var g=document.createElement("div");g.style.position="absolute";g.style.left=b+"px";g.style.top=h+"px";g.style.width=d+"px";g.style.height=a+"px";g.style.zIndex=999;document.body.appendChild(g);this.tarps.push(g)}};Dygraph.IFrameTarp.prototype.uncover=function(){for(var a=0;a<this.tarps.length;a++){this.tarps[a].parentNode.removeChild(this.tarps[a])}this.tarps=[]};Dygraph.detectLineDelimiter=function(c){for(var a=0;a<c.length;a++){var b=c.charAt(a);if(b==="\r"){if(((a+1)<c.length)&&(c.charAt(a+1)==="\n")){return"\r\n"}return b}if(b==="\n"){if(((a+1)<c.length)&&(c.charAt(a+1)==="\r")){return"\n\r"}return b}}return null};Dygraph.isNodeContainedBy=function(b,a){if(a===null||b===null){return false}var c=(b);while(c&&c!==a){c=c.parentNode}return(c===a)};Dygraph.pow=function(a,b){if(b<0){return 1/Math.pow(a,-b)}return Math.pow(a,b)};Dygraph.dateSetters={ms:Date.prototype.setMilliseconds,s:Date.prototype.setSeconds,m:Date.prototype.setMinutes,h:Date.prototype.setHours};Dygraph.setDateSameTZ=function(c,b){var f=c.getTimezoneOffset();for(var a in b){if(!b.hasOwnProperty(a)){continue}var e=Dygraph.dateSetters[a];if(!e){throw"Invalid setter: "+a}e.call(c,b[a]);if(c.getTimezoneOffset()!=f){c.setTime(c.getTime()+(f-c.getTimezoneOffset())*60*1000)}}};"use strict";Dygraph.GVizChart=function(a){this.container=a};Dygraph.GVizChart.prototype.draw=function(b,a){this.container.innerHTML="";if(typeof(this.date_graph)!="undefined"){this.date_graph.destroy()}this.date_graph=new Dygraph(this.container,b,a)};Dygraph.GVizChart.prototype.setSelection=function(b){var a=false;if(b.length){a=b[0].row}this.date_graph.setSelection(a)};Dygraph.GVizChart.prototype.getSelection=function(){var b=[];var d=this.date_graph.getSelection();if(d<0){return b}var a=this.date_graph.layout_.points;for(var c=0;c<a.length;++c){b.push({row:d,column:c+1})}return b};"use strict";Dygraph.Interaction={};Dygraph.Interaction.startPan=function(o,t,c){var r,b;c.isPanning=true;var k=t.xAxisRange();c.dateRange=k[1]-k[0];c.initialLeftmostDate=k[0];c.xUnitsPerPixel=c.dateRange/(t.plotter_.area.w-1);if(t.attr_("panEdgeFraction")){var x=t.width_*t.attr_("panEdgeFraction");var d=t.xAxisExtremes();var j=t.toDomXCoord(d[0])-x;var l=t.toDomXCoord(d[1])+x;var u=t.toDataXCoord(j);var w=t.toDataXCoord(l);c.boundedDates=[u,w];var f=[];var a=t.height_*t.attr_("panEdgeFraction");for(r=0;r<t.axes_.length;r++){b=t.axes_[r];var p=b.extremeRange;var q=t.toDomYCoord(p[0],r)+a;var s=t.toDomYCoord(p[1],r)-a;var n=t.toDataYCoord(q,r);var e=t.toDataYCoord(s,r);f[r]=[n,e]}c.boundedValues=f}c.is2DPan=false;c.axes=[];for(r=0;r<t.axes_.length;r++){b=t.axes_[r];var h={};var m=t.yAxisRange(r);var v=t.attributes_.getForAxis("logscale",r);if(v){h.initialTopValue=Dygraph.log10(m[1]);h.dragValueRange=Dygraph.log10(m[1])-Dygraph.log10(m[0])}else{h.initialTopValue=m[1];h.dragValueRange=m[1]-m[0]}h.unitsPerPixel=h.dragValueRange/(t.plotter_.area.h-1);c.axes.push(h);if(b.valueWindow||b.valueRange){c.is2DPan=true}}};Dygraph.Interaction.movePan=function(b,k,c){c.dragEndX=k.dragGetX_(b,c);c.dragEndY=k.dragGetY_(b,c);var h=c.initialLeftmostDate-(c.dragEndX-c.dragStartX)*c.xUnitsPerPixel;if(c.boundedDates){h=Math.max(h,c.boundedDates[0])}var a=h+c.dateRange;if(c.boundedDates){if(a>c.boundedDates[1]){h=h-(a-c.boundedDates[1]);a=h+c.dateRange}}k.dateWindow_=[h,a];if(c.is2DPan){var d=c.dragEndY-c.dragStartY;for(var j=0;j<k.axes_.length;j++){var e=k.axes_[j];var o=c.axes[j];var p=d*o.unitsPerPixel;var f=c.boundedValues?c.boundedValues[j]:null;var l=o.initialTopValue+p;if(f){l=Math.min(l,f[1])}var n=l-o.dragValueRange;if(f){if(n<f[0]){l=l-(n-f[0]);n=l-o.dragValueRange}}var m=k.attributes_.getForAxis("logscale",j);if(m){e.valueWindow=[Math.pow(Dygraph.LOG_SCALE,n),Math.pow(Dygraph.LOG_SCALE,l)]}else{e.valueWindow=[n,l]}}}k.drawGraph_(false)};Dygraph.Interaction.endPan=function(c,b,a){a.dragEndX=b.dragGetX_(c,a);a.dragEndY=b.dragGetY_(c,a);var e=Math.abs(a.dragEndX-a.dragStartX);var d=Math.abs(a.dragEndY-a.dragStartY);if(e<2&&d<2&&b.lastx_!==undefined&&b.lastx_!=-1){Dygraph.Interaction.treatMouseOpAsClick(b,c,a)}a.isPanning=false;a.is2DPan=false;a.initialLeftmostDate=null;a.dateRange=null;a.valueRange=null;a.boundedDates=null;a.boundedValues=null;a.axes=null};Dygraph.Interaction.startZoom=function(c,b,a){a.isZooming=true;a.zoomMoved=false};Dygraph.Interaction.moveZoom=function(c,b,a){a.zoomMoved=true;a.dragEndX=b.dragGetX_(c,a);a.dragEndY=b.dragGetY_(c,a);var e=Math.abs(a.dragStartX-a.dragEndX);var d=Math.abs(a.dragStartY-a.dragEndY);a.dragDirection=(e<d/2)?Dygraph.VERTICAL:Dygraph.HORIZONTAL;b.drawZoomRect_(a.dragDirection,a.dragStartX,a.dragEndX,a.dragStartY,a.dragEndY,a.prevDragDirection,a.prevEndX,a.prevEndY);a.prevEndX=a.dragEndX;a.prevEndY=a.dragEndY;a.prevDragDirection=a.dragDirection};Dygraph.Interaction.treatMouseOpAsClick=function(f,b,d){var k=f.attr_("clickCallback");var n=f.attr_("pointClickCallback");var j=null;if(n){var l=-1;var m=Number.MAX_VALUE;for(var e=0;e<f.selPoints_.length;e++){var c=f.selPoints_[e];var a=Math.pow(c.canvasx-d.dragEndX,2)+Math.pow(c.canvasy-d.dragEndY,2);if(!isNaN(a)&&(l==-1||a<m)){m=a;l=e}}var h=f.attr_("highlightCircleSize")+2;if(m<=h*h){j=f.selPoints_[l]}}if(j){n(b,j)}if(k){k(b,f.lastx_,f.selPoints_)}};Dygraph.Interaction.endZoom=function(c,i,e){e.isZooming=false;e.dragEndX=i.dragGetX_(c,e);e.dragEndY=i.dragGetY_(c,e);var h=Math.abs(e.dragEndX-e.dragStartX);var d=Math.abs(e.dragEndY-e.dragStartY);if(h<2&&d<2&&i.lastx_!==undefined&&i.lastx_!=-1){Dygraph.Interaction.treatMouseOpAsClick(i,c,e)}var b=i.getArea();if(h>=10&&e.dragDirection==Dygraph.HORIZONTAL){var f=Math.min(e.dragStartX,e.dragEndX),k=Math.max(e.dragStartX,e.dragEndX);f=Math.max(f,b.x);k=Math.min(k,b.x+b.w);if(f<k){i.doZoomX_(f,k)}e.cancelNextDblclick=true}else{if(d>=10&&e.dragDirection==Dygraph.VERTICAL){var j=Math.min(e.dragStartY,e.dragEndY),a=Math.max(e.dragStartY,e.dragEndY);j=Math.max(j,b.y);a=Math.min(a,b.y+b.h);if(j<a){i.doZoomY_(j,a)}e.cancelNextDblclick=true}else{if(e.zoomMoved){i.clearZoomRect_()}}}e.dragStartX=null;e.dragStartY=null};Dygraph.Interaction.startTouch=function(f,e,d){f.preventDefault();if(f.touches.length>1){d.startTimeForDoubleTapMs=null}var h=[];for(var c=0;c<f.touches.length;c++){var b=f.touches[c];h.push({pageX:b.pageX,pageY:b.pageY,dataX:e.toDataXCoord(b.pageX),dataY:e.toDataYCoord(b.pageY)})}d.initialTouches=h;if(h.length==1){d.initialPinchCenter=h[0];d.touchDirections={x:true,y:true}}else{if(h.length>=2){d.initialPinchCenter={pageX:0.5*(h[0].pageX+h[1].pageX),pageY:0.5*(h[0].pageY+h[1].pageY),dataX:0.5*(h[0].dataX+h[1].dataX),dataY:0.5*(h[0].dataY+h[1].dataY)};var a=180/Math.PI*Math.atan2(d.initialPinchCenter.pageY-h[0].pageY,h[0].pageX-d.initialPinchCenter.pageX);a=Math.abs(a);if(a>90){a=90-a}d.touchDirections={x:(a<(90-45/2)),y:(a>45/2)}}}d.initialRange={x:e.xAxisRange(),y:e.yAxisRange()}};Dygraph.Interaction.moveTouch=function(n,q,d){d.startTimeForDoubleTapMs=null;var p,l=[];for(p=0;p<n.touches.length;p++){var k=n.touches[p];l.push({pageX:k.pageX,pageY:k.pageY})}var a=d.initialTouches;var h;var j=d.initialPinchCenter;if(l.length==1){h=l[0]}else{h={pageX:0.5*(l[0].pageX+l[1].pageX),pageY:0.5*(l[0].pageY+l[1].pageY)}}var m={pageX:h.pageX-j.pageX,pageY:h.pageY-j.pageY};var f=d.initialRange.x[1]-d.initialRange.x[0];var o=d.initialRange.y[0]-d.initialRange.y[1];m.dataX=(m.pageX/q.plotter_.area.w)*f;m.dataY=(m.pageY/q.plotter_.area.h)*o;var w,c;if(l.length==1){w=1;c=1}else{if(l.length>=2){var e=(a[1].pageX-j.pageX);w=(l[1].pageX-h.pageX)/e;var v=(a[1].pageY-j.pageY);c=(l[1].pageY-h.pageY)/v}}w=Math.min(8,Math.max(0.125,w));c=Math.min(8,Math.max(0.125,c));var u=false;if(d.touchDirections.x){q.dateWindow_=[j.dataX-m.dataX+(d.initialRange.x[0]-j.dataX)/w,j.dataX-m.dataX+(d.initialRange.x[1]-j.dataX)/w];u=true}if(d.touchDirections.y){for(p=0;p<1;p++){var b=q.axes_[p];var s=q.attributes_.getForAxis("logscale",p);if(s){}else{b.valueWindow=[j.dataY-m.dataY+(d.initialRange.y[0]-j.dataY)/c,j.dataY-m.dataY+(d.initialRange.y[1]-j.dataY)/c];u=true}}}q.drawGraph_(false);if(u&&l.length>1&&q.attr_("zoomCallback")){var r=q.xAxisRange();q.attr_("zoomCallback")(r[0],r[1],q.yAxisRanges())}};Dygraph.Interaction.endTouch=function(e,d,c){if(e.touches.length!==0){Dygraph.Interaction.startTouch(e,d,c)}else{if(e.changedTouches.length==1){var a=new Date().getTime();var b=e.changedTouches[0];if(c.startTimeForDoubleTapMs&&a-c.startTimeForDoubleTapMs<500&&c.doubleTapX&&Math.abs(c.doubleTapX-b.screenX)<50&&c.doubleTapY&&Math.abs(c.doubleTapY-b.screenY)<50){d.resetZoom()}else{c.startTimeForDoubleTapMs=a;c.doubleTapX=b.screenX;c.doubleTapY=b.screenY}}}};Dygraph.Interaction.defaultModel={mousedown:function(c,b,a){if(c.button&&c.button==2){return}a.initializeMouseDown(c,b,a);if(c.altKey||c.shiftKey){Dygraph.startPan(c,b,a)}else{Dygraph.startZoom(c,b,a)}},mousemove:function(c,b,a){if(a.isZooming){Dygraph.moveZoom(c,b,a)}else{if(a.isPanning){Dygraph.movePan(c,b,a)}}},mouseup:function(c,b,a){if(a.isZooming){Dygraph.endZoom(c,b,a)}else{if(a.isPanning){Dygraph.endPan(c,b,a)}}},touchstart:function(c,b,a){Dygraph.Interaction.startTouch(c,b,a)},touchmove:function(c,b,a){Dygraph.Interaction.moveTouch(c,b,a)},touchend:function(c,b,a){Dygraph.Interaction.endTouch(c,b,a)},mouseout:function(c,b,a){if(a.isZooming){a.dragEndX=null;a.dragEndY=null;b.clearZoomRect_()}},dblclick:function(c,b,a){if(a.cancelNextDblclick){a.cancelNextDblclick=false;return}if(c.altKey||c.shiftKey){return}b.resetZoom()}};Dygraph.DEFAULT_ATTRS.interactionModel=Dygraph.Interaction.defaultModel;Dygraph.defaultInteractionModel=Dygraph.Interaction.defaultModel;Dygraph.endZoom=Dygraph.Interaction.endZoom;Dygraph.moveZoom=Dygraph.Interaction.moveZoom;Dygraph.startZoom=Dygraph.Interaction.startZoom;Dygraph.endPan=Dygraph.Interaction.endPan;Dygraph.movePan=Dygraph.Interaction.movePan;Dygraph.startPan=Dygraph.Interaction.startPan;Dygraph.Interaction.nonInteractiveModel_={mousedown:function(c,b,a){a.initializeMouseDown(c,b,a)},mouseup:function(c,b,a){a.dragEndX=b.dragGetX_(c,a);a.dragEndY=b.dragGetY_(c,a);var e=Math.abs(a.dragEndX-a.dragStartX);var d=Math.abs(a.dragEndY-a.dragStartY);if(e<2&&d<2&&b.lastx_!==undefined&&b.lastx_!=-1){Dygraph.Interaction.treatMouseOpAsClick(b,c,a)}}};Dygraph.Interaction.dragIsPanInteractionModel={mousedown:function(c,b,a){a.initializeMouseDown(c,b,a);Dygraph.startPan(c,b,a)},mousemove:function(c,b,a){if(a.isPanning){Dygraph.movePan(c,b,a)}},mouseup:function(c,b,a){if(a.isPanning){Dygraph.endPan(c,b,a)}}};"use strict";Dygraph.TickList=undefined;Dygraph.Ticker=undefined;Dygraph.numericLinearTicks=function(d,c,i,g,f,h){var e=function(a){if(a==="logscale"){return false}return g(a)};return Dygraph.numericTicks(d,c,i,e,f,h)};Dygraph.numericTicks=function(F,E,u,p,d,q){var z=(p("pixelsPerLabel"));var G=[];var C,A,t,y;if(q){for(C=0;C<q.length;C++){G.push({v:q[C]})}}else{if(p("logscale")){y=Math.floor(u/z);var l=Dygraph.binarySearch(F,Dygraph.PREFERRED_LOG_TICK_VALUES,1);var H=Dygraph.binarySearch(E,Dygraph.PREFERRED_LOG_TICK_VALUES,-1);if(l==-1){l=0}if(H==-1){H=Dygraph.PREFERRED_LOG_TICK_VALUES.length-1}var s=null;if(H-l>=y/4){for(var r=H;r>=l;r--){var m=Dygraph.PREFERRED_LOG_TICK_VALUES[r];var k=Math.log(m/F)/Math.log(E/F)*u;var D={v:m};if(s===null){s={tickValue:m,pixel_coord:k}}else{if(Math.abs(k-s.pixel_coord)>=z){s={tickValue:m,pixel_coord:k}}else{D.label=""}}G.push(D)}G.reverse()}}if(G.length===0){var g=p("labelsKMG2");var n,h;if(g){n=[1,2,4,8,16,32,64,128,256];h=16}else{n=[1,2,5,10,20,50,100];h=10}var w=Math.ceil(u/z);var o=Math.abs(E-F)/w;var v=Math.floor(Math.log(o)/Math.log(h));var f=Math.pow(h,v);var I,x,c,e;for(A=0;A<n.length;A++){I=f*n[A];x=Math.floor(F/I)*I;c=Math.ceil(E/I)*I;y=Math.abs(c-x)/I;e=u/y;if(e>z){break}}if(x>c){I*=-1}for(C=0;C<y;C++){t=x+C*I;G.push({v:t})}}}var B=(p("axisLabelFormatter"));for(C=0;C<G.length;C++){if(G[C].label!==undefined){continue}G[C].label=B(G[C].v,0,p,d)}return G};Dygraph.dateTicker=function(e,c,i,g,f,h){var d=Dygraph.pickDateTickGranularity(e,c,i,g);if(d>=0){return Dygraph.getDateAxis(e,c,d,g,f)}else{return[]}};Dygraph.SECONDLY=0;Dygraph.TWO_SECONDLY=1;Dygraph.FIVE_SECONDLY=2;Dygraph.TEN_SECONDLY=3;Dygraph.THIRTY_SECONDLY=4;Dygraph.MINUTELY=5;Dygraph.TWO_MINUTELY=6;Dygraph.FIVE_MINUTELY=7;Dygraph.TEN_MINUTELY=8;Dygraph.THIRTY_MINUTELY=9;Dygraph.HOURLY=10;Dygraph.TWO_HOURLY=11;Dygraph.SIX_HOURLY=12;Dygraph.DAILY=13;Dygraph.WEEKLY=14;Dygraph.MONTHLY=15;Dygraph.QUARTERLY=16;Dygraph.BIANNUAL=17;Dygraph.ANNUAL=18;Dygraph.DECADAL=19;Dygraph.CENTENNIAL=20;Dygraph.NUM_GRANULARITIES=21;Dygraph.SHORT_SPACINGS=[];Dygraph.SHORT_SPACINGS[Dygraph.SECONDLY]=1000*1;Dygraph.SHORT_SPACINGS[Dygraph.TWO_SECONDLY]=1000*2;Dygraph.SHORT_SPACINGS[Dygraph.FIVE_SECONDLY]=1000*5;Dygraph.SHORT_SPACINGS[Dygraph.TEN_SECONDLY]=1000*10;Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_SECONDLY]=1000*30;Dygraph.SHORT_SPACINGS[Dygraph.MINUTELY]=1000*60;Dygraph.SHORT_SPACINGS[Dygraph.TWO_MINUTELY]=1000*60*2;Dygraph.SHORT_SPACINGS[Dygraph.FIVE_MINUTELY]=1000*60*5;Dygraph.SHORT_SPACINGS[Dygraph.TEN_MINUTELY]=1000*60*10;Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_MINUTELY]=1000*60*30;Dygraph.SHORT_SPACINGS[Dygraph.HOURLY]=1000*3600;Dygraph.SHORT_SPACINGS[Dygraph.TWO_HOURLY]=1000*3600*2;Dygraph.SHORT_SPACINGS[Dygraph.SIX_HOURLY]=1000*3600*6;Dygraph.SHORT_SPACINGS[Dygraph.DAILY]=1000*86400;Dygraph.SHORT_SPACINGS[Dygraph.WEEKLY]=1000*604800;Dygraph.LONG_TICK_PLACEMENTS=[];Dygraph.LONG_TICK_PLACEMENTS[Dygraph.MONTHLY]={months:[0,1,2,3,4,5,6,7,8,9,10,11],year_mod:1};Dygraph.LONG_TICK_PLACEMENTS[Dygraph.QUARTERLY]={months:[0,3,6,9],year_mod:1};Dygraph.LONG_TICK_PLACEMENTS[Dygraph.BIANNUAL]={months:[0,6],year_mod:1};Dygraph.LONG_TICK_PLACEMENTS[Dygraph.ANNUAL]={months:[0],year_mod:1};Dygraph.LONG_TICK_PLACEMENTS[Dygraph.DECADAL]={months:[0],year_mod:10};Dygraph.LONG_TICK_PLACEMENTS[Dygraph.CENTENNIAL]={months:[0],year_mod:100};Dygraph.PREFERRED_LOG_TICK_VALUES=function(){var c=[];for(var b=-39;b<=39;b++){var a=Math.pow(10,b);for(var d=1;d<=9;d++){var e=a*d;c.push(e)}}return c}();Dygraph.pickDateTickGranularity=function(d,c,j,h){var g=(h("pixelsPerLabel"));for(var f=0;f<Dygraph.NUM_GRANULARITIES;f++){var e=Dygraph.numDateTicks(d,c,f);if(j/e>=g){return f}}return -1};Dygraph.numDateTicks=function(e,b,f){if(f<Dygraph.MONTHLY){var g=Dygraph.SHORT_SPACINGS[f];return Math.floor(0.5+1*(b-e)/g)}else{var d=Dygraph.LONG_TICK_PLACEMENTS[f];var c=365.2524*24*3600*1000;var a=1*(b-e)/c;return Math.floor(0.5+1*a*d.months.length/d.year_mod)}};Dygraph.getDateAxis=function(p,l,a,n,z){var w=(n("axisLabelFormatter"));var C=[];var m;if(a<Dygraph.MONTHLY){var c=Dygraph.SHORT_SPACINGS[a];var y=c/1000;var A=new Date(p);Dygraph.setDateSameTZ(A,{ms:0});var h;if(y<=60){h=A.getSeconds();Dygraph.setDateSameTZ(A,{s:h-h%y})}else{Dygraph.setDateSameTZ(A,{s:0});y/=60;if(y<=60){h=A.getMinutes();Dygraph.setDateSameTZ(A,{m:h-h%y})}else{Dygraph.setDateSameTZ(A,{m:0});y/=60;if(y<=24){h=A.getHours();A.setHours(h-h%y)}else{A.setHours(0);y/=24;if(y==7){A.setDate(A.getDate()-A.getDay())}}}}p=A.getTime();var B=new Date(p).getTimezoneOffset();var e=(c>=Dygraph.SHORT_SPACINGS[Dygraph.TWO_HOURLY]);for(m=p;m<=l;m+=c){A=new Date(m);if(e&&A.getTimezoneOffset()!=B){var k=A.getTimezoneOffset()-B;m+=k*60*1000;A=new Date(m);B=A.getTimezoneOffset();if(new Date(m+c).getTimezoneOffset()!=B){m+=c;A=new Date(m);B=A.getTimezoneOffset()}}C.push({v:m,label:w(A,a,n,z)})}}else{var f;var r=1;if(a<Dygraph.NUM_GRANULARITIES){f=Dygraph.LONG_TICK_PLACEMENTS[a].months;r=Dygraph.LONG_TICK_PLACEMENTS[a].year_mod}else{Dygraph.warn("Span of dates is too long")}var v=new Date(p).getFullYear();var q=new Date(l).getFullYear();var b=Dygraph.zeropad;for(var u=v;u<=q;u++){if(u%r!==0){continue}for(var s=0;s<f.length;s++){var o=u+"/"+b(1+f[s])+"/01";m=Dygraph.dateStrToMillis(o);if(m<p||m>l){continue}C.push({v:m,label:w(new Date(m),a,n,z)})}}}return C};if(Dygraph&&Dygraph.DEFAULT_ATTRS&&Dygraph.DEFAULT_ATTRS.axes&&Dygraph.DEFAULT_ATTRS.axes["x"]&&Dygraph.DEFAULT_ATTRS.axes["y"]&&Dygraph.DEFAULT_ATTRS.axes["y2"]){Dygraph.DEFAULT_ATTRS.axes["x"]["ticker"]=Dygraph.dateTicker;Dygraph.DEFAULT_ATTRS.axes["y"]["ticker"]=Dygraph.numericTicks;Dygraph.DEFAULT_ATTRS.axes["y2"]["ticker"]=Dygraph.numericTicks}Dygraph.Plugins={};Dygraph.Plugins.Annotations=(function(){var a=function(){this.annotations_=[]};a.prototype.toString=function(){return"Annotations Plugin"};a.prototype.activate=function(b){return{clearChart:this.clearChart,didDrawChart:this.didDrawChart}};a.prototype.detachLabels=function(){for(var c=0;c<this.annotations_.length;c++){var b=this.annotations_[c];if(b.parentNode){b.parentNode.removeChild(b)}this.annotations_[c]=null}this.annotations_=[]};a.prototype.clearChart=function(b){this.detachLabels()};a.prototype.didDrawChart=function(v){var t=v.dygraph;var r=t.layout_.annotated_points;if(!r||r.length===0){return}var h=v.canvas.parentNode;var x={position:"absolute",fontSize:t.getOption("axisLabelFontSize")+"px",zIndex:10,overflow:"hidden"};var b=function(e,g,i){return function(y){var p=i.annotation;if(p.hasOwnProperty(e)){p[e](p,i,t,y)}else{if(t.getOption(g)){t.getOption(g)(p,i,t,y)}}}};var u=v.dygraph.plotter_.area;var q={};for(var s=0;s<r.length;s++){var l=r[s];if(l.canvasx<u.x||l.canvasx>u.x+u.w||l.canvasy<u.y||l.canvasy>u.y+u.h){continue}var w=l.annotation;var n=6;if(w.hasOwnProperty("tickHeight")){n=w.tickHeight}var j=document.createElement("div");for(var A in x){if(x.hasOwnProperty(A)){j.style[A]=x[A]}}if(!w.hasOwnProperty("icon")){j.className="dygraphDefaultAnnotation"}if(w.hasOwnProperty("cssClass")){j.className+=" "+w.cssClass}var m=w.hasOwnProperty("width")?w.width:16;var k=w.hasOwnProperty("height")?w.height:16;if(w.hasOwnProperty("icon")){var z=document.createElement("img");z.src=w.icon;z.width=m;z.height=k;j.appendChild(z)}else{if(l.annotation.hasOwnProperty("shortText")){j.appendChild(document.createTextNode(l.annotation.shortText))}}var c=l.canvasx-m/2;j.style.left=c+"px";var f=0;if(w.attachAtBottom){var d=(u.y+u.h-k-n);if(q[c]){d-=q[c]}else{q[c]=0}q[c]+=(n+k);f=d}else{f=l.canvasy-k-n}j.style.top=f+"px";j.style.width=m+"px";j.style.height=k+"px";j.title=l.annotation.text;j.style.color=t.colorsMap_[l.name];j.style.borderColor=t.colorsMap_[l.name];w.div=j;t.addAndTrackEvent(j,"click",b("clickHandler","annotationClickHandler",l,this));t.addAndTrackEvent(j,"mouseover",b("mouseOverHandler","annotationMouseOverHandler",l,this));t.addAndTrackEvent(j,"mouseout",b("mouseOutHandler","annotationMouseOutHandler",l,this));t.addAndTrackEvent(j,"dblclick",b("dblClickHandler","annotationDblClickHandler",l,this));h.appendChild(j);this.annotations_.push(j);var o=v.drawingContext;o.save();o.strokeStyle=t.colorsMap_[l.name];o.beginPath();if(!w.attachAtBottom){o.moveTo(l.canvasx,l.canvasy);o.lineTo(l.canvasx,l.canvasy-2-n)}else{var d=f+k;o.moveTo(l.canvasx,d);o.lineTo(l.canvasx,d+n)}o.closePath();o.stroke();o.restore()}};a.prototype.destroy=function(){this.detachLabels()};return a})();Dygraph.Plugins.Axes=(function(){var a=function(){this.xlabels_=[];this.ylabels_=[]};a.prototype.toString=function(){return"Axes Plugin"};a.prototype.activate=function(b){return{layout:this.layout,clearChart:this.clearChart,willDrawChart:this.willDrawChart}};a.prototype.layout=function(f){var d=f.dygraph;if(d.getOption("drawYAxis")){var b=d.getOption("yAxisLabelWidth")+2*d.getOption("axisTickSize");f.reserveSpaceLeft(b)}if(d.getOption("drawXAxis")){var c;if(d.getOption("xAxisHeight")){c=d.getOption("xAxisHeight")}else{c=d.getOptionForAxis("axisLabelFontSize","x")+2*d.getOption("axisTickSize")}f.reserveSpaceBottom(c)}if(d.numAxes()==2){if(d.getOption("drawYAxis")){var b=d.getOption("yAxisLabelWidth")+2*d.getOption("axisTickSize");f.reserveSpaceRight(b)}}else{if(d.numAxes()>2){d.error("Only two y-axes are supported at this time. (Trying to use "+d.numAxes()+")")}}};a.prototype.detachLabels=function(){function b(d){for(var c=0;c<d.length;c++){var e=d[c];if(e.parentNode){e.parentNode.removeChild(e)}}}b(this.xlabels_);b(this.ylabels_);this.xlabels_=[];this.ylabels_=[]};a.prototype.clearChart=function(b){this.detachLabels()};a.prototype.willDrawChart=function(H){var F=H.dygraph;if(!F.getOption("drawXAxis")&&!F.getOption("drawYAxis")){return}function B(e){return Math.round(e)+0.5}function A(e){return Math.round(e)-0.5}var j=H.drawingContext;var v=H.canvas.parentNode;var J=H.canvas.width;var d=H.canvas.height;var s,u,t,E,D;var C=function(e){return{position:"absolute",fontSize:F.getOptionForAxis("axisLabelFontSize",e)+"px",zIndex:10,color:F.getOptionForAxis("axisLabelColor",e),width:F.getOption("axisLabelWidth")+"px",lineHeight:"normal",overflow:"hidden"}};var p={x:C("x"),y:C("y"),y2:C("y2")};var m=function(g,x,y){var K=document.createElement("div");var e=p[y=="y2"?"y2":x];for(var r in e){if(e.hasOwnProperty(r)){K.style[r]=e[r]}}var i=document.createElement("div");i.className="dygraph-axis-label dygraph-axis-label-"+x+(y?" dygraph-axis-label-"+y:"");i.innerHTML=g;K.appendChild(i);return K};j.save();var I=F.layout_;var G=H.dygraph.plotter_.area;if(F.getOption("drawYAxis")){if(I.yticks&&I.yticks.length>0){var h=F.numAxes();for(D=0;D<I.yticks.length;D++){E=I.yticks[D];if(typeof(E)=="function"){return}u=G.x;var o=1;var f="y1";if(E[0]==1){u=G.x+G.w;o=-1;f="y2"}var k=F.getOptionForAxis("axisLabelFontSize",f);t=G.y+E[1]*G.h;s=m(E[2],"y",h==2?f:null);var z=(t-k/2);if(z<0){z=0}if(z+k+3>d){s.style.bottom="0px"}else{s.style.top=z+"px"}if(E[0]===0){s.style.left=(G.x-F.getOption("yAxisLabelWidth")-F.getOption("axisTickSize"))+"px";s.style.textAlign="right"}else{if(E[0]==1){s.style.left=(G.x+G.w+F.getOption("axisTickSize"))+"px";s.style.textAlign="left"}}s.style.width=F.getOption("yAxisLabelWidth")+"px";v.appendChild(s);this.ylabels_.push(s)}var n=this.ylabels_[0];var k=F.getOptionForAxis("axisLabelFontSize","y");var q=parseInt(n.style.top,10)+k;if(q>d-k){n.style.top=(parseInt(n.style.top,10)-k/2)+"px"}}var c;if(F.getOption("drawAxesAtZero")){var w=F.toPercentXCoord(0);if(w>1||w<0||isNaN(w)){w=0}c=B(G.x+w*G.w)}else{c=B(G.x)}j.strokeStyle=F.getOptionForAxis("axisLineColor","y");j.lineWidth=F.getOptionForAxis("axisLineWidth","y");j.beginPath();j.moveTo(c,A(G.y));j.lineTo(c,A(G.y+G.h));j.closePath();j.stroke();if(F.numAxes()==2){j.strokeStyle=F.getOptionForAxis("axisLineColor","y2");j.lineWidth=F.getOptionForAxis("axisLineWidth","y2");j.beginPath();j.moveTo(A(G.x+G.w),A(G.y));j.lineTo(A(G.x+G.w),A(G.y+G.h));j.closePath();j.stroke()}}if(F.getOption("drawXAxis")){if(I.xticks){for(D=0;D<I.xticks.length;D++){E=I.xticks[D];u=G.x+E[0]*G.w;t=G.y+G.h;s=m(E[1],"x");s.style.textAlign="center";s.style.top=(t+F.getOption("axisTickSize"))+"px";var l=(u-F.getOption("axisLabelWidth")/2);if(l+F.getOption("axisLabelWidth")>J){l=J-F.getOption("xAxisLabelWidth");s.style.textAlign="right"}if(l<0){l=0;s.style.textAlign="left"}s.style.left=l+"px";s.style.width=F.getOption("xAxisLabelWidth")+"px";v.appendChild(s);this.xlabels_.push(s)}}j.strokeStyle=F.getOptionForAxis("axisLineColor","x");j.lineWidth=F.getOptionForAxis("axisLineWidth","x");j.beginPath();var b;if(F.getOption("drawAxesAtZero")){var w=F.toPercentYCoord(0,0);if(w>1||w<0){w=1}b=A(G.y+w*G.h)}else{b=A(G.y+G.h)}j.moveTo(B(G.x),b);j.lineTo(B(G.x+G.w),b);j.closePath();j.stroke()}j.restore()};return a})();Dygraph.Plugins.ChartLabels=(function(){var c=function(){this.title_div_=null;this.xlabel_div_=null;this.ylabel_div_=null;this.y2label_div_=null};c.prototype.toString=function(){return"ChartLabels Plugin"};c.prototype.activate=function(d){return{layout:this.layout,didDrawChart:this.didDrawChart}};var b=function(d){var e=document.createElement("div");e.style.position="absolute";e.style.left=d.x+"px";e.style.top=d.y+"px";e.style.width=d.w+"px";e.style.height=d.h+"px";return e};c.prototype.detachLabels_=function(){var e=[this.title_div_,this.xlabel_div_,this.ylabel_div_,this.y2label_div_];for(var d=0;d<e.length;d++){var f=e[d];if(!f){continue}if(f.parentNode){f.parentNode.removeChild(f)}}this.title_div_=null;this.xlabel_div_=null;this.ylabel_div_=null;this.y2label_div_=null};var a=function(l,i,f,h,j){var d=document.createElement("div");d.style.position="absolute";if(f==1){d.style.left="0px"}else{d.style.left=i.x+"px"}d.style.top=i.y+"px";d.style.width=i.w+"px";d.style.height=i.h+"px";d.style.fontSize=(l.getOption("yLabelWidth")-2)+"px";var m=document.createElement("div");m.style.position="absolute";m.style.width=i.h+"px";m.style.height=i.w+"px";m.style.top=(i.h/2-i.w/2)+"px";m.style.left=(i.w/2-i.h/2)+"px";m.style.textAlign="center";var e="rotate("+(f==1?"-":"")+"90deg)";m.style.transform=e;m.style.WebkitTransform=e;m.style.MozTransform=e;m.style.OTransform=e;m.style.msTransform=e;if(typeof(document.documentMode)!=="undefined"&&document.documentMode<9){m.style.filter="progid:DXImageTransform.Microsoft.BasicImage(rotation="+(f==1?"3":"1")+")";m.style.left="0px";m.style.top="0px"}var k=document.createElement("div");k.className=h;k.innerHTML=j;m.appendChild(k);d.appendChild(m);return d};c.prototype.layout=function(k){this.detachLabels_();var i=k.dygraph;var m=k.chart_div;if(i.getOption("title")){var d=k.reserveSpaceTop(i.getOption("titleHeight"));this.title_div_=b(d);this.title_div_.style.textAlign="center";this.title_div_.style.fontSize=(i.getOption("titleHeight")-8)+"px";this.title_div_.style.fontWeight="bold";this.title_div_.style.zIndex=10;var f=document.createElement("div");f.className="dygraph-label dygraph-title";f.innerHTML=i.getOption("title");this.title_div_.appendChild(f);m.appendChild(this.title_div_)}if(i.getOption("xlabel")){var j=k.reserveSpaceBottom(i.getOption("xLabelHeight"));this.xlabel_div_=b(j);this.xlabel_div_.style.textAlign="center";this.xlabel_div_.style.fontSize=(i.getOption("xLabelHeight")-2)+"px";var f=document.createElement("div");f.className="dygraph-label dygraph-xlabel";f.innerHTML=i.getOption("xlabel");this.xlabel_div_.appendChild(f);m.appendChild(this.xlabel_div_)}if(i.getOption("ylabel")){var h=k.reserveSpaceLeft(0);this.ylabel_div_=a(i,h,1,"dygraph-label dygraph-ylabel",i.getOption("ylabel"));m.appendChild(this.ylabel_div_)}if(i.getOption("y2label")&&i.numAxes()==2){var l=k.reserveSpaceRight(0);this.y2label_div_=a(i,l,2,"dygraph-label dygraph-y2label",i.getOption("y2label"));m.appendChild(this.y2label_div_)}};c.prototype.didDrawChart=function(f){var d=f.dygraph;if(this.title_div_){this.title_div_.children[0].innerHTML=d.getOption("title")}if(this.xlabel_div_){this.xlabel_div_.children[0].innerHTML=d.getOption("xlabel")}if(this.ylabel_div_){this.ylabel_div_.children[0].children[0].innerHTML=d.getOption("ylabel")}if(this.y2label_div_){this.y2label_div_.children[0].children[0].innerHTML=d.getOption("y2label")}};c.prototype.clearChart=function(){};c.prototype.destroy=function(){this.detachLabels_()};return c})();Dygraph.Plugins.Grid=(function(){var a=function(){};a.prototype.toString=function(){return"Gridline Plugin"};a.prototype.activate=function(b){return{willDrawChart:this.willDrawChart}};a.prototype.willDrawChart=function(s){var q=s.dygraph;var l=s.drawingContext;var t=q.layout_;var r=s.dygraph.plotter_.area;function k(e){return Math.round(e)+0.5}function j(e){return Math.round(e)-0.5}var h,f,p,u;if(q.getOption("drawYGrid")){var o=["y","y2"];var m=[],v=[],b=[],n=[],d=[];for(var p=0;p<o.length;p++){b[p]=q.getOptionForAxis("drawGrid",o[p]);if(b[p]){m[p]=q.getOptionForAxis("gridLineColor",o[p]);v[p]=q.getOptionForAxis("gridLineWidth",o[p]);d[p]=q.getOptionForAxis("gridLinePattern",o[p]);n[p]=d[p]&&(d[p].length>=2)}}u=t.yticks;l.save();for(p=0;p<u.length;p++){var c=u[p][0];if(b[c]){if(n[c]){l.installPattern(d[c])}l.strokeStyle=m[c];l.lineWidth=v[c];h=k(r.x);f=j(r.y+u[p][1]*r.h);l.beginPath();l.moveTo(h,f);l.lineTo(h+r.w,f);l.closePath();l.stroke();if(n[c]){l.uninstallPattern()}}}l.restore()}if(q.getOption("drawXGrid")&&q.getOptionForAxis("drawGrid","x")){u=t.xticks;l.save();var d=q.getOptionForAxis("gridLinePattern","x");var n=d&&(d.length>=2);if(n){l.installPattern(d)}l.strokeStyle=q.getOptionForAxis("gridLineColor","x");l.lineWidth=q.getOptionForAxis("gridLineWidth","x");for(p=0;p<u.length;p++){h=k(r.x+u[p][0]*r.w);f=j(r.y+r.h);l.beginPath();l.moveTo(h,f);l.lineTo(h,r.y);l.closePath();l.stroke()}if(n){l.uninstallPattern()}l.restore()}};a.prototype.destroy=function(){};return a})();Dygraph.Plugins.Legend=(function(){var c=function(){this.legend_div_=null;this.is_generated_div_=false};c.prototype.toString=function(){return"Legend Plugin"};var a,d;c.prototype.activate=function(j){var m;var f=j.getOption("labelsDivWidth");var l=j.getOption("labelsDiv");if(l&&null!==l){if(typeof(l)=="string"||l instanceof String){m=document.getElementById(l)}else{m=l}}else{var i={position:"absolute",fontSize:"14px",zIndex:10,width:f+"px",top:"0px",left:(j.size().width-f-2)+"px",background:"white",lineHeight:"normal",textAlign:"left",overflow:"hidden"};Dygraph.update(i,j.getOption("labelsDivStyles"));m=document.createElement("div");m.className="dygraph-legend";for(var h in i){if(!i.hasOwnProperty(h)){continue}try{m.style[h]=i[h]}catch(k){this.warn("You are using unsupported css properties for your browser in labelsDivStyles")}}j.graphDiv.appendChild(m);this.is_generated_div_=true}this.legend_div_=m;this.one_em_width_=10;return{select:this.select,deselect:this.deselect,predraw:this.predraw,didDrawChart:this.didDrawChart}};var b=function(g){var f=document.createElement("span");f.setAttribute("style","margin: 0; padding: 0 0 0 1em; border: 0;");g.appendChild(f);var e=f.offsetWidth;g.removeChild(f);return e};c.prototype.select=function(i){var h=i.selectedX;var g=i.selectedPoints;var f=a(i.dygraph,h,g,this.one_em_width_);this.legend_div_.innerHTML=f};c.prototype.deselect=function(h){var f=b(this.legend_div_);this.one_em_width_=f;var g=a(h.dygraph,undefined,undefined,f);this.legend_div_.innerHTML=g};c.prototype.didDrawChart=function(f){this.deselect(f)};c.prototype.predraw=function(h){if(!this.is_generated_div_){return}h.dygraph.graphDiv.appendChild(this.legend_div_);var g=h.dygraph.plotter_.area;var f=h.dygraph.getOption("labelsDivWidth");this.legend_div_.style.left=g.x+g.w-f-1+"px";this.legend_div_.style.top=g.y+"px";this.legend_div_.style.width=f+"px"};c.prototype.destroy=function(){this.legend_div_=null};a=function(w,p,l,f){if(w.getOption("showLabelsOnHighlight")!==true){return""}var r,C,u,s,m;var z=w.getLabels();if(typeof(p)==="undefined"){if(w.getOption("legend")!="always"){return""}C=w.getOption("labelsSeparateLines");r="";for(u=1;u<z.length;u++){var q=w.getPropertiesForSeries(z[u]);if(!q.visible){continue}if(r!==""){r+=(C?"<br/>":" ")}m=w.getOption("strokePattern",z[u]);s=d(m,q.color,f);r+="<span style='font-weight: bold; color: "+q.color+";'>"+s+" "+z[u]+"</span>"}return r}var A=w.optionsViewForAxis_("x");var o=A("valueFormatter");r=o(p,A,z[0],w);if(r!==""){r+=":"}var v=[];var j=w.numAxes();for(u=0;u<j;u++){v[u]=w.optionsViewForAxis_("y"+(u?1+u:""))}var k=w.getOption("labelsShowZeroValues");C=w.getOption("labelsSeparateLines");var B=w.getHighlightSeries();for(u=0;u<l.length;u++){var t=l[u];if(t.yval===0&&!k){continue}if(!Dygraph.isOK(t.canvasy)){continue}if(C){r+="<br/>"}var q=w.getPropertiesForSeries(t.name);var n=v[q.axis-1];var y=n("valueFormatter");var e=y(t.yval,n,t.name,w);var h=(t.name==B)?" class='highlight'":"";r+="<span"+h+"> <b><span style='color: "+q.color+";'>"+t.name+"</span></b>:&nbsp;"+e+"</span>"}return r};d=function(s,h,r){var e=(/MSIE/.test(navigator.userAgent)&&!window.opera);if(e){return"&mdash;"}if(!s||s.length<=1){return'<div style="display: inline-block; position: relative; bottom: .5ex; padding-left: 1em; height: 1px; border-bottom: 2px solid '+h+';"></div>'}var l,k,f,o;var g=0,q=0;var p=[];var n;for(l=0;l<=s.length;l++){g+=s[l%s.length]}n=Math.floor(r/(g-s[0]));if(n>1){for(l=0;l<s.length;l++){p[l]=s[l]/r}q=p.length}else{n=1;for(l=0;l<s.length;l++){p[l]=s[l]/g}q=p.length+1}var m="";for(k=0;k<n;k++){for(l=0;l<q;l+=2){f=p[l%p.length];if(l<s.length){o=p[(l+1)%p.length]}else{o=0}m+='<div style="display: inline-block; position: relative; bottom: .5ex; margin-right: '+o+"em; padding-left: "+f+"em; height: 1px; border-bottom: 2px solid "+h+';"></div>'}}return m};return c})();Dygraph.Plugins.RangeSelector=(function(){var a=function(){this.isIE_=/MSIE/.test(navigator.userAgent)&&!window.opera;this.hasTouchInterface_=typeof(TouchEvent)!="undefined";this.isMobileDevice_=/mobile|android/gi.test(navigator.appVersion);this.interfaceCreated_=false};a.prototype.toString=function(){return"RangeSelector Plugin"};a.prototype.activate=function(b){this.dygraph_=b;this.isUsingExcanvas_=b.isUsingExcanvas_;if(this.getOption_("showRangeSelector")){this.createInterface_()}return{layout:this.reserveSpace_,predraw:this.renderStaticLayer_,didDrawChart:this.renderInteractiveLayer_}};a.prototype.destroy=function(){this.bgcanvas_=null;this.fgcanvas_=null;this.leftZoomHandle_=null;this.rightZoomHandle_=null;this.iePanOverlay_=null};a.prototype.getOption_=function(b){return this.dygraph_.getOption(b)};a.prototype.setDefaultOption_=function(b,c){return this.dygraph_.attrs_[b]=c};a.prototype.createInterface_=function(){this.createCanvases_();if(this.isUsingExcanvas_){this.createIEPanOverlay_()}this.createZoomHandles_();this.initInteraction_();if(this.getOption_("animatedZooms")){this.dygraph_.warn("Animated zooms and range selector are not compatible; disabling animatedZooms.");this.dygraph_.updateOptions({animatedZooms:false},true)}this.interfaceCreated_=true;this.addToGraph_()};a.prototype.addToGraph_=function(){var b=this.graphDiv_=this.dygraph_.graphDiv;b.appendChild(this.bgcanvas_);b.appendChild(this.fgcanvas_);b.appendChild(this.leftZoomHandle_);b.appendChild(this.rightZoomHandle_)};a.prototype.removeFromGraph_=function(){var b=this.graphDiv_;b.removeChild(this.bgcanvas_);b.removeChild(this.fgcanvas_);b.removeChild(this.leftZoomHandle_);b.removeChild(this.rightZoomHandle_);this.graphDiv_=null};a.prototype.reserveSpace_=function(b){if(this.getOption_("showRangeSelector")){b.reserveSpaceBottom(this.getOption_("rangeSelectorHeight")+4)}};a.prototype.renderStaticLayer_=function(){if(!this.updateVisibility_()){return}this.resize_();this.drawStaticLayer_()};a.prototype.renderInteractiveLayer_=function(){if(!this.updateVisibility_()||this.isChangingRange_){return}this.placeZoomHandles_();this.drawInteractiveLayer_()};a.prototype.updateVisibility_=function(){var b=this.getOption_("showRangeSelector");if(b){if(!this.interfaceCreated_){this.createInterface_()}else{if(!this.graphDiv_||!this.graphDiv_.parentNode){this.addToGraph_()}}}else{if(this.graphDiv_){this.removeFromGraph_();var c=this.dygraph_;setTimeout(function(){c.width_=0;c.resize()},1)}}return b};a.prototype.resize_=function(){function d(e,f){e.style.top=f.y+"px";e.style.left=f.x+"px";e.width=f.w;e.height=f.h;e.style.width=e.width+"px";e.style.height=e.height+"px"}var c=this.dygraph_.layout_.getPlotArea();var b=0;if(this.getOption_("drawXAxis")){b=this.getOption_("xAxisHeight")||(this.getOption_("axisLabelFontSize")+2*this.getOption_("axisTickSize"))}this.canvasRect_={x:c.x,y:c.y+c.h+b+4,w:c.w,h:this.getOption_("rangeSelectorHeight")};d(this.bgcanvas_,this.canvasRect_);d(this.fgcanvas_,this.canvasRect_)};a.prototype.createCanvases_=function(){this.bgcanvas_=Dygraph.createCanvas();this.bgcanvas_.className="dygraph-rangesel-bgcanvas";this.bgcanvas_.style.position="absolute";this.bgcanvas_.style.zIndex=9;this.bgcanvas_ctx_=Dygraph.getContext(this.bgcanvas_);this.fgcanvas_=Dygraph.createCanvas();this.fgcanvas_.className="dygraph-rangesel-fgcanvas";this.fgcanvas_.style.position="absolute";this.fgcanvas_.style.zIndex=9;this.fgcanvas_.style.cursor="default";this.fgcanvas_ctx_=Dygraph.getContext(this.fgcanvas_)};a.prototype.createIEPanOverlay_=function(){this.iePanOverlay_=document.createElement("div");this.iePanOverlay_.style.position="absolute";this.iePanOverlay_.style.backgroundColor="white";this.iePanOverlay_.style.filter="alpha(opacity=0)";this.iePanOverlay_.style.display="none";this.iePanOverlay_.style.cursor="move";this.fgcanvas_.appendChild(this.iePanOverlay_)};a.prototype.createZoomHandles_=function(){var b=new Image();b.className="dygraph-rangesel-zoomhandle";b.style.position="absolute";b.style.zIndex=10;b.style.visibility="hidden";b.style.cursor="col-resize";if(/MSIE 7/.test(navigator.userAgent)){b.width=7;b.height=14;b.style.backgroundColor="white";b.style.border="1px solid #333333"}else{b.width=9;b.height=16;b.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAQCAYAAADESFVDAAAAAXNSR0IArs4c6QAAAAZiS0dEANAAzwDP4Z7KegAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9sHGw0cMqdt1UwAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAaElEQVQoz+3SsRFAQBCF4Z9WJM8KCDVwownl6YXsTmCUsyKGkZzcl7zkz3YLkypgAnreFmDEpHkIwVOMfpdi9CEEN2nGpFdwD03yEqDtOgCaun7sqSTDH32I1pQA2Pb9sZecAxc5r3IAb21d6878xsAAAAAASUVORK5CYII="}if(this.isMobileDevice_){b.width*=2;b.height*=2}this.leftZoomHandle_=b;this.rightZoomHandle_=b.cloneNode(false)};a.prototype.initInteraction_=function(){var o=this;var i=this.isIE_?document:window;var u=0;var v=null;var s=false;var d=false;var g=!this.isMobileDevice_&&!this.isUsingExcanvas_;var k=new Dygraph.IFrameTarp();var p,f,r,j,w,h,x,t,q,c,l;var e,n,m;p=function(C){var B=o.dygraph_.xAxisExtremes();var z=(B[1]-B[0])/o.canvasRect_.w;var A=B[0]+(C.leftHandlePos-o.canvasRect_.x)*z;var y=B[0]+(C.rightHandlePos-o.canvasRect_.x)*z;return[A,y]};f=function(y){Dygraph.cancelEvent(y);s=true;u=y.clientX;v=y.target?y.target:y.srcElement;if(y.type==="mousedown"||y.type==="dragstart"){Dygraph.addEvent(i,"mousemove",r);Dygraph.addEvent(i,"mouseup",j)}o.fgcanvas_.style.cursor="col-resize";k.cover();return true};r=function(C){if(!s){return false}Dygraph.cancelEvent(C);var z=C.clientX-u;if(Math.abs(z)<4){return true}u=C.clientX;var B=o.getZoomHandleStatus_();var y;if(v==o.leftZoomHandle_){y=B.leftHandlePos+z;y=Math.min(y,B.rightHandlePos-v.width-3);y=Math.max(y,o.canvasRect_.x)}else{y=B.rightHandlePos+z;y=Math.min(y,o.canvasRect_.x+o.canvasRect_.w);y=Math.max(y,B.leftHandlePos+v.width+3)}var A=v.width/2;v.style.left=(y-A)+"px";o.drawInteractiveLayer_();if(g){w()}return true};j=function(y){if(!s){return false}s=false;k.uncover();Dygraph.removeEvent(i,"mousemove",r);Dygraph.removeEvent(i,"mouseup",j);o.fgcanvas_.style.cursor="default";if(!g){w()}return true};w=function(){try{var z=o.getZoomHandleStatus_();o.isChangingRange_=true;if(!z.isZoomed){o.dygraph_.resetZoom()}else{var y=p(z);o.dygraph_.doZoomXDates_(y[0],y[1])}}finally{o.isChangingRange_=false}};h=function(A){if(o.isUsingExcanvas_){return A.srcElement==o.iePanOverlay_}else{var z=o.leftZoomHandle_.getBoundingClientRect();var y=z.left+z.width/2;z=o.rightZoomHandle_.getBoundingClientRect();var B=z.left+z.width/2;return(A.clientX>y&&A.clientX<B)}};x=function(y){if(!d&&h(y)&&o.getZoomHandleStatus_().isZoomed){Dygraph.cancelEvent(y);d=true;u=y.clientX;if(y.type==="mousedown"){Dygraph.addEvent(i,"mousemove",t);Dygraph.addEvent(i,"mouseup",q)}return true}return false};t=function(C){if(!d){return false}Dygraph.cancelEvent(C);var z=C.clientX-u;if(Math.abs(z)<4){return true}u=C.clientX;var B=o.getZoomHandleStatus_();var E=B.leftHandlePos;var y=B.rightHandlePos;var D=y-E;if(E+z<=o.canvasRect_.x){E=o.canvasRect_.x;y=E+D}else{if(y+z>=o.canvasRect_.x+o.canvasRect_.w){y=o.canvasRect_.x+o.canvasRect_.w;E=y-D}else{E+=z;y+=z}}var A=o.leftZoomHandle_.width/2;o.leftZoomHandle_.style.left=(E-A)+"px";o.rightZoomHandle_.style.left=(y-A)+"px";o.drawInteractiveLayer_();if(g){c()}return true};q=function(y){if(!d){return false}d=false;Dygraph.removeEvent(i,"mousemove",t);Dygraph.removeEvent(i,"mouseup",q);if(!g){c()}return true};c=function(){try{o.isChangingRange_=true;o.dygraph_.dateWindow_=p(o.getZoomHandleStatus_());o.dygraph_.drawGraph_(false)}finally{o.isChangingRange_=false}};l=function(y){if(s||d){return}var z=h(y)?"move":"default";if(z!=o.fgcanvas_.style.cursor){o.fgcanvas_.style.cursor=z}};e=function(y){if(y.type=="touchstart"&&y.targetTouches.length==1){if(f(y.targetTouches[0])){Dygraph.cancelEvent(y)}}else{if(y.type=="touchmove"&&y.targetTouches.length==1){if(r(y.targetTouches[0])){Dygraph.cancelEvent(y)}}else{j(y)}}};n=function(y){if(y.type=="touchstart"&&y.targetTouches.length==1){if(x(y.targetTouches[0])){Dygraph.cancelEvent(y)}}else{if(y.type=="touchmove"&&y.targetTouches.length==1){if(t(y.targetTouches[0])){Dygraph.cancelEvent(y)}}else{q(y)}}};m=function(B,A){var z=["touchstart","touchend","touchmove","touchcancel"];for(var y=0;y<z.length;y++){o.dygraph_.addAndTrackEvent(B,z[y],A)}};this.setDefaultOption_("interactionModel",Dygraph.Interaction.dragIsPanInteractionModel);this.setDefaultOption_("panEdgeFraction",0.0001);var b=window.opera?"mousedown":"dragstart";this.dygraph_.addAndTrackEvent(this.leftZoomHandle_,b,f);this.dygraph_.addAndTrackEvent(this.rightZoomHandle_,b,f);if(this.isUsingExcanvas_){this.dygraph_.addAndTrackEvent(this.iePanOverlay_,"mousedown",x)}else{this.dygraph_.addAndTrackEvent(this.fgcanvas_,"mousedown",x);this.dygraph_.addAndTrackEvent(this.fgcanvas_,"mousemove",l)}if(this.hasTouchInterface_){m(this.leftZoomHandle_,e);m(this.rightZoomHandle_,e);m(this.fgcanvas_,n)}};a.prototype.drawStaticLayer_=function(){var b=this.bgcanvas_ctx_;b.clearRect(0,0,this.canvasRect_.w,this.canvasRect_.h);try{this.drawMiniPlot_()}catch(c){Dygraph.warn(c)}var d=0.5;this.bgcanvas_ctx_.lineWidth=1;b.strokeStyle="gray";b.beginPath();b.moveTo(d,d);b.lineTo(d,this.canvasRect_.h-d);b.lineTo(this.canvasRect_.w-d,this.canvasRect_.h-d);b.lineTo(this.canvasRect_.w-d,d);b.stroke()};a.prototype.drawMiniPlot_=function(){var f=this.getOption_("rangeSelectorPlotFillColor");var r=this.getOption_("rangeSelectorPlotStrokeColor");if(!f&&!r){return}var j=this.getOption_("stepPlot");var v=this.computeCombinedSeriesAndLimits_();var q=v.yMax-v.yMin;var p=this.bgcanvas_ctx_;var n=0.5;var e=this.dygraph_.xAxisExtremes();var o=Math.max(e[1]-e[0],1e-30);var g=(this.canvasRect_.w-n)/o;var u=(this.canvasRect_.h-n)/q;var t=this.canvasRect_.w-n;var b=this.canvasRect_.h-n;var d=null,c=null;p.beginPath();p.moveTo(n,b);for(var s=0;s<v.data.length;s++){var h=v.data[s];var l=((h[0]!==null)?((h[0]-e[0])*g):NaN);var k=((h[1]!==null)?(b-(h[1]-v.yMin)*u):NaN);if(isFinite(l)&&isFinite(k)){if(d===null){p.lineTo(l,b)}else{if(j){p.lineTo(l,c)}}p.lineTo(l,k);d=l;c=k}else{if(d!==null){if(j){p.lineTo(l,c);p.lineTo(l,b)}else{p.lineTo(d,b)}}d=c=null}}p.lineTo(t,b);p.closePath();if(f){var m=this.bgcanvas_ctx_.createLinearGradient(0,0,0,b);m.addColorStop(0,"white");m.addColorStop(1,f);this.bgcanvas_ctx_.fillStyle=m;p.fill()}if(r){this.bgcanvas_ctx_.strokeStyle=r;this.bgcanvas_ctx_.lineWidth=1.5;p.stroke()}};a.prototype.computeCombinedSeriesAndLimits_=function(){var v=this.dygraph_.rawData_;var u=this.getOption_("logscale");var q=[];var d;var h;var m;var t,s,r;var e,g;for(t=0;t<v.length;t++){if(v[t].length>1&&v[t][1]!==null){m=typeof v[t][1]!="number";if(m){d=[];h=[];for(r=0;r<v[t][1].length;r++){d.push(0);h.push(0)}}break}}for(t=0;t<v.length;t++){var l=v[t];e=l[0];if(m){for(r=0;r<d.length;r++){d[r]=h[r]=0}}else{d=h=0}for(s=1;s<l.length;s++){if(this.dygraph_.visibility()[s-1]){var n;if(m){for(r=0;r<d.length;r++){n=l[s][r];if(n===null||isNaN(n)){continue}d[r]+=n;h[r]++}}else{n=l[s];if(n===null||isNaN(n)){continue}d+=n;h++}}}if(m){for(r=0;r<d.length;r++){d[r]/=h[r]}g=d.slice(0)}else{g=d/h}q.push([e,g])}q=this.dygraph_.rollingAverage(q,this.dygraph_.rollPeriod_);if(typeof q[0][1]!="number"){for(t=0;t<q.length;t++){g=q[t][1];q[t][1]=g[0]}}var b=Number.MAX_VALUE;var c=-Number.MAX_VALUE;for(t=0;t<q.length;t++){g=q[t][1];if(g!==null&&isFinite(g)&&(!u||g>0)){b=Math.min(b,g);c=Math.max(c,g)}}var o=0.25;if(u){c=Dygraph.log10(c);c+=c*o;b=Dygraph.log10(b);for(t=0;t<q.length;t++){q[t][1]=Dygraph.log10(q[t][1])}}else{var f;var p=c-b;if(p<=Number.MIN_VALUE){f=c*o}else{f=p*o}c+=f;b-=f}return{data:q,yMin:b,yMax:c}};a.prototype.placeZoomHandles_=function(){var h=this.dygraph_.xAxisExtremes();var b=this.dygraph_.xAxisRange();var c=h[1]-h[0];var j=Math.max(0,(b[0]-h[0])/c);var f=Math.max(0,(h[1]-b[1])/c);var i=this.canvasRect_.x+this.canvasRect_.w*j;var e=this.canvasRect_.x+this.canvasRect_.w*(1-f);var d=Math.max(this.canvasRect_.y,this.canvasRect_.y+(this.canvasRect_.h-this.leftZoomHandle_.height)/2);var g=this.leftZoomHandle_.width/2;this.leftZoomHandle_.style.left=(i-g)+"px";this.leftZoomHandle_.style.top=d+"px";this.rightZoomHandle_.style.left=(e-g)+"px";this.rightZoomHandle_.style.top=this.leftZoomHandle_.style.top;this.leftZoomHandle_.style.visibility="visible";this.rightZoomHandle_.style.visibility="visible"};a.prototype.drawInteractiveLayer_=function(){var c=this.fgcanvas_ctx_;c.clearRect(0,0,this.canvasRect_.w,this.canvasRect_.h);var f=1;var e=this.canvasRect_.w-f;var b=this.canvasRect_.h-f;var h=this.getZoomHandleStatus_();c.strokeStyle="black";if(!h.isZoomed){c.beginPath();c.moveTo(f,f);c.lineTo(f,b);c.lineTo(e,b);c.lineTo(e,f);c.stroke();if(this.iePanOverlay_){this.iePanOverlay_.style.display="none"}}else{var g=Math.max(f,h.leftHandlePos-this.canvasRect_.x);var d=Math.min(e,h.rightHandlePos-this.canvasRect_.x);c.fillStyle="rgba(240, 240, 240, 0.6)";c.fillRect(0,0,g,this.canvasRect_.h);c.fillRect(d,0,this.canvasRect_.w-d,this.canvasRect_.h);c.beginPath();c.moveTo(f,f);c.lineTo(g,f);c.lineTo(g,b);c.lineTo(d,b);c.lineTo(d,f);c.lineTo(e,f);c.stroke();if(this.isUsingExcanvas_){this.iePanOverlay_.style.width=(d-g)+"px";this.iePanOverlay_.style.left=g+"px";this.iePanOverlay_.style.height=b+"px";this.iePanOverlay_.style.display="inline"}}};a.prototype.getZoomHandleStatus_=function(){var c=this.leftZoomHandle_.width/2;var d=parseFloat(this.leftZoomHandle_.style.left)+c;var b=parseFloat(this.rightZoomHandle_.style.left)+c;return{leftHandlePos:d,rightHandlePos:b,isZoomed:(d-1>this.canvasRect_.x||b+1<this.canvasRect_.x+this.canvasRect_.w)}};return a})();Dygraph.PLUGINS.push(Dygraph.Plugins.Legend,Dygraph.Plugins.Axes,Dygraph.Plugins.RangeSelector,Dygraph.Plugins.ChartLabels,Dygraph.Plugins.Annotations,Dygraph.Plugins.Grid);

(function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define([], factory);
    } else if (typeof exports !== "undefined") {
      factory();
    } else {
      var mod = {
        exports: {}
      };
      factory();
      global.FileSaver = mod.exports;
    }
  })(this, function () {
    "use strict";
  
    /*
    * FileSaver.js
    * A saveAs() FileSaver implementation.
    *
    * By Eli Grey, http://eligrey.com
    *
    * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
    * source  : http://purl.eligrey.com/github/FileSaver.js
    */
    // The one and only way of getting global scope in all environments
    // https://stackoverflow.com/q/3277182/1008999
    var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof global === 'object' && global.global === global ? global : void 0;
  
    function bom(blob, opts) {
      if (typeof opts === 'undefined') opts = {
        autoBom: false
      };else if (typeof opts !== 'object') {
        console.warn('Deprecated: Expected third argument to be a object');
        opts = {
          autoBom: !opts
        };
      } // prepend BOM for UTF-8 XML and text/* types (including HTML)
      // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
  
      if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
        return new Blob([String.fromCharCode(0xFEFF), blob], {
          type: blob.type
        });
      }
  
      return blob;
    }
  
    function download(url, name, opts) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'blob';
  
      xhr.onload = function () {
        saveAs(xhr.response, name, opts);
      };
  
      xhr.onerror = function () {
        console.error('could not download file');
      };
  
      xhr.send();
    }
  
    function corsEnabled(url) {
      var xhr = new XMLHttpRequest(); // use sync to avoid popup blocker
  
      xhr.open('HEAD', url, false);
  
      try {
        xhr.send();
      } catch (e) {}
  
      return xhr.status >= 200 && xhr.status <= 299;
    } // `a.click()` doesn't work for all browsers (#465)
  
  
    function click(node) {
      try {
        node.dispatchEvent(new MouseEvent('click'));
      } catch (e) {
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
        node.dispatchEvent(evt);
      }
    } // Detect WebView inside a native macOS app by ruling out all browsers
    // We just need to check for 'Safari' because all other browsers (besides Firefox) include that too
    // https://www.whatismybrowser.com/guides/the-latest-user-agent/macos
  
  
    var isMacOSWebView = /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent);
    var saveAs = _global.saveAs || ( // probably in some web worker
    typeof window !== 'object' || window !== _global ? function saveAs() {}
    /* noop */
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView
    : 'download' in HTMLAnchorElement.prototype && !isMacOSWebView ? function saveAs(blob, name, opts) {
      var URL = _global.URL || _global.webkitURL;
      var a = document.createElement('a');
      name = name || blob.name || 'download';
      a.download = name;
      a.rel = 'noopener'; // tabnabbing
      // TODO: detect chrome extensions & packaged apps
      // a.target = '_blank'
  
      if (typeof blob === 'string') {
        // Support regular links
        a.href = blob;
  
        if (a.origin !== location.origin) {
          corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
        } else {
          click(a);
        }
      } else {
        // Support blobs
        a.href = URL.createObjectURL(blob);
        setTimeout(function () {
          URL.revokeObjectURL(a.href);
        }, 4E4); // 40s
  
        setTimeout(function () {
          click(a);
        }, 0);
      }
    } // Use msSaveOrOpenBlob as a second approach
    : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
      name = name || blob.name || 'download';
  
      if (typeof blob === 'string') {
        if (corsEnabled(blob)) {
          download(blob, name, opts);
        } else {
          var a = document.createElement('a');
          a.href = blob;
          a.target = '_blank';
          setTimeout(function () {
            click(a);
          });
        }
      } else {
        navigator.msSaveOrOpenBlob(bom(blob, opts), name);
      }
    } // Fallback to using FileReader and a popup
    : function saveAs(blob, name, opts, popup) {
      // Open a popup immediately do go around popup blocker
      // Mostly only available on user interaction and the fileReader is async so...
      popup = popup || open('', '_blank');
  
      if (popup) {
        popup.document.title = popup.document.body.innerText = 'downloading...';
      }
  
      if (typeof blob === 'string') return download(blob, name, opts);
      var force = blob.type === 'application/octet-stream';
  
      var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;
  
      var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
  
      if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== 'undefined') {
        // Safari doesn't allow downloading of blob URLs
        var reader = new FileReader();
  
        reader.onloadend = function () {
          var url = reader.result;
          url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
          if (popup) popup.location.href = url;else location = url;
          popup = null; // reverse-tabnabbing #460
        };
  
        reader.readAsDataURL(blob);
      } else {
        var URL = _global.URL || _global.webkitURL;
        var url = URL.createObjectURL(blob);
        if (popup) popup.location = url;else location.href = url;
        popup = null; // reverse-tabnabbing #460
  
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 4E4); // 40s
      }
    });
    _global.saveAs = saveAs.saveAs = saveAs;
  
    if (typeof module !== 'undefined') {
      module.exports = saveAs;
    }
  });




  








  

"use strict";function download(t,e,i){function n(t){var e=t.split(/[:;,]/),i=e[1],n="base64"==e[2]?atob:decodeURIComponent,r=n(e.pop()),o=r.length,a=0,s=new Uint8Array(o);for(a;a<o;++a)s[a]=r.charCodeAt(a);return new m([s],{type:i})}function r(t,e){if("download"in c)return c.href=t,c.setAttribute("download",g),c.innerHTML="downloading...",c.style.display="none",l.body.appendChild(c),setTimeout(function(){c.click(),l.body.removeChild(c),e===!0&&setTimeout(function(){h.URL.revokeObjectURL(c.href)},250)},66),!0;var i=l.createElement("iframe");l.body.appendChild(i),e||(t="data:"+t.replace(/^data:([\w\/\-\+]+)/,f)),i.src=t,setTimeout(function(){l.body.removeChild(i)},333)}var o,a,s,h=window,f="application/octet-stream",u=i||f,d=t,l=document,c=l.createElement("a"),p=function(t){return String(t)},m=h.Blob||h.MozBlob||h.WebKitBlob||p,w=h.MSBlobBuilder||h.WebKitBlobBuilder||h.BlobBuilder,g=e||"download";if("true"===String(this)&&(d=[d,u],u=d[0],d=d[1]),String(d).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/))return navigator.msSaveBlob?navigator.msSaveBlob(n(d),g):r(d);try{o=d instanceof m?d:new m([d],{type:u})}catch(t){w&&(a=new w,a.append([d]),o=a.getBlob(u))}if(navigator.msSaveBlob)return navigator.msSaveBlob(o,g);if(h.URL)r(h.URL.createObjectURL(o),!0);else{if("string"==typeof o||o.constructor===p)try{return r("data:"+u+";base64,"+h.btoa(o))}catch(t){return r("data:"+u+","+encodeURIComponent(o))}s=new FileReader,s.onload=function(t){r(this.result)},s.readAsDataURL(o)}return!0}!function(){var t=function(t){this.data=new Uint8Array(t),this.pos=0};t.prototype.seek=function(t){this.pos=t},t.prototype.writeBytes=function(t){for(var e=0;e<t.length;e++)this.data[this.pos++]=t[e]},t.prototype.writeByte=function(t){this.data[this.pos++]=t},t.prototype.writeU8=t.prototype.writeByte,t.prototype.writeU16BE=function(t){this.data[this.pos++]=t>>8,this.data[this.pos++]=t},t.prototype.writeDoubleBE=function(t){for(var e=new Uint8Array(new Float64Array([t]).buffer),i=e.length-1;i>=0;i--)this.writeByte(e[i])},t.prototype.writeFloatBE=function(t){for(var e=new Uint8Array(new Float32Array([t]).buffer),i=e.length-1;i>=0;i--)this.writeByte(e[i])},t.prototype.writeString=function(t){for(var e=0;e<t.length;e++)this.data[this.pos++]=t.charCodeAt(e)},t.prototype.writeEBMLVarIntWidth=function(t,e){switch(e){case 1:this.writeU8(128|t);break;case 2:this.writeU8(64|t>>8),this.writeU8(t);break;case 3:this.writeU8(32|t>>16),this.writeU8(t>>8),this.writeU8(t);break;case 4:this.writeU8(16|t>>24),this.writeU8(t>>16),this.writeU8(t>>8),this.writeU8(t);break;case 5:this.writeU8(8|t/4294967296&7),this.writeU8(t>>24),this.writeU8(t>>16),this.writeU8(t>>8),this.writeU8(t);break;default:throw new RuntimeException("Bad EBML VINT size "+e)}},t.prototype.measureEBMLVarInt=function(t){if(t<127)return 1;if(t<16383)return 2;if(t<2097151)return 3;if(t<268435455)return 4;if(t<34359738367)return 5;throw new RuntimeException("EBML VINT size not supported "+t)},t.prototype.writeEBMLVarInt=function(t){this.writeEBMLVarIntWidth(t,this.measureEBMLVarInt(t))},t.prototype.writeUnsignedIntBE=function(t,e){switch(void 0===e&&(e=this.measureUnsignedInt(t)),e){case 5:this.writeU8(Math.floor(t/4294967296));case 4:this.writeU8(t>>24);case 3:this.writeU8(t>>16);case 2:this.writeU8(t>>8);case 1:this.writeU8(t);break;default:throw new RuntimeException("Bad UINT size "+e)}},t.prototype.measureUnsignedInt=function(t){return t<256?1:t<65536?2:t<1<<24?3:t<4294967296?4:5},t.prototype.getAsDataArray=function(){if(this.pos<this.data.byteLength)return this.data.subarray(0,this.pos);if(this.pos==this.data.byteLength)return this.data;throw"ArrayBufferDataStream's pos lies beyond end of buffer"},"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=t:window.ArrayBufferDataStream=t}(),function(){var t=function(t){return function(e){function i(t){return new Promise(function(e,i){var n=new FileReader;n.addEventListener("loadend",function(){e(n.result)}),n.readAsArrayBuffer(t)})}function n(t){return new Promise(function(e,n){e(t instanceof Uint8Array?t:t instanceof ArrayBuffer||ArrayBuffer.isView(t)?new Uint8Array(t):t instanceof Blob?i(t).then(function(t){return new Uint8Array(t)}):i(new Blob([t])).then(function(t){return new Uint8Array(t)}))})}function r(t){var e=t.byteLength||t.length||t.size;if(!Number.isInteger(e))throw"Failed to determine size of element";return e}var o=[],a=Promise.resolve(),s=null,h=null;"undefined"!=typeof FileWriter&&e instanceof FileWriter?s=e:t&&e&&(h=e),this.pos=0,this.length=0,this.seek=function(t){if(t<0)throw"Offset may not be negative";if(isNaN(t))throw"Offset may not be NaN";if(t>this.length)throw"Seeking beyond the end of file is not allowed";this.pos=t},this.write=function(e){var i={offset:this.pos,data:e,length:r(e)},f=i.offset>=this.length;this.pos+=i.length,this.length=Math.max(this.length,this.pos),a=a.then(function(){if(h)return new Promise(function(e,r){n(i.data).then(function(n){var r=0,o=Buffer.from(n.buffer),a=function(n,o,s){r+=o,r>=s.length?e():t.write(h,s,r,s.length-r,i.offset+r,a)};t.write(h,o,0,o.length,i.offset,a)})});if(s)return new Promise(function(t,e){s.onwriteend=t,s.seek(i.offset),s.write(new Blob([i.data]))});if(!f)for(var e=0;e<o.length;e++){var r=o[e];if(!(i.offset+i.length<=r.offset||i.offset>=r.offset+r.length)){if(i.offset<r.offset||i.offset+i.length>r.offset+r.length)throw new Error("Overwrite crosses blob boundaries");return i.offset==r.offset&&i.length==r.length?void(r.data=i.data):n(r.data).then(function(t){return r.data=t,n(i.data)}).then(function(t){i.data=t,r.data.set(i.data,i.offset-r.offset)})}}o.push(i)})},this.complete=function(t){return a=h||s?a.then(function(){return null}):a.then(function(){for(var e=[],i=0;i<o.length;i++)e.push(o[i].data);return new Blob(e,{mimeType:t})})}}};"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=t(require("fs")):window.BlobBuffer=t(null)}(),function(){var t=function(t,e){function i(t,e){var i={};return[t,e].forEach(function(t){for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&(i[e]=t[e])}),i}function n(t){return!("string"!=typeof t||!t.match(/^data:image\/webp;base64,/i))&&window.atob(t.substring("data:image/webp;base64,".length))}function r(t,e){var i=t.toDataURL("image/webp",{quality:e});return n(i)}function o(t){var e=t.indexOf("VP8 ");if(e==-1)throw"Failed to identify beginning of keyframe in WebP image";return e+="VP8 ".length+4,t.substring(e)}function a(t){this.value=t}function s(t){this.value=t}function h(t,e,i){if(Array.isArray(i))for(var n=0;n<i.length;n++)h(t,e,i[n]);else if("string"==typeof i)t.writeString(i);else if(i instanceof Uint8Array)t.writeBytes(i);else{if(!i.id)throw"Bad EBML datatype "+typeof i.data;if(i.offset=t.pos+e,t.writeUnsignedIntBE(i.id),Array.isArray(i.data)){var r,o,f;i.size===-1?t.writeByte(255):(r=t.pos,t.writeBytes([0,0,0,0])),o=t.pos,i.dataOffset=o+e,h(t,e,i.data),i.size!==-1&&(f=t.pos,i.size=f-o,t.seek(r),t.writeEBMLVarIntWidth(i.size,4),t.seek(f))}else if("string"==typeof i.data)t.writeEBMLVarInt(i.data.length),i.dataOffset=t.pos+e,t.writeString(i.data);else if("number"==typeof i.data)i.size||(i.size=t.measureUnsignedInt(i.data)),t.writeEBMLVarInt(i.size),i.dataOffset=t.pos+e,t.writeUnsignedIntBE(i.data,i.size);else if(i.data instanceof s)t.writeEBMLVarInt(8),i.dataOffset=t.pos+e,t.writeDoubleBE(i.data.value);else if(i.data instanceof a)t.writeEBMLVarInt(4),i.dataOffset=t.pos+e,t.writeFloatBE(i.data.value);else{if(!(i.data instanceof Uint8Array))throw"Bad EBML datatype "+typeof i.data;t.writeEBMLVarInt(i.data.byteLength),i.dataOffset=t.pos+e,t.writeBytes(i.data)}}}return function(n){function a(t){return t-B.dataOffset}function f(){var t={id:21420,size:5,data:0},e={id:290298740,data:[]};for(var i in D){var n=D[i];n.positionEBML=Object.create(t),e.data.push({id:19899,data:[{id:21419,data:n.id},n.positionEBML]})}return e}function u(){x=f();var e={id:440786851,data:[{id:17030,data:1},{id:17143,data:1},{id:17138,data:4},{id:17139,data:8},{id:17026,data:"webm"},{id:17031,data:2},{id:17029,data:2}]},i={id:357149030,data:[{id:2807729,data:1e6},{id:19840,data:"webm-writer-js"},{id:22337,data:"webm-writer-js"},M]},n={id:374648427,data:[{id:174,data:[{id:215,data:A},{id:29637,data:A},{id:156,data:0},{id:2274716,data:"und"},{id:134,data:"V_VP8"},{id:2459272,data:"VP8"},{id:131,data:1},{id:224,data:[{id:176,data:b},{id:186,data:k}]}]}]};B={id:408125543,size:-1,data:[x,i,n]};var r=new t(256);h(r,S.pos,[e,B]),S.write(r.getAsDataArray()),D.SegmentInfo.positionEBML.data=a(i.offset),D.Tracks.positionEBML.data=a(n.offset)}function d(e){var i=new t(4);if(!(e.trackNumber>0&&e.trackNumber<127))throw"TrackNumber must be > 0 and < 127";return i.writeEBMLVarInt(e.trackNumber),i.writeU16BE(e.timecode),i.writeByte(128),{id:163,data:[i.getAsDataArray(),e.frame]}}function l(t){return{id:524531317,data:[{id:231,data:Math.round(t.timecode)}]}}function c(t,e,i){_.push({id:187,data:[{id:179,data:e},{id:183,data:[{id:247,data:t},{id:241,data:a(i)}]}]})}function p(){var e={id:475249515,data:_},i=new t(16+32*_.length);h(i,S.pos,e),S.write(i.getAsDataArray()),D.Cues.positionEBML.data=a(e.offset)}function m(){if(0!=T.length){for(var e=0,i=0;i<T.length;i++)e+=T[i].frame.length;for(var n=new t(e+32*T.length),r=l({timecode:Math.round(U)}),i=0;i<T.length;i++)r.data.push(d(T[i]));h(n,S.pos,r),S.write(n.getAsDataArray()),c(A,Math.round(U),r.offset),T=[],U+=F,F=0}}function w(){if(!n.frameDuration){if(!n.frameRate)throw"Missing required frameDuration or frameRate setting";n.frameDuration=1e3/n.frameRate}}function g(t){t.trackNumber=A,t.timecode=Math.round(F),T.push(t),F+=t.duration,F>=E&&m()}function y(){var e=new t(x.size),i=S.pos;h(e,x.dataOffset,x.data),S.seek(x.dataOffset),S.write(e.getAsDataArray()),S.seek(i)}function v(){var e=new t(8),i=S.pos;e.writeDoubleBE(U),S.seek(M.dataOffset),S.write(e.getAsDataArray()),S.seek(i)}var b,k,B,x,E=5e3,A=1,L=!1,T=[],U=0,F=0,I={quality:.95,fileWriter:null,fd:null,frameDuration:null,frameRate:null},D={Cues:{id:new Uint8Array([28,83,187,107]),positionEBML:null},SegmentInfo:{id:new Uint8Array([21,73,169,102]),positionEBML:null},Tracks:{id:new Uint8Array([22,84,174,107]),positionEBML:null}},M={id:17545,data:new s(0)},_=[],S=new e(n.fileWriter||n.fd);this.addFrame=function(t){if(L){if(t.width!=b||t.height!=k)throw"Frame size differs from previous frames"}else b=t.width,k=t.height,u(),L=!0;var e=r(t,{quality:n.quality});if(!e)throw"Couldn't decode WebP frame, does the browser support WebP?";g({frame:o(e),duration:n.frameDuration})},this.complete=function(){return m(),p(),y(),v(),S.complete("video/webm")},this.getWrittenSize=function(){return S.length},n=i(I,n||{}),w()}};"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=t(require("./ArrayBufferDataStream"),require("./BlobBuffer")):window.WebMWriter=t(ArrayBufferDataStream,BlobBuffer)}(),function(){function t(t){var e,i=new Uint8Array(t);for(e=0;e<t;e+=1)i[e]=0;return i}function e(e,i,n,r){var o=i+n,a=t((parseInt(o/r)+1)*r);return a.set(e),a}function i(t,e,i){return t=t.toString(i||8),"000000000000".substr(t.length+12-e)+t}function n(e,i,n){var r,o;for(i=i||t(e.length),n=n||0,r=0,o=e.length;r<o;r+=1)i[n]=e.charCodeAt(r),n+=1;return i}function r(t){function e(t){return o[t>>18&63]+o[t>>12&63]+o[t>>6&63]+o[63&t]}var i,n,r,a=t.length%3,s="";for(i=0,r=t.length-a;i<r;i+=3)n=(t[i]<<16)+(t[i+1]<<8)+t[i+2],s+=e(n);switch(s.length%4){case 1:s+="=";break;case 2:s+="=="}return s}var o=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/"];window.utils={},window.utils.clean=t,window.utils.pad=i,window.utils.extend=e,window.utils.stringToUint8=n,window.utils.uint8ToBase64=r}(),function(){function t(t,n){var r=i.clean(512),o=0;return e.forEach(function(e){var i,n,a=t[e.field]||"";for(i=0,n=a.length;i<n;i+=1)r[o]=a.charCodeAt(i),o+=1;o+=e.length-i}),"function"==typeof n?n(r,o):r}var e,i=window.utils;e=[{field:"fileName",length:100},{field:"fileMode",length:8},{field:"uid",length:8},{field:"gid",length:8},{field:"fileSize",length:12},{field:"mtime",length:12},{field:"checksum",length:8},{field:"type",length:1},{field:"linkName",length:100},{field:"ustar",length:8},{field:"owner",length:32},{field:"group",length:32},{field:"majorNumber",length:8},{field:"minorNumber",length:8},{field:"filenamePrefix",length:155},{field:"padding",length:12}],window.header={},window.header.structure=e,window.header.format=t}(),function(){function t(t){this.written=0,e=(t||20)*r,this.out=n.clean(e),this.blocks=[],this.length=0}var e,i=window.header,n=window.utils,r=512;t.prototype.append=function(t,e,o,a){var s,h,f,u,d,l,c;if("string"==typeof e)e=n.stringToUint8(e);else if(e.constructor!==Uint8Array.prototype.constructor)throw"Invalid input type. You gave me: "+e.constructor.toString().match(/function\s*([$A-Za-z_][0-9A-Za-z_]*)\s*\(/)[1];"function"==typeof o&&(a=o,o={}),o=o||{},f=o.mode||4095&parseInt("777",8),u=o.mtime||Math.floor(+new Date/1e3),d=o.uid||0,l=o.gid||0,s={fileName:t,fileMode:n.pad(f,7),uid:n.pad(d,7),gid:n.pad(l,7),fileSize:n.pad(e.length,11),mtime:n.pad(u,11),checksum:"        ",type:"0",ustar:"ustar  ",owner:o.owner||"",group:o.group||""},h=0,Object.keys(s).forEach(function(t){var e,i,n=s[t];for(e=0,i=n.length;e<i;e+=1)h+=n.charCodeAt(e)}),s.checksum=n.pad(h,6)+"\0 ",c=i.format(s);var p=Math.ceil(c.length/r)*r,m=Math.ceil(e.length/r)*r;this.blocks.push({header:c,input:e,headerLength:p,inputLength:m})},t.prototype.save=function(){var t=[],e=[],i=0,n=Math.pow(2,20),o=[];return this.blocks.forEach(function(t){i+t.headerLength+t.inputLength>n&&(e.push({blocks:o,length:i}),o=[],i=0),o.push(t),i+=t.headerLength+t.inputLength}),e.push({blocks:o,length:i}),e.forEach(function(e){var i=new Uint8Array(e.length),n=0;e.blocks.forEach(function(t){i.set(t.header,n),n+=t.headerLength,i.set(t.input,n),n+=t.inputLength}),t.push(i)}),t.push(new Uint8Array(2*r)),new Blob(t,{type:"octet/stream"})},t.prototype.clear=function(){this.written=0,this.out=n.clean(e)},window.Tar=t}(),function(t){function e(t,i){if({}.hasOwnProperty.call(e.cache,t))return e.cache[t];var n=e.resolve(t);if(!n)throw new Error("Failed to resolve module "+t);var r={id:t,require:e,filename:t,exports:{},loaded:!1,parent:i,children:[]};i&&i.children.push(r);var o=t.slice(0,t.lastIndexOf("/")+1);return e.cache[t]=r.exports,n.call(r.exports,r,r.exports,o,t),r.loaded=!0,e.cache[t]=r.exports}e.modules={},e.cache={},e.resolve=function(t){return{}.hasOwnProperty.call(e.modules,t)?e.modules[t]:void 0},e.define=function(t,i){e.modules[t]=i};var i=function(e){return e="/",{title:"browser",version:"v0.10.26",browser:!0,env:{},argv:[],nextTick:t.setImmediate||function(t){setTimeout(t,0)},cwd:function(){return e},chdir:function(t){e=t}}}();e.define("/gif.coffee",function(t,i,n,r){function o(t,e){return{}.hasOwnProperty.call(t,e)}function a(t,e){for(var i=0,n=e.length;i<n;++i)if(i in e&&e[i]===t)return!0;return!1}function s(t,e){function i(){this.constructor=t}for(var n in e)o(e,n)&&(t[n]=e[n]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t}var h,f,u,d,l;u=e("events",t).EventEmitter,h=e("/browser.coffee",t),l=function(t){function e(t){var e,i;this.running=!1,this.options={},this.frames=[],this.freeWorkers=[],this.activeWorkers=[],this.setOptions(t);for(e in f)i=f[e],null!=this.options[e]?this.options[e]:this.options[e]=i}return s(e,t),f={workerScript:"gif.worker.js",workers:2,repeat:0,background:"#fff",quality:10,width:null,height:null,transparent:null},d={delay:500,copy:!1},e.prototype.setOption=function(t,e){return this.options[t]=e,null==this._canvas||"width"!==t&&"height"!==t?void 0:this._canvas[t]=e},e.prototype.setOptions=function(t){var e,i;return function(n){for(e in t)o(t,e)&&(i=t[e],n.push(this.setOption(e,i)));return n}.call(this,[])},e.prototype.addFrame=function(t,e){var i,n;null==e&&(e={}),i={},i.transparent=this.options.transparent;for(n in d)i[n]=e[n]||d[n];if(null!=this.options.width||this.setOption("width",t.width),null!=this.options.height||this.setOption("height",t.height),"undefined"!=typeof ImageData&&null!=ImageData&&t instanceof ImageData)i.data=t.data;else if("undefined"!=typeof CanvasRenderingContext2D&&null!=CanvasRenderingContext2D&&t instanceof CanvasRenderingContext2D||"undefined"!=typeof WebGLRenderingContext&&null!=WebGLRenderingContext&&t instanceof WebGLRenderingContext)e.copy?i.data=this.getContextData(t):i.context=t;else{if(null==t.childNodes)throw new Error("Invalid image");e.copy?i.data=this.getImageData(t):i.image=t}return this.frames.push(i)},e.prototype.render=function(){var t,e;if(this.running)throw new Error("Already running");if(null==this.options.width||null==this.options.height)throw new Error("Width and height must be set prior to rendering");this.running=!0,this.nextFrame=0,this.finishedFrames=0,this.imageParts=function(e){for(var i=function(){var t;t=[];for(var e=0;0<=this.frames.length?e<this.frames.length:e>this.frames.length;0<=this.frames.length?++e:--e)t.push(e);return t}.apply(this,arguments),n=0,r=i.length;n<r;++n)t=i[n],e.push(null);return e}.call(this,[]),e=this.spawnWorkers();for(var i=function(){var t;t=[];for(var i=0;0<=e?i<e:i>e;0<=e?++i:--i)t.push(i);return t}.apply(this,arguments),n=0,r=i.length;n<r;++n)t=i[n],this.renderNextFrame();return this.emit("start"),this.emit("progress",0)},e.prototype.abort=function(){for(var t;;){if(t=this.activeWorkers.shift(),!(null!=t))break;console.log("killing active worker"),t.terminate()}return this.running=!1,this.emit("abort")},e.prototype.spawnWorkers=function(){var t;return t=Math.min(this.options.workers,this.frames.length),function(){var e;e=[];for(var i=this.freeWorkers.length;this.freeWorkers.length<=t?i<t:i>t;this.freeWorkers.length<=t?++i:--i)e.push(i);return e}.apply(this,arguments).forEach(function(t){return function(e){var i;return console.log("spawning worker "+e),i=new Worker(t.options.workerScript),i.onmessage=function(t){return function(e){return t.activeWorkers.splice(t.activeWorkers.indexOf(i),1),t.freeWorkers.push(i),t.frameFinished(e.data)}}(t),t.freeWorkers.push(i)}}(this)),t},e.prototype.frameFinished=function(t){return console.log("frame "+t.index+" finished - "+this.activeWorkers.length+" active"),this.finishedFrames++,this.emit("progress",this.finishedFrames/this.frames.length),this.imageParts[t.index]=t,a(null,this.imageParts)?this.renderNextFrame():this.finishRendering()},e.prototype.finishRendering=function(){var t,e,i,n,r,o,a;r=0;for(var s=0,h=this.imageParts.length;s<h;++s)e=this.imageParts[s],r+=(e.data.length-1)*e.pageSize+e.cursor;r+=e.pageSize-e.cursor,console.log("rendering finished - filesize "+Math.round(r/1e3)+"kb"),t=new Uint8Array(r),o=0;for(var f=0,u=this.imageParts.length;f<u;++f){e=this.imageParts[f];for(var d=0,l=e.data.length;d<l;++d)a=e.data[d],i=d,t.set(a,o),o+=i===e.data.length-1?e.cursor:e.pageSize}return n=new Blob([t],{type:"image/gif"}),this.emit("finished",n,t)},e.prototype.renderNextFrame=function(){var t,e,i;if(0===this.freeWorkers.length)throw new Error("No free workers");return this.nextFrame>=this.frames.length?void 0:(t=this.frames[this.nextFrame++],i=this.freeWorkers.shift(),e=this.getTask(t),console.log("starting frame "+(e.index+1)+" of "+this.frames.length),this.activeWorkers.push(i),i.postMessage(e))},e.prototype.getContextData=function(t){return t.getImageData(0,0,this.options.width,this.options.height).data},e.prototype.getImageData=function(t){var e;return null!=this._canvas||(this._canvas=document.createElement("canvas"),this._canvas.width=this.options.width,this._canvas.height=this.options.height),e=this._canvas.getContext("2d"),e.setFill=this.options.background,e.fillRect(0,0,this.options.width,this.options.height),e.drawImage(t,0,0),this.getContextData(e)},e.prototype.getTask=function(t){var e,i;if(e=this.frames.indexOf(t),i={index:e,last:e===this.frames.length-1,delay:t.delay,transparent:t.transparent,width:this.options.width,height:this.options.height,quality:this.options.quality,repeat:this.options.repeat,canTransfer:"chrome"===h.name},null!=t.data)i.data=t.data;else if(null!=t.context)i.data=this.getContextData(t.context);else{if(null==t.image)throw new Error("Invalid frame");i.data=this.getImageData(t.image)}return i},e}(u),t.exports=l}),e.define("/browser.coffee",function(t,e,i,n){var r,o,a,s,h;s=navigator.userAgent.toLowerCase(),a=navigator.platform.toLowerCase(),h=s.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/)||[null,"unknown",0],o="ie"===h[1]&&document.documentMode,r={name:"version"===h[1]?h[3]:h[1],version:o||parseFloat("opera"===h[1]&&h[4]?h[4]:h[2]),platform:{name:s.match(/ip(?:ad|od|hone)/)?"ios":(s.match(/(?:webos|android)/)||a.match(/mac|win|linux/)||["other"])[0]}},r[r.name]=!0,r[r.name+parseInt(r.version,10)]=!0,r.platform[r.platform.name]=!0,t.exports=r}),e.define("events",function(t,e,n,r){i.EventEmitter||(i.EventEmitter=function(){});var o=e.EventEmitter=i.EventEmitter,a="function"==typeof Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},s=10;o.prototype.setMaxListeners=function(t){this._events||(this._events={}),this._events.maxListeners=t},o.prototype.emit=function(t){if("error"===t&&(!this._events||!this._events.error||a(this._events.error)&&!this._events.error.length))throw arguments[1]instanceof Error?arguments[1]:new Error("Uncaught, unspecified 'error' event.");if(!this._events)return!1;var e=this._events[t];if(!e)return!1;if("function"!=typeof e){if(a(e)){for(var i=Array.prototype.slice.call(arguments,1),n=e.slice(),r=0,o=n.length;r<o;r++)n[r].apply(this,i);return!0}return!1}switch(arguments.length){case 1:e.call(this);break;case 2:e.call(this,arguments[1]);break;case 3:e.call(this,arguments[1],arguments[2]);break;default:var i=Array.prototype.slice.call(arguments,1);e.apply(this,i)}return!0},o.prototype.addListener=function(t,e){if("function"!=typeof e)throw new Error("addListener only takes instances of Function");if(this._events||(this._events={}),this.emit("newListener",t,e),this._events[t])if(a(this._events[t])){if(!this._events[t].warned){var i;i=void 0!==this._events.maxListeners?this._events.maxListeners:s,i&&i>0&&this._events[t].length>i&&(this._events[t].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[t].length),console.trace())}this._events[t].push(e)}else this._events[t]=[this._events[t],e];else this._events[t]=e;return this},o.prototype.on=o.prototype.addListener,o.prototype.once=function(t,e){var i=this;return i.on(t,function n(){i.removeListener(t,n),e.apply(this,arguments)}),this},o.prototype.removeListener=function(t,e){if("function"!=typeof e)throw new Error("removeListener only takes instances of Function");if(!this._events||!this._events[t])return this;var i=this._events[t];if(a(i)){var n=i.indexOf(e);if(n<0)return this;i.splice(n,1),0==i.length&&delete this._events[t]}else this._events[t]===e&&delete this._events[t];return this},o.prototype.removeAllListeners=function(t){return t&&this._events&&this._events[t]&&(this._events[t]=null),this},o.prototype.listeners=function(t){return this._events||(this._events={}),this._events[t]||(this._events[t]=[]),a(this._events[t])||(this._events[t]=[this._events[t]]),this._events[t]}}),t.GIF=e("/gif.coffee")}.call(this,this),function(){function t(t){return t&&t.Object===Object?t:null}function e(t){return String("0000000"+t).slice(-7)}function i(){function t(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()}function n(t){var e={};this.settings=t,this.on=function(t,i){e[t]=i},this.emit=function(t){var i=e[t];i&&i.apply(null,Array.prototype.slice.call(arguments,1))},this.filename=t.name||i(),this.extension="",this.mimeType=""}function r(t){n.call(this,t),this.extension=".tar",this.mimeType="application/x-tar",this.fileExtension="",this.baseFilename=this.filename,this.tape=null,this.count=0,this.part=1,this.frames=0}function o(t){r.call(this,t),this.type="image/png",this.fileExtension=".png"}function a(t){r.call(this,t),this.type="image/jpeg",this.fileExtension=".jpg",this.quality=t.quality/100||.8}function s(t){var e=document.createElement("canvas");"image/webp"!==e.toDataURL("image/webp").substr(5,10)&&console.log("WebP not supported - try another export format"),n.call(this,t),this.quality=t.quality/100||.8,this.extension=".webm",this.mimeType="video/webm",this.baseFilename=this.filename,this.framerate=t.framerate,this.frames=0,this.part=1,this.videoWriter=new WebMWriter({quality:this.quality,fileWriter:null,fd:null,frameRate:this.framerate})}function h(t){n.call(this,t),t.quality=t.quality/100||.8,this.encoder=new FFMpegServer.Video(t),this.encoder.on("process",function(){this.emit("process")}.bind(this)),this.encoder.on("finished",function(t,e){var i=this.callback;i&&(this.callback=void 0,i(t,e))}.bind(this)),this.encoder.on("progress",function(t){this.settings.onProgress&&this.settings.onProgress(t)}.bind(this)),this.encoder.on("error",function(t){alert(JSON.stringify(t,null,2))}.bind(this))}function f(t){n.call(this,t),this.framerate=this.settings.framerate,this.type="video/webm",this.extension=".webm",this.stream=null,this.mediaRecorder=null,this.chunks=[]}function u(t){n.call(this,t),t.quality=31-(30*t.quality/100||10),t.workers=t.workers||4,this.extension=".gif",this.mimeType="image/gif",this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d"),this.sizeSet=!1,this.encoder=new GIF({workers:t.workers,quality:t.quality,workerScript:t.workersPath+"gif.worker.js"}),this.encoder.on("progress",function(t){this.settings.onProgress&&this.settings.onProgress(t)}.bind(this)),this.encoder.on("finished",function(t){var e=this.callback;e&&(this.callback=void 0,e(t))}.bind(this))}function d(t){function e(){function t(){return this._hooked||(this._hooked=!0,this._hookedTime=this.currentTime||0,this.pause(),it.push(this)),this._hookedTime+M.startTime}b("Capturer start"),U=window.Date.now(),T=U+M.startTime,I=window.performance.now(),F=I+M.startTime,window.Date.prototype.getTime=function(){return T},window.Date.now=function(){return T},window.setTimeout=function(t,e){var i={callback:t,time:e,triggerTime:T+e};return _.push(i),b("Timeout set to "+i.time),i},window.clearTimeout=function(t){for(var e=0;e<_.length;e++)_[e]!=t||(_.splice(e,1),b("Timeout cleared"))},window.setInterval=function(t,e){var i={callback:t,time:e,triggerTime:T+e};return S.push(i),b("Interval set to "+i.time),i},window.clearInterval=function(t){return b("clear Interval"),null},window.requestAnimationFrame=function(t){W.push(t)},window.performance.now=function(){return F};try{Object.defineProperty(HTMLVideoElement.prototype,"currentTime",{get:t}),Object.defineProperty(HTMLAudioElement.prototype,"currentTime",{get:t})}catch(t){b(t)}}function i(){e(),D.start(),R=!0}function n(){R=!1,D.stop(),l()}function r(t,e){Z(t,0,e)}function d(){r(y)}function l(){b("Capturer stop"),window.setTimeout=Z,window.setInterval=J,window.clearInterval=Y,window.clearTimeout=$,window.requestAnimationFrame=Q,window.Date.prototype.getTime=et,window.Date.now=X,window.performance.now=tt}function c(){var t=C/M.framerate;(M.frameLimit&&C>=M.frameLimit||M.timeLimit&&t>=M.timeLimit)&&(n(),v());var e=new Date(null);e.setSeconds(t),M.motionBlurFrames>2?j.textContent="CCapture "+M.format+" | "+C+" frames ("+O+" inter) | "+e.toISOString().substr(11,8):j.textContent="CCapture "+M.format+" | "+C+" frames | "+e.toISOString().substr(11,8)}function p(t){N.width===t.width&&N.height===t.height||(N.width=t.width,N.height=t.height,z=new Uint16Array(N.height*N.width*4),V.fillStyle="#0",V.fillRect(0,0,N.width,N.height))}function m(t){V.drawImage(t,0,0),q=V.getImageData(0,0,N.width,N.height);for(var e=0;e<z.length;e+=4)z[e]+=q.data[e],z[e+1]+=q.data[e+1],z[e+2]+=q.data[e+2];O++}function w(){for(var t=q.data,e=0;e<z.length;e+=4)t[e]=2*z[e]/M.motionBlurFrames,t[e+1]=2*z[e+1]/M.motionBlurFrames,t[e+2]=2*z[e+2]/M.motionBlurFrames;V.putImageData(q,0,0),D.add(N),C++,O=0,b("Full MB Frame! "+C+" "+T);for(var e=0;e<z.length;e+=4)z[e]=0,z[e+1]=0,z[e+2]=0;gc()}function g(t){R&&(M.motionBlurFrames>2?(p(t),m(t),O>=.5*M.motionBlurFrames?w():d()):(D.add(t),C++,b("Full Frame! "+C)))}function y(){var t=1e3/M.framerate,e=(C+O/M.motionBlurFrames)*t;T=U+e,F=I+e,it.forEach(function(t){t._hookedTime=e/1e3}),c(),b("Frame: "+C+" "+O);for(var i=0;i<_.length;i++)T>=_[i].triggerTime&&(r(_[i].callback),_.splice(i,1));for(var i=0;i<S.length;i++)T>=S[i].triggerTime&&(r(S[i].callback),S[i].triggerTime+=S[i].time);W.forEach(function(t){r(t,T-k)}),W=[]}function v(t){t||(t=function(t){return download(t,D.filename+D.extension,D.mimeType),!1}),D.save(t)}function b(t){A&&console.log(t)}function B(t,e){P[t]=e}function x(t){var e=P[t];e&&e.apply(null,Array.prototype.slice.call(arguments,1))}function E(t){x("progress",t)}var A,L,T,U,F,I,d,D,M=t||{},_=(new Date,[]),S=[],C=0,O=0,W=[],R=!1,P={};M.framerate=M.framerate||60,M.motionBlurFrames=2*(M.motionBlurFrames||1),A=M.verbose||!1,L=M.display||!1,M.step=1e3/M.framerate,M.timeLimit=M.timeLimit||0,M.frameLimit=M.frameLimit||0,M.startTime=M.startTime||0;var j=document.createElement("div");j.style.position="absolute",j.style.left=j.style.top=0,j.style.backgroundColor="black",j.style.fontFamily="monospace",j.style.fontSize="11px",j.style.padding="5px",j.style.color="red",j.style.zIndex=1e5,M.display&&document.body.appendChild(j);var z,q,N=document.createElement("canvas"),V=N.getContext("2d");b("Step is set to "+M.step+"ms");var G={gif:u,webm:s,ffmpegserver:h,png:o,jpg:a,"webm-mediarecorder":f},H=G[M.format];if(!H)throw"Error: Incorrect or missing format: Valid formats are "+Object.keys(G).join(", ");if(D=new H(M),D.step=d,D.on("process",y),D.on("progress",E),"performance"in window==0&&(window.performance={}),Date.now=Date.now||function(){return(new Date).getTime()},"now"in window.performance==0){var K=Date.now();performance.timing&&performance.timing.navigationStart&&(K=performance.timing.navigationStart),window.performance.now=function(){return Date.now()-K}}var Z=window.setTimeout,J=window.setInterval,Y=window.clearInterval,$=window.clearTimeout,Q=window.requestAnimationFrame,X=window.Date.now,tt=window.performance.now,et=window.Date.prototype.getTime,it=[];return{start:i,capture:g,stop:n,save:v,on:B}}var l={function:!0,object:!0},c=(parseFloat,parseInt,l[typeof exports]&&exports&&!exports.nodeType?exports:void 0),p=l[typeof module]&&module&&!module.nodeType?module:void 0,m=p&&p.exports===c?c:void 0,w=t(c&&p&&"object"==typeof global&&global),g=t(l[typeof self]&&self),y=t(l[typeof window]&&window),v=t(l[typeof this]&&this),b=w||y!==(v&&v.window)&&y||g||v||Function("return this")();"gc"in window||(window.gc=function(){}),HTMLCanvasElement.prototype.toBlob||Object.defineProperty(HTMLCanvasElement.prototype,"toBlob",{value:function(t,e,i){for(var n=atob(this.toDataURL(e,i).split(",")[1]),r=n.length,o=new Uint8Array(r),a=0;a<r;a++)o[a]=n.charCodeAt(a);t(new Blob([o],{type:e||"image/png"}))}}),function(){if("performance"in window==0&&(window.performance={}),Date.now=Date.now||function(){return(new Date).getTime()},"now"in window.performance==0){var t=Date.now();performance.timing&&performance.timing.navigationStart&&(t=performance.timing.navigationStart),window.performance.now=function(){return Date.now()-t}}}();var k=window.Date.now();n.prototype.start=function(){},n.prototype.stop=function(){},n.prototype.add=function(){},n.prototype.save=function(){},n.prototype.dispose=function(){},n.prototype.safeToProceed=function(){return!0},n.prototype.step=function(){console.log("Step not set!")},r.prototype=Object.create(n.prototype),r.prototype.start=function(){this.dispose()},r.prototype.add=function(t){
var i=new FileReader;i.onload=function(){this.tape.append(e(this.count)+this.fileExtension,new Uint8Array(i.result)),this.settings.autoSaveTime>0&&this.frames/this.settings.framerate>=this.settings.autoSaveTime?this.save(function(t){this.filename=this.baseFilename+"-part-"+e(this.part),download(t,this.filename+this.extension,this.mimeType);var i=this.count;this.dispose(),this.count=i+1,this.part++,this.filename=this.baseFilename+"-part-"+e(this.part),this.frames=0,this.step()}.bind(this)):(this.count++,this.frames++,this.step())}.bind(this),i.readAsArrayBuffer(t)},r.prototype.save=function(t){t(this.tape.save())},r.prototype.dispose=function(){this.tape=new Tar,this.count=0},o.prototype=Object.create(r.prototype),o.prototype.add=function(t){t.toBlob(function(t){r.prototype.add.call(this,t)}.bind(this),this.type)},a.prototype=Object.create(r.prototype),a.prototype.add=function(t){t.toBlob(function(t){r.prototype.add.call(this,t)}.bind(this),this.type,this.quality)},s.prototype=Object.create(n.prototype),s.prototype.start=function(t){this.dispose()},s.prototype.add=function(t){this.videoWriter.addFrame(t),this.settings.autoSaveTime>0&&this.frames/this.settings.framerate>=this.settings.autoSaveTime?this.save(function(t){this.filename=this.baseFilename+"-part-"+e(this.part),download(t,this.filename+this.extension,this.mimeType),this.dispose(),this.part++,this.filename=this.baseFilename+"-part-"+e(this.part),this.step()}.bind(this)):(this.frames++,this.step())},s.prototype.save=function(t){this.videoWriter.complete().then(t)},s.prototype.dispose=function(t){this.frames=0,this.videoWriter=new WebMWriter({quality:this.quality,fileWriter:null,fd:null,frameRate:this.framerate})},h.prototype=Object.create(n.prototype),h.prototype.start=function(){this.encoder.start(this.settings)},h.prototype.add=function(t){this.encoder.add(t)},h.prototype.save=function(t){this.callback=t,this.encoder.end()},h.prototype.safeToProceed=function(){return this.encoder.safeToProceed()},f.prototype=Object.create(n.prototype),f.prototype.add=function(t){this.stream||(this.stream=t.captureStream(this.framerate),this.mediaRecorder=new MediaRecorder(this.stream),this.mediaRecorder.start(),this.mediaRecorder.ondataavailable=function(t){this.chunks.push(t.data)}.bind(this)),this.step()},f.prototype.save=function(t){this.mediaRecorder.onstop=function(e){var i=new Blob(this.chunks,{type:"video/webm"});this.chunks=[],t(i)}.bind(this),this.mediaRecorder.stop()},u.prototype=Object.create(n.prototype),u.prototype.add=function(t){this.sizeSet||(this.encoder.setOption("width",t.width),this.encoder.setOption("height",t.height),this.sizeSet=!0),this.canvas.width=t.width,this.canvas.height=t.height,this.ctx.drawImage(t,0,0),this.encoder.addFrame(this.ctx,{copy:!0,delay:this.settings.step}),this.step()},u.prototype.save=function(t){this.callback=t,this.encoder.render()},(y||g||{}).CCapture=d,"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return d}):c&&p?(m&&((p.exports=d).CCapture=d),c.CCapture=d):b.CCapture=d}();

























  
  "use strict";
/**
 * An implementation of ODEX, by E. Hairer and G. Wanner, ported from the Fortran ODEX.F.
 * The original work carries the BSD 2-clause license, and so does this.
 *
 * Copyright (c) 2016 Colin Smith.
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
 * disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
 * following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Object.defineProperty(exports, "__esModule", { value: true });

// var Outcome;
// (function (Outcome) {
//     Outcome[Outcome["Converged"] = 0] = "Converged";
//     Outcome[Outcome["MaxStepsExceeded"] = 1] = "MaxStepsExceeded";
//     Outcome[Outcome["EarlyReturn"] = 2] = "EarlyReturn";
// })
 //(Outcome = exports.Outcome || (exports.Outcome = {}));

function Outcome(){
  Outcome[Outcome["Converged"] = 0] = "Converged";
  Outcome[Outcome["MaxStepsExceeded"] = 1] = "MaxStepsExceeded";
  Outcome[Outcome["EarlyReturn"] = 2] = "EarlyReturn";
}
var Solver = (function () {
    function Solver(n) {
        this.n = n;
        this.uRound = 2.3e-16;
        this.maxSteps = 100;            // 10000
        this.initialStepSize = 1e-4;
        this.maxStepSize = 0;
        this.maxExtrapolationColumns = 9;
        this.stepSizeSequence = 0;
        this.stabilityCheckCount = 1;
        this.stabilityCheckTableLines = 2;
        this.denseOutput = false;
        this.denseOutputErrorEstimator = true;
        this.denseComponents = undefined;
        this.interpolationFormulaDegree = 4;
        this.stepSizeReductionFactor = 0.5;
        this.stepSizeFac1 = 0.02;
        this.stepSizeFac2 = 4.0;
        this.stepSizeFac3 = 0.8;
        this.stepSizeFac4 = 0.9;
        this.stepSafetyFactor1 = 0.65;
        this.stepSafetyFactor2 = 0.94;
        this.relativeTolerance = 1e-3;    // 1e-5
        this.absoluteTolerance = 1e-3;    // 1e-5
        this.debug = false;
    }
    Solver.prototype.grid = function (dt, out) {
        if (!this.denseOutput)
            throw new Error('Must set .denseOutput to true when using grid');
        var components = this.denseComponents;
        if (!components) {
            components = [];
            for (var i = 0; i < this.n; ++i)
                components.push(i);
        }
        var t;
        return function (n, xOld, x, y, interpolate) {
            if (n === 1) {
                var v = out(x, y);
                t = x + dt;
                return v;
            }
            while (t <= x) {
                var yf = [];
                for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
                    var i = components_1[_i];
                    yf.push(interpolate(i, t));
                }
                var v = out(t, yf);
                if (v === false)
                    return false;
                t += dt;
            }
        };
    };
    // Make a 1-based 2D array, with r rows and c columns. The initial values are undefined.
    Solver.dim2 = function (r, c) {
        var a = new Array(r + 1);
        for (var i = 1; i <= r; ++i)
            a[i] = Solver.dim(c);
        return a;
    };
    // Generate step size sequence and return as a 1-based array of length n.
    Solver.stepSizeSequence = function (nSeq, n) {
        var a = new Array(n + 1);
        a[0] = 0;
        switch (nSeq) {
            case 1:
                for (var i = 1; i <= n; ++i)
                    a[i] = 2 * i;
                break;
            case 2:
                a[1] = 2;
                for (var i = 2; i <= n; ++i)
                    a[i] = 4 * i - 4;
                break;
            case 3:
                a[1] = 2;
                a[2] = 4;
                a[3] = 6;
                for (var i = 4; i <= n; ++i)
                    a[i] = 2 * a[i - 2];
                break;
            case 4:
                for (var i = 1; i <= n; ++i)
                    a[i] = 4 * i - 2;
                break;
            case 5:
                for (var i = 1; i <= n; ++i)
                    a[i] = 4 * i;
                break;
            default:
                throw new Error('invalid stepSizeSequence selected');
        }
        return a;
    };
    // Integrate the differential system represented by f, from x to xEnd, with initial data y.
    // solOut, if provided, is called at each integration step.
    Solver.prototype.solve = function (f, x, y0, xEnd, solOut) {
        var _this = this;
        // Make a copy of y0, 1-based. We leave the user's parameters alone so that they may be reused if desired.
        var y = [0].concat(y0);
        var dz = Solver.dim(this.n);
        var yh1 = Solver.dim(this.n);
        var yh2 = Solver.dim(this.n);
        if (this.maxSteps <= 0)
            throw new Error('maxSteps must be positive');
        var km = this.maxExtrapolationColumns;
        if (km <= 2)
            throw new Error('maxExtrapolationColumns must be > 2');
        var nSeq = this.stepSizeSequence || (this.denseOutput ? 4 : 1);
        if (nSeq <= 3 && this.denseOutput)
            throw new Error('stepSizeSequence incompatible with denseOutput');
        if (this.denseOutput && !solOut)
            throw new Error('denseOutput requires a solution observer function');
        if (this.interpolationFormulaDegree <= 0 || this.interpolationFormulaDegree >= 7)
            throw new Error('bad interpolationFormulaDegree');
        var icom = [0]; // icom will be 1-based, so start with a pad entry.
        var nrdens = 0;
        if (this.denseOutput) {
            if (this.denseComponents) {
                for (var _i = 0, _a = this.denseComponents; _i < _a.length; _i++) {
                    var c = _a[_i];
                    // convert dense components requested into one-based indexing.
                    if (c < 0 || c > this.n)
                        throw new Error('bad dense component: ' + c);
                    icom.push(c + 1);
                    ++nrdens;
                }
            }
            else {
                // if user asked for dense output but did not specify any denseComponents,
                // request all of them.
                for (var i = 1; i <= this.n; ++i) {
                    icom.push(i);
                }
                nrdens = this.n;
            }
        }
        if (this.uRound <= 1e-35 || this.uRound > 1)
            throw new Error('suspicious value of uRound');
        var hMax = Math.abs(this.maxStepSize || xEnd - x);
        var lfSafe = 2 * km * km + km;
        function expandToArray(x, n) {
            // If x is an array, return a 1-based copy of it. If x is a number, return a new 1-based array
            // consisting of n copies of the number.
            var tolArray = [0];
            if (Array.isArray(x)) {
                return tolArray.concat(x);
            }
            else {
                for (var i = 0; i < n; ++i)
                    tolArray.push(x);
                return tolArray;
            }
        }
        var aTol = expandToArray(this.absoluteTolerance, this.n);
        var rTol = expandToArray(this.relativeTolerance, this.n);
        var _b = [0, 0, 0, 0], nEval = _b[0], nStep = _b[1], nAccept = _b[2], nReject = _b[3];
        // call to core integrator
        var nrd = Math.max(1, nrdens);
        var ncom = Math.max(1, (2 * km + 5) * nrdens);
        var dens = Solver.dim(ncom);
        var fSafe = Solver.dim2(lfSafe, nrd);
        // Wrap f in a function F which hides the one-based indexing from the customers.
        var F = function (x, y, yp) {
            var ret = f(x, y.slice(1));
            for (var i = 0; i < ret.length; ++i)
                yp[i + 1] = ret[i];
        };
        var odxcor = function () {
            // The following three variables are COMMON/CONTEX/
            var xOldd;
            var hhh;
            var kmit;
            var acceptStep = function (n) {
                // Returns true if we should continue the integration. The only time false
                // is returned is when the user's solution observation function has returned false,
                // indicating that she does not wish to continue the computation.
                xOld = x;
                x += h;
                if (_this.denseOutput) {
                    // kmit = mu of the paper
                    kmit = 2 * kc - _this.interpolationFormulaDegree + 1;
                    for (var i = 1; i <= nrd; ++i)
                        dens[i] = y[icom[i]];
                    xOldd = xOld;
                    hhh = h; // note: xOldd and hhh are part of /CONODX/
                    for (var i = 1; i <= nrd; ++i)
                        dens[nrd + i] = h * dz[icom[i]];
                    var kln = 2 * nrd;
                    for (var i = 1; i <= nrd; ++i)
                        dens[kln + i] = t[1][icom[i]];
                    // compute solution at mid-point
                    for (var j = 2; j <= kc; ++j) {
                        var dblenj = nj[j];
                        for (var l = j; l >= 2; --l) {
                            var factor = Math.pow((dblenj / nj[l - 1]), 2) - 1;
                            for (var i = 1; i <= nrd; ++i) {
                                ySafe[l - 1][i] = ySafe[l][i] + (ySafe[l][i] - ySafe[l - 1][i]) / factor;
                            }
                        }
                    }
                    var krn = 4 * nrd;
                    for (var i = 1; i <= nrd; ++i)
                        dens[krn + i] = ySafe[1][i];
                    // compute first derivative at right end
                    for (var i = 1; i <= n; ++i)
                        yh1[i] = t[1][i];
                    F(x, yh1, yh2);
                    krn = 3 * nrd;
                    for (var i = 1; i <= nrd; ++i)
                        dens[krn + i] = yh2[icom[i]] * h;
                    // THE LOOP
                    for (var kmi = 1; kmi <= kmit; ++kmi) {
                        // compute kmi-th derivative at mid-point
                        var kbeg = (kmi + 1) / 2 | 0;
                        for (var kk = kbeg; kk <= kc; ++kk) {
                            var facnj = Math.pow((nj[kk] / 2), (kmi - 1));
                            iPt = iPoint[kk + 1] - 2 * kk + kmi;
                            for (var i = 1; i <= nrd; ++i) {
                                ySafe[kk][i] = fSafe[iPt][i] * facnj;
                            }
                        }
                        for (var j = kbeg + 1; j <= kc; ++j) {
                            var dblenj = nj[j];
                            for (var l = j; l >= kbeg + 1; --l) {
                                var factor = Math.pow((dblenj / nj[l - 1]), 2) - 1;
                                for (var i = 1; i <= nrd; ++i) {
                                    ySafe[l - 1][i] = ySafe[l][i] + (ySafe[l][i] - ySafe[l - 1][i]) / factor;
                                }
                            }
                        }
                        krn = (kmi + 4) * nrd;
                        for (var i = 1; i <= nrd; ++i)
                            dens[krn + i] = ySafe[kbeg][i] * h;
                        if (kmi === kmit)
                            continue;
                        // compute differences
                        for (var kk = (kmi + 2) / 2 | 0; kk <= kc; ++kk) {
                            var lbeg = iPoint[kk + 1];
                            var lend = iPoint[kk] + kmi + 1;
                            if (kmi === 1 && nSeq === 4)
                                lend += 2;
                            var l = void 0;
                            for (l = lbeg; l >= lend; l -= 2) {
                                for (var i = 1; i <= nrd; ++i) {
                                    fSafe[l][i] -= fSafe[l - 2][i];
                                }
                            }
                            if (kmi === 1 && nSeq === 4) {
                                l = lend - 2;
                                for (var i = 1; i <= nrd; ++i)
                                    fSafe[l][i] -= dz[icom[i]];
                            }
                        }
                        // compute differences
                        for (var kk = (kmi + 2) / 2 | 0; kk <= kc; ++kk) {
                            var lbeg = iPoint[kk + 1] - 1;
                            var lend = iPoint[kk] + kmi + 2;
                            for (var l = lbeg; l >= lend; l -= 2) {
                                for (var i = 1; i <= nrd; ++i) {
                                    fSafe[l][i] -= fSafe[l - 2][i];
                                }
                            }
                        }
                    }
                    interp(nrd, dens, kmit);
                    // estimation of interpolation error
                    if (_this.denseOutputErrorEstimator && kmit >= 1) {
                        var errint = 0;
                        for (var i = 1; i <= nrd; ++i)
                            errint += Math.pow((dens[(kmit + 4) * nrd + i] / scal[icom[i]]), 2);
                        errint = Math.sqrt(errint / nrd) * errfac[kmit];
                        hoptde = h / Math.max(Math.pow(errint, (1 / (kmit + 4))), 0.01);
                        if (errint > 10) {
                            h = hoptde;
                            x = xOld;
                            ++nReject;
                            reject = true;
                            return true;
                        }
                    }
                    for (var i = 1; i <= n; ++i)
                        dz[i] = yh2[i];
                }
                for (var i = 1; i <= n; ++i)
                    y[i] = t[1][i];
                ++nAccept;
                if (solOut) {
                    // If denseOutput, we also want to supply the dense closure.
                    if (solOut(nAccept + 1, xOld, x, y.slice(1), _this.denseOutput && contex(xOldd, hhh, kmit, dens, icom)) === false)
                        return false;
                }
                // compute optimal order
                var kopt;
                if (kc === 2) {
                    kopt = Math.min(3, km - 1);
                    if (reject)
                        kopt = 2;
                }
                else {
                    if (kc <= k) {
                        kopt = kc;
                        if (w[kc - 1] < w[kc] * _this.stepSizeFac3)
                            kopt = kc - 1;
                        if (w[kc] < w[kc - 1] * _this.stepSizeFac4)
                            kopt = Math.min(kc + 1, km - 1);
                    }
                    else {
                        kopt = kc - 1;
                        if (kc > 3 && w[kc - 2] < w[kc - 1] * _this.stepSizeFac3)
                            kopt = kc - 2;
                        if (w[kc] < w[kopt] * _this.stepSizeFac4)
                            kopt = Math.min(kc, km - 1);
                    }
                }
                // after a rejected step
                if (reject) {
                    k = Math.min(kopt, kc);
                    h = posneg * Math.min(Math.abs(h), Math.abs(hh[k]));
                    reject = false;
                    return true; // goto 10
                }
                if (kopt <= kc) {
                    h = hh[kopt];
                }
                else {
                    if (kc < k && w[kc] < w[kc - 1] * _this.stepSizeFac4) {
                        h = hh[kc] * a[kopt + 1] / a[kc];
                    }
                    else {
                        h = hh[kc] * a[kopt] / a[kc];
                    }
                }
                // compute stepsize for next step
                k = kopt;
                h = posneg * Math.abs(h);
                return true;
            };
            var midex = function (j) {
                var dy = Solver.dim(_this.n);
                // Computes the jth line of the extrapolation table and
                // provides an estimation of the optional stepsize
                var hj = h / nj[j];
                // Euler starting step
                for (var i = 1; i <= _this.n; ++i) {
                    yh1[i] = y[i];
                    yh2[i] = y[i] + hj * dz[i];
                }
                // Explicit midpoint rule
                var m = nj[j] - 1;
                var njMid = (nj[j] / 2) | 0;
                for (var mm = 1; mm <= m; ++mm) {
                    if (_this.denseOutput && mm === njMid) {
                        for (var i = 1; i <= nrd; ++i) {
                            ySafe[j][i] = yh2[icom[i]];
                        }
                    }
                    F(x + hj * mm, yh2, dy);
                    if (_this.denseOutput && Math.abs(mm - njMid) <= 2 * j - 1) {
                        ++iPt;
                        for (var i = 1; i <= nrd; ++i) {
                            fSafe[iPt][i] = dy[icom[i]];
                        }
                    }
                    for (var i = 1; i <= _this.n; ++i) {
                        var ys = yh1[i];
                        yh1[i] = yh2[i];
                        yh2[i] = ys + 2 * hj * dy[i];
                    }
                    if (mm <= _this.stabilityCheckCount && j <= _this.stabilityCheckTableLines) {
                        // stability check
                        var del1 = 0;
                        for (var i = 1; i <= _this.n; ++i) {
                            del1 += Math.pow((dz[i] / scal[i]), 2);
                        }
                        var del2 = 0;
                        for (var i = 1; i <= _this.n; ++i) {
                            del2 += Math.pow(((dy[i] - dz[i]) / scal[i]), 2);
                        }
                        var quot = del2 / Math.max(_this.uRound, del1);
                        if (quot > 4) {
                            ++nEval;
                            atov = true;
                            h *= _this.stepSizeReductionFactor;
                            reject = true;
                            return;
                        }
                    }
                }
                // final smoothing step
                F(x + h, yh2, dy);
                if (_this.denseOutput && njMid <= 2 * j - 1) {
                    ++iPt;
                    for (var i = 1; i <= nrd; ++i) {
                        fSafe[iPt][i] = dy[icom[i]];
                    }
                }
                for (var i = 1; i <= _this.n; ++i) {
                    t[j][i] = (yh1[i] + yh2[i] + hj * dy[i]) / 2;
                }
                nEval += nj[j];
                // polynomial extrapolation
                if (j === 1)
                    return; // was j.eq.1
                var dblenj = nj[j];
                var fac;
                for (var l = j; l > 1; --l) {
                    fac = Math.pow((dblenj / nj[l - 1]), 2) - 1;
                    for (var i = 1; i <= _this.n; ++i) {
                        t[l - 1][i] = t[l][i] + (t[l][i] - t[l - 1][i]) / fac;
                    }
                }
                err = 0;
                // scaling
                for (var i = 1; i <= _this.n; ++i) {
                    var t1i = Math.max(Math.abs(y[i]), Math.abs(t[1][i]));
                    scal[i] = aTol[i] + rTol[i] * t1i;
                    err += Math.pow(((t[1][i] - t[2][i]) / scal[i]), 2);
                }
                err = Math.sqrt(err / _this.n);
                if (err * _this.uRound >= 1 || (j > 2 && err >= errOld)) {
                    atov = true;
                    h *= _this.stepSizeReductionFactor;
                    reject = true;
                    return;
                }
                errOld = Math.max(4 * err, 1);
                // compute optimal stepsizes
                var exp0 = 1 / (2 * j - 1);
                var facMin = Math.pow(_this.stepSizeFac1, exp0);
                fac = Math.min(_this.stepSizeFac2 / facMin, Math.max(facMin, Math.pow((err / _this.stepSafetyFactor1), exp0) / _this.stepSafetyFactor2));
                fac = 1 / fac;
                hh[j] = Math.min(Math.abs(h) * fac, hMax);
                w[j] = a[j] / hh[j];
            };
            var interp = function (n, y, imit) {
                // computes the coefficients of the interpolation formula
                var a = new Array(31); // zero-based: 0:30
                // begin with Hermite interpolation
                for (var i = 1; i <= n; ++i) {
                    var y0_1 = y[i];
                    var y1 = y[2 * n + i];
                    var yp0 = y[n + i];
                    var yp1 = y[3 * n + i];
                    var yDiff = y1 - y0_1;
                    var aspl = -yp1 + yDiff;
                    var bspl = yp0 - yDiff;
                    y[n + i] = yDiff;
                    y[2 * n + i] = aspl;
                    y[3 * n + i] = bspl;
                    if (imit < 0)
                        continue;
                    // compute the derivatives of Hermite at midpoint
                    var ph0 = (y0_1 + y1) * 0.5 + 0.125 * (aspl + bspl);
                    var ph1 = yDiff + (aspl - bspl) * 0.25;
                    var ph2 = -(yp0 - yp1);
                    var ph3 = 6 * (bspl - aspl);
                    // compute the further coefficients
                    if (imit >= 1) {
                        a[1] = 16 * (y[5 * n + i] - ph1);
                        if (imit >= 3) {
                            a[3] = 16 * (y[7 * n + i] - ph3 + 3 * a[1]);
                            if (imit >= 5) {
                                for (var im = 5; im <= imit; im += 2) {
                                    var fac1 = im * (im - 1) / 2;
                                    var fac2 = fac1 * (im - 2) * (im - 3) * 2;
                                    a[im] = 16 * (y[(im + 4) * n + i] + fac1 * a[im - 2] - fac2 * a[im - 4]);
                                }
                            }
                        }
                    }
                    a[0] = (y[4 * n + i] - ph0) * 16;
                    if (imit >= 2) {
                        a[2] = (y[n * 6 + i] - ph2 + a[0]) * 16;
                        if (imit >= 4) {
                            for (var im = 4; im <= imit; im += 2) {
                                var fac1 = im * (im - 1) / 2;
                                var fac2 = im * (im - 1) * (im - 2) * (im - 3);
                                a[im] = (y[n * (im + 4) + i] + a[im - 2] * fac1 - a[im - 4] * fac2) * 16;
                            }
                        }
                    }
                    for (var im = 0; im <= imit; ++im)
                        y[n * (im + 4) + i] = a[im];
                }
            };
            var contex = function (xOld, h, imit, y, icom) {
                return function (c, x) {
                    var i = 0;
                    for (var j = 1; j <= nrd; ++j) {
                        // careful: customers describe components 0-based. We record indices 1-based.
                        if (icom[j] === c + 1)
                            i = j;
                    }
                    if (i === 0)
                        throw new Error('no dense output available for component ' + c);
                    var theta = (x - xOld) / h;
                    var theta1 = 1 - theta;
                    var phthet = y[i] + theta * (y[nrd + i] + theta1 * (y[2 * nrd + i] * theta + y[3 * nrd + i] * theta1));
                    if (imit < 0)
                        return phthet;
                    var thetah = theta - 0.5;
                    var ret = y[nrd * (imit + 4) + i];
                    for (var im = imit; im >= 1; --im) {
                        ret = y[nrd * (im + 3) + i] + ret * thetah / im;
                    }
                    return phthet + Math.pow((theta * theta1), 2) * ret;
                };
            };
            // preparation
            var ySafe = Solver.dim2(km, nrd);
            var hh = Solver.dim(km);
            var t = Solver.dim2(km, _this.n);
            // Define the step size sequence
            var nj = Solver.stepSizeSequence(nSeq, km);
            // Define the a[i] for order selection
            var a = Solver.dim(km);
            a[1] = 1 + nj[1];
            for (var i = 2; i <= km; ++i) {
                a[i] = a[i - 1] + nj[i];
            }
            // Initial Scaling
            var scal = Solver.dim(_this.n);
            for (var i = 1; i <= _this.n; ++i) {
                scal[i] = aTol[i] + rTol[i] + Math.abs(y[i]);
            }
            // Initial preparations
            var posneg = xEnd - x >= 0 ? 1 : -1;
            var k = Math.max(2, Math.min(km - 1, Math.floor(-Solver.log10(rTol[1] + 1e-40) * 0.6 + 1.5)));
            var h = Math.max(Math.abs(_this.initialStepSize), 1e-4);
            h = posneg * Math.min(h, hMax, Math.abs(xEnd - x) / 2);
            var iPoint = Solver.dim(km + 1);
            var errfac = Solver.dim(2 * km);
            var xOld = x;
            var iPt = 0;
            if (solOut) {
                if (_this.denseOutput) {
                    iPoint[1] = 0;
                    for (var i = 1; i <= km; ++i) {
                        var njAdd = 4 * i - 2;
                        if (nj[i] > njAdd)
                            ++njAdd;
                        iPoint[i + 1] = iPoint[i] + njAdd;
                    }
                    for (var mu = 1; mu <= 2 * km; ++mu) {
                        var errx = Math.sqrt(mu / (mu + 4)) * 0.5;
                        var prod = Math.pow((1 / (mu + 4)), 2);
                        for (var j = 1; j <= mu; ++j)
                            prod *= errx / j;
                        errfac[mu] = prod;
                    }
                    iPt = 0;
                }
                // check return value and abandon integration if called for
                if (false === solOut(nAccept + 1, xOld, x, y.slice(1))) {
                    return Outcome.EarlyReturn;
                }
            }
            var err = 0;
            var errOld = 1e10;
            var hoptde = posneg * hMax;
            var w = Solver.dim(km);
            w[1] = 0;
            var reject = false;
            var last = false;
            var atov;
            var kc = 0;
            var STATE;
            (function (STATE) {
                STATE[STATE["Start"] = 0] = "Start";
                STATE[STATE["BasicIntegrationStep"] = 1] = "BasicIntegrationStep";
                STATE[STATE["ConvergenceStep"] = 2] = "ConvergenceStep";
                STATE[STATE["HopeForConvergence"] = 3] = "HopeForConvergence";
                STATE[STATE["Accept"] = 4] = "Accept";
                STATE[STATE["Reject"] = 5] = "Reject";
            })(STATE || (STATE = {}));
            var state = STATE.Start;
            loop: while (true) {
                _this.debug && console.log('STATE', STATE[state], nStep, xOld, x, h, k, kc, hoptde);
                switch (state) {
                    case STATE.Start:
                        atov = false;
                        // Is xEnd reached in the next step?
                        if (0.1 * Math.abs(xEnd - x) <= Math.abs(x) * _this.uRound)
                            break loop;
                        h = posneg * Math.min(Math.abs(h), Math.abs(xEnd - x), hMax, Math.abs(hoptde));
                        if ((x + 1.01 * h - xEnd) * posneg > 0) {
                            h = xEnd - x;
                            last = true;
                        }
                        if (nStep === 0 || !_this.denseOutput) {
                            F(x, y, dz);
                            ++nEval;
                        }
                        // The first and last step
                        if (nStep === 0 || last) {
                            iPt = 0;
                            ++nStep;
                            for (var j = 1; j <= k; ++j) {
                                kc = j;
                                midex(j);
                                if (atov)
                                    continue loop;
                                if (j > 1 && err <= 1) {
                                    state = STATE.Accept;
                                    continue loop;
                                }
                            }
                            state = STATE.HopeForConvergence;
                            continue;
                        }
                        state = STATE.BasicIntegrationStep;
                        continue;
                    case STATE.BasicIntegrationStep:
                        // basic integration step
                        iPt = 0;
                        ++nStep;
                        if (nStep >= _this.maxSteps) {
                            return Outcome.MaxStepsExceeded;
                        }
                        kc = k - 1;
                        for (var j = 1; j <= kc; ++j) {
                            midex(j);
                            if (atov) {
                                state = STATE.Start;
                                continue loop;
                            }
                        }
                        // convergence monitor
                        if (k === 2 || reject) {
                            state = STATE.ConvergenceStep;
                        }
                        else {
                            if (err <= 1) {
                                state = STATE.Accept;
                            }
                            else if (err > Math.pow(((nj[k + 1] * nj[k]) / 4), 2)) {
                                state = STATE.Reject;
                            }
                            else
                                state = STATE.ConvergenceStep;
                        }
                        continue;
                    case STATE.ConvergenceStep:
                        midex(k);
                        if (atov) {
                            state = STATE.Start;
                            continue;
                        }
                        kc = k;
                        if (err <= 1) {
                            state = STATE.Accept;
                            continue;
                        }
                        state = STATE.HopeForConvergence;
                        continue;
                    case STATE.HopeForConvergence:
                        // hope for convergence in line k + 1
                        if (err > Math.pow((nj[k + 1] / 2), 2)) {
                            state = STATE.Reject;
                            continue;
                        }
                        kc = k + 1;
                        midex(kc);
                        if (atov)
                            state = STATE.Start;
                        else if (err > 1)
                            state = STATE.Reject;
                        else
                            state = STATE.Accept;
                        continue;
                    case STATE.Accept:
                        if (!acceptStep(_this.n))
                            return Outcome.EarlyReturn;
                        state = STATE.Start;
                        continue;
                    case STATE.Reject:
                        k = Math.min(k, kc, km - 1);
                        if (k > 2 && w[k - 1] < w[k] * _this.stepSizeFac3)
                            k -= 1;
                        ++nReject;
                        h = posneg * hh[k];
                        reject = true;
                        state = STATE.BasicIntegrationStep;
                }
            }
            return Outcome.Converged;
        };
        var outcome = odxcor();
        return {
            y: y.slice(1),
            outcome: outcome,
            nStep: nStep,
            xEnd: xEnd,
            nAccept: nAccept,
            nReject: nReject,
            nEval: nEval
        };
    };
    return Solver;
}());
// return a 1-based array of length n. Initial values undefined.
Solver.dim = function (n) { return Array(n + 1); };
Solver.log10 = function (x) { return Math.log(x) / Math.LN10; };


  ///// MERSENNE TWISTER

  /*
  I've wrapped Makoto Matsumoto and Takuji Nishimura's code in a namespace
  so it's better encapsulated. Now you can have multiple random number generators
  and they won't stomp all over eachother's state.
  
  If you want to use this as a substitute for Math.random(), use the random()
  method like so:
  
  var m = new MersenneTwister();
  var randomNumber = m.random();
  
  You can also call the other genrand_{foo}() methods on the instance.
  If you want to use a specific seed in order to get a repeatable random
  sequence, pass an integer into the constructor:
  var m = new MersenneTwister(123);
  and that will always produce the same random sequence.
  Sean McCullough (banksean@gmail.com)
*/

/* 
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.
 
   Before using, initialize the state by using init_genrand(seed)  
   or init_by_array(init_key, key_length).
 
   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.                          
 
   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:
 
     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
 
     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
 
     3. The names of its contributors may not be used to endorse or promote 
        products derived from this software without specific prior written 
        permission.
 
   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 
   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/

function MersenneTwister(seed) {
    if (seed == undefined) {
      seed = new Date().getTime();
    } 
    /* Period parameters */  
    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 0x9908b0df;   /* constant vector a */
    this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
    this.LOWER_MASK = 0x7fffffff; /* least significant r bits */

    this.mt = new Array(this.N); /* the array for the state vector */
    this.mti=this.N+1; /* mti==N+1 means mt[N] is not initialized */

    this.init_genrand(seed);
  }  

  /* initializes mt[N] with a seed */
  MersenneTwister.prototype.init_genrand = function(s) {
    this.mt[0] = s >>> 0;
    for (this.mti=1; this.mti<this.N; this.mti++) {
        var s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30);
     this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
    + this.mti;
        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
        /* In the previous versions, MSBs of the seed affect   */
        /* only MSBs of the array mt[].                        */
        /* 2002/01/09 modified by Makoto Matsumoto             */
        this.mt[this.mti] >>>= 0;
        /* for >32 bit machines */
    }
  }

  /* initialize by an array with array-length */
  /* init_key is the array for initializing keys */
  /* key_length is its length */
  /* slight change for C++, 2004/2/26 */
  MersenneTwister.prototype.init_by_array = function(init_key, key_length) {
    var i, j, k;
    this.init_genrand(19650218);
    i=1; j=0;
    k = (this.N>key_length ? this.N : key_length);
    for (; k; k--) {
      var s = this.mt[i-1] ^ (this.mt[i-1] >>> 30)
      this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525)))
        + init_key[j] + j; /* non linear */
      this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
      i++; j++;
      if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
      if (j>=key_length) j=0;
    }
    for (k=this.N-1; k; k--) {
      var s = this.mt[i-1] ^ (this.mt[i-1] >>> 30);
      this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941))
        - i; /* non linear */
      this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
      i++;
      if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
    }

    this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */ 
  }

  /* generates a random number on [0,0xffffffff]-interval */
  MersenneTwister.prototype.genrand_int32 = function() {
    var y;
    var mag01 = new Array(0x0, this.MATRIX_A);
    /* mag01[x] = x * MATRIX_A  for x=0,1 */

    if (this.mti >= this.N) { /* generate N words at one time */
      var kk;

      if (this.mti == this.N+1)   /* if init_genrand() has not been called, */
        this.init_genrand(5489); /* a default initial seed is used */

      for (kk=0;kk<this.N-this.M;kk++) {
        y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
        this.mt[kk] = this.mt[kk+this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
      }
      for (;kk<this.N-1;kk++) {
        y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
        this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
      }
      y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
      this.mt[this.N-1] = this.mt[this.M-1] ^ (y >>> 1) ^ mag01[y & 0x1];

      this.mti = 0;
    }

    y = this.mt[this.mti++];

    /* Tempering */
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);

    return y >>> 0;
  }

  /* generates a random number on [0,0x7fffffff]-interval */
  MersenneTwister.prototype.genrand_int31 = function() {
    return (this.genrand_int32()>>>1);
  }

  /* generates a random number on [0,1]-real-interval */
  MersenneTwister.prototype.genrand_real1 = function() {
    return this.genrand_int32()*(1.0/4294967295.0); 
    /* divided by 2^32-1 */ 
  }
  /* generates a random number on [0,1)-real-interval */
  MersenneTwister.prototype.genrand_real2 = function() {
    return this.genrand_int32()*(1.0/4294967296.0); 
    /* divided by 2^32 */
  }

   /* generates a random int between [min,max] */
   MersenneTwister.prototype.genrand_int = function(min,max) {
    return min+Math.floor(this.genrand_real2()*(max));
  }

  /* generates a random number on [0,1)-real-interval */
  MersenneTwister.prototype.random = function() {
    return this.genrand_int32()*(1.0/4294967296.0); 
    /* divided by 2^32 */
  }

  /* generates a random number on (0,1)-real-interval */
  MersenneTwister.prototype.genrand_real3 = function() {
    return (this.genrand_int32() + 0.5)*(1.0/4294967296.0); 
    /* divided by 2^32 */
  }

  /* generates a random number on [0,1) with 53-bit resolution*/
  MersenneTwister.prototype.genrand_res53 = function() { 
    var a=this.genrand_int32()>>>5, b=this.genrand_int32()>>>6; 
    return(a*67108864.0+b)*(1.0/9007199254740992.0); 
  } 

  /* These real versions are due to Isaku Wada, 2002/01/09 added */
