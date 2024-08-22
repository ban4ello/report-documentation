import{B as y,aB as me,aC as fe,G as x,aD as w,au as R,aE as ge,s as _,a as p,c as h,N as $,O as ve,k as S,S as E,x as u,b as o,Q as v,v as f,U as T,R as H,a3 as be,d as r,e as l,a5 as L,an as j,T as F,t as M,M as ye,P as V,a1 as _e,r as D,g as b}from"./index-DJBwkoZY.js";import{s as Se}from"./index-6bT2q1h9.js";import{s as ze}from"./index-D1SSTtC7.js";import{s as Pe}from"./index-D0trEqvk.js";import{s as W}from"./index-cUUcv6oJ.js";import{s as X}from"./index-BwiZWGqm.js";import{s as Y}from"./index-jkYnPYH4.js";import{s as xe,a as we,b as $e}from"./index-wyl3YYgF.js";import{c as Te,s as Le,a as Ee,b as qe}from"./index-B8HEQn8E.js";import{s as Ie}from"./index-R_4G_yAf.js";import{s as ke}from"./index-B7wDskVi.js";import{s as Ae,a as Be}from"./index-h_z7yQkC.js";import{s as De}from"./index-nBie461h.js";import"./index-BHlj4Wkw.js";import"./index-C1XCmfy2.js";import"./index-Djrj-gYB.js";import"./index-F9SGngVz.js";import"./index-2LRS8nzj.js";import"./index-CM6Mkz7c.js";import"./index-D1KdbZV8.js";import"./index-C5QC2rhd.js";var Me=function(t){var n=t.dt;return`
.p-splitter {
    display: flex;
    flex-wrap: nowrap;
    border: 1px solid `.concat(n("splitter.border.color"),`;
    background: `).concat(n("splitter.background"),`;
    border-radius: `).concat(n("border.radius.md"),`;
    color: `).concat(n("splitter.color"),`;
}

.p-splitter-vertical {
    flex-direction: column;
}

.p-splitter-gutter {
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    background: `).concat(n("splitter.gutter.background"),`;
}

.p-splitter-gutter-handle {
    border-radius: `).concat(n("splitter.handle.border.radius"),`;
    background: `).concat(n("splitter.handle.background"),`;
    transition: outline-color `).concat(n("splitter.transition.duration"),", box-shadow ").concat(n("splitter.transition.duration"),`;
    outline-color: transparent;
}

.p-splitter-gutter-handle:focus-visible {
    box-shadow: `).concat(n("splitter.handle.focus.ring.shadow"),`;
    outline: `).concat(n("splitter.handle.focus.ring.width")," ").concat(n("splitter.handle.focus.ring.style")," ").concat(n("splitter.handle.focus.ring.color"),`;
    outline-offset: `).concat(n("splitter.handle.focus.ring.offset"),`;
}

.p-splitter-horizontal.p-splitter-resizing {
    cursor: col-resize;
    user-select: none;
}

.p-splitter-vertical.p-splitter-resizing {
    cursor: row-resize;
    user-select: none;
}

.p-splitter-horizontal > .p-splitter-gutter > .p-splitter-gutter-handle {
    height: `).concat(n("splitter.handle.size"),`;
    width: 100%;
}

.p-splitter-vertical > .p-splitter-gutter > .p-splitter-gutter-handle {
    width: `).concat(n("splitter.handle.size"),`;
    height: 100%;
}

.p-splitter-horizontal > .p-splitter-gutter {
    cursor: col-resize;
}

.p-splitter-vertical > .p-splitter-gutter {
    cursor: row-resize;
}

.p-splitterpanel {
    flex-grow: 1;
    overflow: hidden;
}

.p-splitterpanel-nested {
    display: flex;
}

.p-splitterpanel .p-splitter {
    flex-grow: 1;
    border: 0 none;
}
`)},Oe={root:function(t){var n=t.props;return["p-splitter p-component","p-splitter-"+n.layout]},gutter:"p-splitter-gutter",gutterHandle:"p-splitter-gutter-handle"},je={root:function(t){var n=t.props;return[{display:"flex","flex-wrap":"nowrap"},n.layout==="vertical"?{"flex-direction":"column"}:""]}},Ce=y.extend({name:"splitter",theme:Me,classes:Oe,inlineStyles:je}),Ke={name:"BaseSplitter",extends:_,props:{layout:{type:String,default:"horizontal"},gutterSize:{type:Number,default:4},stateKey:{type:String,default:null},stateStorage:{type:String,default:"session"},step:{type:Number,default:5}},style:Ce,provide:function(){return{$pcSplitter:this,$parentInstance:this}}};function U(e){return Ge(e)||Ne(e)||Ue(e)||Re()}function Re(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ue(e,t){if(e){if(typeof e=="string")return O(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?O(e,t):void 0}}function Ne(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Ge(e){if(Array.isArray(e))return O(e)}function O(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,a=Array(t);n<t;n++)a[n]=e[n];return a}var J={name:"Splitter",extends:Ke,inheritAttrs:!1,emits:["resizestart","resizeend","resize"],dragging:!1,mouseMoveListener:null,mouseUpListener:null,touchMoveListener:null,touchEndListener:null,size:null,gutterElement:null,startPos:null,prevPanelElement:null,nextPanelElement:null,nextPanelSize:null,prevPanelSize:null,panelSizes:null,prevPanelIndex:null,timer:null,data:function(){return{prevSize:null}},mounted:function(){var t=this;if(this.panels&&this.panels.length){var n=!1;if(this.isStateful()&&(n=this.restoreState()),!n){var a=U(this.$el.children).filter(function(i){return i.getAttribute("data-pc-name")==="splitterpanel"}),s=[];this.panels.map(function(i,c){var d=i.props&&i.props.size?i.props.size:null,g=d||100/t.panels.length;s[c]=g,a[c].style.flexBasis="calc("+g+"% - "+(t.panels.length-1)*t.gutterSize+"px)"}),this.panelSizes=s,this.prevSize=parseFloat(s[0]).toFixed(4)}}},beforeUnmount:function(){this.clear(),this.unbindMouseListeners()},methods:{isSplitterPanel:function(t){return t.type.name==="SplitterPanel"},onResizeStart:function(t,n,a){this.gutterElement=t.currentTarget||t.target.parentElement,this.size=this.horizontal?me(this.$el):fe(this.$el),a||(this.dragging=!0,this.startPos=this.layout==="horizontal"?t.pageX||t.changedTouches[0].pageX:t.pageY||t.changedTouches[0].pageY),this.prevPanelElement=this.gutterElement.previousElementSibling,this.nextPanelElement=this.gutterElement.nextElementSibling,a?(this.prevPanelSize=this.horizontal?x(this.prevPanelElement,!0):w(this.prevPanelElement,!0),this.nextPanelSize=this.horizontal?x(this.nextPanelElement,!0):w(this.nextPanelElement,!0)):(this.prevPanelSize=100*(this.horizontal?x(this.prevPanelElement,!0):w(this.prevPanelElement,!0))/this.size,this.nextPanelSize=100*(this.horizontal?x(this.nextPanelElement,!0):w(this.nextPanelElement,!0))/this.size),this.prevPanelIndex=n,this.$emit("resizestart",{originalEvent:t,sizes:this.panelSizes}),this.$refs.gutter[n].setAttribute("data-p-gutter-resizing",!0),this.$el.setAttribute("data-p-resizing",!0)},onResize:function(t,n,a){var s,i,c;a?this.horizontal?(i=100*(this.prevPanelSize+n)/this.size,c=100*(this.nextPanelSize-n)/this.size):(i=100*(this.prevPanelSize-n)/this.size,c=100*(this.nextPanelSize+n)/this.size):(this.horizontal?s=t.pageX*100/this.size-this.startPos*100/this.size:s=t.pageY*100/this.size-this.startPos*100/this.size,i=this.prevPanelSize+s,c=this.nextPanelSize-s),this.validateResize(i,c)&&(this.prevPanelElement.style.flexBasis="calc("+i+"% - "+(this.panels.length-1)*this.gutterSize+"px)",this.nextPanelElement.style.flexBasis="calc("+c+"% - "+(this.panels.length-1)*this.gutterSize+"px)",this.panelSizes[this.prevPanelIndex]=i,this.panelSizes[this.prevPanelIndex+1]=c,this.prevSize=parseFloat(i).toFixed(4)),this.$emit("resize",{originalEvent:t,sizes:this.panelSizes})},onResizeEnd:function(t){this.isStateful()&&this.saveState(),this.$emit("resizeend",{originalEvent:t,sizes:this.panelSizes}),this.$refs.gutter.forEach(function(n){return n.setAttribute("data-p-gutter-resizing",!1)}),this.$el.setAttribute("data-p-resizing",!1),this.clear()},repeat:function(t,n,a){this.onResizeStart(t,n,!0),this.onResize(t,a,!0)},setTimer:function(t,n,a){var s=this;this.timer||(this.timer=setInterval(function(){s.repeat(t,n,a)},40))},clearTimer:function(){this.timer&&(clearInterval(this.timer),this.timer=null)},onGutterKeyUp:function(){this.clearTimer(),this.onResizeEnd()},onGutterKeyDown:function(t,n){switch(t.code){case"ArrowLeft":{this.layout==="horizontal"&&this.setTimer(t,n,this.step*-1),t.preventDefault();break}case"ArrowRight":{this.layout==="horizontal"&&this.setTimer(t,n,this.step),t.preventDefault();break}case"ArrowDown":{this.layout==="vertical"&&this.setTimer(t,n,this.step*-1),t.preventDefault();break}case"ArrowUp":{this.layout==="vertical"&&this.setTimer(t,n,this.step),t.preventDefault();break}}},onGutterMouseDown:function(t,n){this.onResizeStart(t,n),this.bindMouseListeners()},onGutterTouchStart:function(t,n){this.onResizeStart(t,n),this.bindTouchListeners(),t.preventDefault()},onGutterTouchMove:function(t){this.onResize(t),t.preventDefault()},onGutterTouchEnd:function(t){this.onResizeEnd(t),this.unbindTouchListeners(),t.preventDefault()},bindMouseListeners:function(){var t=this;this.mouseMoveListener||(this.mouseMoveListener=function(n){return t.onResize(n)},document.addEventListener("mousemove",this.mouseMoveListener)),this.mouseUpListener||(this.mouseUpListener=function(n){t.onResizeEnd(n),t.unbindMouseListeners()},document.addEventListener("mouseup",this.mouseUpListener))},bindTouchListeners:function(){var t=this;this.touchMoveListener||(this.touchMoveListener=function(n){return t.onResize(n.changedTouches[0])},document.addEventListener("touchmove",this.touchMoveListener)),this.touchEndListener||(this.touchEndListener=function(n){t.resizeEnd(n),t.unbindTouchListeners()},document.addEventListener("touchend",this.touchEndListener))},validateResize:function(t,n){if(t>100||t<0||n>100||n<0)return!1;var a=R(this.panels[this.prevPanelIndex],"minSize");if(this.panels[this.prevPanelIndex].props&&a&&a>t)return!1;var s=R(this.panels[this.prevPanelIndex+1],"minSize");return!(this.panels[this.prevPanelIndex+1].props&&s&&s>n)},unbindMouseListeners:function(){this.mouseMoveListener&&(document.removeEventListener("mousemove",this.mouseMoveListener),this.mouseMoveListener=null),this.mouseUpListener&&(document.removeEventListener("mouseup",this.mouseUpListener),this.mouseUpListener=null)},unbindTouchListeners:function(){this.touchMoveListener&&(document.removeEventListener("touchmove",this.touchMoveListener),this.touchMoveListener=null),this.touchEndListener&&(document.removeEventListener("touchend",this.touchEndListener),this.touchEndListener=null)},clear:function(){this.dragging=!1,this.size=null,this.startPos=null,this.prevPanelElement=null,this.nextPanelElement=null,this.prevPanelSize=null,this.nextPanelSize=null,this.gutterElement=null,this.prevPanelIndex=null},isStateful:function(){return this.stateKey!=null},getStorage:function(){switch(this.stateStorage){case"local":return window.localStorage;case"session":return window.sessionStorage;default:throw new Error(this.stateStorage+' is not a valid value for the state storage, supported values are "local" and "session".')}},saveState:function(){ge(this.panelSizes)&&this.getStorage().setItem(this.stateKey,JSON.stringify(this.panelSizes))},restoreState:function(){var t=this,n=this.getStorage(),a=n.getItem(this.stateKey);if(a){this.panelSizes=JSON.parse(a);var s=U(this.$el.children).filter(function(i){return i.getAttribute("data-pc-name")==="splitterpanel"});return s.forEach(function(i,c){i.style.flexBasis="calc("+t.panelSizes[c]+"% - "+(t.panels.length-1)*t.gutterSize+"px)"}),!0}return!1}},computed:{panels:function(){var t=this,n=[];return this.$slots.default().forEach(function(a){t.isSplitterPanel(a)?n.push(a):a.children instanceof Array&&a.children.forEach(function(s){t.isSplitterPanel(s)&&n.push(s)})}),n},gutterStyle:function(){return this.horizontal?{width:this.gutterSize+"px"}:{height:this.gutterSize+"px"}},horizontal:function(){return this.layout==="horizontal"},getPTOptions:function(){var t;return{context:{nested:(t=this.$parentInstance)===null||t===void 0?void 0:t.nestedState}}}}},He=["onMousedown","onTouchstart","onTouchmove","onTouchend"],Fe=["aria-orientation","aria-valuenow","onKeydown"];function Ve(e,t,n,a,s,i){return p(),h("div",u({class:e.cx("root"),style:e.sx("root"),"data-p-resizing":!1},e.ptmi("root",i.getPTOptions)),[(p(!0),h($,null,ve(i.panels,function(c,d){return p(),h($,{key:d},[(p(),S(E(c),{tabindex:"-1"})),d!==i.panels.length-1?(p(),h("div",u({key:0,ref_for:!0,ref:"gutter",class:e.cx("gutter"),role:"separator",tabindex:"-1",onMousedown:function(m){return i.onGutterMouseDown(m,d)},onTouchstart:function(m){return i.onGutterTouchStart(m,d)},onTouchmove:function(m){return i.onGutterTouchMove(m,d)},onTouchend:function(m){return i.onGutterTouchEnd(m,d)},"data-p-gutter-resizing":!1},e.ptm("gutter")),[o("div",u({class:e.cx("gutterHandle"),tabindex:"0",style:[i.gutterStyle],"aria-orientation":e.layout,"aria-valuenow":s.prevSize,onKeyup:t[0]||(t[0]=function(){return i.onGutterKeyUp&&i.onGutterKeyUp.apply(i,arguments)}),onKeydown:function(m){return i.onGutterKeyDown(m,d)},ref_for:!0},e.ptm("gutterHandle")),null,16,Fe)],16,He)):v("",!0)],64)}),128))],16)}J.render=Ve;var We={root:function(t){var n=t.instance;return["p-splitterpanel",{"p-splitterpanel-nested":n.isNested}]}},Xe=y.extend({name:"splitterpanel",classes:We}),Ye={name:"BaseSplitterPanel",extends:_,props:{size:{type:Number,default:null},minSize:{type:Number,default:null}},style:Xe,provide:function(){return{$pcSplitterPanel:this,$parentInstance:this}}},Q={name:"SplitterPanel",extends:Ye,inheritAttrs:!1,data:function(){return{nestedState:null}},computed:{isNested:function(){var t=this;return this.$slots.default().some(function(n){return t.nestedState=n.type.name==="Splitter"?!0:null,t.nestedState})},getPTOptions:function(){return{context:{nested:this.isNested}}}}};function Je(e,t,n,a,s,i){return p(),h("div",u({ref:"container",class:e.cx("root")},e.ptmi("root",i.getPTOptions)),[f(e.$slots,"default")],16)}Q.render=Je;var Qe=function(t){var n=t.dt;return`
.p-fieldset {
    background: `.concat(n("fieldset.background"),`;
    border: 1px solid `).concat(n("fieldset.border.color"),`;
    border-radius: `).concat(n("fieldset.border.radius"),`;
    color: `).concat(n("fieldset.color"),`;
    padding:  `).concat(n("fieldset.padding"),`;
    margin: 0;
}

.p-fieldset-legend {
    background: `).concat(n("fieldset.legend.background"),`;
    border-radius: `).concat(n("fieldset.legend.border.radius"),`;
    border-width: `).concat(n("fieldset.legend.border.width"),`;
    border-style: solid;
    border-color: `).concat(n("fieldset.legend.border.color"),`;
    padding: `).concat(n("fieldset.legend.padding"),`;
    transition: background `).concat(n("fieldset.transition.duration"),", color ").concat(n("fieldset.transition.duration"),", outline-color ").concat(n("fieldset.transition.duration"),", box-shadow ").concat(n("fieldset.transition.duration"),`;
}

.p-fieldset-toggleable > .p-fieldset-legend {
    padding: 0;
}

.p-fieldset-toggle-button {
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    position: relative;
    text-decoration: none;
    display: flex;
    gap: `).concat(n("fieldset.legend.gap"),`;
    align-items: center;
    justify-content: center;
    padding: `).concat(n("fieldset.legend.padding"),`;
    background: transparent;
    border: 0 none;
    border-radius: `).concat(n("fieldset.legend.border.radius"),`;
    transition: background `).concat(n("fieldset.transition.duration"),", color ").concat(n("fieldset.transition.duration"),", outline-color ").concat(n("fieldset.transition.duration"),", box-shadow ").concat(n("fieldset.transition.duration"),`;
    outline-color: transparent;
}

.p-fieldset-legend-label {
    font-weight: `).concat(n("fieldset.legend.font.weight"),`;
}

.p-fieldset-toggle-button:focus-visible {
    box-shadow: `).concat(n("fieldset.legend.focus.ring.shadow"),`;
    outline: `).concat(n("fieldset.legend.focus.ring.width")," ").concat(n("fieldset.legend.focus.ring.style")," ").concat(n("fieldset.legend.focus.ring.color"),`;
    outline-offset: `).concat(n("fieldset.legend.focus.ring.offset"),`;
}

.p-fieldset-toggleable > .p-fieldset-legend:hover {
    color: `).concat(n("fieldset.legend.hover.color"),`;
    background: `).concat(n("fieldset.legend.hover.background"),`;
}

.p-fieldset-toggle-icon {
    color: `).concat(n("fieldset.toggle.icon.color"),`;
    transition: color `).concat(n("fieldset.transition.duration"),`;
}

.p-fieldset-toggleable > .p-fieldset-legend:hover .p-fieldset-toggle-icon {
    color: `).concat(n("fieldset.toggle.icon.hover.color"),`;
}

.p-fieldset .p-fieldset-content {
    padding: `).concat(n("fieldset.content.padding"),`;
}
`)},Ze={root:function(t){var n=t.props;return["p-fieldset p-component",{"p-fieldset-toggleable":n.toggleable}]},legend:"p-fieldset-legend",legendLabel:"p-fieldset-legend-label",toggleButton:"p-fieldset-toggle-button",toggleIcon:"p-fieldset-toggle-icon",contentContainer:"p-fieldset-content-container",content:"p-fieldset-content"},et=y.extend({name:"fieldset",theme:Qe,classes:Ze}),tt={name:"BaseFieldset",extends:_,props:{legend:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:null,default:null}},style:et,provide:function(){return{$pcFieldset:this,$parentInstance:this}}},Z={name:"Fieldset",extends:tt,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{id:this.$attrs.id,d_collapsed:this.collapsed}},watch:{"$attrs.id":function(t){this.id=t||T()},collapsed:function(t){this.d_collapsed=t}},mounted:function(){this.id=this.id||T()},methods:{toggle:function(t){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:t,value:this.d_collapsed})},onKeyDown:function(t){(t.code==="Enter"||t.code==="NumpadEnter"||t.code==="Space")&&(this.toggle(t),t.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.legend}},directives:{ripple:H},components:{PlusIcon:X,MinusIcon:W}};function z(e){"@babel/helpers - typeof";return z=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},z(e)}function N(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(s){return Object.getOwnPropertyDescriptor(e,s).enumerable})),n.push.apply(n,a)}return n}function G(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?N(Object(n),!0).forEach(function(a){nt(e,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):N(Object(n)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(n,a))})}return e}function nt(e,t,n){return(t=it(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function it(e){var t=ot(e,"string");return z(t)=="symbol"?t:t+""}function ot(e,t){if(z(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var a=n.call(e,t||"default");if(z(a)!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var st=["id"],at=["id","aria-controls","aria-expanded","aria-label"],rt=["id","aria-labelledby"];function lt(e,t,n,a,s,i){var c=be("ripple");return p(),h("fieldset",u({class:e.cx("root")},e.ptmi("root")),[o("legend",u({class:e.cx("legend")},e.ptm("legend")),[f(e.$slots,"legend",{toggleCallback:i.toggle},function(){return[e.toggleable?v("",!0):(p(),h("span",u({key:0,id:s.id+"_header",class:e.cx("legendLabel")},e.ptm("legendLabel")),M(e.legend),17,st)),e.toggleable?L((p(),h("button",u({key:1,id:s.id+"_header",type:"button","aria-controls":s.id+"_content","aria-expanded":!s.d_collapsed,"aria-label":i.buttonAriaLabel,class:e.cx("toggleButton"),onClick:t[0]||(t[0]=function(){return i.toggle&&i.toggle.apply(i,arguments)}),onKeydown:t[1]||(t[1]=function(){return i.onKeyDown&&i.onKeyDown.apply(i,arguments)})},G(G({},e.toggleButtonProps),e.ptm("toggleButton"))),[f(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:s.d_collapsed},function(){return[(p(),S(E(s.d_collapsed?"PlusIcon":"MinusIcon"),u({class:e.cx("toggleIcon")},e.ptm("toggleIcon")),null,16,["class"]))]}),o("span",u({class:e.cx("legendLabel")},e.ptm("legendLabel")),M(e.legend),17)],16,at)),[[c]]):v("",!0)]})],16),r(F,u({name:"p-toggleable-content"},e.ptm("transition")),{default:l(function(){return[L(o("div",u({id:s.id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":s.id+"_header"},e.ptm("contentContainer")),[o("div",u({class:e.cx("content")},e.ptm("content")),[f(e.$slots,"default")],16)],16,rt),[[j,!s.d_collapsed]])]}),_:3},16)],16)}Z.render=lt;var ut=function(t){var n=t.dt;return`
.p-panel {
    border: 1px solid `.concat(n("panel.border.color"),`;
    border-radius: `).concat(n("panel.border.radius"),`;
    background: `).concat(n("panel.background"),`;
    color: `).concat(n("panel.color"),`;
}

.p-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: `).concat(n("panel.header.padding"),`;
    background: `).concat(n("panel.header.background"),`;
    color: `).concat(n("panel.header.color"),`;
    border-style: solid;
    border-width: `).concat(n("panel.header.border.width"),`;
    border-color: `).concat(n("panel.header.border.color"),`;
    border-radius: `).concat(n("panel.header.border.radius"),`;
}

.p-panel-toggleable .p-panel-header {
    padding: `).concat(n("panel.toggleable.header.padding"),`;
}

.p-panel-title {
    line-height: 1;
    font-weight: `).concat(n("panel.title.font.weight"),`;
}

.p-panel-content {
    padding: `).concat(n("panel.content.padding"),`;
}

.p-panel-footer {
    padding: `).concat(n("panel.footer.padding"),`;
}
`)},ct={root:function(t){var n=t.props;return["p-panel p-component",{"p-panel-toggleable":n.toggleable}]},header:"p-panel-header",title:"p-panel-title",headerActions:"p-panel-header-actions",pcToggleButton:"p-panel-toggle-button",contentContainer:"p-panel-content-container",content:"p-panel-content",footer:"p-panel-footer"},dt=y.extend({name:"panel",theme:ut,classes:ct}),pt={name:"BasePanel",extends:_,props:{header:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}}},style:dt,provide:function(){return{$pcPanel:this,$parentInstance:this}}},ee={name:"Panel",extends:pt,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{id:this.$attrs.id,d_collapsed:this.collapsed}},watch:{"$attrs.id":function(t){this.id=t||T()},collapsed:function(t){this.d_collapsed=t}},mounted:function(){this.id=this.id||T()},methods:{toggle:function(t){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:t,value:this.d_collapsed})},onKeyDown:function(t){(t.code==="Enter"||t.code==="NumpadEnter"||t.code==="Space")&&(this.toggle(t),t.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.header}},components:{PlusIcon:X,MinusIcon:W,Button:Y},directives:{ripple:H}},ht=["id"],mt=["id","aria-labelledby"];function ft(e,t,n,a,s,i){var c=ye("Button");return p(),h("div",u({class:e.cx("root")},e.ptmi("root")),[o("div",u({class:e.cx("header")},e.ptm("header")),[f(e.$slots,"header",{id:s.id+"_header",class:V(e.cx("title"))},function(){return[e.header?(p(),h("span",u({key:0,id:s.id+"_header",class:e.cx("title")},e.ptm("title")),M(e.header),17,ht)):v("",!0)]}),o("div",u({class:e.cx("headerActions")},e.ptm("headerActions")),[f(e.$slots,"icons"),e.toggleable?(p(),S(c,u({key:0,id:s.id+"_header",class:e.cx("pcToggleButton"),"aria-label":i.buttonAriaLabel,"aria-controls":s.id+"_content","aria-expanded":!s.d_collapsed,unstyled:e.unstyled,onClick:i.toggle,onKeydown:i.onKeyDown},e.toggleButtonProps,{pt:e.ptm("pcToggleButton")}),{icon:l(function(d){return[f(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:s.d_collapsed},function(){return[(p(),S(E(s.d_collapsed?"PlusIcon":"MinusIcon"),u({class:d.class},e.ptm("pcToggleButton").icon),null,16,["class"]))]})]}),_:3},16,["id","class","aria-label","aria-controls","aria-expanded","unstyled","onClick","onKeydown","pt"])):v("",!0)],16)],16),r(F,u({name:"p-toggleable-content"},e.ptm("transition")),{default:l(function(){return[L(o("div",u({id:s.id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":s.id+"_header"},e.ptm("contentContainer")),[o("div",u({class:e.cx("content")},e.ptm("content")),[f(e.$slots,"default")],16),e.$slots.footer?(p(),h("div",u({key:0,class:e.cx("footer")},e.ptm("footer")),[f(e.$slots,"footer")],16)):v("",!0)],16,mt),[[j,!s.d_collapsed]])]}),_:3},16)],16)}ee.render=ft;var gt={root:"p-tabpanels"},vt=y.extend({name:"tabpanels",classes:gt}),bt={name:"BaseTabPanels",extends:_,props:{},style:vt,provide:function(){return{$pcTabPanels:this,$parentInstance:this}}},te={name:"TabPanels",extends:bt,inheritAttrs:!1};function yt(e,t,n,a,s,i){return p(),h("div",u({class:e.cx("root"),role:"presentation"},e.ptmi("root")),[f(e.$slots,"default")],16)}te.render=yt;var _t={root:function(t){var n=t.instance;return["p-tabpanel",{"p-tabpanel-active":n.active}]}},St=y.extend({name:"tabpanel",classes:_t}),zt={name:"BaseTabPanel",extends:_,props:{value:{type:String,default:void 0},as:{type:String,default:"DIV"},asChild:{type:Boolean,default:!1},header:null,headerStyle:null,headerClass:null,headerProps:null,headerActionProps:null,contentStyle:null,contentClass:null,contentProps:null,disabled:Boolean},style:St,provide:function(){return{$pcTabPanel:this,$parentInstance:this}}},ne={name:"TabPanel",extends:zt,inheritAttrs:!1,inject:["$pcTabs"],computed:{active:function(){var t;return _e((t=this.$pcTabs)===null||t===void 0?void 0:t.d_value,this.value)},id:function(){var t;return"".concat((t=this.$pcTabs)===null||t===void 0?void 0:t.id,"_tabpanel_").concat(this.value)},ariaLabelledby:function(){var t;return"".concat((t=this.$pcTabs)===null||t===void 0?void 0:t.id,"_tab_").concat(this.value)},attrs:function(){return u(this.a11yAttrs,this.ptmi("root",this.ptParams))},a11yAttrs:function(){var t;return{id:this.id,tabindex:(t=this.$pcTabs)===null||t===void 0?void 0:t.tabindex,role:"tabpanel","aria-labelledby":this.ariaLabelledby,"data-pc-name":"tabpanel","data-p-active":this.active}},ptParams:function(){return{context:{active:this.active}}}}};function Pt(e,t,n,a,s,i){var c,d;return i.$pcTabs?(p(),h($,{key:1},[e.asChild?f(e.$slots,"default",{key:1,class:V(e.cx("root")),active:i.active,a11yAttrs:i.a11yAttrs}):(p(),h($,{key:0},[!((c=i.$pcTabs)!==null&&c!==void 0&&c.lazy)||i.active?L((p(),S(E(e.as),u({key:0,class:e.cx("root")},i.attrs),{default:l(function(){return[f(e.$slots,"default")]}),_:3},16,["class"])),[[j,(d=i.$pcTabs)!==null&&d!==void 0&&d.lazy?!0:i.active]]):v("",!0)],64))],64)):f(e.$slots,"default",{key:0})}ne.render=Pt;const xt={class:"flex flex-col"},wt={class:"card"},$t=o("div",{class:"font-semibold text-xl mb-4"},"Toolbar",-1),Tt=o("i",{class:"pi pi-search"},null,-1),Lt={class:"flex flex-col md:flex-row gap-8"},Et={class:"md:w-1/2"},qt={class:"card"},It=o("div",{class:"font-semibold text-xl mb-4"},"Accordion",-1),kt=o("p",{class:"m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1),At=o("p",{class:"m-0"}," Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi. ",-1),Bt=o("p",{class:"m-0"}," At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus. ",-1),Dt={class:"card"},Mt=o("div",{class:"font-semibold text-xl mb-4"},"Tabs",-1),Ot=o("p",{class:"m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1),jt=o("p",{class:"m-0"}," Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi. ",-1),Ct=o("p",{class:"m-0"}," At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus. ",-1),Kt={class:"md:w-1/2 mt-6 md:mt-0"},Rt={class:"card"},Ut=o("div",{class:"font-semibold text-xl mb-4"},"Panel",-1),Nt=o("p",{class:"leading-normal m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1),Gt={class:"card"},Ht=o("div",{class:"font-semibold text-xl mb-4"},"Fieldset",-1),Ft=o("p",{class:"leading-normal m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1),Vt={class:"flex items-center justify-between mb-0"},Wt=o("div",{class:"font-semibold text-xl mb-4"},"Card",-1),Xt=o("p",{class:"leading-normal m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1),Yt={class:"card mt-8"},Jt=o("div",{class:"font-semibold text-xl mb-4"},"Divider",-1),Qt={class:"flex flex-col md:flex-row"},Zt={class:"w-full md:w-5/12 flex flex-col items-center justify-center gap-3 py-5"},en={class:"flex flex-col gap-2"},tn=o("label",{for:"username"},"Username",-1),nn={class:"flex flex-col gap-2"},on=o("label",{for:"password"},"Password",-1),sn={class:"flex"},an={class:"w-full md:w-2/12"},rn=o("b",null,"OR",-1),ln=o("b",null,"OR",-1),un={class:"w-full md:w-5/12 flex items-center justify-center py-5"},cn={class:"card"},dn=o("div",{class:"font-semibold text-xl mb-4"},"Splitter",-1),pn=o("div",{className:"h-full flex items-center justify-center"},"Panel 1",-1),hn=o("div",{className:"h-full flex items-center justify-center"},"Panel 2",-1),mn=o("div",{className:"h-full flex items-center justify-center"},"Panel 3",-1),Mn={__name:"PanelsDoc",setup(e){const t=D([{label:"Save",icon:"pi pi-check"},{label:"Update",icon:"pi pi-upload"},{label:"Delete",icon:"pi pi-trash"},{label:"Home Page",icon:"pi pi-home"}]),n=D([{label:"Save",icon:"pi pi-fw pi-check"},{label:"Update",icon:"pi pi-fw pi-refresh"},{label:"Delete",icon:"pi pi-fw pi-trash"}]),a=D(null);function s(){a.value.toggle(event)}return(i,c)=>{const d=Y,g=Ae,m=De,ie=Be,oe=ke,se=Ie,q=Le,I=Ee,k=qe,ae=Te,A=we,re=$e,B=ne,le=te,ue=xe,ce=ee,de=Z,pe=Pe,he=ze,C=Se,P=Q,K=J;return p(),h("div",xt,[o("div",wt,[$t,r(se,null,{start:l(()=>[r(d,{icon:"pi pi-plus",class:"mr-2",severity:"secondary",text:""}),r(d,{icon:"pi pi-print",class:"mr-2",severity:"secondary",text:""}),r(d,{icon:"pi pi-upload",severity:"secondary",text:""})]),center:l(()=>[r(ie,null,{default:l(()=>[r(g,null,{default:l(()=>[Tt]),_:1}),r(m,{placeholder:"Search"})]),_:1})]),end:l(()=>[r(oe,{label:"Save",model:t.value},null,8,["model"])]),_:1})]),o("div",Lt,[o("div",Et,[o("div",qt,[It,r(ae,{value:"0"},{default:l(()=>[r(k,{value:"0"},{default:l(()=>[r(q,null,{default:l(()=>[b("Header I")]),_:1}),r(I,null,{default:l(()=>[kt]),_:1})]),_:1}),r(k,{value:"1"},{default:l(()=>[r(q,null,{default:l(()=>[b("Header II")]),_:1}),r(I,null,{default:l(()=>[At]),_:1})]),_:1}),r(k,{value:"2"},{default:l(()=>[r(q,null,{default:l(()=>[b("Header III")]),_:1}),r(I,null,{default:l(()=>[Bt]),_:1})]),_:1})]),_:1})]),o("div",Dt,[Mt,r(ue,{value:"0"},{default:l(()=>[r(re,null,{default:l(()=>[r(A,{value:"0"},{default:l(()=>[b("Header I")]),_:1}),r(A,{value:"1"},{default:l(()=>[b("Header II")]),_:1}),r(A,{value:"2"},{default:l(()=>[b("Header III")]),_:1})]),_:1}),r(le,null,{default:l(()=>[r(B,{value:"0"},{default:l(()=>[Ot]),_:1}),r(B,{value:"1"},{default:l(()=>[jt]),_:1}),r(B,{value:"2"},{default:l(()=>[Ct]),_:1})]),_:1})]),_:1})])]),o("div",Kt,[o("div",Rt,[Ut,r(ce,{header:"Header",toggleable:!0},{default:l(()=>[Nt]),_:1})]),o("div",Gt,[Ht,r(de,{legend:"Legend",toggleable:!0},{default:l(()=>[Ft]),_:1})]),r(he,null,{title:l(()=>[o("div",Vt,[Wt,r(d,{icon:"pi pi-plus",class:"p-button-text",onClick:s})]),r(pe,{id:"config_menu",ref_key:"menuRef",ref:a,model:n.value,popup:!0},null,8,["model"])]),content:l(()=>[Xt]),_:1})])]),o("div",Yt,[Jt,o("div",Qt,[o("div",Zt,[o("div",en,[tn,r(m,{id:"username",type:"text"})]),o("div",nn,[on,r(m,{id:"password",type:"password"})]),o("div",sn,[r(d,{label:"Login",icon:"pi pi-user",class:"w-full max-w-[17.35rem] mx-auto"})])]),o("div",an,[r(C,{layout:"vertical",class:"!hidden md:!flex"},{default:l(()=>[rn]),_:1}),r(C,{layout:"horizontal",class:"!flex md:!hidden",align:"center"},{default:l(()=>[ln]),_:1})]),o("div",un,[r(d,{label:"Sign Up",icon:"pi pi-user-plus",severity:"success",class:"w-full max-w-[17.35rem] mx-auto"})])])]),o("div",cn,[dn,r(K,{style:{height:"300px"},class:"mb-8"},{default:l(()=>[r(P,{size:30,minSize:10},{default:l(()=>[pn]),_:1}),r(P,{size:70},{default:l(()=>[r(K,{layout:"vertical"},{default:l(()=>[r(P,{size:15},{default:l(()=>[hn]),_:1}),r(P,{size:50},{default:l(()=>[mn]),_:1})]),_:1})]),_:1})]),_:1})])])}}};export{Mn as default};
